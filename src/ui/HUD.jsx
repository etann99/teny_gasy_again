import './hud.css'
import { MODES } from '../appState'

function Breadcrumb({ selectedSystem, selectedPlanet }) {
  const parts = ['Galaksia']
  if (selectedSystem) parts.push(selectedSystem.name)
  if (selectedPlanet) parts.push(selectedPlanet.name)
  return <div className="crumb">{parts.join(' / ')}</div>
}

export default function HUD({ mode, selectedSystem, selectedPlanet, isTransitioning, onBack }) {
  const showBack = mode !== MODES.GALAXY

  return (
    <div className="hud">
      <div className="top">
        <div className="brand">
          <div className="title">Galaksia Teny Gasy</div>
          <div className="tag">Explore • Zoom • Focus</div>
        </div>
        <Breadcrumb selectedSystem={selectedSystem} selectedPlanet={selectedPlanet} />
      </div>

      <div className="bottom">
        {showBack ? (
          <button className="btn primary" onClick={onBack} disabled={isTransitioning}>
            Hiverina
          </button>
        ) : (
          <div className="hint">Tsindrio ny rafitra mba hizaha ny sehatra</div>
        )}

        <div className="pill">
          <span className="dot" />
          <span className="mode">{mode}</span>
        </div>
      </div>

      {mode === MODES.PLANET && (
        <div className="planetModal" role="dialog" aria-modal="true">
          <div className="panel">
            <div className="panelTitle">{selectedPlanet?.name || 'Planeta'}</div>
            <div className="panelText">UI-only mode: eto no hisokatra ny glossaire FR–EN–MG.</div>
            <div className="panelActions">
              <button className="btn ghost" onClick={onBack} disabled={isTransitioning}>Hiverina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
