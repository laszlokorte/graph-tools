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

    track(state);

    return steps;
}

const buildResidual = (graph) => {
    const nodes = graph.nodes.map((neighbours, nodeId) => neighbours.map((n) => n))
    const capacity = graph.attributes.edges.capacity.map((caps) => caps.map((c) => c))

    const sources = graph.nodes.map((_, nodeId) => nodeId).filter((nodeId) => graph.attributes.nodes.source[nodeId])
    const sinks = graph.nodes.map((_, nodeId) => nodeId).filter((nodeId) => graph.attributes.nodes.sink[nodeId])

    const newSource = nodes.length
    const newSink = nodes.length + 1

    nodes.push(sources)
    capacity.push(sources.map(() => Infinity))
    nodes.push([])
    capacity.push([])

    for(let s of sinks) {
        nodes[s].push(newSink)
        capacity[s].push(Infinity)
    }

    for(let n=0;n<nodes.length;n++) {
        const neighbours = nodes[n]
        for(let m=0;m<neighbours.length;m++) {
            const neighbour = neighbours[m]

            nodes[m].push(n)
            capacity[m].push(0)
        }
    }

    return {
        nodes,
        capacity,
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
            })
        },
        edges: {
            flow: graph.nodes.map((other, idx) => other.map(() => 0))
        },
        time: 0,
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "Maximal Flow",
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
}
