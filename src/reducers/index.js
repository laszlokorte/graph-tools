import { combineReducers } from 'redux'
import undoable, { includeAction, excludeAction } from 'redux-undo';import selection from './selection'
import graph from './graph'
import graphSelection from './graph_selection'

export default undoable((state, action) => {
    const combination = combineReducers({
        selection,
        graph,
    })

    const intermediateState = combination(state, action);

    return {
        ...intermediateState,
        selection: graphSelection(intermediateState.graph, intermediateState.selection, action),
    };
}, {
    limit: 10,
    filter: excludeAction([
        'CLEAR_SELECTION', 'SELECT_NODE','SELECT_EDGE',
    ]),
    ignoreInitialState: true,
    groupBy: (action, currentState, previousHistory) => {
        if(action.type === 'SET_NODE_ATTRIBUTE') {
            return action.nodeId + '-' + action.attribute;
        }
        if(action.type === 'SET_EDGE_ATTRIBUTE') {
            return action.nodeId + '-' + action.edgeIndex + '-' + action.attribute;
        }

        return null;
    }
})
