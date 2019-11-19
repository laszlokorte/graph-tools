import bfs from './bfs'
import dfs from './dfs'
import dijkstra from './dijkstra'
import belman_ford from './belman_ford'

const algorithms = {
    bfs,
    dfs,
    dijkstra,
    belman_ford,
};

const initialState = {
    bfs: {
        result: null,
    },
    dfs: {
        result: null,
    },
    dijkstra: {
        result: null,
    },
    belman_ford: {
        result: null,
    },
};

const invalidatingActions = [
    'ADD_EDGE',
    'DELETE_NODE',
    'CREATE_NODE',
    'DELETE_EDGE',
    'SET_GRAPH_FLAG',
];

export default (state = initialState, graph, action) => {
    if(invalidatingActions.includes(action.type)) {
        return initialState;
    } else {
        if(action.type === 'RUN_ALGORITHM') {
            return {
                ...state,
                [action.algorithm]: true,
            };
        } else {
            return state;
        }
    }
}
