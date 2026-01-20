import { useMemo, useReducer, useState } from 'react'
import { MODES, initialNav, navReducer } from './appState'
import { SYSTEMS } from './data/systems'
import Scene from './scene/Scene'
import HUD from './ui/HUD'

export default function App() {
  const [nav, dispatch] = useReducer(navReducer, initialNav)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const selectedSystem = useMemo(
    () => SYSTEMS.find(s => s.id === nav.systemId) || null,
    [nav.systemId]
  )

  const selectedPlanet = useMemo(() => {
    if (!selectedSystem || !nav.planetId) return null
    const p = selectedSystem.planets.find(p => p[0] === nav.planetId)
    if (!p) return null
    return { id: p[0], name: p[1], color: p[2] }
  }, [selectedSystem, nav.planetId])

  return (
    <>
      <Scene
        nav={nav}
        dispatch={dispatch}
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
      />

      <HUD
        nav={nav}
        mode={nav.mode}
        selectedSystem={selectedSystem}
        selectedPlanet={selectedPlanet}
        isTransitioning={isTransitioning}
        onBack={() => dispatch({ type: 'HIVERINA' })}
      />

      {isTransitioning && <div style={{ position:'fixed', inset:0, zIndex:50 }} />}
    </>
  )
}
