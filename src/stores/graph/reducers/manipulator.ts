const initialState = {
        connectionStart: null,
        edgeIndex: null,
        connectionSnap: null,
        x: null,
        y: null,
        movingNode: null,
        offsetX: 0,
        offsetY: 0,
        control: null,
        hasMoved: false,
    }

export default function manipulationReducer (state = initialState, action) {
    switch(action.type) {
        case 'MANIPULATOR_STOP':
            if(state.connectionStart === null && state.x === null && state.movingNode === null) {
                return state
            }
            return {
                ...state,
                connectionStart: null,
                connectionSnap: null,
                x: null,
                y: null,
                offsetX: 0,
                offsetY: 0,
                movingNode: null,
                edgeIndex: null,
                control: null,
            };
        case 'MANIPULATOR_MOVE':
            if(state.connectionStart!==null || state.movingNode !== null || (state.x !== null && state.y !== null)) {
                return {
                    ...state,
                    x: action.x,
                    y: action.y,
                    hasMoved: true,
                }
            } else {
                return state;
            }
        case 'MANIPULATOR_START_CONNECT':
            const hasEdge = typeof action.edgeIndex !== 'undefined';
            const hasControl = typeof action.control !== 'undefined';

            return {
                ...state,
                connectionStart: action.nodeId,
                x: action.x,
                y: action.y,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
                connectionSnap: hasEdge ? null : action.nodeId,
                edgeIndex: hasEdge ? action.edgeIndex : null,
                control: hasControl ? action.control : null,
            }
        case 'MANIPULATOR_START_CREATE':
            return {
                ...state,
                connectionStart: null,
                x: action.x,
                y: action.y,
                offsetX: 0,
                offsetY: 0,
                connectionSnap: null,
                edgeIndex: null,
                control: null,
            }
        case 'MANIPULATOR_SNAP_CONNECT':
            if(state.connectionStart === null) {
                return state;
            }
            return {
                ...state,
                x: null,
                y: null,
                connectionSnap:action.nodeId,
                control: null,
            }
        case 'MANIPULATOR_UNSNAP_CONNECT':
            if(state.connectionStart === null) {
                return state;
            }
            return {
                ...state,
                x: action.x,
                y: action.y,
                connectionSnap:null,
                control: null,
            }
        case 'MANIPULATOR_START_MOVE':
            return {
                ...state,
                x: action.x,
                y: action.y,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
                movingNode: action.nodeId,
                edgeIndex: null,
                control: null,
                hasMoved: false,
            }
    }
    return state;
}
