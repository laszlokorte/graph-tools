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

export const ALGORITHMS = ['bfs','dfs','dijkstra','belman_ford',];

const initialState = {
    focus: 0,
    result: null,
};

const invalidatingActions = [
    'CLEAR_GRAPH',
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
        switch(action.type) {
            case 'RUN_ALGORITHM': {
                return {
                    type: action.algorithm,
                    focus: 0,
                    result: {
                        steps: algorithms[action.algorithm](graph),
                    }
                };
            }
            case 'STEP_ALGORITHM': {
                if(!state.result || !state.result.steps) {
                    return state;
                }
                return {
                    ...state,
                    focus: (state.focus + action.delta + state.result.steps.length) % (state.result.steps.length),
                    result: {
                        steps: state.result.steps,
                    }
                };
            }
        }

        return state;
    }
}
