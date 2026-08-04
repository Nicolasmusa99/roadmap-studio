import { useState } from 'react'
import { useRoadmapState } from './hooks/useRoadmapState.ts'
import TopBar from './components/TopBar.tsx'
import LeftPanel from './components/LeftPanel.tsx'
import TreeView from './components/TreeView.tsx'
import TimelineView from './components/TimelineView.tsx'
import ViewToggle, { type View } from './components/ViewToggle.tsx'
import RightPanel from './components/RightPanel.tsx'
import MilestoneModal from './components/MilestoneModal.tsx'
import MilestoneDetail from './components/MilestoneDetail.tsx'
import { useI18n } from './i18n/I18nContext.tsx'

export default function App() {
  const roadmap = useRoadmapState()
  const { t } = useI18n()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [view, setView] = useState<View>('tree')
  const [modalOpen, setModalOpen] = useState(false)

  // Story and milestone selection are mutually exclusive: the right panel shows one detail.
  const selectStory = (id: string | null) => { setSelectedMilestoneId(null); setSelectedId(id) }
  const selectMilestone = (id: string | null) => { setSelectedId(null); setSelectedMilestoneId(id) }

  const selectedStory = selectedId
    ? (roadmap.state.stories.find(s => s.id === selectedId) ?? null)
    : null
  const selectedScheduled = selectedId
    ? (roadmap.scheduledStories.find(s => s.storyId === selectedId) ?? null)
    : null
  const selectedMilestone = selectedMilestoneId
    ? (roadmap.state.milestones.find(m => m.id === selectedMilestoneId) ?? null)
    : null

  function handleCreateMilestone(name: string, target: string, storyIds: string[]) {
    const id = roadmap.addMilestone(name, target, storyIds)
    setModalOpen(false)
    setView('timeline')      // show the new checkpoint on the timeline
    selectMilestone(id)
  }

  return (
    <div className="workspace">
      <TopBar datasets={roadmap.state.datasets} onReset={roadmap.reset} />
      <div className="workspace-body">
        <LeftPanel
          teamRoles={roadmap.state.config.teamRoles}
          riskLayers={roadmap.state.config.riskLayers}
          stories={roadmap.state.stories}
          onSetPeople={roadmap.setTeamPeople}
          onToggleLayer={roadmap.toggleRiskLayer}
        />
        {/* Center column: view toolbar + the active view. selectedId is shared by
            both views, so switching preserves the selection (US-002 UC-02). */}
        <div className="center-col">
          <div className="view-toolbar">
            <ViewToggle view={view} onChange={setView} />
            <button
              className="btn-checkpoint"
              data-testid="new-milestone"
              onClick={() => setModalOpen(true)}
            >
              ◇ {t('msNew')}
            </button>
          </div>
          {view === 'tree' ? (
            <TreeView
              state={roadmap.state}
              scheduledStories={roadmap.scheduledStories}
              selectedId={selectedId}
              onSelect={selectStory}
              onReorderEpic={roadmap.reorderEpic}
              onReorderStory={roadmap.reorderStory}
            />
          ) : (
            <TimelineView
              state={roadmap.state}
              scheduledStories={roadmap.scheduledStories}
              selectedId={selectedId}
              onSelect={selectStory}
              selectedMilestoneId={selectedMilestoneId}
              onSelectMilestone={selectMilestone}
              forecasts={roadmap.milestoneForecasts}
            />
          )}
        </div>
        {selectedMilestone ? (
          <MilestoneDetail
            milestone={selectedMilestone}
            forecast={
              roadmap.milestoneForecasts.get(selectedMilestone.id) ?? {
                forecast: null, status: 'blocked', gapWeeks: 0,
              }
            }
            state={roadmap.state}
            onClose={() => selectMilestone(null)}
          />
        ) : (
          <RightPanel
            story={selectedStory}
            scheduled={selectedScheduled}
            daysPerWeek={roadmap.state.config.calendarConfig.daysPerWeek}
            teamRoles={roadmap.state.config.teamRoles}
          />
        )}
      </div>

      {modalOpen && (
        <MilestoneModal
          state={roadmap.state}
          onSave={handleCreateMilestone}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
