const initialState = {
    nodes: [],
    attributes: {
        edges: {
            label: [[]],
            weight: [[]]
        },
        nodes: {
            position: [],
            label: [],
            color: [],
        }
    }
};

const attributeDefaults = {
    edges: {
        label: "new",
        weight: 1
    },
    nodes: {
        label: "new",
        color: null,
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

export default (state = initialState, action) => {
    switch(action.type) {
        case 'ADD_EDGE':
            return ({
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
                            [...value[action.fromNodeId], attributeDefaults.edges[key]],
                            ...value.slice(action.fromNodeId+1)
                        ]
                    )
                },
            });
        case 'DELETE_EDGE':
            return ({
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
                                ...value[action.nodeId].slice(0, edgeIndex),
                                ...value[action.nodeId].slice(edgeIndex + 1)
                            ],
                            ...value.slice(action.nodeId+1)
                        ]
                    )
                },
            });
        case 'CREATE_NODE':
            return ({
                nodes: [
                    ...state.nodes,
                    []
                ],
                attributes: {
                    ...state.attributes,
                    nodes: objectMap(state.attributes.nodes,
                        (key, value) => [
                            ...value,
                            action.attributes[key] || attributeDefaults.nodes[key]
                        ]
                    ),
                    edges: objectMap(state.attributes.edges,
                        (key, value) => [...value, []]
                    )
                },
            })
        case 'DELETE_NODE':
            return ({
                nodes: [
                    ...state.nodes.slice(0, action.nodeId),
                    ...state.nodes.slice(action.nodeId+1)
                ],
                attributes: {
                    ...state.attributes,
                    nodes: objectMap(state.attributes.nodes,
                        (key, value) => [
                            ...value.slice(0, action.nodeId),
                            ...value.slice(action.nodeId+1)
                        ]
                    )
                },
            });
        case 'SET_EDGE_ATTRIBUTE':
            return ({
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

        default:
            return state;
    }
}
