const initialState = {
    x0:null,
    y0:null,
    x1:null,
    y1:null,
}

export default function(state = initialState, action) {
    switch(action.type) {
        case 'SELECTION_BOX_START': {
            return {
                ...state,
                x0:action.x,
                y0:action.y,
                x1:action.x,
                y1:action.y,
            }
        }
        case 'SELECTION_BOX_MOVE': {
            if(state.x0 === null) {
                return state;
            }
            return {
                ...state,
                x1:action.x,
                y1:action.y,
            }
        }
        case 'SELECTION_BOX_STOP': {
            return {
                ...state,
                x0:null,
                y0:null,
                x1:null,
                y1:null,
            }
        }
    }
    return state;
}
