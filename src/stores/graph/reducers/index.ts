import { combineReducers } from 'redux'
import undoable, { includeAction, excludeAction } from 'redux-undo';import selection from './selection'
import graph from './graph'
import graphSelection from './graph_selection'
import algorithm, {ALGORITHMS} from './algorithm'
import properties from './properties'

import camera from './camera'
import manipulator from './manipulator'
import pathManipulator from './path_manipulator'
import selectionBox from './select_box'

const skipActions = [
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

const data = undoable((state, action) => {
    let error = null;
    const oldGraph = state ? state.graph : undefined;
    const oldSelection = state ? state.selection : undefined;
    const oldAlgorithm = state ? state.algorithm : undefined;
    const oldProperties = state ? state.properties : undefined;
    const newGraph = graph(oldGraph, action)
    if(newGraph.error) return { ...state, error: newGraph.error};
    const newGraphSelection = graphSelection(selection(oldSelection, action), newGraph, oldGraph, action);
    if(newGraphSelection.error) return { ...state, error: newGraphSelection.error};
    const newAlgorithm = algorithm(oldAlgorithm, newGraph, action)
    if(newAlgorithm.error) return { ...state, error: newAlgorithm.error};
    const newProperties = properties(oldProperties, newGraph, action)
    if(newProperties.error) return { ...state, error: newProperties.error};

    return {
        graph: newGraph,
        selection: newGraphSelection,
        algorithm: newAlgorithm,
        properties: newProperties,
        error: null,
    };
}, {
    limit: 10,
    filter: excludeAction([
        'CLEAR_SELECTION', 'SELECT_NODE','SELECT_EDGE','STEP_ALGORITHM',
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


export default (state, action) => {
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
    };
}
