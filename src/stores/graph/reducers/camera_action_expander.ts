export default (next) => (state, action) => {
    const expandedActions = expandAction(state, action)

    if(expandedActions === false) {
        return next(state, action)
    }

    return expandedActions.reduce((currentState, a) => {
        return next(currentState, a)
    }, state)
}

const expandAction = (state, action) => {
    const camera = state && state.camera
    const box = camera && camera.box
    switch(action.type) {
        case 'CLEAR_GRAPH':
        case 'NODE_AUTO_LAYOUT':
        case 'INIT_GRAPH': {
            return [action, {type: 'CAMERA_RESET'}]
        }
        case 'CAMERA_JUMP_ZOOM': {
            const defaultZoom = Math.min(
                      camera.screen.width/(box.maxX - box.minX),
                      camera.screen.height/(box.maxY - box.minY),
                      20
                    )
            if(camera.rotation != 0) {
                return [{type: 'CAMERA_RESET'}]
            } else if(Math.abs(camera.zoom / defaultZoom) < 1.05) {
                return [{type:'CAMERA_ZOOM', x: action.x, y: action.y, factor: 6 / 2}]
            } else {
                return [{type: 'CAMERA_RESET'}]
            }
        }
    }

    return false
}
