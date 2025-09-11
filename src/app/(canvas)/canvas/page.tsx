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

export default function CanvasPage() {
  return (
    <div className="w-full h-screen">
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