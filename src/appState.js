export const MODES = {
  GALAXY: 'GALAXY',
  SYSTEM: 'SYSTEM',
  PLANET: 'PLANET',
}

export const initialNav = {
  mode: MODES.GALAXY,
  systemId: null,
  planetId: null,
}

export function navReducer(state, action) {
  switch (action.type) {
    case 'ENTER_GALAXY':
      return { mode: MODES.GALAXY, systemId: null, planetId: null }

    case 'ENTER_SYSTEM':
      if (!action.systemId) return state
      return { mode: MODES.SYSTEM, systemId: action.systemId, planetId: null }

    case 'ENTER_PLANET':
      if (!action.systemId || !action.planetId) return state
      return { mode: MODES.PLANET, systemId: action.systemId, planetId: action.planetId }

    case 'HIVERINA':
      if (state.mode === MODES.PLANET) return { mode: MODES.SYSTEM, systemId: state.systemId, planetId: null }
      if (state.mode === MODES.SYSTEM) return { mode: MODES.GALAXY, systemId: null, planetId: null }
      return state

    default:
      return state
  }
}
