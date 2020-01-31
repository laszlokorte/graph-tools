const initialState = {
    nodes: [],
    attributes: {
        edges: {
            label: [],
            cost: [],
            capacity: [],
            weight: [],
        },
        nodes: {
            position: [],
            label: [],
            color: [],
            initial: [],
            final: [],
            source: [],
            sink: [],
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
                visible: true,
            },
            cost: {
                default: 1,
                type: 'numeric',
                visible: false,
            },
            capacity: {
                default: 1,
                type: 'numeric',
                visible: true,
            },
            weight: {
                default: 1,
                type: 'numeric',
                visible: true,
            },
        },
        nodes: {
            position: {
                default: {x:0,y:0},
                type: 'object',
                visible: false,
            },
            label: {
                default: 'new',
                type: 'text',
                visible: true,
            },
            color: {
                default: null,
                type: 'color',
                visible: false,
            },
            initial: {
                default: false,
                type: 'boolean',
                visible: false,
            },
            final: {
                default: false,
                type: 'boolean',
                visible: false,
            },
            source: {
                default: false,
                type: 'boolean',
                visible: false,
            },
            sink: {
                default: false,
                type: 'boolean',
                visible: false,
            },
        }
    }
};

const example = {
    "nodes": [
      [
        1,
        4,
        2,
        0
      ],
      [
        0,
        1,
        2,
        4,
        3
      ],
      [
        0,
        5,
        6
      ],
      [
        2,
        4
      ],
      [
        1,
        3
      ],
      [
        6
      ],
      []
    ],
    "attributes": {
      "edges": {
        "label": [
          [
            "",
            "",
            "",
            ""
          ],
          [
            "",
            "",
            "",
            "",
            ""
          ],
          [
            "",
            "",
            ""
          ],
          [
            "",
            ""
          ],
          [
            "",
            ""
          ],
          [
            ""
          ],
          []
        ],
        "cost": [
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1
          ],
          [
            1,
            1
          ],
          [
            1
          ],
          []
        ],
        "capacity": [
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1
          ],
          [
            1,
            1
          ],
          [
            1
          ],
          []
        ],
        "weight": [
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1
          ],
          [
            1,
            1
          ],
          [
            1
          ],
          []
        ]
      },
      "nodes": {
        "position": [
          {
            "x": -35.51763916015625,
            "y": -222.72677612304688
          },
          {
            "x": -266.4918212890625,
            "y": -86.96369934082031
          },
          {
            "x": 41.94293212890625,
            "y": -0.812835693359375
          },
          {
            "x": -15.652587890625,
            "y": 182.35848999023438
          },
          {
            "x": -222.92498779296875,
            "y": 150.67352294921875
          },
          {
            "x": 192.538330078125,
            "y": -7.2330322265625
          },
          {
            "x": 120.3287353515625,
            "y": 132.19061279296875
          }
        ],
        "label": [
          "new",
          "new",
          "new",
          "new",
          "new",
          "new",
          "new"
        ],
        "color": [
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ],
        "initial": [
          true,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        "final": [
          false,
          false,
          false,
          false,
          false,
          false,
          true,
        ],
        "source": [
          true,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        "sink": [
          false,
          false,
          false,
          false,
          false,
          false,
          true,
        ]
      }
    },
    "flags": {
      "multiGraph": false,
      "directed": true
    },
    "attributeTypes": {
      "edges": {
        "label": {
          "default": "",
          "type": "text",
          "visible": false,
        },
        "cost": {
          "default": 1,
          "type": "numeric",
          "visible": true,
        },
        "capacity": {
          "default": 1,
          "type": "numeric",
          "visible": false,
        },
        "weight": {
          "default": 1,
          "type": "numeric",
          "visible": false,
        }
      },
      "nodes": {
        "position": {
          "default": {
            "x": 0,
            "y": 0
          },
          "type": "object",
          "visible": false,
        },
        "label": {
          "default": "new",
          "type": "text",
          "visible": true,
        },
        "color": {
          "default": null,
          "type": "color",
          "visible": false,
        },
        "initial": {
          "default": false,
          "type": "boolean",
          "visible": false,
        },
        "final": {
          "default": false,
          "type": "boolean",
          "visible": false,
        },
        "source": {
          "default": false,
          "type": "boolean",
          "visible": false,
        },
        "sink": {
          "default": false,
          "type": "boolean",
          "visible": false,
        },
      }
    }
  };

const castAttributeType = (type, val) => {
    switch(type) {
        case 'numeric':
            return parseFloat(val || 0);
        case 'boolean':
            return !!val;
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
                return neighbours.filter((n) => n > nodeId)
            }),
            attributes: {
                ...state.attributes,
                edges: objectMap(state.attributes.edges,
                    (key, value) =>
                        value.map((vs, node) => vs.filter((v, i) => state.nodes[node][i] > node))
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

const thisReducer = (state = /*initialState*/example, action) => {
    switch(action.type) {
        case 'CLEAR_GRAPH': {
            return initialState;
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
            const nodeAdded = ({
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

            if(action.attributes.connectTo !== null) {
                return thisReducer(nodeAdded, {
                    type: 'ADD_EDGE',
                    fromNodeId: action.attributes.connectTo,
                    toNodeId: nodeAdded.nodes.length - 1,
                })
            } else {
                return nodeAdded;
            }
        }
        case 'DELETE_NODE': {
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
                        ].map((values, newNodeId) => values
                            .filter((v, i) =>
                                state.nodes[newNodeId >= action.nodeId ? newNodeId + 1 : newNodeId][i] !== action.nodeId))
                    )
                },
            });
        }
        case 'SET_EDGE_ATTRIBUTE': {
            const newAttr = castAttributeType(state.attributeTypes.edges[action.attribute].type, action.value);
            const oldAttr = state.attributes.edges[action.attribute][action.nodeId][action.edgeIndex];
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
            const newAttr = castAttributeType(state.attributeTypes.nodes[action.attribute].type, action.value);
            const oldAttr = state.attributes.nodes[action.attribute][action.nodeId];
            if(newAttr == oldAttr) {
                return state;
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
        case 'NODE_AUTO_LAYOUT': {
            const positionAttribute = 'position';
            const nodeCount = state.nodes.length;

            const count = state.nodes.length;

            const sum = state.attributes.nodes[positionAttribute].reduce(({cx,cy}, {x,y}) => ({
                cx: cx + x,
                cy: cy + y,
            }), {cx: 0,cy: 0})

            const center = {
                x: sum.cx / count,
                y: sum.cy / count,
            }

            const radius = Math.sqrt(state.attributes.nodes[positionAttribute].reduce((d, {x,y}) => (
                d + (x-center.x)*(x-center.x)+(y-center.y)*(y-center.y)
            ), 0) / count)

            return {
                ...state,
                attributes: {
                    ...state.attributes,
                    nodes: {
                        ...state.attributes.nodes,
                        [positionAttribute]: state.attributes.nodes[positionAttribute].map(({x,y}, i) => ({
                            x: center.x + radius * Math.sin(2*Math.PI * i / count),
                            y: center.y + radius * Math.cos(2*Math.PI * i / count),
                        }))
                    }
                }
            }
        }
        default:
            return state;
    }
}

export default thisReducer;
