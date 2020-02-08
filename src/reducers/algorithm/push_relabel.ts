const run = (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    if(!isAntiSymmetric(graph)) {
        return steps;
    }

    const residual = buildResidual(graph)
    const height = residual.nodes.map(() => 0)
    const excess = residual.nodes.map(() => 0)
    const flow = residual.capacity.map((c) => c.map(() => 0))
    height[residual.source] = residual.nodes.length

    const queue = []

    // initialize pre flow
    for(let n = 0;n<residual.nodes[residual.source].length; n++) {
        const node = residual.nodes[residual.source][n]
        const c = residual.capacity[residual.source][n]

        //const flowDelta = residual.capacity[residual.source][n]
        const flowDelta = residual.capacity[node].reduce((a,b) => a+b, 0)

        const backIndex = residual.nodes[node].indexOf(residual.source)
        const prevExcess = excess[node]

        residual.capacity[residual.source][n] -= flowDelta
        residual.capacity[node][backIndex] += flowDelta

        excess[residual.source] -= flowDelta
        excess[node] += flowDelta

        if(residual.backEdge[residual.source][n]) {
            const backIndex = residual.nodes[node].indexOf(residual.source)
            flow[node][backIndex] -= flowDelta
        } else {
            flow[residual.source][n] += flowDelta
        }

        queue.push(node)
    }


    state.nodes.height = height
    state.nodes.excess = excess
    state.edges.flow = flow


    while(queue.length) {
        const node = queue[0]
        state.nodes.color[node] = 'white'

        if(node === residual.sink || excess[node] === 0) {
            queue.shift()
            track(state);
        } else {
            for(let n=0;n<residual.nodes[node].length;n++) {

                const prevExcess = push(residual, excess, flow, height, node, n)
                if(prevExcess !== null) {
                    if(prevExcess === 0) {
                        state.nodes.color[residual.nodes[node][n]] = 'gray'

                        queue.push(residual.nodes[node][n])
                    }
                    state.nodes.color[node] = 'blue'
                    track(state);

                    continue;
                }
            }


            if(relabel(residual, flow, height, node)) {
                state.nodes.color[node] = 'green'
                track(state);
            }
        }
    }


    return steps;
}

const push = (residual, excess, flow, height, nodeId, edgeIndex) => {
    if(excess[nodeId] <= 0) {
        return null
    }
    const otherNode = residual.nodes[nodeId][edgeIndex]
    if(height[nodeId] !== height[otherNode] + 1) {
        return null
    }

    if(residual.capacity[nodeId][edgeIndex] === 0) {

        return null
    }

    const flowDelta = Math.min(excess[nodeId], residual.capacity[nodeId][edgeIndex])

    const backIndex = residual.nodes[otherNode].indexOf(nodeId)
    const prevExcess = excess[otherNode]

    residual.capacity[nodeId][edgeIndex] -= flowDelta
    residual.capacity[otherNode][backIndex] += flowDelta

    excess[nodeId] -= flowDelta
    excess[otherNode] += flowDelta

    if(residual.backEdge[nodeId][edgeIndex]) {
        const backIndex = residual.nodes[otherNode].indexOf(nodeId)
        flow[otherNode][backIndex] -= flowDelta
    } else {
        flow[nodeId][edgeIndex] += flowDelta
    }

    return prevExcess
}

const relabel = (residual, flow, height, nodeId) => {
    if(residual.source === nodeId) {
        return false
    }
    if(residual.sink === nodeId) {
        return false
    }
    const canRelabel = true
    let minHeight = Infinity
    for(let e=0;e<residual.nodes[nodeId].length;e++) {
        const otherNode = residual.nodes[nodeId][e];
        const capacity = residual.capacity[nodeId][e];
        if(capacity > 0) {
            if(height[otherNode] >= height[nodeId]) {
                minHeight = Math.min(minHeight, height[otherNode])
            } else {
                return false
            }
        }
    }

    if(!isFinite(minHeight)) {
        return false
    }

    height[nodeId] = 1 + minHeight

    return true
}

const buildResidual = (graph) => {
    const nodes = graph.nodes.map((neighbours, nodeId) => neighbours.map((n) => n))
    const capacity = graph.attributes.edges.capacity.map((caps) => caps.map((c) => c))
    const backEdge = graph.attributes.edges.capacity.map((caps) => caps.map((c) => false))

    const sources = graph.nodes.map((_, nodeId) => nodeId).filter((nodeId) => graph.attributes.nodes.source[nodeId])
    const sinks = graph.nodes.map((_, nodeId) => nodeId).filter((nodeId) => graph.attributes.nodes.sink[nodeId])

    const newSource = nodes.length
    const newSink = nodes.length + 1

    nodes.push(sources)
    capacity.push(sources.map(() => Infinity))
    backEdge.push(sources.map(() => true))
    nodes.push([])
    capacity.push([])
    backEdge.push([])

    for(let s of sinks) {
        nodes[s].push(newSink)
        capacity[s].push(Infinity)
        backEdge[s].push(true)
    }

    for(let n=0;n<nodes.length;n++) {
        const neighbours = nodes[n]
        for(let m=0;m<neighbours.length;m++) {
            const neighbour = neighbours[m]

            if(nodes[neighbour].indexOf(n) < 0) {
                nodes[neighbour].push(n)
                capacity[neighbour].push(0)
                backEdge[neighbour].push(true)
            }

        }
    }

    return {
        nodes,
        capacity,
        backEdge,
        source: newSource,
        sink: newSink,
    }
}

const isAntiSymmetric = (graph) => {
    const edgeSets = graph.nodes.map((neighbours, nodeId) => {
        return new Set(neighbours)
    })

    for(let n=0;n<graph.nodes.length;n++) {
        const neighbours = graph.nodes[n]

        for(let m=0;m<neighbours.length;m++) {
            const nb = neighbours[m]

            if(edgeSets[nb].has(n)) {
                return false
            }
        }
    }

    return true
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map((_,nodeId) => {
                if(graph.attributes.nodes.source[nodeId]) {
                    if(graph.attributes.nodes.sink[nodeId]) {
                        return 'purple'
                    } else {
                        return 'green'
                    }
                } else if(graph.attributes.nodes.sink[nodeId]) {
                    return 'red'
                } else {
                    return 'white'
                }
            }),
            height: graph.nodes.map((other, idx) => 0),
            excess: graph.nodes.map((other, idx) => 0),
        },
        edges: {
            flow: graph.nodes.map((other, idx) => other.map(() => 0)),
            color: graph.nodes.map((other, idx) => other.map(() => 'GRAY'))
        },
        time: 0,
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "Maximal Flow (Push/Relabel)",
    parameters: {
    },
    dependencies: {
        nodes: [],
        edges: ['capacity','source','sink'],
    },
    requirements: {
        multiGraph: false,
        directed: true,
    },
    category: 'flow',
}
