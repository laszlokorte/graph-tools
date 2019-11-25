import { combineReducers } from 'redux'
import undoable, { includeAction, excludeAction } from 'redux-undo';import selection from './selection'
import graph from './graph'
import graphSelection from './graph_selection'
import algorithms from './algorithms'
import properties from './properties'

export default undoable((state, action) => {
    const combination = combineReducers({
        selection,
        graph,
    })

    const intermediateState = combination({
        selection: state ? state.selection : undefined,
        graph: state ? state.graph : undefined,
    }, action);

    return {
        ...intermediateState,
        selection: graphSelection(intermediateState.graph, intermediateState.selection, action),
        algorithms: algorithms(state ? state.algorithms : undefined, intermediateState.graph, action),
        properties: properties(state ? state.properties : undefined, intermediateState.graph, action),
    };
}, {
    limit: 10,
    filter: excludeAction([
        'CLEAR_SELECTION', 'SELECT_NODE','SELECT_EDGE',
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

        return null;
    }
})
