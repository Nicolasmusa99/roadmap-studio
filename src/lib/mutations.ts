import type { AppState, Story, AssumptionSection } from './types'

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

// Stories that assign effort to a given role. Deleting the role strips those
// roleEfforts (see removeRoleFromState), so surfacing them lets the confirmation
// state the blast radius before the user commits — same no-orphan criterion used
// for deleting stories/epics.
export function storiesUsingRole(state: AppState, roleId: string): Story[] {
  return state.stories.filter(s => s.roleEfforts.some(re => re.roleId === roleId))
}

// Stories that carry a given tag label (matched case-insensitively by name, since
// story.labels stores names, not IDs). Used for the delete-tag blast-radius warning.
export function storiesUsingTag(state: AppState, tagId: string): Story[] {
  const tag = state.config.riskLayers.find(l => l.id === tagId)
  if (!tag) return []
  const lower = tag.name.toLowerCase()
  return state.stories.filter(s => s.labels.some(l => l.toLowerCase() === lower))
}

// Removes a tag from riskLayers and strips its name from every story's labels
// so no story is left pointing at a tag that no longer exists.
export function removeTagFromState(state: AppState, tagId: string): AppState {
  const tag = state.config.riskLayers.find(l => l.id === tagId)
  if (!tag) return state
  const lower = tag.name.toLowerCase()
  return {
    ...state,
    stories: state.stories.map(s => ({
      ...s,
      labels: s.labels.filter(l => l.toLowerCase() !== lower),
    })),
    config: {
      ...state.config,
      riskLayers: state.config.riskLayers.filter(l => l.id !== tagId),
    },
  }
}

// Removes a role from the team and strips every roleEffort referencing it from
// all stories, so no story is left pointing at a role that no longer exists.
export function removeRoleFromState(state: AppState, roleId: string): AppState {
  return {
    ...state,
    stories: state.stories.map(s => ({
      ...s,
      roleEfforts: s.roleEfforts.filter(re => re.roleId !== roleId),
    })),
    config: {
      ...state.config,
      teamRoles: state.config.teamRoles.filter(r => r.id !== roleId),
    },
  }
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

// Removes a note section and cascades to delete all notes inside it.
export function removeSectionFromState(state: AppState, sectionId: string): AppState {
  return {
    ...state,
    assumptionSections: state.assumptionSections.filter(s => s.id !== sectionId),
    assumptions: state.assumptions.filter(a => a.sectionId !== sectionId),
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
