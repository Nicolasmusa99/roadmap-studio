import { useState } from 'react'
import { useRoadmapState } from './hooks/useRoadmapState.ts'
import TopBar from './components/TopBar.tsx'
import LeftPanel from './components/LeftPanel.tsx'
import TreeView from './components/TreeView.tsx'
import RightPanel from './components/RightPanel.tsx'

export default function App() {
  const roadmap = useRoadmapState()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedStory = selectedId
    ? (roadmap.state.stories.find(s => s.id === selectedId) ?? null)
    : null

  const selectedScheduled = selectedId
    ? (roadmap.scheduledStories.find(s => s.storyId === selectedId) ?? null)
    : null

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
        <TreeView
          state={roadmap.state}
          scheduledStories={roadmap.scheduledStories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onReorderEpic={roadmap.reorderEpic}
          onReorderStory={roadmap.reorderStory}
        />
        <RightPanel
          story={selectedStory}
          scheduled={selectedScheduled}
          daysPerWeek={roadmap.state.config.calendarConfig.daysPerWeek}
          teamRoles={roadmap.state.config.teamRoles}
        />
      </div>
    </div>
  )
}
