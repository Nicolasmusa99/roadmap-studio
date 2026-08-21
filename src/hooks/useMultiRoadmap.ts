import { useState, useEffect, useCallback } from 'react'
import type { AppState } from '../lib/types'
import type { StoredRoadmap, StorageError } from '../lib/storage'
import { loadStore, saveStore, SCHEMA_VERSION } from '../lib/storage'
import { createInitialState } from '../data/baseline'

export interface MultiRoadmapState {
  roadmaps: StoredRoadmap[]
  activeId: string | null
  storeError: StorageError | null
  createRoadmap: (name: string) => string
  openRoadmap: (id: string) => void
  closeRoadmap: () => void
  renameRoadmap: (id: string, name: string) => void
  deleteRoadmap: (id: string) => void
  saveActiveRoadmap: (state: AppState) => void
}

export function useMultiRoadmap(): MultiRoadmapState {
  const [roadmaps, setRoadmaps] = useState<StoredRoadmap[]>(() => {
    const { data } = loadStore()
    return data?.roadmaps ?? []
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [storeError, setStoreError] = useState<StorageError | null>(null)

  // Persist whenever roadmaps changes
  useEffect(() => {
    const err = saveStore({ schemaVersion: SCHEMA_VERSION, roadmaps })
    setStoreError(err ?? null)
  }, [roadmaps])

  const createRoadmap = useCallback((name: string): string => {
    const id = `rm-${Date.now()}`
    const newRoadmap: StoredRoadmap = {
      id,
      name: name.trim() || 'New Roadmap',
      lastEdited: new Date().toISOString(),
      state: createInitialState(),
    }
    setRoadmaps(prev => [...prev, newRoadmap])
    setActiveId(id)
    return id
  }, [])

  const openRoadmap = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const closeRoadmap = useCallback(() => {
    setActiveId(null)
  }, [])

  const renameRoadmap = useCallback((id: string, name: string) => {
    setRoadmaps(prev =>
      prev.map(r => (r.id === id ? { ...r, name: name.trim() || r.name } : r)),
    )
  }, [])

  const deleteRoadmap = useCallback((id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id))
    setActiveId(prev => (prev === id ? null : prev))
  }, [])

  // Called with debounce from the workspace to save the active roadmap's state.
  const saveActiveRoadmap = useCallback((state: AppState) => {
    setRoadmaps(prev =>
      prev.map(r =>
        r.id === activeId
          ? { ...r, state, lastEdited: new Date().toISOString() }
          : r,
      ),
    )
  }, [activeId])

  return {
    roadmaps,
    activeId,
    storeError,
    createRoadmap,
    openRoadmap,
    closeRoadmap,
    renameRoadmap,
    deleteRoadmap,
    saveActiveRoadmap,
  }
}
