import { combineReducers } from 'redux'
import undoable, { includeAction, excludeAction } from 'redux-undo';import selection from './selection'
import graph from './graph'
import graphSelection from './graph_selection'
import algorithm from './algorithm'
import properties from './properties'

import camera from './camera'
import manipulator from './manipulator'
import pathManipulator from './path_manipulator'
import selectionBox from './select_box'

const skipActions = [
    'SELECTION_BOX_START',
        'SELECTION_BOX_MOVE',
        'SELECTION_BOX_STOP',
        'CAMERA_CLAMP',
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

const data = undoable((state, action) => {
    let error = null;
    const oldGraph = state ? state.graph : undefined;
    const oldSelection = state ? state.selection : undefined;
    const oldAlgorithm = state ? state.algorithm : undefined;
    const oldProperties = state ? state.properties : undefined;
    const newGraph = graph(oldGraph, action)
    if(newGraph.error) return { ...state, error};
    const newGraphSelection = graphSelection(selection(oldSelection, action), newGraph, oldGraph, action);
    if(newGraphSelection.error) return { ...state, error};
    const newAlgorithm = algorithm(oldAlgorithm, newGraph, action)
    if(newAlgorithm.error) return { ...state, error};
    const newProperties = properties(oldProperties, newGraph, action)
    if(newProperties.error) return { ...state, error};

    return {
        graph: newGraph,
        selection: newGraphSelection,
        algorithm: newAlgorithm,
        properties: newProperties,
        error: error,
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
    return {
        data: skip ? state.data : data(state ? state.data : undefined, action),
        camera: camera(state ? state.camera : undefined, action),
        manipulator: manipulator(state ? state.manipulator : undefined, action),
        pathManipulator: pathManipulator(state ? state.pathManipulator : undefined, action),
        selectionBox: selectionBox(state ? state.selectionBox : undefined, action),
    };
}
