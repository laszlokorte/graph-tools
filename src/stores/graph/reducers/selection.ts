const initialState = {
    nodes: [],
    edges: [],
};

export default (state = initialState, action) => {
    switch(action.type) {
        case 'CLEAR_SELECTION': {
            return initialState;
        }
        case 'SELECT_NODE': {
            const alreadySelected = state.nodes.includes(action.nodeId)
            return ({
                ...state,
                nodes:
                    alreadySelected && action.toggle ?
                    state.nodes.filter(x=>x!==action.nodeId) :
                    action.add ?
                    [...state.nodes.filter(x=>x!==action.nodeId), action.nodeId] :
                    [action.nodeId],
                edges: action.add ?
                    state.edges :
                    []
                ,
            })
        }
        case 'SELECT_EDGE': {
            const alreadySelected = state.edges.findIndex(
                ([n,i]) => (n===action.nodeId && i===action.edgeIndex)
            ) >= 0

            return ({
                ...state,
                nodes: action.add ?
                    state.nodes : [],
                edges:
                    alreadySelected && action.toggle ?
                    state.edges.filter(([n,i]) => (n!==action.nodeId || i!==action.edgeIndex)) :
                    action.add ?
                    [...state.edges.filter(([n,i]) => (n!==action.nodeId || i!==action.edgeIndex)), [action.nodeId, action.edgeIndex]] :
                    [[action.nodeId, action.edgeIndex]]
                ,
            })
        }
        case 'DESELECT_NODE': {
            return ({
                ...state,
                nodes: state.nodes.filter(x=>x!==action.nodeId),
            })
        }
        case 'DESELECT_EDGE': {
            return ({
                ...state,
                edges: state.edges.filter(([n,i]) => (n!==action.nodeId || i!==action.edgeIndex)),
            })
        }
        case 'DELETE_EDGE':
            if (state.edges
                    .some(([nodeId,edgeIndex]) => nodeId===action.nodeId && edgeIndex===action.edgeIndex)) {
                return {error: 'Selected Edge can not be deleted'};
            }
            return ({
                ...state,
                edges: state.edges
                    .map(([nodeId,edgeIndex]) =>
                            nodeId !== action.nodeId ?
                            [nodeId, edgeIndex] :
                            [nodeId,
                                action.edgeIndex < edgeIndex ?
                                edgeIndex -1 : edgeIndex
                            ]),
            })
        case 'DELETE_NODE':
            if (state.nodes.includes(action.nodeId)) {
                return {error: 'Selected Node can not be deleted'};
            }
            return ({
                ...state,
                nodes: state.nodes
                    .map((nodeId) => nodeId > action.nodeId ? nodeId - 1 : nodeId),
                edges: state.edges.map(([nodeId, edgeIndex]) => {
                    const newNodeId = nodeId > action.nodeId ? nodeId - 1 : nodeId

                    return [
                        newNodeId,
                        edgeIndex,
                    ]
                }),
            })

        case 'CLEAR_GRAPH_EDGES':
            if (state.edges.length) {
                return {error: 'Edges are still selected and can not be deleted'};
            }

        default: {
            return state;
        }
    }
}
