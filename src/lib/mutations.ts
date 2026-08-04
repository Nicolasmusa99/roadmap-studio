import type { AppState, Story } from './types'

// Pure state transformations used by the hook mutations.
// Each function returns a new AppState without mutating the input.

// ─── Deletion impact queries (for dependency-aware confirmations) ─────────────

// Direct dependents of a story: the stories that name `storyId` in their dependsOn.
// removeStoryFromState will strip the reference from each of these, so surfacing
// them lets the user see who is affected before confirming (no silent orphans).
export function dependentsOf(state: AppState, storyId: string): Story[] {
  return state.stories.filter(s => s.id !== storyId && s.dependsOn.includes(storyId))
}

// Impact of deleting an epic: the stories that go with it (cascade) and the
// surviving stories OUTSIDE the epic that depend on any of them (whose dependsOn
// removeEpicFromState will clean up). Lets the confirmation state the full blast radius.
export function epicDeletionImpact(
  state: AppState,
  epicId: string,
): { cascade: Story[]; externalDependents: Story[] } {
  const cascadeIds = new Set(state.stories.filter(s => s.epicId === epicId).map(s => s.id))
  const cascade = state.stories.filter(s => cascadeIds.has(s.id))
  const externalDependents = state.stories.filter(
    s => !cascadeIds.has(s.id) && s.dependsOn.some(d => cascadeIds.has(d)),
  )
  return { cascade, externalDependents }
}

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
