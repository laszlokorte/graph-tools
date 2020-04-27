const initialState = {
    nodes: [],
    edges: [],
};

export default (state = initialState, action) => {
    switch(action.type) {
        case 'CLEAR_SELECTION': {
            return initialState;
        }
        case 'SELECT_NODE': {
            const alreadySelected = state.nodes.includes(action.nodeId)
            return ({
                ...state,
                nodes:
                    alreadySelected && action.toggle ?
                    state.nodes.filter(x=>x!==action.nodeId) :
                    action.add ?
                    [...state.nodes.filter(x=>x!==action.nodeId), action.nodeId] :
                    [action.nodeId],
                edges: action.add ?
                    state.edges :
                    []
                ,
            })
        }
        case 'SELECT_EDGE': {
            const alreadySelected = state.edges.findIndex(
                ([n,i]) => (n===action.nodeId && i===action.edgeIndex)
            ) >= 0

            return ({
                ...state,
                nodes: action.add ?
                    state.nodes : [],
                edges:
                    alreadySelected && action.toggle ?
                    state.edges.filter(([n,i]) => (n!==action.nodeId || i!==action.edgeIndex)) :
                    action.add ?
                    [...state.edges.filter(([n,i]) => (n!==action.nodeId || i!==action.edgeIndex)), [action.nodeId, action.edgeIndex]] :
                    [[action.nodeId, action.edgeIndex]]
                ,
            })
        }
        default: {
            return state;
        }
    }
}
