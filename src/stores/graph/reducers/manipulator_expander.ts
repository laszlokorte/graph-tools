import * as actions from '../../../actions.ts'

export default (next) => (state, action) => {
    const expandedActions = expandAction(state, action)

    if(expandedActions === false) {
        return next(state, action)
    }

    return expandedActions.reduce((currentState, a) => {
        if(state && state !== currentState && currentState.error) {
            return {...state, error: currentState.error}
        }

        const newState = next(currentState, a)

        if(newState.error) {
            return {...state, error: newState.error}
        }

        return newState
    }, state)
}

const expandAction = (state, action) => {
    if(!state) {
        return false
    }

    switch(action.type) {
        case 'MANIPULATOR_STOP': {
            const manipulator = state.manipulator

            if(manipulator.connectionStart !== null && manipulator.connectionSnap !== null) {
                return [
                    action,
                    actions.addEdge(
                        manipulator.connectionStart,
                        manipulator.connectionSnap
                    )
                ]
            } else if(manipulator.connectionStart !== null) {
                return [
                    action,
                    actions.createNode(
                        manipulator.x+manipulator.offsetX,
                        manipulator.y+manipulator.offsetY,
                        manipulator.connectionStart,
                        manipulator.edgeIndex,
                        action.altKey,
                        manipulator.control
                    )
                ]
            } else if(manipulator.movingNode !== null) {
                if(manipulator.hasMoved) {
                    return [
                        action,
                        actions.setNodeAttribute(
                            manipulator.movingNode,
                            'position',
                            {x:manipulator.x+manipulator.offsetX, y:manipulator.y+manipulator.offsetY}
                        ),
                    ]
                } else if(!action.ctrlKey && !action.shiftKey) {
                    return [
                        action,
                        actions.selectNode(manipulator.movingNode)
                    ]
                }
            } else if(manipulator.x !== null && manipulator.y !== null) {
                return [
                    action,
                    actions.createNode(
                        manipulator.x+manipulator.offsetX,
                        manipulator.y+manipulator.offsetY
                    )
                ]
            }
        }
    }

    return false
}
