import { useState, useMemo, useCallback, useRef } from 'react'
import type { AppState, ScheduledStory } from '../lib/types.ts'
import type { ReorderResult } from '../lib/reorder.ts'
import { epicEffortDays, epicWindow, componentEffortDays } from '../lib/aggregation.ts'
import { parseDate } from '../lib/calendar.ts'
import { useI18n } from '../i18n/I18nContext.tsx'
import Toast from './Toast.tsx'

interface Props {
  state: AppState
  scheduledStories: ScheduledStory[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onReorderEpic: (movingId: string, newIndex: number) => ReorderResult
  onReorderStory: (epicId: string, movingId: string, newIndex: number) => ReorderResult
  onAddStory: (epicId: string) => void
  onAddEpic: (componentId: string, name: string) => void
  onRenameEpic: (epicId: string, name: string) => void
  onDeleteEpic: (epicId: string) => void
}

const COMP_COLORS: Record<string, string> = {
  'comp-data':  '#6B7A72',
  'comp-viz':   '#2E6E6A',
  'comp-risk':  '#1E7A4D',
  'comp-ai':    '#5A6E52',
}

const CHIP_CLASS: Record<string, string> = {
  data:      'chip chip--data',
  fullstack: 'chip chip--fullstack',
  ai:        'chip chip--ai',
}

function fmtShortDate(iso: string): string {
  if (!iso) return '—'
  const d = parseDate(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtWeeks(days: number, dpw: number): string {
  if (days === 0) return '—'
  return `${days / dpw}sem`
}

interface DragItem {
  type: 'epic' | 'story'
  id: string
  epicId: string
}

interface DropTarget {
  id: string
  pos: 'before' | 'after'
}

// ─── TreeView ─────────────────────────────────────────────────────────────────

export default function TreeView({
  state,
  scheduledStories,
  selectedId,
  onSelect,
  onReorderEpic,
  onReorderStory,
  onAddStory,
  onAddEpic,
  onRenameEpic,
  onDeleteEpic,
}: Props) {
  const allIds = useMemo(
    () => [...state.components.map(c => c.id), ...state.epics.map(e => e.id)],
    [state.components, state.epics],
  )
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allIds))
  const { t } = useI18n()

  // ── Drag state ─────────────────────────────────────────────────────────────
  // dragRef is a synchronous ref — reads in dragOver/drop handlers never see stale closures.
  // draggingId is React state only for visual re-renders (opacity change on the dragged row).
  const dragRef = useRef<DragItem | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const dismissToast = useCallback(() => setToast(null), [])
  // epicId → current inline rename value (null = not editing)
  const [renamingEpic, setRenamingEpic] = useState<{ id: string; value: string } | null>(null)
  // componentId → new epic name being typed (null = form hidden)
  const [addingEpic, setAddingEpic] = useState<{ compId: string; value: string } | null>(null)

  const dpw = state.config.calendarConfig.daysPerWeek

  const epicIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    state.epics.forEach((e, i) => map.set(e.id, i + 1))
    return map
  }, [state.epics])

  const schedMap = useMemo(
    () => new Map(scheduledStories.map(s => [s.storyId, s])),
    [scheduledStories],
  )

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Drag helpers ────────────────────────────────────────────────────────────

  function startDrag(e: React.DragEvent, item: DragItem) {
    // Prevent the click-then-drag gesture from firing a selection change
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    // setData required for Firefox to recognise the drag at all
    e.dataTransfer.setData('text/plain', `${item.type}:${item.id}`)
    dragRef.current = item
    // Defer the state update so the browser snapshot isn't taken with opacity:0.4 applied yet
    requestAnimationFrame(() => setDraggingId(item.id))
  }

  function endDrag() {
    dragRef.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  function dropPos(e: React.DragEvent): 'before' | 'after' {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  }

  // ── Epic DnD handlers ───────────────────────────────────────────────────────

  function onEpicDragOver(e: React.DragEvent, epicId: string) {
    // dragRef.current is always fresh — no stale-closure bug.
    const item = dragRef.current
    if (!item || item.type !== 'epic' || item.id === epicId) return
    e.preventDefault() // must call to allow the drop
    setDropTarget({ id: epicId, pos: dropPos(e) })
  }

  function onEpicDrop(e: React.DragEvent, targetEpicId: string) {
    e.preventDefault()
    const item = dragRef.current
    if (!item || item.type !== 'epic' || item.id === targetEpicId) { endDrag(); return }
    const dt = dropTarget?.id === targetEpicId ? dropTarget.pos : 'before'
    const targetIdx = state.epics.findIndex(ep => ep.id === targetEpicId)
    const newIndex = dt === 'before' ? targetIdx : targetIdx + 1
    const result = onReorderEpic(item.id, newIndex)
    if (!result.ok && result.errorKey) setToast(t(result.errorKey as Parameters<typeof t>[0], result.errorParams))
    endDrag()
  }

  // ── Story DnD handlers ──────────────────────────────────────────────────────

  function onStoryDragOver(e: React.DragEvent, storyId: string, epicId: string) {
    const item = dragRef.current
    // Only allow within the same epic; cross-epic story moves are not supported
    if (!item || item.type !== 'story' || item.epicId !== epicId || item.id === storyId) return
    e.preventDefault()
    e.stopPropagation() // prevent the parent epic's onDragOver from also firing
    setDropTarget({ id: storyId, pos: dropPos(e) })
  }

  function onStoryDrop(e: React.DragEvent, targetStoryId: string, epicId: string) {
    e.preventDefault()
    e.stopPropagation()
    const item = dragRef.current
    if (!item || item.type !== 'story' || item.id === targetStoryId) { endDrag(); return }
    const dt = dropTarget?.id === targetStoryId ? dropTarget.pos : 'before'
    const epicStories = state.stories.filter(s => s.epicId === epicId)
    const targetIdx = epicStories.findIndex(s => s.id === targetStoryId)
    const newIndex = dt === 'before' ? targetIdx : targetIdx + 1
    const result = onReorderStory(epicId, item.id, newIndex)
    if (!result.ok && result.errorKey) setToast(t(result.errorKey as Parameters<typeof t>[0], result.errorParams))
    endDrag()
  }

  function onDragLeave(e: React.DragEvent) {
    // Only clear the indicator when the cursor truly leaves this element (not when
    // moving to a child), by checking whether relatedTarget is still inside.
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDropTarget(null)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="tree-view">
      {toast && <Toast message={toast} onClose={dismissToast} />}

      {state.components.map(comp => {
        const compEpics = state.epics.filter(e => e.componentId === comp.id)
        const compStories = state.stories.filter(s => compEpics.some(e => e.id === s.epicId))
        const compEffort = componentEffortDays(comp.id, state.epics, state.stories)
        const isExpanded = expanded.has(comp.id)
        const compColor = COMP_COLORS[comp.id] ?? '#6B7A72'

        return (
          <div key={comp.id} className="tree-component">
            <button
              className="tree-comp-header"
              style={{ '--comp-color': compColor } as React.CSSProperties}
              onClick={() => toggle(comp.id)}
            >
              <span className="tree-toggle">{isExpanded ? '▼' : '▶'}</span>
              <span className="tree-comp-name">{comp.name}</span>
              <span className="tree-comp-meta">
                {compEffort}d · {t('nStories', { n: String(compStories.length) })}
              </span>
            </button>

            {isExpanded && (
              <div className="tree-comp-body">
                {compEpics.map(epic => {
                  const stageNum = epicIndexMap.get(epic.id) ?? 1
                  const epicStories = state.stories.filter(s => s.epicId === epic.id)
                  const effort = epicEffortDays(epic.id, state.stories)
                  const win = epicWindow(epic.id, state.stories, scheduledStories)
                  const isEpicExpanded = expanded.has(epic.id)
                  const hasBlocked = epicStories.some(s => schedMap.get(s.id)?.blocked)
                  const isDragging = draggingId === epic.id
                  const isDropTarget = dropTarget?.id === epic.id && dragRef.current?.type === 'epic'

                  return (
                    <div
                      key={epic.id}
                      className={[
                        'tree-epic',
                        isDragging      ? 'is-dragging'  : '',
                        isDropTarget && dropTarget?.pos === 'before' ? 'drop-ind-before' : '',
                        isDropTarget && dropTarget?.pos === 'after'  ? 'drop-ind-after'  : '',
                      ].filter(Boolean).join(' ')}
                      onDragOver={e => onEpicDragOver(e, epic.id)}
                      onDrop={e => onEpicDrop(e, epic.id)}
                      onDragLeave={onDragLeave}
                    >
                      {/* Eyebrow — drag handle, rename, delete */}
                      <div className="tree-epic-eyebrow">
                        <span
                          className="drag-handle"
                          draggable
                          onDragStart={e => startDrag(e, { type: 'epic', id: epic.id, epicId: epic.id })}
                          onDragEnd={endDrag}
                          title={t('dragEpicTip')}
                          aria-label={t('reorderEpicAria')}
                        >
                          ⠿
                        </span>

                        {renamingEpic?.id === epic.id ? (
                          <input
                            className="tree-epic-rename-input"
                            data-testid={`epic-rename-input-${epic.id}`}
                            value={renamingEpic.value}
                            autoFocus
                            onChange={e => setRenamingEpic({ id: epic.id, value: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && renamingEpic.value.trim()) {
                                onRenameEpic(epic.id, renamingEpic.value)
                                setRenamingEpic(null)
                              } else if (e.key === 'Escape') {
                                setRenamingEpic(null)
                              }
                            }}
                            onBlur={() => {
                              if (renamingEpic.value.trim()) onRenameEpic(epic.id, renamingEpic.value)
                              setRenamingEpic(null)
                            }}
                          />
                        ) : (
                          <span>STAGE {String(stageNum).padStart(2, '0')} — {epic.name.toUpperCase()}</span>
                        )}

                        {hasBlocked && (
                          <span style={{ color: 'var(--warn)', marginLeft: 8 }}>⊘ {t('blocked')}</span>
                        )}

                        <span className="tree-epic-eyebrow-actions">
                          <button
                            className="tree-epic-action-btn"
                            data-testid={`epic-rename-btn-${epic.id}`}
                            title="Rename stage"
                            onClick={() => setRenamingEpic({ id: epic.id, value: epic.name })}
                          >
                            ✎
                          </button>
                          {!epic.isProtected && (
                            <button
                              className="tree-epic-action-btn tree-epic-action-btn--danger"
                              data-testid={`epic-delete-btn-${epic.id}`}
                              title="Delete stage"
                              onClick={() => {
                                if (window.confirm(t('epicDeleteConfirm'))) {
                                  onDeleteEpic(epic.id)
                                }
                              }}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      </div>

                      <button
                        className="tree-epic-header"
                        onClick={() => toggle(epic.id)}
                      >
                        <span className="tree-toggle">{isEpicExpanded ? '▼' : '▶'}</span>
                        <span className="tree-epic-name">{epic.name}</span>
                        <span className="tree-epic-meta">
                          <span className="tree-epic-effort">{effort}d</span>
                          {win && (
                            <span>
                              {fmtShortDate(win.startDate)} → {fmtShortDate(win.endDate)}
                            </span>
                          )}
                        </span>
                      </button>

                      {isEpicExpanded && (
                        <div className="tree-epic-body">
                          {epicStories.map(story => {
                            const sched = schedMap.get(story.id)
                            const isSelected = story.id === selectedId
                            const isBlocked = sched?.blocked ?? false
                            const durationLabel = isBlocked
                              ? '⊘'
                              : sched ? fmtWeeks(sched.durationDays, dpw) : '—'
                            const isThisDragging = draggingId === story.id
                            const isDropHere =
                              dropTarget?.id === story.id && dragRef.current?.type === 'story'

                            return (
                              <div
                                key={story.id}
                                className={[
                                  'tree-story-wrap',
                                  isThisDragging ? 'is-dragging' : '',
                                  isDropHere && dropTarget?.pos === 'before' ? 'drop-ind-before' : '',
                                  isDropHere && dropTarget?.pos === 'after'  ? 'drop-ind-after'  : '',
                                ].filter(Boolean).join(' ')}
                                onDragOver={e => onStoryDragOver(e, story.id, epic.id)}
                                onDrop={e => onStoryDrop(e, story.id, epic.id)}
                                onDragLeave={onDragLeave}
                              >
                                {/* Handle is a plain flex item — always visible, easy to grab */}
                                <span
                                  className="drag-handle"
                                  draggable
                                  onDragStart={e =>
                                    startDrag(e, { type: 'story', id: story.id, epicId: epic.id })
                                  }
                                  onDragEnd={endDrag}
                                  title={t('dragStoryTip')}
                                  aria-label={t('reorderStoryAria')}
                                >
                                  ⠿
                                </span>

                                <button
                                  className={`tree-story-row${isSelected ? ' tree-story-row--selected' : ''}`}
                                  onClick={() => onSelect(isSelected ? null : story.id)}
                                >
                                  <span className="story-id">{story.id}</span>
                                  <span className="story-title">{story.title}</span>
                                  <span className="story-chips">
                                    {story.roleEfforts.map(re => (
                                      <span
                                        key={re.roleId}
                                        className={CHIP_CLASS[re.roleId] ?? 'chip chip--default'}
                                      >
                                        {re.roleId.toUpperCase().slice(0, 4)} {re.days}d
                                      </span>
                                    ))}
                                  </span>
                                  {story.mvpEnabled && (
                                    <span className="story-badge story-badge--mvp">MVP</span>
                                  )}
                                  {story.estimationState === 'auto' && (
                                    <span className="story-badge story-badge--auto">AUTO</span>
                                  )}
                                  <span
                                    className={`story-duration${isBlocked ? ' story-duration--blocked' : ''}`}
                                  >
                                    {durationLabel}
                                  </span>
                                  {!isBlocked && sched?.startDate && (
                                    <span className="story-start">
                                      {fmtShortDate(sched.startDate)}
                                    </span>
                                  )}
                                </button>
                              </div>
                            )
                          })}
                          <button
                            className="tree-add-story-btn"
                            data-testid={`add-story-${epic.id}`}
                            onClick={() => onAddStory(epic.id)}
                          >
                            + {t('newStory')}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Add epic inline form (US-003) */}
                {addingEpic?.compId === comp.id ? (
                  <div className="tree-add-epic-form">
                    <input
                      className="tree-add-epic-input"
                      data-testid={`add-epic-input-${comp.id}`}
                      placeholder={t('newEpicPlaceholder')}
                      value={addingEpic.value}
                      autoFocus
                      onChange={e => setAddingEpic({ compId: comp.id, value: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && addingEpic.value.trim()) {
                          onAddEpic(comp.id, addingEpic.value)
                          setAddingEpic(null)
                        } else if (e.key === 'Escape') {
                          setAddingEpic(null)
                        }
                      }}
                      onBlur={() => {
                        if (addingEpic.value.trim()) onAddEpic(comp.id, addingEpic.value)
                        setAddingEpic(null)
                      }}
                    />
                  </div>
                ) : (
                  <button
                    className="tree-add-epic-btn"
                    data-testid={`add-epic-${comp.id}`}
                    onClick={() => setAddingEpic({ compId: comp.id, value: '' })}
                  >
                    + {t('addEpic')}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </main>
  )
}
