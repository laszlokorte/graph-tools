export const clearSelection = () => ({
    type: 'CLEAR_SELECTION',
});

export const loadGraph = (graph) => ({
    type: 'INIT_GRAPH',
    graph,
});

export const selectNode = (nodeId, add = false, toggle = false) => ({
    type: 'SELECT_NODE',
    nodeId,
    add,
    toggle,
});

export const selectEdge = (nodeId, edgeIndex, add = false, toggle = false) => ({
    type: 'SELECT_EDGE',
    nodeId,
    edgeIndex,
    add,
    toggle,
});

export const setPosition = (nodeId, x, y) => ({
    type: 'SET_NODE_ATTRIBUTE',
    nodeId,
    attribute: 'position',
    value: {x, y},
})

export const clearGraph = () => ({
    type: 'CLEAR_GRAPH',
})

export const clearGraphEdges = () => ({
    type: 'CLEAR_GRAPH_EDGES',
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

export const createNode = (x, y, connectTo = null, onEdge = null, keepEdge = false, splitPathControl = null) => ({
    type: 'CREATE_NODE',
    attributes: {
        position: {x, y},
        connectTo,
        onEdge,
        keepEdge,
        splitPathControl,
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

export const setEdgeAttributeVisible = (attribute, visible) => ({
    type: 'SET_EDGE_ATTRIBUTE_VISIBLE',
    attribute,
    visible,
})
export const setNodeAttributeVisible = (attribute, visible) => ({
    type: 'SET_NODE_ATTRIBUTE_VISIBLE',
    attribute,
    visible,
})


export const autoLayout = () => ({
    type: 'NODE_AUTO_LAYOUT'
})

export const runAlgorithm = (algorithm, parameters) => ({
    type: 'RUN_ALGORITHM',
    algorithm,
    parameters
})

export const stepAlgorithm = (delta) => ({
    type: 'STEP_ALGORITHM',
    delta,
})


export const storageLoad = (id) => ({
    type: 'STORAGE_LOAD',
    id,
});

export const selectionBoxStart = (x, y) => ({type: 'SELECTION_BOX_START', x, y});
export const selectionBoxMove = (x, y) => ({type: 'SELECTION_BOX_MOVE', x, y});
export const selectionBoxStop = () => ({type: 'SELECTION_BOX_STOP'});

export const cameraUpdateScreen = (screen) => ({type: 'CAMERA_UPDATE_SCREEN', screen});
export const cameraUpdateBox = (box) => ({type: 'CAMERA_UPDATE_BOX', box});
export const cameraMovePan = (x,y) => ({type: 'CAMERA_MOVE_PAN', x, y});
export const cameraJumpZoom = (x, y) => ({type: 'CAMERA_JUMP_ZOOM', x, y});
export const cameraStartPan = (x, y) => ({type: 'CAMERA_START_PAN', x, y});
export const cameraStopPan = () => ({type: 'CAMERA_STOP_PAN'});
export const cameraPan = (deltaX, deltaY) => ({type: 'CAMERA_PAN', deltaX, deltaY});
export const cameraRotate = (x, y, deltaAngle) => ({type: 'CAMERA_ROTATE', x, y, deltaAngle});
export const cameraZoom = (x, y, factor) => ({type: 'CAMERA_ZOOM', x, y, factor});

export const manipulatorStop = () => ({type: 'MANIPULATOR_STOP'});
export const manipulatorMove = (x, y) => ({type: 'MANIPULATOR_MOVE', x, y});
export const manipulatorSnapConnect = (nodeId) => ({type: 'MANIPULATOR_SNAP_CONNECT', nodeId});
export const manipulatorUnsnapConnect = (x, y) => ({type: 'MANIPULATOR_UNSNAP_CONNECT', x, y});
export const manipulatorStartMove = (nodeId, x, y, offsetX, offsetY) => ({type: 'MANIPULATOR_START_MOVE', nodeId, x, y, offsetX, offsetY});
export const manipulatorStartCreate = (x, y) => ({type: 'MANIPULATOR_START_CREATE', x, y});
export const manipulatorStartConnect = (nodeId, x, y, offsetX, offsetY, edgeIndex, control) => ({type: 'MANIPULATOR_START_CONNECT', x, y, nodeId, edgeIndex, offsetX, offsetY, control});

export const pathManipulatorStop = () => ({type: 'PATH_MANIPULATOR_STOP'})
export const pathManipulatorMove = (x, y) => ({type: 'PATH_MANIPULATOR_MOVE', x, y})
export const pathManipulatorCreate = (nodeIdx, edgeIdx, controlIdx, path, x, y) => ({type: 'PATH_MANIPULATOR_START_CREATE', nodeIdx, edgeIdx, controlIdx, path, x, y})
export const pathManipulatorStartMove = (nodeIdx, edgeIdx, controlIdx, path, x, y) => ({type: 'PATH_MANIPULATOR_START_MOVE', nodeIdx, edgeIdx, controlIdx, path, x, y})

export const selectAlgorithm = (algorithm) => ({type: 'ALGORITHM_SELECT', algorithm})
export const selectTool = (tool) => ({type: 'TOOL_SELECT', tool})
