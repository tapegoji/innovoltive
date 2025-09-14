'use client'

import { Canvas } from '@react-three/fiber'
import { Edges, GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import { ControlPanel } from '@/components/canvas/control-panel'

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="lightblue" />
      <Edges lineWidth={2} color="black" />
    </mesh>
  )
}

interface CanvasClientProps {
  projectId: string
}

export default function CanvasClient({ projectId }: CanvasClientProps) {
  // Here you can use the projectId to load project-specific data
  // The authorization has already been validated on the server
  console.log('Loading project:', projectId) // TODO: Load project data
  
  return (
    <div className="w-full h-[calc(100vh-2rem-1px)]">
      <ControlPanel />
      <Canvas
        orthographic
        camera={{ position: [10, 10, 10], zoom: 75 }}
      >
        {/* <ambientLight intensity={1} /> */}
        {/* <pointLight position={[10, 10, 10]} /> */}
        <Box />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
        </GizmoHelper>
        <OrbitControls enableDamping={false} makeDefault />
      </Canvas>
    </div>
  )
}