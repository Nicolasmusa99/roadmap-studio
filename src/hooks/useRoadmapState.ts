import { useState, useMemo, useCallback } from 'react'
import type { AppState, ScheduledStory, Story, NewStoryInput } from '../lib/types'
import type { PreparedImport } from '../lib/csvImport'
import { createInitialState } from '../data/baseline'
import { schedule } from '../lib/scheduler'
import { storiesInScope } from '../lib/threats'
import { milestoneForecast, type MilestoneForecast } from '../lib/milestones'
import { validateEpicMove, validateStoryMove, reorderArray, type ReorderResult } from '../lib/reorder'
import { clampMvpPct } from '../lib/validation'
import { applyEstimationAction } from '../lib/estimation'
import { removeStoryFromState, removeEpicFromState, removeRoleFromState, removeTagFromState, removeSectionFromState } from '../lib/mutations'

export interface RoadmapState {
  state: AppState
  scheduledStories: ScheduledStory[]
  milestoneForecasts: Map<string, MilestoneForecast>
  setTeamPeople: (roleId: string, people: number) => void
  addRole: (name: string) => string
  renameRole: (roleId: string, name: string) => void
  removeRole: (roleId: string) => void
  addTag: (name: string) => string
  removeTag: (tagId: string) => void
  toggleRiskLayer: (layerId: string) => void
  toggleMvpStory: (storyId: string) => void
  updateStory: (storyId: string, patch: Partial<Story>) => void
  addStory: (epicId: string, fields: NewStoryInput) => string
  deleteStory: (storyId: string) => void
  addEpic: (componentId: string, name: string) => string
  updateEpicName: (epicId: string, name: string) => void
  deleteEpic: (epicId: string) => void
  reorderEpic: (movingId: string, newIndex: number) => ReorderResult
  reorderStory: (epicId: string, movingId: string, newIndex: number) => ReorderResult
  addMilestone: (name: string, target: string, storyIds: string[]) => string
  importBatch: (prepared: PreparedImport) => void
  addSection: (name: string) => string
  renameSection: (sectionId: string, name: string) => void
  deleteSection: (sectionId: string) => void
  addNote: (sectionId: string) => string
  updateNote: (id: string, text: string) => void
  deleteNote: (id: string) => void
  reset: () => void
}

