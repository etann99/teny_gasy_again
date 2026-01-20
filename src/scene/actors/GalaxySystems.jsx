import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function SystemNode({ system, disabled, onPick }) {
  const core = useRef()
  const halo = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const s = 1 + Math.sin(t * 2 + system.position[0] * 0.1) * 0.06
    if (core.current) core.current.rotation.y += 0.012
    if (core.current) core.current.scale.setScalar(s)
    if (halo.current) halo.current.scale.setScalar(s * 1.9)
  })

  return (
    <group position={system.position}>
      <mesh ref={halo}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color={system.color} transparent opacity={0.15} />
      </mesh>

      <mesh
        ref={core}
        onClick={(e) => {
          e.stopPropagation()
          if (disabled) return
          onPick(system.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = disabled ? 'default' : 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[1.85, 48, 48]} />
        <meshStandardMaterial
          color={system.color}
          emissive={system.color}
          emissiveIntensity={0.55}
          metalness={0.85}
          roughness={0.18}
          toneMapped={false}
        />
      </mesh>

      <Text position={[0, 3.6, 0]} fontSize={0.82} color="#ffffff" anchorX="center" anchorY="middle">
        {system.name}
      </Text>
    </group>
  )
}

export default function GalaxySystems({ systems, disabled, onPick }) {
  return systems.map((s) => <SystemNode key={s.id} system={s} disabled={disabled} onPick={onPick} />)
}
