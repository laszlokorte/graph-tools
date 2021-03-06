const run = (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }
    const restoreTracked = (goback = 1) => {
        return copy(steps[steps.length - 1 - goback])
    }

    if(!isAntiSymmetric(graph)) {
        return steps;
    }

    const residual = buildResidual(graph)

    let limit = 10

    track(state);

    while(limit--) {
        const shortestAugmentingPaths = bfs(
            residual.nodes,
            residual.capacity,
            residual.source,
            residual.sink
        )

        if(shortestAugmentingPaths.length === 0) {
            break;
        }

        {
            for(let s=0;s<shortestAugmentingPaths.length;s++) {
                const shortestAugmentingPath = shortestAugmentingPaths[s]


                let node = residual.source

                for(let p=0;p<shortestAugmentingPath.indexPath.length;p++) {
                    const pathIndex = shortestAugmentingPath.indexPath[p]

                    if(residual.backEdge[node][pathIndex]) {
                        const backNode = residual.nodes[node][pathIndex]
                        const backIndex = residual.nodes[backNode].indexOf(node)
                        if(backNode < graph.nodes.length && backIndex < graph.nodes[backNode].length) {
                            state.edges.color[backNode][backIndex] = 'cyan'
                        }
                    } else {
                        if(node < graph.nodes.length && pathIndex < graph.nodes[node].length) {
                            state.edges.color[node][pathIndex] = 'cyan'
                        }
                    }


                    node = residual.nodes[node][pathIndex]
                }

            }
            track(state);
        }


        {
            const edgeColors = copy(state.edges.color)

            for(let s=0;s<shortestAugmentingPaths.length;s++) {
                state.edges.color = copy(edgeColors)

                const shortestAugmentingPath = shortestAugmentingPaths[s]

                let flowDelta = shortestAugmentingPath.maxCapacity
                {
                    let node = residual.source
                    for(let p=0;p<shortestAugmentingPath.indexPath.length;p++) {
                        const pathIndex = shortestAugmentingPath.indexPath[p]

                        if(residual.capacity[node][pathIndex] < flowDelta) {
                            flowDelta = residual.capacity[node][pathIndex]
                        }
                        node = residual.nodes[node][pathIndex]
                    }

                    if(flowDelta <= 0) {
                        continue;
                    }
                }

                let node = residual.source

                for(let p=0;p<shortestAugmentingPath.indexPath.length;p++) {
                    const pathIndex = shortestAugmentingPath.indexPath[p]

                    {
                        const backNode = residual.nodes[node][pathIndex]
                        const backIndex = residual.nodes[backNode].indexOf(node)

                        if(backNode < graph.nodes.length && backIndex < graph.nodes[backNode].length) {
                            state.edges.color[backNode][backIndex] = 'RED'
                            state.edges.flow[backNode][backIndex] -= flowDelta
                        }
                        if(node < graph.nodes.length && pathIndex < graph.nodes[node].length) {
                            state.edges.color[node][pathIndex] = 'GREEN'
                            state.edges.flow[node][pathIndex] += flowDelta
                        }

                        residual.capacity[node][pathIndex] -= flowDelta
                        residual.capacity[backNode][backIndex] += flowDelta
                    }

                    node = residual.nodes[node][pathIndex]
                }

                track(state);
            }


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

    let neighboursLengths = nodes.map((neighbours) => neighbours.length)
    for(let n=0;n<nodes.length;n++) {
        const neighbours = nodes[n]
        const neighbourLength = neighboursLengths[n]
        for(let m=0;m<neighbourLength;m++) {
            const neighbour = neighbours[m]

            nodes[neighbour].push(n)
            capacity[neighbour].push(0)
            backEdge[neighbour].push(true)
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
    const parents = Array(nodes.length).fill(null).map(() => new Set())
    const distances = Array(nodes.length).fill(null)
    distances[startNode] = 0
    while(q.length) {
        const currentNode = q.shift()
        for(let i=0;i<nodes[currentNode].length;i++) {
            const neighbour = nodes[currentNode][i];
            if((distances[neighbour] === null || distances[neighbour] === distances[currentNode] + 1) && capacity[currentNode][i] > 0) {
                parents[neighbour].add(currentNode)
                distances[neighbour] = distances[currentNode] + 1

                if(neighbour === target) {
                    break
                }

                q.push(neighbour)
            }
        }
    }

    parents[startNode].clear()

    const allPaths = reconstructPaths(startNode, target, parents, capacity, nodes, Infinity)


    return allPaths
}

const reconstructPaths = (startNode, to, parents, capacity, nodes, maxCapacity) => {
    const indexPaths = []

    for(let p of parents[to]) {
        const pathIndex = nodes[p].indexOf(to)
        const newMaxCapacity = Math.min(
            maxCapacity,
            capacity[p][pathIndex]
        )


        if(startNode === p) {
            indexPaths.push({
                indexPath: [pathIndex],
                maxCapacity: newMaxCapacity,
            })
        } else {
            const subPaths = reconstructPaths(startNode, p, parents, capacity, nodes, newMaxCapacity)

            for(let s = 0; s<subPaths.length; s++) {
                indexPaths.push({
                    indexPath: [...subPaths[s].indexPath, pathIndex],
                    maxCapacity: subPaths[s].maxCapacity,
                })
            }
        }

    }

    return indexPaths;
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
    name: "Maximal Flow (Dinic)",
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
