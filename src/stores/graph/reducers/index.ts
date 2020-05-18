import { combineReducers } from 'redux'
import undoable, { includeAction, excludeAction } from 'redux-undo';import selection from './selection'
import graph from './graph'
import algorithm, {ALGORITHMS} from './algorithm'
import properties from './properties'

import graphActionExpander from './graph_action_expander'
import selectionActionExpander from './selection_action_expander'
import cameraActionExpander from './camera_action_expander'


import camera from './camera'
import manipulator from './manipulator'
import pathManipulator from './path_manipulator'
import selectionBox from './select_box'
import layout from './layout'

const skipActions = [
    'TOGGLE_PROJECT_LIST',
    'SELECTION_BOX_START',
    'SELECTION_BOX_MOVE',
    'SELECTION_BOX_STOP',
    'CAMERA_UPDATE_SCREEN',
    'CAMERA_MOVE_PAN',
    'CAMERA_JUMP_ZOOM',
    'CAMERA_START_PAN',
    'CAMERA_STOP_PAN',
    'CAMERA_PAN',
    'CAMERA_ROTATE',
    'CAMERA_ZOOM',
    'MANIPULATOR_STOP',
    'MANIPULATOR_MOVE',
    'MANIPULATOR_SNAP_CONNECT',
    'MANIPULATOR_UNSNAP_CONNECT',
    'MANIPULATOR_START_MOVE',
    'MANIPULATOR_CREATE',
    'MANIPULATOR_START_CONNECTION',
    'PATH_MANIPULATOR_STOP',
    'PATH_MANIPULATOR_MOVE',
    'PATH_MANIPULATOR_CREATE',
    'PATH_MANIPULATOR_START_MOVE',
    'TOGGLE_SETTINGS',
    'TOGGLE_DUMP',
    'TOGGLE_ALGORITHM',
    'TOOL_SELECT',
]

const algorithmSelection = (state = ALGORITHMS[0].key, action) => {
    if(action.type === 'ALGORITHM_SELECT') {
        return action.algorithm
    }

    return state
}

const toolSelection = (state = 'edit', action) => {
    if(action.type === 'TOOL_SELECT') {
        return action.tool
    }

    return state
}

const data = undoable(graphActionExpander((state, action) => {
    const oldGraph = state ? state.graph : undefined;
    const oldSelection = state ? state.selection : undefined;
    const oldAlgorithm = state ? state.algorithm : undefined;
    const oldProperties = state ? state.properties : undefined;
    const newGraph = graph(oldGraph, action)
    if(newGraph.error) return { ...state, error: newGraph.error};
    const newSelection = selection(oldSelection, action);
    if(newSelection.error) return { ...state, error: newSelection.error};
    const newAlgorithm = algorithm(oldAlgorithm, newGraph, action)
    if(newAlgorithm.error) return { ...state, error: newAlgorithm.error};
    const newProperties = properties(oldProperties, newGraph, action)
    if(newProperties.error) return { ...state, error: newProperties.error};

    return {
        graph: newGraph,
        selection: newSelection,
        algorithm: newAlgorithm,
        properties: newProperties,
        error: null,
    };
}), {
    limit: 10,
    filter: excludeAction([
        'CLEAR_SELECTION', 'SELECT_NODE','SELECT_EDGE','STEP_ALGORITHM',
        'SELECT_AREA',
        'DESELECT_NODE',
        'DESELECT_EEDGE',
        ...skipActions,
    ]),
    ignoreInitialState: true,
    groupBy: (action, currentState, previousHistory) => {
        if(action.type === 'SET_NODE_ATTRIBUTE') {
            return 'node-attr' + action.nodeId + '-' + action.attribute;
        }
        if(action.type === 'SET_EDGE_ATTRIBUTE') {
            return 'edge-attr' + action.nodeId + '-' + action.edgeIndex + '-' + action.attribute;
        }
        if(action.type === 'SET_EDGE_ATTRIBUTE_VISIBLE') {
            return 'edge-visible' + action.attribute;
        }
        if(action.type === 'SET_NODE_ATTRIBUTE_VISIBLE') {
            return 'node-visible' + action.attribute;
        }
        if(action.type === 'CLEAR_GRAPH') {
            return 'CLEAR_GRAPH';
        }
        if(action.type === 'CLEAR_GRAPH_EDGES') {
            return 'CLEAR_GRAPH_EDGES';
        }

        return null;
    }
})

const toggleOnAction = (actionType, def = false) => (state = def, action) => {
    if(action.type === actionType) {
        return !state
    } else {
        return state
    }
}

const memo = (fn) => {
    let cached
    let prevArg = {}
    return (arg) => {
        if(prevArg !== arg) {
            cached = fn(arg)
            prevArg = arg
        }
        return cached
    }
}

const doLayout = memo(layout)

const toggleProjects = (state = false, action) => {
    if(action.type === 'TOGGLE_PROJECT_LIST') {
        return !state
    } else if (action.type === 'INIT_GRAPH') {
        return false
    } else {
        return state
    }
}

const toggleSettings = (state = false, action) => {
    if(action.type === 'TOGGLE_SETTINGS') {
        return !state
    } else {
        return state
    }
}


const toggleDump = (state = false, action) => {
    if(action.type === 'TOGGLE_DUMP') {
        return !state
    } else {
        return state
    }
}


const toggleAlgorithm = (state = false, action) => {
    if(action.type === 'TOGGLE_ALGORITHM') {
        return !state
    } else {
        return state
    }
}

export default cameraActionExpander(selectionActionExpander((state, action) => {
    const skip = skipActions.includes(action.type)

    const d = skip ? state.data : data(state ? state.data : undefined, action)
    const margin = 200;

    let nonInfBox = state && state.camera.box
    if (!skip || !nonInfBox) {
        const box = d.present.graph.attributes.nodes.position.reduce((acc, p) => ({
            minX: Math.min(acc.minX + margin, p.x) - margin,
            maxX: Math.max(acc.maxX - margin, p.x) + margin,
            minY: Math.min(acc.minY + margin, p.y) - margin,
            maxY: Math.max(acc.maxY - margin, p.y) + margin,
        }), ({
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
        }));

        nonInfBox = {
            minX: box.minX===Infinity ? -1*margin : box.minX,
            maxX: box.maxX===-Infinity ? 1*margin : box.maxX,
            minY: box.minY===Infinity ? -1*margin : box.minY,
            maxY: box.maxY===-Infinity ? 1*margin : box.maxY,
        }
    }

    const newCamera = camera(state ? state.camera : undefined, nonInfBox, action)
    const newManipulator = manipulator(state ? state.manipulator : undefined, action)
    const newPathManipulator = pathManipulator(state ? state.pathManipulator : undefined, action)
    const newSelectionBox = selectionBox(state ? state.selectionBox : undefined, action)
    const newAlgorithmSelection = algorithmSelection(state ? state.algorithmSelection : undefined, action)
    const newToolSelection = toolSelection(state ? state.toolSelection : undefined, action)

    return {
        data: d,
        camera: newCamera,
        manipulator: newManipulator,
        pathManipulator: newPathManipulator,
        selectionBox: newSelectionBox,
        algorithmSelection: newAlgorithmSelection,
        toolSelection: newToolSelection,
        showProjects: toggleProjects(state ? state.showProjects : false, action),
        showSettings: toggleSettings(state ? state.showSettings : false, action),
        showDump: toggleDump(state ? state.showDump : false, action),
        showAlgorithm: toggleAlgorithm(state ? state.showAlgorithm : false, action),
        layout: d.present ? doLayout(d.present.graph) : undefined,
    };
}))
