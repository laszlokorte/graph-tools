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

export const ALGORITHMS = Object.keys(algorithms).map((a) => ({
    key: a,
    name: algorithms[a].name,
    parameters: algorithms[a].parameters,
    requirements: algorithms[a].requirements,
    dependencies: algorithms[a].dependencies,
}));

const initialState = {
    type: null,
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
    } else if(action.type === 'SET_NODE_ATTRIBUTE') {
        if(state.type && algorithms[state.type].dependencies.nodes && algorithms[state.type].dependencies.nodes.includes(action.attribute)) {
            return initialState
        } else {
            return state;
        }
    } else if(action.type === 'SET_EDGE_ATTRIBUTE') {
        if(state.type && algorithms[state.type].dependencies.edges && algorithms[state.type].dependencies.edges.includes(action.attribute)) {
            return initialState
        } else {
            return state;
        }
    } else {
        switch(action.type) {
            case 'RUN_ALGORITHM': {
                return {
                    type: action.algorithm,
                    focus: 0,
                    result: {
                        steps: algorithms[action.algorithm].run(graph),
                    },
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
