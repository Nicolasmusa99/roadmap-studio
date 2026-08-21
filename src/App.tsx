import { useState, useEffect } from 'react'
import { useRoadmapState } from './hooks/useRoadmapState.ts'
import { useMultiRoadmap } from './hooks/useMultiRoadmap.ts'
import type { StoredRoadmap } from './lib/storage.ts'
import { dependentsOf, storiesUsingRole, storiesUsingTag } from './lib/mutations.ts'
import type { NewStoryInput } from './lib/types.ts'
import TopBar from './components/TopBar.tsx'
import LeftPanel from './components/LeftPanel.tsx'
import TreeView from './components/TreeView.tsx'
import TimelineView from './components/TimelineView.tsx'
import AssumptionsView from './components/AssumptionsView.tsx'
import ViewToggle, { type View } from './components/ViewToggle.tsx'
import RightPanel from './components/RightPanel.tsx'
import MilestoneModal from './components/MilestoneModal.tsx'
import MilestoneDetail from './components/MilestoneDetail.tsx'
import StoryModal from './components/StoryModal.tsx'
import HomeScreen from './components/HomeScreen.tsx'
import CsvImportModal from './components/CsvImportModal.tsx'
import { useI18n } from './i18n/I18nContext.tsx'
import type { ImportedRow } from './lib/csvImport.ts'

// ── Top-level router ──────────────────────────────────────────────────────────
// Manages the collection of roadmaps. When activeId is null, the home screen is
// shown. When a roadmap is selected, RoadmapWorkspace is mounted with key=activeId
// so useRoadmapState is fully re-initialised when switching between roadmaps.

export default function App() {
  const multi = useMultiRoadmap()

  if (multi.activeId === null) {
    return (
      <HomeScreen
        roadmaps={multi.roadmaps}
        onCreate={multi.createRoadmap}
        onOpen={multi.openRoadmap}
        onRename={multi.renameRoadmap}
        onDelete={multi.deleteRoadmap}
      />
    )
  }

  const activeRoadmap = multi.roadmaps.find(r => r.id === multi.activeId)
  if (!activeRoadmap) {
    // Stale activeId (e.g. roadmap was deleted from another tab) — fall back to home.
    multi.closeRoadmap()
    return null
  }

  return (
    <RoadmapWorkspace
      key={multi.activeId}
      roadmap={activeRoadmap}
      allRoadmaps={multi.roadmaps}
      storeError={multi.storeError}
      onSaveState={multi.saveActiveRoadmap}
      onSwitchRoadmap={multi.openRoadmap}
      onHome={multi.closeRoadmap}
      onRenameRoadmap={(name) => multi.renameRoadmap(multi.activeId!, name)}
    />
  )
}

// ── Workspace ─────────────────────────────────────────────────────────────────
// Renders the full roadmap editor for one roadmap. Mounted fresh (via key=) each
// time a different roadmap is opened, so all local state resets cleanly.
// Debounces persistence: writes to the multi-roadmap store 500 ms after any
// state change, avoiding writes on every keystroke.

interface WorkspaceProps {
  roadmap: StoredRoadmap
  allRoadmaps: StoredRoadmap[]
  storeError: import('./lib/storage.ts').StorageError | null
  onSaveState: (state: import('./lib/types.ts').AppState) => void
  onSwitchRoadmap: (id: string) => void
  onHome: () => void
  onRenameRoadmap: (name: string) => void
}

