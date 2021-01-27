export default (next) => (state, action) => {
    const expandedActions = expandAction(state, action)

    if(expandedActions === false) {
        return next(state, action)
    }

    return expandedActions.reduce((currentState, a) => {
        if(state && state !== currentState && currentState.error) {
            return {...state, error: currentState.error}
        }

        const newState = next(currentState, a)

        if(newState.error) {
            return {...state, error: newState.error}
        }

        return newState
    }, state)
}

const expandAction = (state, action) => {
    if(!state) {
        return false
    }

    switch(action.type) {
        case 'ALIGN_SELECTED_NODES': {
            const selectedNodes = state.selection.nodes.sort((a,b) => state.graph.attributes.nodes.position[a][action.axis] - state.graph.attributes.nodes.position[b][action.axis])
            const selectedEdges = state.selection.edges

            if(selectedNodes.length < 2) {
                return false
            }

            position = state.graph.attributes.nodes.position
            const projected = selectedNodes.map((p) => state.graph.attributes.nodes.position[p][action.axis]);
            const min = Math.min(...projected, Infinity)
            const max = Math.max(...projected, -Infinity)

            const center = (max+min)/2
            const aligned = action.alignment * min + (1-action.alignment) * max
            const spread = action.spread * 2*Math.abs(aligned-center) / Math.max(projected.length-1, 1)



            return [
                action,
                ...selectedNodes.map((nodeId, i) => ({
                    type: 'SET_NODE_ATTRIBUTE',
                    nodeId,
                    attribute: 'position',
                    value: {...position[nodeId], [action.axis]: aligned + i * spread},
                }))
            ]
        }
    }

    return false
}
