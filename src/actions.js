export const clearSelection = () => ({
    type: 'CLEAR_SELECTION',
});

export const selectNode = (nodeId, add = false) => ({
    type: 'SELECT_NODE',
    nodeId,
    add,
});

export const selectEdge = (nodeId, edgeIndex, add = false) => ({
    type: 'SELECT_EDGE',
    nodeId,
    edgeIndex,
    add,
});

export const setPosition = (nodeId, x, y) => ({
    type: 'SET_NODE_ATTRIBUTE',
    nodeId,
    attribute: 'position',
    value: {x, y},
})

export const addEdge = (fromNodeId, toNodeId) => ({
    type: 'ADD_EDGE',
    fromNodeId,
    toNodeId,
})

export const deleteNode = (nodeId) => ({
    type: 'DELETE_NODE',
    nodeId,
})

export const createNode = (x, y) => ({
    type: 'CREATE_NODE',
    attributes: {
        position: {x, y},
    },
})

export const deleteEdge = (nodeId, edgeIndex) => ({
    type: 'DELETE_EDGE',
    nodeId, edgeIndex,
})

export const setEdgeLabel = (nodeId, edgeIndex, label) => ({
    type: 'SET_EDGE_ATTRIBUTE',
    nodeId, edgeIndex,
    attribute: 'label',
    value: label,
})

export const setEdgeWeight = (nodeId, edgeIndex, weight) => ({
    type: 'SET_EDGE_ATTRIBUTE',
    nodeId, edgeIndex,
    attribute: 'weight',
    value: weight,
})

export const setNodeLabel = (nodeId, label) => ({
    type: 'SET_NODE_ATTRIBUTE',
    nodeId,
    attribute: 'label',
    value: label,
})

export const setNodeColor = (nodeId, color) => ({
    type: 'SET_NODE_ATTRIBUTE',
    nodeId,
    attribute: 'color',
    value: color,
})
