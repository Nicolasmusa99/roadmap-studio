import type { AppState } from './types'

export const STORAGE_KEY = 'roadmap-studio-v1'
export const SCHEMA_VERSION = 1

export interface StoredRoadmap {
  id: string
  name: string
  lastEdited: string  // ISO 8601
  state: AppState
}

export interface RoadmapsStore {
  schemaVersion: number
  roadmaps: StoredRoadmap[]
}

export type StorageError = 'unavailable' | 'quota-exceeded' | 'corrupt'

export function loadStore(): { data: RoadmapsStore | null; error?: StorageError } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { data: null }
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== 'object' || parsed === null ||
      typeof parsed.schemaVersion !== 'number' ||
      !Array.isArray(parsed.roadmaps)
    ) {
      return { data: null, error: 'corrupt' }
    }
    return { data: parsed as RoadmapsStore }
  } catch {
    return { data: null, error: 'unavailable' }
  }
}

export function saveStore(store: RoadmapsStore): StorageError | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    return null
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      return 'quota-exceeded'
    }
    return 'unavailable'
  }
}

export function emptyStore(): RoadmapsStore {
  return { schemaVersion: SCHEMA_VERSION, roadmaps: [] }
}
