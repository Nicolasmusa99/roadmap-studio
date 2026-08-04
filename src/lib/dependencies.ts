import type { Story } from './types'

// ─── Cycle detection ──────────────────────────────────────────────────────────

// Returns true if adding `fromId.dependsOn.push(toId)` would create a cycle.
// Checks whether `toId` can already reach `fromId` through existing dependsOn edges.
// Self-dependency (fromId === toId) is also rejected. (TC-023)
export function wouldCreateCycle(stories: Story[], fromId: string, toId: string): boolean {
  if (fromId === toId) return true

  const storyMap = new Map(stories.map(s => [s.id, s]))

  // DFS from toId following dependsOn edges; cycle if we reach fromId
  const visited = new Set<string>()
  const stack = [toId]

  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === fromId) return true
    if (visited.has(current)) continue
    visited.add(current)
    const story = storyMap.get(current)
    if (story) {
      for (const dep of story.dependsOn) {
        if (!visited.has(dep)) stack.push(dep)
      }
    }
  }

  return false
}

// ─── Dependency classification ────────────────────────────────────────────────

// Invariant #8: same epic → internal (local order, never escapes the epic).
// Different epic → cross-epic (propagates to epic-level dependency). (TC-022)
export function classifyDep(
  fromStory: Story,
  toStory: Story,
): 'internal' | 'cross-epic' {
  return fromStory.epicId === toStory.epicId ? 'internal' : 'cross-epic'
}

// ─── Epic-level dependency propagation ───────────────────────────────────────

export interface EpicDep {
  fromEpicId: string
  toEpicId: string
  storyId: string          // story that owns the cross-epic dependsOn
  dependsOnStoryId: string // the story being depended on
}

// Collects all cross-epic dependencies from the stories list and returns them
// as epic-level edges. (TC-022: "C1→A2 se propaga como dep entre esos epics")
export function getEpicDeps(stories: Story[]): EpicDep[] {
  const epicOf = new Map(stories.map(s => [s.id, s.epicId]))
  const deps: EpicDep[] = []

  for (const story of stories) {
    for (const depId of story.dependsOn) {
      const depEpicId = epicOf.get(depId)
      if (depEpicId !== undefined && depEpicId !== story.epicId) {
        deps.push({
          fromEpicId: story.epicId,
          toEpicId: depEpicId,
          storyId: story.id,
          dependsOnStoryId: depId,
        })
      }
    }
  }

  return deps
}
