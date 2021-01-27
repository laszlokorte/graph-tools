export default (next) => (state, action) => {
    const expandedActions = expandAction(state, action)

    if(expandedActions === false) {
        return next(state, action)
    }

    return expandedActions.reduce((currentState, a) => {
        return next(currentState, a)
    }, state)
}

const expandAction = (state, action) => {
    const graph = state && state.data && state.data.present && state.data.present.graph
    switch(action.type) {
        case 'SELECTION_BOX_STOP':
            if(!state.selectionBox.moved) {
                return false
            }
            return [action, {
                type: 'SELECT_AREA',
                minX: Math.min(state.selectionBox.x0, state.selectionBox.x1),
                maxX: Math.max(state.selectionBox.x0, state.selectionBox.x1),
                minY: Math.min(state.selectionBox.y0, state.selectionBox.y1),
                maxY: Math.max(state.selectionBox.y0, state.selectionBox.y1),
                nodes: true,
                edges: true,
                add: action.add,
                toggle: action.toggle,
            }]
    }

    return false
}
