const initialState = {
    nodes: [],
    edges: [],
};

export default (state = initialState, action) => {
    switch(action.type) {
        case 'CLEAR_SELECTION':
            return initialState;
        case 'SELECT_NODE':
            return ({
                ...state,
                nodes: action.add ?
                    [...state.nodes.filter(x=>x!==action.nodeId), action.nodeId] :
                    [action.nodeId],
                edges: action.add ?
                    state.edges :
                    []
                ,
            })
        case 'SELECT_EDGE':
            return ({
                ...state,
                nodes: action.add ?
                    state.nodes : [],
                edges: action.add ?
                    [...state.edges.filter(([n,i]) => (n!=action.nodeId || i!=action.edgeIndex)), [action.nodeId, action.edgeIndex]] :
                    [[action.nodeId, action.edgeIndex]]
                ,
            })
        default:
            return state;
    }
}
