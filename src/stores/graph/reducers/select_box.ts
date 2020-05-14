const initialState = {
    x0:null,
    y0:null,
    x1:null,
    y1:null,
    moved: false,
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
                moved: false,
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
                moved: state.move ||
                    Math.abs(action.x - state.x0) > 5 ||
                    Math.abs(action.y - state.y0) > 5,
            }
        }
        case 'SELECTION_BOX_STOP': {
            return {
                ...state,
                x0:null,
                y0:null,
                x1:null,
                y1:null,
                moved: false,
            }
        }
    }
    return state;
}
