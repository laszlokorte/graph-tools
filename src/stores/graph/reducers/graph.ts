const initialState = {
  "nodes": [],
  "attributes": {
    "edges": {
      "path": [],
      "label": [],
      "cost": [],
      "capacity": [],
      "weight": []
    },
    "nodes": {
      "position": [],
      "label": [],
      "type": [],
      "color": [],
      "initial": [],
      "final": [],
      "source": [],
      "sink": []
    }
  },
  "flags": {
      "multiGraph": false,
      "directed": true,
      "loops": true,
  },
  "partition": null,
  "attributeTypes": {
    "edges": {
      "path": {
        "default": [],
        "type": "path",
        "visible": false
      },
      "label": {
        "default": "",
        "type": "text",
        "visible": true
      },
      "cost": {
        "default": 1,
        "type": "numeric",
        "visible": true
      },
      "capacity": {
        "default": 1,
        "type": "numeric",
        "visible": false
      },
      "weight": {
        "default": 1,
        "type": "numeric",
        "visible": false
      }
    },
    "nodes": {
      "position": {
        "default": {
          "x": 0,
          "y": 0
        },
        "type": "object",
        "visible": false
      },
      "label": {
        "default": "new",
        "type": "text",
        "visible": true
      },
      "type": {
        "default": "place",
        "type": "enum",
        "options": [
            "place", "transition"
        ],
        "required": true,
      },
      "color": {
        "default": null,
        "type": "color",
        "visible": false
      },
      "initial": {
        "default": false,
        "type": "boolean",
        "visible": false
      },
      "final": {
        "default": false,
        "type": "boolean",
        "visible": false
      },
      "source": {
        "default": false,
        "type": "boolean",
        "visible": false
      },
      "sink": {
        "default": false,
        "type": "boolean",
        "visible": false
      }
    }
  }
};

const castAttributeType = (attr, val, old) => {
    switch(attr.type) {
        case 'numeric':
            const parsed = parseFloat(val || 0);
            if(isNaN(parsed)) {
                return old
            }
            return parsed
        case 'boolean':
            return !!val;
        case 'enum':
            if(attr.options.indexOf(val) > -1) {
                return val
            } else if(attr.required) {
                return attr.default || attr.options[0];
            } else {
                return null;
            }
    }
    return val;
}

