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
    const selectedNodes = state.selection.nodes
    const selectedEdges = state.selection.edges

    switch(action.type) {
        case 'DELETE_SELECTED': {
            return [
                action,
                ...expandAction(state, {type: 'DELETE_SELECTED_EDGES'}).slice(1),
                ...expandAction(state, {type: 'DELETE_SELECTED_NODES'}).slice(1),
            ]
        }
        case 'DELETE_SELECTED_NODES': {
            return [
                action,
                ...selectedNodes
                .sort((a,b) => b - a)
                .map((nodeId) => ({
                    type: 'DELETE_NODE',
                    nodeId,
                }))
            ]
        }
        case 'DELETE_SELECTED_EDGES': {
            return [
                action,
                ...selectedEdges
                .sort(([n0, e0], [n1, e1]) => n1 - n0 || e1-e0)
                .map(([nodeId, edgeIndex]) => ({
                    type: 'DELETE_EDGE',
                    nodeId,
                    edgeIndex,
                }))
            ]
        }
        case 'SET_SELECTED_NODES_ATTRIBUTE': {
            return [
                action,
                ...selectedNodes
                .sort((a,b) => b - a)
                .map((nodeId) => ({
                    type: 'SET_NODE_ATTRIBUTE',
                    nodeId,
                    attribute: action.attribute,
                    value: action.value,
                }))
            ]
        }
        case 'SET_SELECTED_EDGES_ATTRIBUTE': {
            return [
                action,
                ...selectedEdges
                .sort(([n0, e0], [n1, e1]) => n1 - n0 || e1-e0)
                .map(([nodeId, edgeIndex]) => ({
                    type: 'SET_EDGE_ATTRIBUTE',
                    nodeId,
                    edgeIndex,
                    attribute: action.attribute,
                    value: action.value,
                }))
            ]
        }
        case 'SET_NODE_ATTRIBUTE': {
            if(action.attribute === 'position' && selectedNodes.includes(action.nodeId)) {
                const offsetX = action.value.x - state.graph.attributes.nodes.position[action.nodeId].x
                const offsetY = action.value.y - state.graph.attributes.nodes.position[action.nodeId].y
                return [
                    action,
                    ...selectedNodes
                    .sort((a,b) => b - a)
                    .filter((nodeId) => nodeId != action.nodeId)
                    .map((nodeId) => ({
                        type: 'SET_NODE_ATTRIBUTE',
                        nodeId,
                        attribute: action.attribute,
                        value: {
                            x: state.graph.attributes.nodes.position[nodeId].x + offsetX,
                            y: state.graph.attributes.nodes.position[nodeId].y + offsetY,
                        },
                    })),
                ]
            }
        }
        case 'ALIGN_SELECTED_NODES':
            return [
                action,
                {
                    type: 'ALIGN_NODES',
                    axis: action.axis,
                    alignment: action.alignment,
                    spread: action.spread,
                    nodeIds: selectedNodes,
                },
            ]
        case 'SELECTED_NODE_AUTO_LAYOUT':
            return [
                action,
                {
                    type: 'ALIGN_NODES_CIRCLE',
                    nodes: selectedNodes.length > 1 ? selectedNodes : state.graph.nodes.map((neighbours, nodeId) => nodeId),
                },
            ]
    }

    return false
}
