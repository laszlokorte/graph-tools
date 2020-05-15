export default (next) => (state, action) => {
    const expandedActions = expandGraphAction(state, action)

    if(expandedActions === false) {
        return next(state, action)
    }

    return expandedActions.reduce((currentState, a) => {
        if(state && !state.error && currentState.error) {
            return {...state, error: currentState.error}
        }

        return next(currentState, a)
    }, state)
}

const expandGraphAction = (state, action) => {
    const graph = state && state.graph;

    switch(action.type) {
        case 'ADD_EDGE':
            if(!graph.flags.directed && action.fromNodeId > action.toNodeId) {
                return [
                    {
                        ...action,
                        fromNodeId: action.toNodeId,
                        toNodeId: action.fromNodeId,
                    },
                    {
                        type: 'SELECT_EDGE',
                        nodeId: action.toNodeId,
                        edgeIndex: graph.nodes[action.toNodeId].length,
                        add: false,
                        toggle: false,
                    }
                ]
            } else {
                return [action, {
                    type: 'SELECT_EDGE',
                    nodeId: action.fromNodeId,
                    edgeIndex: graph.nodes[action.fromNodeId].length,
                    add: false,
                    toggle: false,
                }]
            }
            break;
        case 'DELETE_NODE': {
            const edgeDeletions = []

            edgeDeletions.unshift(
                ...graph.nodes[action.nodeId].map((other, edgeIndex) => ({
                    type: 'DELETE_EDGE',
                    nodeId: action.nodeId, edgeIndex,
                }))
            )

            edgeDeletions.unshift(
                ...graph.nodes.flatMap((neighbours, fromId) =>
                    neighbours.map((toId, edgeIndex) => action.nodeId === toId ? ({
                        type: 'DELETE_EDGE',
                        nodeId: fromId,
                        edgeIndex,
                    }) : null).filter((i) => i !== null)
                )
            )

            edgeDeletions.sort((a,b) => {
                const c = b.nodeId - a.nodeId
                return c === 0 ? b.edgeIndex - a.edgeIndex : c
            })

            return [{
                type: 'DESELECT_NODE',
                nodeId: action.nodeId,
            }, ...edgeDeletions.map(del => ({
                type: 'DESELECT_EDGE',
                nodeId: del.nodeId,
                edgeIndex: del.edgeIndex,
            })),...edgeDeletions, action]
        }
        case 'CREATE_NODE': {
            const actions = [action]
            if(action.attributes.connectTo !== null) {
                if(graph.partition) {
                    const sourcePartition = graph.attributes.nodes[graph.partition][action.attributes.connectTo];
                    const partitions = graph.attributeTypes.nodes[graph.partition].options;
                    const newPartition = partitions[(partitions.indexOf(sourcePartition) + 1) % partitions.length];

                    actions.push({
                        type: 'SET_NODE_ATTRIBUTE',
                        nodeId: graph.nodes.length,
                        attribute: graph.partition,
                        value: newPartition,
                    })
                }

                actions.push({
                    type: 'ADD_EDGE',
                    fromNodeId: action.attributes.connectTo,
                    toNodeId: graph.nodes.length,
                })

                if(action.attributes.onEdge !== null) {
                    actions.push({
                        type: 'ADD_EDGE',
                        fromNodeId: graph.nodes.length,
                        toNodeId: graph.nodes[action.attributes.connectTo][action.attributes.onEdge],
                    })


                    if(!action.attributes.keepEdge && !graph.partition) {
                        const basePath = graph.attributes.edges['path'][action.attributes.connectTo][action.attributes.onEdge];
                        if(action.attributes.splitPathControl !== null) {
                            const offset = (action.attributes.splitPathControl % 2)
                            actions.push({
                                type: 'SET_EDGE_ATTRIBUTE',
                                nodeId: action.attributes.connectTo,
                                edgeIndex: graph.nodes[action.attributes.connectTo].length,
                                attribute: 'path',
                                value: basePath.slice(0, action.attributes.splitPathControl - offset),
                            }, {
                                type: 'SET_EDGE_ATTRIBUTE',
                                nodeId: graph.nodes.length,
                                edgeIndex: 0,
                                attribute: 'path',
                                value: basePath.slice(action.attributes.splitPathControl + offset),
                            })
                        }

                        actions.push({
                            type: 'DESELECT_EDGE',
                            nodeId: action.attributes.connectTo,
                            edgeIndex: action.attributes.onEdge,
                        })

                        actions.push({
                            type: 'DELETE_EDGE',
                            nodeId: action.attributes.connectTo,
                            edgeIndex: action.attributes.onEdge,
                        })
                    }
                }
            }

            actions.push({
                type: 'SELECT_NODE',
                nodeId: graph.nodes.length,
                add: false,
                toggle: false,
            })

            return actions
        }
        case 'CLEAR_GRAPH':
        case 'INIT_GRAPH': {
            return [{type:'CLEAR_SELECTION'}, action]
        }
        case 'DELETE_EDGE': {
            return [{
                type: 'DESELECT_EDGE',
                nodeId: action.nodeId,
                edgeIndex: action.edgeIndex,
            }, action]
        }
        case 'CLEAR_GRAPH_EDGES': {
            return [{type:'CLEAR_SELECTION'}, action]
        }
        case 'SELECT_AREA': {
            if(action.nodes) {
                const nodeIds = graph.nodes.map((_, n) => n).filter(n => {
                    const pos = graph.attributes.nodes.position[n]
                    return action.minX < pos.x && pos.x < action.maxX &&
                        action.minY < pos.y && pos.y < action.maxY
                })

                const nodeSelection = nodeIds.map((nodeId, i) => ({
                    type: 'SELECT_NODE',
                    nodeId,
                    add: i > 0,
                    toggle: false,
                }))

                const edgeSelection = graph.nodes.flatMap((neighbours, nodeId) => {
                    const startPos = graph.attributes.nodes.position[nodeId]

                    return neighbours.map((n,edgeIndex) => {
                        const endPos = graph.attributes.nodes.position[n]


                        if(action.minX > startPos.x || startPos.x > action.maxX ||
                            action.minY > startPos.y || startPos.y > action.maxY) {
                            return null
                        }

                        if(action.minX > endPos.x || endPos.x > action.maxX ||
                            action.minY > endPos.y || endPos.y > action.maxY) {
                            return null
                        }

                        return ({
                            nodeId,
                            edgeIndex,
                        })
                    }).filter(n => n !== null).map((x, i) => ({
                        ...x,
                        type: 'SELECT_EDGE',
                        add: i > 0 || nodeSelection.length > 0,
                        toggle: false,
                    }))
                })

                if(nodeSelection.length || edgeSelection.length) {
                    return [action, ...nodeSelection, ...edgeSelection];
                } else {
                    return false
                }

            }
        }
        case 'SET_GRAPH_FLAG': {
            return [{type: 'CLEAR_SELECTION'}, action]
        }
    }


    return false
}
