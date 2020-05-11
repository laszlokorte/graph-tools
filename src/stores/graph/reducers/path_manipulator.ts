const initialState = {
    nodeIdx: null,
    edgeIdx: null,
    controlIdx: null,
    path: null,
    offsetX: 0,
    offsetY: 0,
}

export default function pathManipulationReducer (state = initialState, action) {
    switch(action.type) {
        case 'PATH_MANIPULATOR_STOP':
            return {
                ...state,
                nodeIdx: null,
                edgeIdx: null,
                controlIdx: null,
                path:null,
                offsetX: 0,
                offsetY: 0,
            };
        case 'PATH_MANIPULATOR_MOVE':
            if(state.nodeIdx != null) {
                return {
                    ...state,
                    path: [...state.path.slice(0, state.controlIdx*2), action.x, action.y, ...state.path.slice(state.controlIdx*2 + 2)],
                }
            } else {
                return state;
            }
        case 'PATH_MANIPULATOR_START_CREATE':
            return {
                ...state,
                nodeIdx: action.nodeIdx,
                edgeIdx: action.edgeIdx,
                controlIdx: action.controlIdx,
                path: [...action.path.slice(0, action.controlIdx*2), action.x, action.y, ...action.path.slice(action.controlIdx*2)],
                offsetX: 0,
                offsetY: 0,
            }
        case 'PATH_MANIPULATOR_START_MOVE':
            return {
                ...state,
                nodeIdx: action.nodeIdx,
                edgeIdx: action.edgeIdx,
                controlIdx: action.controlIdx,
                path: [...action.path.slice(0, action.controlIdx*2), action.x, action.y, ...action.path.slice(action.controlIdx*2 + 2)],
                offsetX: 0,
                offsetY: 0,
            }
    }
    return state;
}
