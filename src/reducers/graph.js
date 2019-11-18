const initialState = {
    nodes: [],
    attributes: {
        edges: {
            label: [],
            weight: []
        },
        nodes: {
            position: [],
            label: [],
            color: [],
        }
    },
    flags: {
        multiGraph: false,
        directed: true,
    },
    attributeTypes: {
        edges: {
            label: {
                default: '',
                type: 'text',
            },
            weight: {
                default: 1,
                type: 'numeric',
            },
        },
        nodes: {
            position: {
                default: {x:0,y:0},
                type: 'object',
            },
            label: {
                default: 'new',
                type: 'text',
            },
            color: {
                default: null,
                type: 'color',
            },
        }
    }
};

const flagConversions = {
    multiGraph: (state, yes) => {
        return state;
    },
    directed: (state, yes) => {
        return state;
    }
}

const objectMap = (obj, fn) => {
    const keys = Object.keys(obj);
    const result = {};

    for(let i=0;i<keys.length;i++) {
        result[keys[i]] = fn(keys[i], obj[keys[i]]);
    }

    return result;
}

const thisReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'ADD_EDGE':
            if(!state.flags.multiGraph && state.nodes[action.fromNodeId].includes(action.toNodeId)) {
                return state;
            }
            if(!state.flags.directed && action.fromNodeId === action.toNodeId) {
                return state;
            }
            if(!state.flags.directed && action.fromNodeId > action.toNodeId) {
                return thisReducer(state, {
                    ...action,
                    fromNodeId: action.toNodeId,
                    toNodeId: action.fromNodeId,
                })
            }
            return ({
                ...state,
                nodes: [
                    ...state.nodes.slice(0, action.fromNodeId),
                    [...state.nodes[action.fromNodeId], action.toNodeId],
                    ...state.nodes.slice(action.fromNodeId+1)
                ],
                attributes: {
                    ...state.attributes,
                    edges: objectMap(state.attributes.edges,
                        (key, value) => [
                            ...value.slice(0, action.fromNodeId),
                            [...value[action.fromNodeId], state.attributeTypes.edges[key].default],
                            ...value.slice(action.fromNodeId+1)
                        ]
                    )
                },
            });
        case 'DELETE_EDGE':
            return ({
                ...state,
                nodes: [
                    ...state.nodes.slice(0, action.nodeId),
                    [
                        ...state.nodes[action.nodeId].slice(0, action.edgeIndex),
                        ...state.nodes[action.nodeId].slice(action.edgeIndex + 1)
                    ],
                    ...state.nodes.slice(action.nodeId+1)
                ],
                attributes: {
                    ...state.attributes,
                    edges: objectMap(state.attributes.edges,
                        (key, value) => [
                            ...value.slice(0, action.nodeId),
                            [
                                ...value[action.nodeId].slice(0, action.edgeIndex),
                                ...value[action.nodeId].slice(action.edgeIndex + 1)
                            ],
                            ...value.slice(action.nodeId+1)
                        ]
                    )
                },
            });
        case 'CREATE_NODE':
            return ({
                ...state,
                nodes: [
                    ...state.nodes,
                    []
                ],
                attributes: {
                    ...state.attributes,
                    nodes: objectMap(state.attributes.nodes,
                        (key, value) => [
                            ...value,
                            action.attributes[key] || state.attributeTypes.nodes[key].default
                        ]
                    ),
                    edges: objectMap(state.attributes.edges,
                        (key, value) => [...value, []]
                    )
                },
            })
        case 'DELETE_NODE':
            return ({
                ...state,
                nodes: [
                    ...state.nodes.slice(0, action.nodeId),
                    ...state.nodes.slice(action.nodeId+1)
                ].map((neighbours, nodeId) => neighbours
                    .filter((n) => n !== action.nodeId)
                    .map((n) => n > action.nodeId ? n-1 : n)),
                attributes: {
                    ...state.attributes,
                    nodes: objectMap(state.attributes.nodes,
                        (key, value) => [
                            ...value.slice(0, action.nodeId),
                            ...value.slice(action.nodeId+1)
                        ]
                    ),
                    edges: objectMap(state.attributes.edges,
                        (key, values) => [
                            ...values.slice(0, action.nodeId),
                            ...values.slice(action.nodeId+1)
                        ].map((values, nodeId) => values
                            .filter((v, i) =>
                                state.nodes[nodeId > action.nodeId ? nodeId - 1 : nodeId][i] !== action.nodeId))
                    )
                },
            });
        case 'SET_EDGE_ATTRIBUTE':
            return ({
                ...state,
                nodes: state.nodes,
                attributes: {
                    ...state.attributes,
                    edges: {
                        ...state.attributes.edges,
                        [action.attribute]: [
                            ...state.attributes.edges[action.attribute].slice(0, action.nodeId),
                            [
                                ...state.attributes.edges[action.attribute][action.nodeId].slice(0, action.edgeIndex),
                                action.value,
                                ...state.attributes.edges[action.attribute][action.nodeId].slice(action.edgeIndex + 1)
                            ],
                            ...state.attributes.edges[action.attribute].slice(action.nodeId+1)
                        ]
                    }
                },
            });
        case 'SET_NODE_ATTRIBUTE':
            return ({
                ...state,
                nodes: state.nodes,
                attributes: {
                    ...state.attributes,
                    nodes: {
                        ...state.attributes.nodes,
                        [action.attribute]: [
                            ...state.attributes.nodes[action.attribute].slice(0, action.nodeId),
                            action.value,
                            ...state.attributes.nodes[action.attribute].slice(action.nodeId+1)
                        ]
                    }
                },
            });
        case 'SET_GRAPH_FLAG':
            const conversion = flagConversions[action.flag];
            return {
                ...conversion(state, action.set),
                flags: {
                    ...state.flags,
                    [action.flag]: action.set,
                }
            };
        default:
            return state;
    }
}

export default thisReducer;
