import * as THREE from 'three'
import { MODES } from '../appState'
import { SYSTEMS } from '../data/systems'

export function getSystemById(systemId) {
  return SYSTEMS.find(s => s.id === systemId) || null
}

export function poseFor(nav) {
  if (nav.mode === MODES.GALAXY) {
    return {
      cam: new THREE.Vector3(0, 0, 30),
      target: new THREE.Vector3(0, 0, 0),
      durationMs: 900,
    }
  }

  const sys = getSystemById(nav.systemId)
  const sysPos = sys ? new THREE.Vector3(...sys.position) : new THREE.Vector3(0, 0, 0)

  if (nav.mode === MODES.SYSTEM) {
    return {
      cam: sysPos.clone().add(new THREE.Vector3(0, 2.5, 14)),
      target: sysPos.clone(),
      durationMs: 1100,
    }
  }

  const idx = sys ? sys.planets.findIndex(p => p[0] === nav.planetId) : 0
  const angle = (idx < 0 ? 0 : idx) * (Math.PI * 0.5)
  const planetPos = sysPos.clone().add(new THREE.Vector3(Math.cos(angle) * 6, 0, Math.sin(angle) * 6))

  return {
    cam: planetPos.clone().add(new THREE.Vector3(0, 1.2, 6.2)),
    target: planetPos.clone(),
    durationMs: 950,
  }
}