const flagConversions = {
    multiGraph: (state, yes) => {
        if(yes) {
            return state;
        }
        return {
            ...state,
            nodes: state.nodes.map((neighbours, nodeId) => {
                return neighbours.filter((n, i, s) => s.indexOf(n) === i)
            }),
            attributes: {
                ...state.attributes,
                edges: objectMap(state.attributes.edges,
                    (key, value) =>
                        value.map((vs, node) => vs.filter((v, i) => state.nodes[node].indexOf(state.nodes[node][i]) === i))
                )
            },
        }
    },
    directed: (state, yes) => {
        if(yes) {
            return state;
        }
        return {
            ...state,
            nodes: state.nodes.map((neighbours, nodeId) => {
                return neighbours.filter((n) => n >= nodeId)
            }),
            attributes: {
                ...state.attributes,
                edges: objectMap(state.attributes.edges,
                    (key, value) =>
                        value.map((vs, node) => vs.filter((v, i) => state.nodes[node][i] >= node))
                )
            },
        };
    },
    loops: (state, yes) => {
        if(yes) {
            return state;
        }
        return {
            ...state,
            nodes: state.nodes.map((neighbours, nodeId) => {
                return neighbours.filter((n) => n !== nodeId)
            }),
            attributes: {
                ...state.attributes,
                edges: objectMap(state.attributes.edges,
                    (key, value) =>
                        value.map((vs, node) => vs.filter((v, i) => state.nodes[node][i] !== node))
                )
            },
        };
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
        case 'CLEAR_GRAPH': {
            return initialState;
        }
        case 'INIT_GRAPH': {
            return action.graph;
        }
        case 'CLEAR_GRAPH_EDGES': {
            return ({
                ...state,
                nodes: state.nodes.map((_) => []),
                attributes: {
                    ...state.attributes,
                    edges: objectMap(state.attributes.edges,
                        (key, value) => value.map((_) => [])
                    )
                },
            });
        }
        case 'ADD_EDGE': {
            if(!state.flags.multiGraph && state.nodes[action.fromNodeId].includes(action.toNodeId)) {
                return {error: 'Edge already exists'};
            }
            if(!state.flags.loops && action.fromNodeId === action.toNodeId) {
                return {error: 'Looping edges are not allowed in this graph'};
            }
            if(!state.flags.directed && action.fromNodeId > action.toNodeId) {
                return {
                    error: 'Edges must be ordered from low to higher node id',
                }
            }
            if(typeof state.partition === 'string') {
                const sourcePartition = state.attributes.nodes[state.partition][action.fromNodeId];
                const targetPartition = state.attributes.nodes[state.partition][action.toNodeId];

                if(sourcePartition === targetPartition) {
                    return {error: 'Partition violated'};
                }
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
        }
        case 'DELETE_EDGE': {
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
        }
        case 'CREATE_NODE': {
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
            });
        }
        case 'DELETE_NODE': {
            if(state.nodes[action.nodeId].length) {
                return {error: 'Node can not be deleted'}
            }
            if(state.nodes.some((neighbours) => neighbours.includes(action.nodeId))) {
                return {error: 'Node can not be deleted'}
            }
            return ({
                ...state,
                nodes: [
                    ...state.nodes.slice(0, action.nodeId),
                    ...state.nodes.slice(action.nodeId+1)
                ].map((neighbours, nodeId) => neighbours
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
                        ]
                    )
                },
            });
        }
        case 'SET_EDGE_ATTRIBUTE': {
            const oldAttr = state.attributes.edges[action.attribute][action.nodeId][action.edgeIndex];
            const newAttr = castAttributeType(state.attributeTypes.edges[action.attribute], action.value, oldAttr);
            if(newAttr == oldAttr) {
                return state;
            }
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
                                newAttr,
                                ...state.attributes.edges[action.attribute][action.nodeId].slice(action.edgeIndex + 1)
                            ],
                            ...state.attributes.edges[action.attribute].slice(action.nodeId+1)
                        ]
                    }
                },
            });
        }
        case 'SET_NODE_ATTRIBUTE': {
            const oldAttr = state.attributes.nodes[action.attribute][action.nodeId];
            const newAttr = castAttributeType(state.attributeTypes.nodes[action.attribute], action.value, oldAttr);
            if(newAttr == oldAttr) {
                return state;
            }

            if(state.partition === action.attribute) {
                if(state.nodes[action.nodeId].length || state.nodes.some((ns) => ns.includes(action.nodeId))) {
                    return {error: 'Changing this attribute would violate the partitioning'};
                }
            }

            return ({
                ...state,
                nodes: state.nodes,
                attributes: {
                    ...state.attributes,
                    nodes: {
                        ...state.attributes.nodes,
                        [action.attribute]: [
                            ...state.attributes.nodes[action.attribute].slice(0, action.nodeId),
                            newAttr,
                            ...state.attributes.nodes[action.attribute].slice(action.nodeId+1)
                        ]
                    }
                },
            });
        }
        case 'SET_GRAPH_FLAG': {
            const conversion = flagConversions[action.flag];
            return {
                ...conversion(state, action.set),
                flags: {
                    ...state.flags,
                    [action.flag]: action.set,
                }
            };
        }
        case 'SET_EDGE_ATTRIBUTE_VISIBLE': {
            return {
                ...state,
                attributeTypes: {
                    ...state.attributeTypes,
                    edges: {
                        ...state.attributeTypes.edges,
                        [action.attribute]: {
                            ...state.attributeTypes.edges[action.attribute],
                            visible: action.visible,
                        }
                    }
                }
            };
        }
        case 'SET_NODE_ATTRIBUTE_VISIBLE': {
            return {
                ...state,
                attributeTypes: {
                    ...state.attributeTypes,
                    nodes: {
                        ...state.attributeTypes.nodes,
                        [action.attribute]: {
                            ...state.attributeTypes.nodes[action.attribute],
                            visible: action.visible,
                        }
                    }
                }
            };
        }
        default:
            return state;
    }
}
