export default (graphState, selectionState, action) => {
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
            return {
                ...selectionState,
                nodes: [action.nodeId],
                edges: [],
            }
        case 'SET_EDGE_ATTRIBUTE':
            return {
                ...selectionState,
                nodes: [],
                edges: [[action.nodeId, action.edgeIndex]],
            }
        case 'ADD_EDGE': {
            const edgeIndex = graphState.nodes[action.fromNodeId].indexOf(action.toNodeId);
            if(edgeIndex < 0) {
                return selectionState;
            }
            return {
                ...selectionState,
                nodes: [],
                edges: [[action.fromNodeId, edgeIndex]],
            };
        }
        case 'CREATE_NODE':
            return {
                ...selectionState,
                nodes: [graphState.nodes.length - 1],
                edges: [],
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
                edges: selectionState.edges
                    .filter(([nodeId,edgeIndex]) => nodeId!==action.nodeId && graphState.nodes[nodeId][edgeIndex] !== action.nodeId)
                    .map(([nodeId,edgeIndex]) => [
                        nodeId > action.nodeId ? nodeId - 1 : nodeId,
                        edgeIndex - graphState.nodes[nodeId >= action.nodeId ? nodeId - 1 : nodeId].slice(0, edgeIndex).filter((n) => n === action.nodeId).length
                    ]),
            })
        default:
            return selectionState;
    }
}
