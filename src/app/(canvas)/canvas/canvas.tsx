'use client'

import { ControlPanel } from '@/components/canvas/control-panel'
import ThreeCanvas from './three-canvas'
import { Header } from '@/components/Header'
import CanvasHeaderIcons from '@/components/canvas/canvas-header-icons'
import KiCanvas from './ki-canvas'
import MagneticCanvas from './magnetic-canvas'

interface CanvasProps {
  projectData: {
    projectName?: string
    projectHash?: string
    simType?: string
  }
}

export default function Canvas({ projectData }: CanvasProps) {
  const showThree = projectData.simType === 'PCB' || projectData.simType === 'CFD' || projectData.simType === 'FEA'
  const showMagnetic = projectData.simType === 'MAG'

  return (
    <div className="w-full h-[calc(100vh-2rem-1px)]">
      <Header compact className='border-b'>
        {showThree && <CanvasHeaderIcons />}
      </Header>
      <ControlPanel projectData={projectData} />
      {showThree && <ThreeCanvas />}
      {showMagnetic && <MagneticCanvas />}

    </div>
  )
}