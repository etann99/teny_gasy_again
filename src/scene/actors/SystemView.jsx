import { Text } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PremiumSystemTeknolojia from './PremiumSystemTeknolojia'

function Atmosphere({ radius = 2.25, color = '#00ffc8' }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  )
}

function Planet({ systemId, planet, index, disabled, onPick }) {
  const [planetId, name, color] = planet
  const group = useRef()
  const mesh = useRef()

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    const angle = t * 0.35 + index * (Math.PI * 0.5)
    group.current.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6)
    if (mesh.current) mesh.current.rotation.y += delta * 0.8
  })

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation()
          if (disabled) return
          onPick(systemId, planetId)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = disabled ? 'default' : 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[1.1, 42, 42]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.22}
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>
      <Atmosphere color={color} />
      <Text position={[0, 2.05, 0]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  )
}

export default function SystemView({ nav, systems, disabled, onPickPlanet }) {
  const system = useMemo(() => systems.find(s => s.id === nav.systemId) || null, [systems, nav.systemId])
  if (!system) return null

  // Premium only for Teknôlôjia (as requested)
  if (system.id === 'teknolojia') {
    return (
      <PremiumSystemTeknolojia
        nav={nav}
        system={system}
        disabled={disabled}
        onPickPlanet={onPickPlanet}
      />
    )
  }

  const sysPos = system.position

  return (
    <group position={sysPos}>
      <mesh>
        <sphereGeometry args={[2.2, 52, 52]} />
        <meshStandardMaterial
          color={system.color}
          emissive={system.color}
          emissiveIntensity={0.85}
          metalness={0.4}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.9, 6.1, 96]} />
        <meshBasicMaterial color={system.color} transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>

      {system.planets.map((p, i) => (
        <Planet
          key={p[0]}
          systemId={system.id}
          planet={p}
          index={i}
          disabled={disabled}
          onPick={onPickPlanet}
        />
      ))}
    </group>
  )
}
