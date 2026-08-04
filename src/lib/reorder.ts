import type { Epic, Story } from './types'

export interface ReorderResult {
  ok: boolean
  // i18n-agnostic: return a key + params; the caller translates.
  errorKey?: string
  errorParams?: Record<string, string>
}

// Move element at `from` to "before the element currently at `to`".
export function reorderArray<T>(arr: readonly T[], from: number, to: number): T[] {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  const insertAt = to > from ? to - 1 : to
  result.splice(insertAt, 0, item)
  return result
}

// Core check: does any story appear before one of its dependencies?
// Only checks deps whose IDs are in `scopeIds`.
function firstViolation(
  orderedStories: Story[],
  scopeIds: Set<string>,
): { storyId: string; depId: string } | null {
  const posMap = new Map(orderedStories.map((s, i) => [s.id, i]))
  for (const story of orderedStories) {
    const myPos = posMap.get(story.id)!
    for (const depId of story.dependsOn) {
      if (!scopeIds.has(depId)) continue
      const depPos = posMap.get(depId)
      if (depPos !== undefined && depPos > myPos) {
        return { storyId: story.id, depId }
      }
    }
  }
  return null
}

// ─── TC-024: validate epic reorder ──────────────────────────────────────────
export function validateEpicMove(
  allEpics: Epic[],
  allStories: Story[],
  movingEpicId: string,
  newIndex: number,
): ReorderResult {
  const fromIdx = allEpics.findIndex(e => e.id === movingEpicId)
  if (fromIdx === -1 || fromIdx === newIndex || fromIdx + 1 === newIndex) return { ok: true }

  const newEpics = reorderArray(allEpics, fromIdx, newIndex)
  const orderedStories = newEpics.flatMap(e => allStories.filter(s => s.epicId === e.id))
  const allStoryIds = new Set(allStories.map(s => s.id))

  const v = firstViolation(orderedStories, allStoryIds)
  if (!v) return { ok: true }

  const depStory = allStories.find(s => s.id === v.depId)
  const depEpic = allEpics.find(e => e.id === depStory?.epicId)
  const movingEpic = allEpics.find(e => e.id === movingEpicId)

  return {
    ok: false,
    errorKey: 'errEpicMove',
    errorParams: {
      epicName:    movingEpic?.name ?? movingEpicId,
      storyId:     v.storyId,
      depId:       v.depId,
      depEpicName: depEpic?.name ?? v.depId,
    },
  }
}

// ─── Validate story reorder (within one epic) ────────────────────────────────
export function validateStoryMove(
  epicStories: Story[],
  movingStoryId: string,
  newIndex: number,
): ReorderResult {
  const fromIdx = epicStories.findIndex(s => s.id === movingStoryId)
  if (fromIdx === -1 || fromIdx === newIndex || fromIdx + 1 === newIndex) return { ok: true }

  const newStories = reorderArray(epicStories, fromIdx, newIndex)
  const epicStoryIds = new Set(epicStories.map(s => s.id))

  const v = firstViolation(newStories, epicStoryIds)
  if (!v) return { ok: true }

  return {
    ok: false,
    errorKey: 'errStoryMove',
    errorParams: {
      storyTitle: epicStories.find(s => s.id === movingStoryId)?.title ?? movingStoryId,
      depId:      v.depId,
    },
  }
}