function RoadmapWorkspace({
  roadmap,
  allRoadmaps,
  storeError,
  onSaveState,
  onSwitchRoadmap,
  onHome,
  onRenameRoadmap,
}: WorkspaceProps) {
  const state = useRoadmapState(roadmap.state)
  const { t } = useI18n()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [view, setView] = useState<View>('tree')
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [storyModal, setStoryModal] = useState<{
    epicId: string
    initialFields?: Partial<NewStoryInput>
    isCopy?: boolean
  } | null>(null)

  // Debounced persistence: 500 ms after the last state change, write to the store.
  useEffect(() => {
    const timer = setTimeout(() => {
      onSaveState(state.state)
    }, 500)
    return () => clearTimeout(timer)
  }, [state.state, onSaveState])

  // Story and milestone selection are mutually exclusive.
  const selectStory = (id: string | null) => { setSelectedMilestoneId(null); setSelectedId(id) }
  const selectMilestone = (id: string | null) => { setSelectedId(null); setSelectedMilestoneId(id) }

  const selectedStory = selectedId
    ? (state.state.stories.find(s => s.id === selectedId) ?? null)
    : null
  const selectedScheduled = selectedId
    ? (state.scheduledStories.find(s => s.storyId === selectedId) ?? null)
    : null
  const epicStories = selectedStory
    ? state.state.stories.filter(s => s.epicId === selectedStory.epicId)
    : []
  const selectedMilestone = selectedMilestoneId
    ? (state.state.milestones.find(m => m.id === selectedMilestoneId) ?? null)
    : null

  function handleCreateMilestone(name: string, target: string, storyIds: string[]) {
    const id = state.addMilestone(name, target, storyIds)
    setModalOpen(false)
    setView('timeline')
    selectMilestone(id)
  }

  function handleAddStory(epicId: string) {
    setStoryModal({ epicId })
  }

  function handleCopyStory() {
    if (!selectedStory) return
    setStoryModal({
      epicId: selectedStory.epicId,
      initialFields: {
        title:       selectedStory.title,
        asA:         selectedStory.asA,
        iWant:       selectedStory.iWant,
        soThat:      selectedStory.soThat,
        roleEfforts: selectedStory.roleEfforts.map(re => ({ ...re })),
        mvpPct:      selectedStory.mvpPct,
        mvpEnabled:  selectedStory.mvpEnabled,
        dependsOn:   [...selectedStory.dependsOn],
        labels:      [...selectedStory.labels],
      },
      isCopy: true,
    })
  }

  function handleSaveStory(fields: NewStoryInput) {
    if (!storyModal) return
    const id = state.addStory(storyModal.epicId, fields)
    setStoryModal(null)
    selectStory(id)
  }

  function handleImportStories(rows: ImportedRow[]) {
    for (const row of rows) {
      state.addStory(row.epicId, row.fields)
    }
    setImportOpen(false)
    setView('tree')
  }

  function handleDeleteRole(roleId: string) {
    const role = state.state.config.teamRoles.find(r => r.id === roleId)
    const used = storiesUsingRole(state.state, roleId)
    const name = role?.name ?? roleId
    const msg = used.length
      ? t('deleteRoleConfirmEffort', {
          name,
          n: String(used.length),
          ids: used.map(s => s.id).join(', '),
        })
      : t('deleteRoleConfirm', { name })
    if (!window.confirm(msg)) return
    state.removeRole(roleId)
  }

  function handleDeleteTag(tagId: string) {
    const tag = state.state.config.riskLayers.find(l => l.id === tagId)
    const name = tag?.name ?? tagId
    const used = storiesUsingTag(state.state, tagId)
    const msg = used.length
      ? t('deleteTagConfirmUsed', {
          name,
          n: String(used.length),
          ids: used.map(s => s.id).join(', '),
        })
      : t('deleteTagConfirm', { name })
    if (!window.confirm(msg)) return
    state.removeTag(tagId)
  }

  function handleDeleteStory(storyId: string) {
    const deps = dependentsOf(state.state, storyId)
    const msg = deps.length
      ? t('deleteStoryConfirmDeps', {
          id: storyId,
          n: String(deps.length),
          ids: deps.map(d => d.id).join(', '),
        })
      : t('deleteStoryConfirm')
    if (!window.confirm(msg)) return
    state.deleteStory(storyId)
    setSelectedId(null)
  }

  return (
    <>
      <div className="mobile-workspace-wall" aria-hidden="true">
        <div className="mw-inner">
          <div className="mw-logo">◉ Roadmap Studio</div>
          <div className="mw-divider" />
          <div className="mw-headline">Built for desktop</div>
          <p className="mw-body">
            The tree view, Gantt timeline, and live scheduling panels
            require a large screen — they can't be rearranged for touch or narrow viewports.
          </p>
          <div className="mw-cta">
            Open this on a laptop or desktop browser for the full experience.
          </div>
        </div>
      </div>
      <div className="workspace">
      <TopBar
        datasets={state.state.datasets}
        onReset={state.reset}
        roadmapName={roadmap.name}
        allRoadmaps={allRoadmaps}
        activeId={roadmap.id}
        storeError={storeError}
        onHome={onHome}
        onSwitchRoadmap={onSwitchRoadmap}
        onRenameRoadmap={onRenameRoadmap}
      />
      <div className="workspace-body">
        <LeftPanel
          teamRoles={state.state.config.teamRoles}
          riskLayers={state.state.config.riskLayers}
          stories={state.state.stories}
          onSetPeople={state.setTeamPeople}
          onAddRole={state.addRole}
          onRenameRole={state.renameRole}
          onRemoveRole={handleDeleteRole}
          onAddTag={state.addTag}
          onRemoveTag={handleDeleteTag}
          onToggleLayer={state.toggleRiskLayer}
        />
        <div className="center-col">
          <div className="view-toolbar">
            <ViewToggle view={view} onChange={setView} />
            {view !== 'assumptions' && (
              <button
                className="btn-checkpoint"
                data-testid="new-milestone"
                onClick={() => setModalOpen(true)}
              >
                ◇ {t('msNew')}
              </button>
            )}
            <button
              className="btn-checkpoint"
              data-testid="import-csv"
              onClick={() => setImportOpen(true)}
            >
              ↑ Import CSV
            </button>
          </div>
          {view === 'tree' && (
            <TreeView
              state={state.state}
              scheduledStories={state.scheduledStories}
              selectedId={selectedId}
              onSelect={selectStory}
              onReorderEpic={state.reorderEpic}
              onReorderStory={state.reorderStory}
              onAddStory={handleAddStory}
              onAddEpic={state.addEpic}
              onRenameEpic={state.updateEpicName}
              onDeleteEpic={state.deleteEpic}
            />
          )}
          {view === 'timeline' && (
            <TimelineView
              state={state.state}
              scheduledStories={state.scheduledStories}
              selectedId={selectedId}
              onSelect={selectStory}
              selectedMilestoneId={selectedMilestoneId}
              onSelectMilestone={selectMilestone}
              forecasts={state.milestoneForecasts}
              onReorderEpic={state.reorderEpic}
            />
          )}
          {view === 'assumptions' && (
            <AssumptionsView
              sections={state.state.assumptionSections}
              notes={state.state.assumptions}
              onAddSection={state.addSection}
              onRenameSection={state.renameSection}
              onDeleteSection={state.deleteSection}
              onAddNote={state.addNote}
              onUpdateNote={state.updateNote}
              onDeleteNote={state.deleteNote}
            />
          )}
        </div>
        {selectedMilestone ? (
          <MilestoneDetail
            milestone={selectedMilestone}
            forecast={
              state.milestoneForecasts.get(selectedMilestone.id) ?? {
                forecast: null, status: 'blocked', gapWeeks: 0,
              }
            }
            state={state.state}
            onClose={() => selectMilestone(null)}
          />
        ) : (
          <RightPanel
            story={selectedStory}
            scheduled={selectedScheduled}
            daysPerWeek={state.state.config.calendarConfig.daysPerWeek}
            teamRoles={state.state.config.teamRoles}
            riskLayers={state.state.config.riskLayers}
            effortScale={state.state.config.effortScale}
            epicStories={epicStories}
            onUpdateStory={state.updateStory}
            onCopyStory={selectedStory ? handleCopyStory : undefined}
            onDeleteStory={handleDeleteStory}
          />
        )}
      </div>

      {modalOpen && (
        <MilestoneModal
          state={state.state}
          onSave={handleCreateMilestone}
          onClose={() => setModalOpen(false)}
        />
      )}

      {storyModal && (
        <StoryModal
          epicId={storyModal.epicId}
          epics={state.state.epics}
          teamRoles={state.state.config.teamRoles}
          riskLayers={state.state.config.riskLayers}
          effortScale={state.state.config.effortScale}
          stories={state.state.stories}
          initialFields={storyModal.initialFields}
          isCopy={storyModal.isCopy}
          onSave={handleSaveStory}
          onClose={() => setStoryModal(null)}
        />
      )}

      {importOpen && (
        <CsvImportModal
          epics={state.state.epics}
          teamRoles={state.state.config.teamRoles}
          effortScale={state.state.config.effortScale}
          riskLayers={state.state.config.riskLayers}
          onImport={handleImportStories}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
    </>
  )
}
