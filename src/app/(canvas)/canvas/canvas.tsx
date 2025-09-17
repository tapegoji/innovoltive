'use client'

import { Canvas as ThreeCanvas } from '@react-three/fiber'
import { Edges, GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import { ControlPanel } from '@/components/canvas/control-panel'
import { useIsMobile } from '@/hooks/use-mobile'

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="lightblue" />
      <Edges lineWidth={2} color="black" />
    </mesh>
  )
}

interface CanvasProps {
  projectName?: string
  projectHash?: string
}

export default function Canvas({ projectName, projectHash }: CanvasProps) {
  const isMobile = useIsMobile()
  const zoom = isMobile ? 50 : 75
  const gizmoScale: [number, number, number] = isMobile ? [30, 30, 30] : [40, 40, 40]
  const gizmoMargin: [number, number] = isMobile ? [40, 60] : [60, 80]
  return (
    <div className="w-full h-[calc(100vh-2rem-1px)]">
      <ControlPanel projectName={projectName} projectHash={projectHash} />
      <ThreeCanvas
        orthographic
        camera={{ position: [10, 10, 10], zoom }}
      >
        {/* <ambientLight intensity={1} /> */}
        {/* <pointLight position={[10, 10, 10]} /> */}
        {/* <Box /> */}
        <GizmoHelper alignment="bottom-right" margin={gizmoMargin}>
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" scale={gizmoScale} />
        </GizmoHelper>
        <OrbitControls enableDamping={false} makeDefault />
      </ThreeCanvas>
    </div>
  )
}