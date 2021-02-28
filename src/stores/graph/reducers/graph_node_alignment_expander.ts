export default (next) => (state, action) => {
    const expandedActions = expandAction(state, action)

    if(expandedActions === false) {
        return next(state, action)
    }

    return expandedActions.reduce((currentState, a) => {
        if(state && state !== currentState && currentState.error) {
            return {...state, error: currentState.error}
        }

        const newState = next(currentState, a)

        if(newState.error) {
            return {...state, error: newState.error}
        }

        return newState
    }, state)
}

const expandAction = (state, action) => {
    if(!state) {
        return false
    }

    switch(action.type) {
        case 'ALIGN_NODES': {
            const nodeIds = action.nodeIds.sort((a,b) => state.graph.attributes.nodes.position[a][action.axis] - state.graph.attributes.nodes.position[b][action.axis])

            if(nodeIds.length < 2) {
                return false
            }

            position = state.graph.attributes.nodes.position
            const projected = nodeIds.map((p) => state.graph.attributes.nodes.position[p][action.axis]);
            const min = Math.min(...projected, Infinity)
            const max = Math.max(...projected, -Infinity)

            const center = (max+min)/2
            const spread = action.spread * (max-min) / Math.max(projected.length-1, 1)
            const aligned = (1-action.alignment) * min + action.alignment * max



            return [
                action,
                ...nodeIds.map((nodeId, i) => ({
                    type: 'SET_NODE_ATTRIBUTE',
                    nodeId,
                    attribute: 'position',
                    value: {...position[nodeId], [action.axis]: aligned + i * spread},
                }))
            ]
        }
        case 'ALIGN_NODES_CIRCLE': {
            const positionAttribute = 'position';
            const pathAttribute = 'path';

            const count = action.nodes.length;

            if(count < 2) {
                return [
                    action
                ]
            }

            const sum = action.nodes.reduce(({cx,cy}, nodeId) => ({
                cx: cx + state.graph.attributes.nodes[positionAttribute][nodeId].x,
                cy: cy + state.graph.attributes.nodes[positionAttribute][nodeId].y,
            }), {cx: 0,cy: 0})

            const center = {
                x: sum.cx / count,
                y: sum.cy / count,
            }

            const radius = Math.sqrt(action.nodes.reduce((d, nodeId) => {
                const x = state.graph.attributes.nodes[positionAttribute][nodeId].x
                const y = state.graph.attributes.nodes[positionAttribute][nodeId].y
                return d + (x-center.x)*(x-center.x)+(y-center.y)*(y-center.y)
            }, 0) / count)

            const sortedNodes = action.nodes.sort((a,b) => {
                return Math.atan2(
                    state.graph.attributes.nodes[positionAttribute][b].y - center.y,
                    state.graph.attributes.nodes[positionAttribute][b].x - center.x
                ) - Math.atan2(
                    state.graph.attributes.nodes[positionAttribute][a].y - center.y,
                    state.graph.attributes.nodes[positionAttribute][a].x - center.x
                )
            })

            const initialAngle = sortedNodes.length ?
                Math.atan2(
                    state.graph.attributes.nodes[positionAttribute][sortedNodes[0]].y - center.y,
                    state.graph.attributes.nodes[positionAttribute][sortedNodes[0]].x - center.x
                ) - Math.PI/2
                : Math.PI/2

            return [
                action,
                ...sortedNodes.map((nodeId, i) => ({
                    type: 'SET_NODE_ATTRIBUTE',
                    nodeId,
                    attribute: 'position',
                    value: {
                        x: center.x + radius * Math.sin(2*Math.PI * i / count - initialAngle),
                        y: center.y + radius * Math.cos(2*Math.PI * i / count - initialAngle),
                    }
                }))
            ]

        }
    }

    return false
}
