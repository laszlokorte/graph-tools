export default (graphState, selectionState, action) => {
    switch(action.type) {
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
                        edgeIndex - graphState.nodes[nodeId > action.nodeId ? nodeId - 1 : nodeId].slice(0, edgeIndex).filter((n) => n === action.nodeId).length
                    ]),
            })
        default:
            return selectionState;
    }
}
