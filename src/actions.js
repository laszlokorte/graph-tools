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

export const setEdgeAttribute = (nodeId, edgeIndex, attribute, value) => ({
    type: 'SET_EDGE_ATTRIBUTE',
    nodeId, edgeIndex,
    attribute,
    value,
})

export const setNodeAttribute = (nodeId, attribute, value) => ({
    type: 'SET_NODE_ATTRIBUTE',
    nodeId,
    attribute,
    value,
})

export const setFlag = (flag, set) => ({
    type: 'SET_GRAPH_FLAG',
    flag,
    set,
})

export const runAlgorithm = (algorithm, options) => ({
    type: 'RUN_ALGORITHM',
    algorithm,
    options
})
