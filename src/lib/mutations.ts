import type { AppState } from './types'

// Pure state transformations used by the hook mutations.
// Each function returns a new AppState without mutating the input.

export function removeStoryFromState(state: AppState, storyId: string): AppState {
  return {
    ...state,
    stories: state.stories
      .filter(s => s.id !== storyId)
      .map(s => ({
        ...s,
        dependsOn: s.dependsOn.filter(d => d !== storyId),
      })),
    milestones: state.milestones.map(m => ({
      ...m,
      storyIds: m.storyIds.filter(id => id !== storyId),
    })),
  }
}

// Removes a non-protected epic plus all its stories, cleaning up dependsOn
// references in surviving stories and removing story IDs from milestones.
export function removeEpicFromState(state: AppState, epicId: string): AppState {
  const epicStoryIds = new Set(
    state.stories.filter(s => s.epicId === epicId).map(s => s.id),
  )
  return {
    ...state,
    epics: state.epics.filter(e => e.id !== epicId),
    stories: state.stories
      .filter(s => s.epicId !== epicId)
      .map(s => ({
        ...s,
        dependsOn: s.dependsOn.filter(d => !epicStoryIds.has(d)),
      })),
    milestones: state.milestones.map(m => ({
      ...m,
      storyIds: m.storyIds.filter(id => !epicStoryIds.has(id)),
    })),
  }
}
