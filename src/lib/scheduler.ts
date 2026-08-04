import type { Story, TeamRole, RiskLayer, CalendarConfig, ScheduledStory } from './types'
import { parseDate, formatDate, addWorkingDays, nextWorkingDay } from './calendar'

export interface SchedulerInput {
  stories: Story[]
  teamRoles: TeamRole[]
  riskLayers: RiskLayer[]
  calendarConfig: CalendarConfig
}

// ─── Topological sort (Kahn's algorithm) ─────────────────────────────────────

// Returns story IDs in dependency order: a story always appears after its deps.
// Stories with equal priority are processed in their original list order (greedy).
function topoSort(stories: Story[]): string[] {
  const ids = new Set(stories.map(s => s.id))

  const inDegree = new Map<string, number>()
  const successors = new Map<string, string[]>() // depId → [stories that need it]

  for (const s of stories) {
    const validDeps = s.dependsOn.filter(d => ids.has(d))
    inDegree.set(s.id, validDeps.length)
    for (const dep of validDeps) {
      if (!successors.has(dep)) successors.set(dep, [])
      successors.get(dep)!.push(s.id)
    }
  }

  // Start with all root stories (no in-scope deps)
  const queue = stories.filter(s => (inDegree.get(s.id) ?? 0) === 0).map(s => s.id)
  const result: string[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    result.push(id)
    for (const succ of (successors.get(id) ?? [])) {
      const deg = (inDegree.get(succ) ?? 0) - 1
      inDegree.set(succ, deg)
      if (deg === 0) queue.push(succ)
    }
  }

  // Append any unprocessed (cycle survivors — should not exist after wouldCreateCycle guard)
  const seen = new Set(result)
  for (const s of stories) {
    if (!seen.has(s.id)) result.push(s.id)
  }

  return result
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

// Resource-leveled, greedy scheduler (product-model §Scheduler).
// Processes stories in dependency order; a role can only be in one story at a time.
export function schedule(input: SchedulerInput): ScheduledStory[] {
  const { stories, teamRoles, riskLayers, calendarConfig } = input
  const { daysPerWeek, holidays, startDate: startDateStr } = calendarConfig

  const roleMap = new Map(teamRoles.map(r => [r.id, r]))

  // Scope multiplier: activeLayers / totalLayers (invariant #12).
  // 0 layers → mult = 1 (no reduction).
  const totalLayers = riskLayers.length
  const activeLayers = riskLayers.filter(l => l.active).length
  const layerMult = totalLayers === 0 ? 1 : activeLayers / totalLayers

  // First working day in the schedule
  const globalStart = nextWorkingDay(parseDate(startDateStr), holidays)

  const orderedIds = topoSort(stories)
  const storyMap = new Map(stories.map(s => [s.id, s]))

  // Role availability: roleId → earliest Date the role is free again
  const roleNextAvail = new Map<string, Date>()
  const scheduledMap = new Map<string, ScheduledStory>()

  for (const id of orderedIds) {
    const story = storyMap.get(id)!

    // TC-020: any required role at 0 people → story is blocked
    const roleBlocked = story.roleEfforts.some(
      re => (roleMap.get(re.roleId)?.people ?? 0) === 0,
    )

    // Propagate block from dependencies
    const depBlocked = story.dependsOn.some(depId => scheduledMap.get(depId)?.blocked)

    if (roleBlocked || depBlocked) {
      scheduledMap.set(id, {
        storyId: id,
        startDate: '',
        endDate: '',
        durationDays: 0,
        blocked: true,
        blockedReason: roleBlocked ? 'role-unavailable' : 'dependency-blocked',
      })
      continue
    }

    // ── Duration formula (product-model §Scheduler) ───────────────────────
    // durSemanas = ceil( max_per_role( effortDays * mult / (daysPerWeek * people) ) )
    // durationDays = durSemanas * daysPerWeek  (invariant #5, TC-015, TC-016)
    const mvpMult = story.mvpEnabled ? story.mvpPct / 100 : 1
    const mult = layerMult * mvpMult

    let maxRatio = 0
    for (const re of story.roleEfforts) {
      const people = roleMap.get(re.roleId)?.people ?? 1
      const ratio = (re.days * mult) / (daysPerWeek * people)
      if (ratio > maxRatio) maxRatio = ratio
    }

    const durationWeeks = Math.ceil(maxRatio)
    const durationDays = durationWeeks * daysPerWeek

    // ── Start date ────────────────────────────────────────────────────────
    let startDate = new Date(globalStart)

    // Push after dependency end dates
    for (const depId of story.dependsOn) {
      const dep = scheduledMap.get(depId)
      if (dep && !dep.blocked && dep.endDate) {
        const afterDep = addWorkingDays(parseDate(dep.endDate), 1, holidays)
        if (afterDep > startDate) startDate = new Date(afterDep)
      }
    }

    // Push after role availability (resource leveling — invariant #5)
    for (const re of story.roleEfforts) {
      const avail = roleNextAvail.get(re.roleId)
      if (avail && avail > startDate) startDate = new Date(avail)
    }

    // Guarantee landing on an actual working day
    startDate = nextWorkingDay(startDate, holidays)

    // ── End date (last working day occupied, inclusive) ───────────────────
    const endDate = durationDays === 0
      ? new Date(startDate)
      : addWorkingDays(startDate, durationDays - 1, holidays)

    // Release roles on the first working day after this story ends
    const nextAvail = addWorkingDays(endDate, 1, holidays)
    for (const re of story.roleEfforts) {
      const cur = roleNextAvail.get(re.roleId)
      if (!cur || nextAvail > cur) roleNextAvail.set(re.roleId, nextAvail)
    }

    scheduledMap.set(id, {
      storyId: id,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      durationDays,
      blocked: false,
    })
  }

  return stories.map(s => scheduledMap.get(s.id) ?? {
    storyId: s.id,
    startDate: '',
    endDate: '',
    durationDays: 0,
    blocked: true,
    blockedReason: 'not-scheduled',
  })
}
