import { Canvas } from '@react-three/fiber'
import { Stars, CameraControls } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { MODES } from '../appState'
import { SYSTEMS } from '../data/systems'
import { poseFor } from './poses'
import GalaxySystems from './actors/GalaxySystems'
import SystemView from './actors/SystemView'

function isMobile() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches
}

function CameraRig({ nav, isTransitioning, setIsTransitioning }) {
  const controls = useRef()
  const first = useRef(true)

  const pose = useMemo(() => poseFor(nav), [nav.mode, nav.systemId, nav.planetId])

  useEffect(() => {
    if (!controls.current) return

    if (first.current) {
      first.current = false
      const c = pose.cam
      const t = pose.target
      controls.current.setLookAt(c.x, c.y, c.z, t.x, t.y, t.z, false)
      return
    }

    setIsTransitioning(true)
    const c = pose.cam
    const t = pose.target

    controls.current.setLookAt(c.x, c.y, c.z, t.x, t.y, t.z, true)

    const id = setTimeout(() => setIsTransitioning(false), pose.durationMs)
    return () => clearTimeout(id)
  }, [pose.cam.x, pose.cam.y, pose.cam.z, pose.target.x, pose.target.y, pose.target.z, pose.durationMs])

  return (
    <CameraControls
      ref={controls}
      enabled={!isTransitioning}
      dollyToCursor={false}
      maxPolarAngle={Math.PI * 0.55}
      minPolarAngle={Math.PI * 0.35}
    />
  )
}

export default function Scene({ nav, dispatch, isTransitioning, setIsTransitioning }) {
  const mobile = isMobile()
  const starsCount = mobile ? 1400 : 3200

  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 55, near: 0.1, far: 600 }}
      dpr={[1, mobile ? 1.35 : 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#07070d']} />

      <Stars radius={220} depth={70} count={starsCount} factor={6} saturation={0} fade speed={0.55} />

      <ambientLight intensity={0.22} />
      <pointLight position={[14, 10, 16]} intensity={1.0} color="#00ffc8" />
      <pointLight position={[-14, -10, 12]} intensity={0.8} color="#6432ff" />
      <pointLight position={[0, 18, -12]} intensity={0.45} color="#ff2fb3" />

      <CameraRig nav={nav} isTransitioning={isTransitioning} setIsTransitioning={setIsTransitioning} />

      {nav.mode === MODES.GALAXY && (
        <GalaxySystems
          systems={SYSTEMS}
          disabled={isTransitioning}
          onPick={(systemId) => dispatch({ type: 'ENTER_SYSTEM', systemId })}
        />
      )}

      {nav.mode !== MODES.GALAXY && (
        <SystemView
          nav={nav}
          systems={SYSTEMS}
          disabled={isTransitioning}
          onPickPlanet={(systemId, planetId) => dispatch({ type: 'ENTER_PLANET', systemId, planetId })}
        />
      )}
    </Canvas>
  )
}
