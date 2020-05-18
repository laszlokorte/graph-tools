import {ALGORITHM_MAP} from "./algorithm/index";

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
    switch(action.type) {
        case 'RUN_SELECTED_ALGORITHM': {
            const parameters = {}
            const alg = ALGORITHM_MAP[state.algorithmSelection.type]
            const expectedParameters = Object.keys(alg.parameters)

            for(let e of expectedParameters) {
                parameters[e] = state.algorithmSelection.parameters.hasOwnProperty(e) ?
                    state.algorithmSelection.parameters[e] : null
            }

            return [{
                type: 'RUN_ALGORITHM',
                algorithm: state.algorithmSelection.type,
                parameters: parameters,
            }]
        }

    }

    return false
}
