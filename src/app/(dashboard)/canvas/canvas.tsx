'use client'

import { ControlPanel } from '@/components/canvas/control-panel'
import ThreeCanvas from './three-canvas'
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
    <div className="w-ful h-[calc(100vh-2rem-1px)]">
      {showThree && (
        <>
        <ControlPanel projectData={projectData} />
        <ThreeCanvas />
        </>
      )}
      {showMagnetic && (<MagneticCanvas />)}

    </div>
  )
}