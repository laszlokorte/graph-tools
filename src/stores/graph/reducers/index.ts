import undoable, { excludeAction, combineFilters } from 'redux-undo';
import selection from './selection'
import graph from './graph'
import algorithm from './algorithm'
import properties from './properties'

import graphActionExpander from './graph_action_expander'
import graphSelectionActionExpander from './graph_selection_action_expander'
import selectionActionExpander from './selection_action_expander'
import nodeAlignmentExpander from './graph_node_alignment_expander'
import cameraActionExpander from './camera_action_expander'
import algorithmActionExpander from './algorithm_action_expander'


import camera from './camera'
import manipulator from './manipulator'
import pathManipulator from './path_manipulator'
import selectionBox from './select_box'
import layout from './layout'
import {ALGORITHM_MAP} from "./algorithm/index";

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
    'CAMERA_RESET',
    'MANIPULATOR_START_CREATE',
    'MANIPULATOR_STOP',
    'MANIPULATOR_MOVE',
    'MANIPULATOR_SNAP_CONNECT',
    'MANIPULATOR_UNSNAP_CONNECT',
    'MANIPULATOR_START_MOVE',
    'MANIPULATOR_CREATE',
    'MANIPULATOR_START_CONNECT',
    'PATH_MANIPULATOR_STOP',
    'PATH_MANIPULATOR_MOVE',
    'PATH_MANIPULATOR_CREATE',
    'PATH_MANIPULATOR_START_MOVE',
    'TOGGLE_SETTINGS',
    'TOGGLE_DUMP',
    'TOGGLE_ALGORITHM',
    'TOOL_SELECT',
]


const castAlgorithmParameter = (parameter, value) => {
    if(value === '' || value === null) {
        return null;
    }
    switch(parameter.type) {
        case 'NODE':
            return parseInt(value, 10);
    }

    return value;
}


const algorithmSelection = (state = {type: null, parameters: {}}, action) => {
    if(action.type === 'ALGORITHM_SELECT') {
        return {
            type: ALGORITHM_MAP[action.algorithm] ? action.algorithm : null,
            parameters: {}
        }
    } else if(action.type === 'ALGORITHM_SELECT_PARAMETER') {
        return {
            ...state,
            parameters: {
                ...state.parameters,
                [action.key]: castAlgorithmParameter(ALGORITHM_MAP[state.type].parameters[action.key], action.value),
            }
        }
    }

    return state
}

const toolSelection = (state = 'edit', action) => {
    if(action.type === 'TOOL_SELECT') {
        return action.tool
    }

    return state
}

const data = undoable(graphSelectionActionExpander(nodeAlignmentExpander(graphActionExpander((state, action) => {
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
}))), {
    limit: 10,
    filter: combineFilters(
        excludeAction([
            'STEP_ALGORITHM','JUMP_STEP_ALGORITHM',
            'DESELECT_NODE',
            'DESELECT_EDGE',
            ...skipActions,
        ]),
        (action, currentState, history) => {
            return !currentState.error
        },
        (action, currentState, history) => {
            return history.future.length === 0 || !([
                'CLEAR_SELECTION',
                'SELECT_NODE',
                'SELECT_EDGE',
                'SELECT_AREA',
            ].includes(action.type))
        }
    ),
    ignoreInitialState: false,
    groupBy: (action, currentState, previousHistory) => {
        if(action.type === 'SET_NODE_ATTRIBUTE') {
            return 'node-attr-' + action.nodeId + '-' + action.attribute;
        }
        if(action.type === 'SET_EDGE_ATTRIBUTE') {
            return 'edge-attr-' + action.nodeId + '-' + action.edgeIndex + '-' + action.attribute;
        }
        if(action.type === 'SET_SELECTED_NODES_ATTRIBUTE') {
            return 'node-attr-' + action.attribute;
        }
        if(action.type === 'SET_SET_SELECTED_EDGES_ATTRIBUTE') {
            return 'edge-attr-' + action.attribute;
        }
        if(action.type === 'SET_EDGE_ATTRIBUTE_VISIBLE') {
            return 'edge-visible-' + action.attribute;
        }
        if(action.type === 'SET_NODE_ATTRIBUTE_VISIBLE') {
            return 'node-visible' + action.attribute;
        }
        if(action.type === 'CLEAR_GRAPH') {
            return 'CLEAR_GRAPH';
        }
        if(['CLEAR_SELECTION',
            'SELECT_NODE',
            'SELECT_EDGE',
            'SELECT_AREA',
        ].includes(action.type)) {
            return 'selection';
        }
        if(action.type === 'CLEAR_GRAPH_EDGES') {
            return 'CLEAR_GRAPH_EDGES';
        }
        if(action.type === 'NODE_AUTO_LAYOUT') {
            return 'NODE_AUTO_LAYOUT';
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

export default algorithmActionExpander(cameraActionExpander(selectionActionExpander((state, action) => {
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
})))
