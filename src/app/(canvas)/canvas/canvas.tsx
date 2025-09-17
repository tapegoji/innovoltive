'use client'

import { ControlPanel } from '@/components/canvas/control-panel'
import ThreeCanvas from './three-canvas'
import { Header } from '@/components/Header'
import CanvasHeaderIcons from '@/components/canvas/canvas-header-icons'
import KiCanvas from './ki-canvas'

interface CanvasProps {
  projectData: {
    projectName?: string
    projectHash?: string
    simType?: string
  }
}

export default function Canvas({ projectData }: CanvasProps) {
  const showThree = projectData.simType === 'CFD' || projectData.simType === 'FEA'
  const showPCB = projectData.simType === 'PCB'
  console.log('simType:', projectData.simType)

  return (
    <div className="w-full h-[calc(100vh-2rem-1px)]">
      <Header compact className='border-b'>
        {showThree && <CanvasHeaderIcons />}
      </Header>
      <ControlPanel projectData={projectData} />
      {showThree && <ThreeCanvas />}
      {showPCB && <KiCanvas />}
    </div>
  )
}