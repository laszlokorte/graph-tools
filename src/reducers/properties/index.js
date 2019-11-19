import nodeCount from './node_count';
import edgeCount from './edge_count';

const invalidatingActions = [
    'ADD_EDGE',
    'DELETE_NODE',
    'CREATE_NODE',
    'DELETE_EDGE',
    'SET_GRAPH_FLAG',
];

export default (prevState, graph = {}, action) => {
    if(!prevState || invalidatingActions.includes(action.type)) {
        return {
            nodeCount: nodeCount(graph),
            edgeCount: edgeCount(graph),
        };
    } else {
        return prevState;
    }
}
