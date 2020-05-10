export default (graphState, prevGraphState, selectionState, action) => {
    switch(action.type) {
        case 'STORAGE_LOAD':
        case 'SET_GRAPH_FLAG':
        case 'CLEAR_GRAPH':
            return {
                ...selectionState,
                nodes: [],
                edges: [],
            }
        case 'CLEAR_GRAPH_EDGES':
            return {
                ...selectionState,
                edges: [],
            }
        case 'SET_NODE_ATTRIBUTE':
            return selectionState
        case 'SET_EDGE_ATTRIBUTE':
            return selectionState
        case 'ADD_EDGE': {
            const edgeIndex = graphState.nodes[action.fromNodeId].indexOf(action.toNodeId);
            if(edgeIndex < 0) {
                return selectionState;
            }
            if(selectionState.edges.length + selectionState.nodes.length === 1) {
                return {
                    ...selectionState,
                    nodes:[],
                    edges: [[action.fromNodeId, edgeIndex]],
                };
            }
            return {
                ...selectionState,
                edges: [...selectionState.edges, [action.fromNodeId, edgeIndex]],
            };
        }
        case 'CREATE_NODE':
            if(selectionState.edges.length + selectionState.nodes.length === 1) {
                return {
                    ...selectionState,
                    nodes:[graphState.nodes.length - 1],
                    edges: [],
                };
            }
            return {
                ...selectionState,
                nodes: [...selectionState.nodes, graphState.nodes.length - 1],
            }
        case 'DELETE_EDGE':
            return ({
                ...selectionState,
                edges: selectionState.edges
                    .filter(([nodeId,edgeIndex]) => nodeId!==action.nodeId || edgeIndex!==action.edgeIndex)
                    .map(([nodeId,edgeIndex]) =>
                            nodeId !== action.nodeId ?
                            [nodeId, edgeIndex] :
                            [nodeId,
                                action.edgeIndex < edgeIndex ?
                                edgeIndex -1 : edgeIndex
                            ]),
            })
        case 'DELETE_NODE':
            return ({
                ...selectionState,
                nodes: selectionState.nodes
                    .filter((nodeId) => nodeId !== action.nodeId)
                    .map((nodeId) => nodeId > action.nodeId ? nodeId - 1 : nodeId),
                edges: selectionState.edges.filter(([nodeId, edgeIndex]) => {
                    return nodeId !== action.nodeId && !prevGraphState.nodes[nodeId].includes(action.nodeId)
                }).map(([nodeId, edgeIndex]) => {
                    const newNodeId = nodeId > action.nodeId ? nodeId - 1 : nodeId

                    return [
                        newNodeId,
                        edgeIndex - prevGraphState.nodes[nodeId]
                            .filter((n, i) => n === action.nodeId && i < edgeIndex)
                            .length
                    ]
                }),
            })
        default:
            return selectionState;
    }
}
