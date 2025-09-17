'use client'

import { ControlPanel } from '@/components/canvas/control-panel'
import Three from './three'

interface CanvasProps {
  projectName?: string
  projectHash?: string
  simType?: string
}

export default function Canvas({ projectName, projectHash, simType }: CanvasProps) {
  const showControlsAndCanvas = simType === 'CFD' || simType === 'FEA'
  console.log('SimType:', simType)

  return (
    <div className="w-full h-[calc(100vh-2rem-1px)]">
      {showControlsAndCanvas && (
        <>
          <ControlPanel projectName={projectName} projectHash={projectHash} />
          <Three />
        </>
      )}
    </div>
  )
}