export function useRoadmapState(initialState?: AppState): RoadmapState {
  const [state, setState] = useState<AppState>(() => initialState ?? createInitialState())

  // Threat scoping happens here, upstream of the scheduler: stories carrying an
  // inactive threat's label are filtered out entirely, so the schedule (and every
  // date derived from it) reflects only the work still in scope. Unchecking a
  // threat therefore removes its stories from Tree/Timeline and recomputes the
  // epics/milestones that lose that work. (invariant #12, hybrid model)
  const scheduledStories = useMemo(
    () =>
      schedule({
        stories: storiesInScope(state.stories, state.config.riskLayers),
        teamRoles: state.config.teamRoles,
        calendarConfig: state.config.calendarConfig,
      }),
    [state.stories, state.config.teamRoles, state.config.riskLayers, state.config.calendarConfig],
  )

  // Milestone forecast/status/gap — derived from the schedule, never stored (US-016).
  const milestoneForecasts = useMemo(() => {
    const m = new Map<string, MilestoneForecast>()
    for (const ms of state.milestones) {
      m.set(ms.id, milestoneForecast(ms, scheduledStories, state.config.calendarConfig))
    }
    return m
  }, [state.milestones, scheduledStories, state.config.calendarConfig])

  const setTeamPeople = useCallback((roleId: string, people: number) => {
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        teamRoles: s.config.teamRoles.map(r =>
          r.id === roleId ? { ...r, people: Math.max(0, people) } : r,
        ),
      },
    }))
  }, [])

  // Add a role with a starter capacity of 1 person so it can schedule work
  // immediately. Returns the generated id. Roles are never protected — the whole
  // team is user-defined (the four defaults are just a convenient starting point).
  const addRole = useCallback((name: string): string => {
    const id = `role-user-${Date.now()}`
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        teamRoles: [...s.config.teamRoles, { id, name: name.trim(), people: 1 }],
      },
    }))
    return id
  }, [])

  const renameRole = useCallback((roleId: string, name: string) => {
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        teamRoles: s.config.teamRoles.map(r =>
          r.id === roleId ? { ...r, name: name.trim() } : r,
        ),
      },
    }))
  }, [])

  // Deleting a role also strips its effort from every story (removeRoleFromState),
  // so no story is left pointing at a role that no longer exists. The App-level
  // handler warns first when stories depend on it (storiesUsingRole).
  const removeRole = useCallback((roleId: string) => {
    setState(s => removeRoleFromState(s, roleId))
  }, [])

  const addTag = useCallback((name: string): string => {
    const id = `tag-user-${Date.now()}`
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        riskLayers: [...s.config.riskLayers, { id, name: name.trim(), active: true }],
      },
    }))
    return id
  }, [])

  const removeTag = useCallback((tagId: string) => {
    setState(s => removeTagFromState(s, tagId))
  }, [])

  const toggleRiskLayer = useCallback((layerId: string) => {
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        riskLayers: s.config.riskLayers.map(l =>
          l.id === layerId ? { ...l, active: !l.active } : l,
        ),
      },
    }))
  }, [])

  // Merge patch into the story identified by storyId.
  // - mvpPct: clamped defensively via clampMvpPct (TC-050).
  // - roleEfforts: if changed, applies applyEstimationAction to transition
  //   estimationState (TC-048). Structural comparison prevents a no-op save
  //   from flipping an 'auto' story to 'unestimated'.
  const updateStory = useCallback((storyId: string, patch: Partial<Story>) => {
    setState(s => {
      const story = s.stories.find(st => st.id === storyId)
      if (!story) return s

      const mvpPct = patch.mvpPct !== undefined
        ? clampMvpPct(patch.mvpPct)
        : story.mvpPct

      let estimationState = story.estimationState
      if (patch.roleEfforts !== undefined) {
        const prev = story.roleEfforts
        const next = patch.roleEfforts
        const changed =
          next.length !== prev.length ||
          next.some((re, i) => re.roleId !== prev[i]?.roleId || re.days !== prev[i]?.days)
        if (changed) {
          estimationState = applyEstimationAction(
            story.estimationState,
            next.length > 0 ? 'load' : 'clear',
          )
        }
      }

      return {
        ...s,
        stories: s.stories.map(st =>
          st.id === storyId ? { ...story, ...patch, mvpPct, estimationState } : st,
        ),
      }
    })
  }, [])

  // Append a new story to the given epic. Returns the generated id.
  // estimationState: 'manual' if any role has days>0, else 'unestimated'.
  // isDraft: true when the narrative fields are incomplete.
  const addStory = useCallback((epicId: string, fields: NewStoryInput): string => {
    const id = `H-user-${Date.now()}`
    const estimationState = fields.roleEfforts.some(re => re.days > 0) ? 'manual' : 'unestimated'
    const isDraft = !fields.title.trim() || !fields.asA.trim() || !fields.iWant.trim() || !fields.soThat.trim()
    const story: Story = {
      id, epicId,
      ...fields,
      mvpPct: clampMvpPct(fields.mvpPct),
      estimationState,
      isDraft,
      isProtected: false,
      useCases: [],
      rules: [],
      datasetIds: [],
    }
    setState(s => ({ ...s, stories: [...s.stories, story] }))
    return id
  }, [])

  const deleteStory = useCallback((storyId: string) => {
    setState(s => removeStoryFromState(s, storyId))
  }, [])

  const toggleMvpStory = useCallback((storyId: string) => {
    setState(s => ({
      ...s,
      stories: s.stories.map(story =>
        story.id === storyId ? { ...story, mvpEnabled: !story.mvpEnabled } : story,
      ),
    }))
  }, [])

  const addEpic = useCallback((componentId: string, name: string): string => {
    const id = `epic-user-${Date.now()}`
    setState(s => ({
      ...s,
      epics: [...s.epics, { id, componentId, name: name.trim(), isProtected: false }],
    }))
    return id
  }, [])

  const updateEpicName = useCallback((epicId: string, name: string) => {
    setState(s => ({
      ...s,
      epics: s.epics.map(e => e.id === epicId ? { ...e, name: name.trim() } : e),
    }))
  }, [])

  const deleteEpic = useCallback((epicId: string) => {
    setState(s => removeEpicFromState(s, epicId))
  }, [])

  // Reorder epics globally — validates cross-epic deps (TC-024) before mutating state.
  // When the epic order changes we re-sort the stories array so the scheduler sees the right priority.
  const reorderEpic = useCallback(
    (movingId: string, newIndex: number): ReorderResult => {
      const result = validateEpicMove(state.epics, state.stories, movingId, newIndex)
      if (!result.ok) return result

      setState(s => {
        const fromIdx = s.epics.findIndex(e => e.id === movingId)
        if (fromIdx === -1) return s
        const newEpics = reorderArray(s.epics, fromIdx, newIndex)

        // Re-sort stories to match new epic order so the scheduler respects priority
        const epicPos = new Map(newEpics.map((e, i) => [e.id, i]))
        const newStories = [...s.stories].sort((a, b) => {
          const epicDiff = (epicPos.get(a.epicId) ?? 0) - (epicPos.get(b.epicId) ?? 0)
          if (epicDiff !== 0) return epicDiff
          return s.stories.indexOf(a) - s.stories.indexOf(b)
        })

        return { ...s, epics: newEpics, stories: newStories }
      })

      return result
    },
    [state.epics, state.stories],
  )

  // Reorder stories within their epic — validates internal deps before mutating.
  const reorderStory = useCallback(
    (epicId: string, movingId: string, newIndex: number): ReorderResult => {
      const epicStories = state.stories.filter(s => s.epicId === epicId)
      const result = validateStoryMove(epicStories, movingId, newIndex)
      if (!result.ok) return result

      setState(s => {
        const es = s.stories.filter(st => st.epicId === epicId)
        const fromIdx = es.findIndex(st => st.id === movingId)
        if (fromIdx === -1) return s
        const reordered = reorderArray(es, fromIdx, newIndex)

        // Replace this epic's block in the global stories array
        const epicIds = new Set(es.map(st => st.id))
        const newStories: typeof s.stories = []
        let inserted = false
        for (const story of s.stories) {
          if (epicIds.has(story.id)) {
            if (!inserted) { newStories.push(...reordered); inserted = true }
          } else {
            newStories.push(story)
          }
        }
        return { ...s, stories: newStories }
      })

      return result
    },
    [state.stories],
  )

  // Atomically apply a PreparedImport: create new tags, create new epics (mapping
  // temp IDs → real IDs), then add all stories. Done in one setState to avoid
  // Date.now() collisions and redundant re-renders from sequential mutations.
  const importBatch = useCallback((prepared: PreparedImport): void => {
    const batchTs = Date.now()
    setState(s => {
      let ns = { ...s }

      // 1. Create new tags, skipping any that match an existing name.
      if (prepared.newTags.length > 0) {
        const existingNames = new Set(ns.config.riskLayers.map(l => l.name.toLowerCase().trim()))
        const freshLayers = [...ns.config.riskLayers]
        prepared.newTags.forEach((spec, i) => {
          const norm = spec.name.toLowerCase().trim()
          if (norm && !existingNames.has(norm)) {
            freshLayers.push({ id: `tag-import-${batchTs}-${i}`, name: spec.name.trim(), active: true })
            existingNames.add(norm)
          }
        })
        ns = { ...ns, config: { ...ns.config, riskLayers: freshLayers } }
      }

      // 2. Create new epics and build tempId → realId map for story resolution.
      const tempToReal = new Map<string, string>()
      if (prepared.newEpics.length > 0) {
        const freshEpics = [...ns.epics]
        prepared.newEpics.forEach((spec, i) => {
          const realId = `epic-import-${batchTs}-${i}`
          freshEpics.push({ id: realId, componentId: spec.componentId, name: spec.name, isProtected: false })
          tempToReal.set(spec.tempId, realId)
        })
        ns = { ...ns, epics: freshEpics }
      }

      // 3. Add stories. Replace temp epic IDs with the real ones assigned above.
      const freshStories = [...ns.stories]
      prepared.rows.forEach((row, i) => {
        const epicId = tempToReal.get(row.epicId) ?? row.epicId
        const fields = row.fields
        const estimationState = fields.roleEfforts.some(re => re.days > 0) ? 'manual' : 'unestimated'
        const isDraft = !fields.title.trim() || !fields.asA.trim() || !fields.iWant.trim() || !fields.soThat.trim()
        freshStories.push({
          id: `H-import-${batchTs}-${i}`,
          epicId,
          ...fields,
          mvpPct: clampMvpPct(fields.mvpPct),
          estimationState,
          isDraft,
          isProtected: false,
          useCases: [],
          rules: [],
          datasetIds: [],
        })
      })
      return { ...ns, stories: freshStories }
    })
  }, [])

  // Create a transversal milestone (US-015). target is a committed date (YYYY-MM-DD);
  // forecast is always derived from the schedule, never stored. Returns the new id.
  const addMilestone = useCallback((name: string, target: string, storyIds: string[]): string => {
    const id = `ms-user-${Date.now()}`
    setState(s => ({
      ...s,
      milestones: [...s.milestones, { id, name, target, storyIds }],
    }))
    return id
  }, [])

  // ── Notes / Assumptions (invariant #15: free-form, user-defined sections) ───
  const addSection = useCallback((name: string): string => {
    const id = `sec-user-${Date.now()}`
    setState(s => ({
      ...s,
      assumptionSections: [...s.assumptionSections, { id, name: name.trim() }],
    }))
    return id
  }, [])

  const renameSection = useCallback((sectionId: string, name: string) => {
    setState(s => ({
      ...s,
      assumptionSections: s.assumptionSections.map(sec =>
        sec.id === sectionId ? { ...sec, name: name.trim() || sec.name } : sec,
      ),
    }))
  }, [])

  const deleteSection = useCallback((sectionId: string) => {
    setState(s => removeSectionFromState(s, sectionId))
  }, [])

  const addNote = useCallback((sectionId: string): string => {
    const id = `note-user-${Date.now()}`
    setState(s => ({
      ...s,
      assumptions: [...s.assumptions, { id, sectionId, text: '' }],
    }))
    return id
  }, [])

  const updateNote = useCallback((id: string, text: string) => {
    setState(s => ({
      ...s,
      assumptions: s.assumptions.map(a => (a.id === id ? { ...a, text } : a)),
    }))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setState(s => ({ ...s, assumptions: s.assumptions.filter(a => a.id !== id) }))
  }, [])

  const reset = useCallback(() => {
    setState(createInitialState())
  }, [])

  return {
    state,
    scheduledStories,
    milestoneForecasts,
    setTeamPeople,
    addRole,
    renameRole,
    removeRole,
    addTag,
    removeTag,
    toggleRiskLayer,
    toggleMvpStory,
    updateStory,
    addStory,
    deleteStory,
    addEpic,
    updateEpicName,
    deleteEpic,
    reorderEpic,
    reorderStory,
    addMilestone,
    importBatch,
    addSection,
    renameSection,
    deleteSection,
    addNote,
    updateNote,
    deleteNote,
    reset,
  }
}
