import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { makePlanetMaps, makeStarMap } from '../materials/proceduralTextures'

function Atmosphere({ radius = 1.22, color = '#00ffc8', opacity = 0.09 }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function PremiumPlanet({ systemId, planet, index, disabled, onPick }) {
  const [planetId, name, accent] = planet

  const group = useRef()
  const mesh = useRef()

  const maps = useMemo(() => {
    // restrained palette: dark base + cyan accent flecks
    const seed = 1000 + index * 97
    return makePlanetMaps({
      size: 384,
      seed,
      tint: '#0b141b',
      accent: '#00ffc8',
      contrast: 0.55,
      normalStrength: 1.1,
    })
  }, [index])

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    const angle = t * 0.33 + index * (Math.PI * 0.5)
    group.current.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6)
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.55
      mesh.current.rotation.x += delta * 0.12
    }
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
        <sphereGeometry args={[1.15, 72, 72]} />
        <meshStandardMaterial
          map={maps.map}
          roughnessMap={maps.roughnessMap}
          normalMap={maps.normalMap}
          roughness={0.85}
          metalness={0.18}
          emissive={new THREE.Color('#00ffc8')}
          emissiveIntensity={0.06}
        />
      </mesh>

      {/* thin neon rim atmosphere */}
      <Atmosphere radius={1.30} color="#00ffc8" opacity={0.06} />

      <Text position={[0, 2.1, 0]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  )
}

function PremiumStar({ color = '#00ffc8' }) {
  const core = useRef()
  const halo = useRef()

  const tex = useMemo(() => makeStarMap({ size: 512, seed: 42, accent: color }), [color])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (core.current) {
      core.current.rotation.y = t * 0.22
      core.current.rotation.x = t * 0.10
      const s = 1 + Math.sin(t * 2.2) * 0.03
      core.current.scale.setScalar(s)
    }
    if (halo.current) {
      const s2 = 1 + Math.sin(t * 1.6 + 1.1) * 0.05
      halo.current.scale.setScalar(s2)
    }
  })

  return (
    <group>
      <mesh ref={halo}>
        <sphereGeometry args={[3.4, 48, 48]} />
        <meshBasicMaterial
          map={tex}
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={core}>
        <sphereGeometry args={[2.35, 84, 84]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.15}
          metalness={0.0}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* inner glow */}
      <mesh>
        <sphereGeometry args={[2.65, 48, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

export default function PremiumSystemTeknolojia({ nav, system, disabled, onPickPlanet }) {
  const sysPos = system.position

  return (
    <group position={sysPos}>
      <PremiumStar color="#00ffc8" />

      {/* orbit ring with subtle gradient */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.85, 6.15, 160]} />
        <meshBasicMaterial color="#00ffc8" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      {system.planets.map((p, i) => (
        <PremiumPlanet
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
