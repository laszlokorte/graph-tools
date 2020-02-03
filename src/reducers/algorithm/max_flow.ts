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

    let limit = 10

    track(state);

    while(limit--) {
        const shortestAugmentingPath = bfs(
            residual.nodes,
            residual.capacity,
            residual.source,
            residual.sink
        )

        if(shortestAugmentingPath.indexPath.length === 0) {
            break;
        }

        {
            let node = residual.source

            for(let p=0;p<shortestAugmentingPath.indexPath.length;p++) {
                const pathIndex = shortestAugmentingPath.indexPath[p]

                if(node < graph.nodes.length && pathIndex < graph.nodes[node].length) {
                    if(residual.backEdge[node][pathIndex]) {
                        const backNode = graph.nodes[node][pathIndex]
                        const backIndex = graph.nodes[backNode].indexOf(node)
                        state.edges.color[backNode][backIndex] = 'cyan'
                    } else {
                        state.edges.color[node][pathIndex] = 'cyan'
                    }
                }

                node = residual.nodes[node][pathIndex]
            }

            track(state);
        }

        {

            let node = residual.source
            const flowDelta = shortestAugmentingPath.augmentation

            for(let p=0;p<shortestAugmentingPath.indexPath.length;p++) {
                const pathIndex = shortestAugmentingPath.indexPath[p]

                {
                    const backNode = residual.nodes[node][pathIndex]
                    const backIndex = residual.nodes[backNode].indexOf(node)
                    residual.capacity[node][pathIndex] -= flowDelta
                    residual.capacity[backNode][backIndex] += flowDelta
                }

                if(node < graph.nodes.length && pathIndex < graph.nodes[node].length) {
                    if(residual.backEdge[node][pathIndex]) {
                        const backNode = graph.nodes[node][pathIndex]
                        const backIndex = graph.nodes[backNode].indexOf(node)
                        state.edges.flow[backNode][backIndex] -= flowDelta
                    } else {
                        state.edges.flow[node][pathIndex] += flowDelta
                    }
                }

                node = residual.nodes[node][pathIndex]
            }

            track(state);

            for(let a = 0;a<state.edges.color.length;a++) {
                for(let b=0;b<state.edges.color[a].length;b++) {
                    state.edges.color[a][b] = 'GRAY'
                }
            }
        }
    }

    track(state);

    return steps;
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

            nodes[m].push(n)
            capacity[m].push(0)
            backEdge[m].push(true)
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


const bfs = (nodes, capacity, startNode, target) => {
    const q = [startNode];
    const parent = Array(nodes.length).fill(null)
    while(q.length) {
        const currentNode = q.shift()
        for(let i=0;i<nodes[currentNode].length;i++) {
            const neighbour = nodes[currentNode][i];
            if(parent[neighbour] === null && capacity[currentNode][i] > 0) {
                parent[neighbour] = currentNode

                if(neighbour === target) {
                    break
                }

                q.push(neighbour)
            }
        }
    }

    const indexPath = []
    let to = target
    let augmentation = Infinity
    while(parent[to] !== null) {
        const pathIndex = nodes[parent[to]].indexOf(to)
        augmentation = Math.min(
            augmentation,
            capacity[parent[to]][pathIndex]
        )
        indexPath.push(pathIndex)
        to = parent[to]
    }

    return {
        indexPath: indexPath.reverse(),
        augmentation,
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
            })
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
    name: "Maximal Flow (Edmonds-Karp)",
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
