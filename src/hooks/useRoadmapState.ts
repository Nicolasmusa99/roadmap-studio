import { useState, useMemo, useCallback } from 'react'
import type { AppState, ScheduledStory } from '../lib/types'
import { createInitialState } from '../data/baseline'
import { schedule } from '../lib/scheduler'
import { milestoneForecast, type MilestoneForecast } from '../lib/milestones'
import { validateEpicMove, validateStoryMove, reorderArray, type ReorderResult } from '../lib/reorder'

export interface RoadmapState {
  state: AppState
  scheduledStories: ScheduledStory[]
  milestoneForecasts: Map<string, MilestoneForecast>
  setTeamPeople: (roleId: string, people: number) => void
  toggleRiskLayer: (layerId: string) => void
  toggleMvpStory: (storyId: string) => void
  reorderEpic: (movingId: string, newIndex: number) => ReorderResult
  reorderStory: (epicId: string, movingId: string, newIndex: number) => ReorderResult
  addMilestone: (name: string, target: string, storyIds: string[]) => string
  reset: () => void
}

export function useRoadmapState(): RoadmapState {
  const [state, setState] = useState<AppState>(createInitialState)

  const scheduledStories = useMemo(
    () =>
      schedule({
        stories: state.stories,
        teamRoles: state.config.teamRoles,
        riskLayers: state.config.riskLayers,
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

  const toggleMvpStory = useCallback((storyId: string) => {
    setState(s => ({
      ...s,
      stories: s.stories.map(story =>
        story.id === storyId ? { ...story, mvpEnabled: !story.mvpEnabled } : story,
      ),
    }))
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

  const reset = useCallback(() => {
    setState(createInitialState())
  }, [])

  return {
    state,
    scheduledStories,
    milestoneForecasts,
    setTeamPeople,
    toggleRiskLayer,
    toggleMvpStory,
    reorderEpic,
    reorderStory,
    addMilestone,
    reset,
  }
}
