import bfs from './bfs'
import dfs from './dfs'
import dijkstra from './dijkstra'
import bellman_ford from './bellman_ford'
import convex_hull from './convex_hull'
import triangulation from './triangulation'
import two_color from './two_color'
import kd_tree from './kd_tree'
import quad_tree from './quad_tree'
import rotating_calipers from './rotating_calipers'
import bcc from './bcc'
import closest_point_pair from './closest_point_pair'
import dinic from './dinic'
import max_bip_matching_fulkerson from './max_bip_matching_fulkerson'
import max_flow from './max_flow'
import max_matching from './max_matching'
import max_matching_hungarian_method from './max_matching_hungarian_method'
import minimal_disk from './minimal_disk'
import push_relabel from './push_relabel'
import scc_tarjan from './scc_tarjan'
import topological_sort from './topological_sort'
import johnson from './johnson'
import floyd_warshall from './floyd_warshall'

const algorithms = {
    bfs,
    dfs,
    dijkstra,
    bellman_ford,
    convex_hull,
    triangulation,
    two_color,
    kd_tree,
    quad_tree,
    rotating_calipers,
    bcc,
    closest_point_pair,
    dinic,
    max_bip_matching_fulkerson,
    max_flow,
    max_matching,
    max_matching_hungarian_method,
    minimal_disk,
    push_relabel,
    scc_tarjan,
    topological_sort,
    johnson,
    floyd_warshall,
};

export const ALGORITHMS = Object.keys(algorithms).map((a) => ({
    key: a,
    name: algorithms[a].name,
    parameters: algorithms[a].parameters,
    requirements: algorithms[a].requirements,
    dependencies: algorithms[a].dependencies,
    category: algorithms[a].category,
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
    'INIT_GRAPH',
    'CLEAR_GRAPH',
    'ADD_EDGE',
    'DELETE_NODE',
    'CREATE_NODE',
    'DELETE_EDGE',
    'SET_GRAPH_FLAG',
    'STORAGE_LOAD',
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
                const result = algorithms[action.algorithm].run(graph, action.parameters)
                return {
                    type: action.algorithm,
                    focus: result.length-1,
                    result: {
                        steps: result,
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
