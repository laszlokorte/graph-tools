import bfs from './bfs'
import dfs from './dfs'
import dijkstra from './dijkstra'
import belman_ford from './belman_ford'
import convex_hull from './convex_hull'
import triangulation from './triangulation'

const algorithms = {
    bfs,
    dfs,
    dijkstra,
    belman_ford,
    convex_hull,
    triangulation,
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
    dependencies: {
        nodes: [],
        edges: [],
    },
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
        if(state.dependencies.nodes && state.dependencies.nodes.includes(action.attribute)) {
            return initialState
        } else {
            return state;
        }
    } else if(action.type === 'NODE_AUTO_LAYOUT') {
        if(state.dependencies.nodes && state.dependencies.nodes.includes('position')) {
            return initialState
        } else {
            return state;
        }
    } else if(action.type === 'SET_EDGE_ATTRIBUTE') {
        if(state.dependencies.edges && state.dependencies.edges.includes(action.attribute)) {
            return initialState
        } else {
            return state;
        }
    } else if(action.type === 'CLEAR_GRAPH_EDGES') {
        if(state.dependencies.edges.length) {
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
                        steps: algorithms[action.algorithm].run(graph, action.parameters),
                    },
                    dependencies: {
                        nodes: [
                            ...(algorithms[action.algorithm].dependencies.nodes),
                            ...Object.keys(algorithms[action.algorithm].parameters).filter((k) => {
                                return algorithms[action.algorithm].parameters[k].type === 'NODE_ATTRIBUTE'
                            }).map((k) => action.parameters[k])
                        ],
                        edges: [
                            ...(algorithms[action.algorithm].dependencies.edges),
                            ...Object.keys(algorithms[action.algorithm].parameters).filter((k) => {
                                return algorithms[action.algorithm].parameters[k].type === 'EDGE_ATTRIBUTE'
                            }).map((k) => action.parameters[k])
                        ],
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
