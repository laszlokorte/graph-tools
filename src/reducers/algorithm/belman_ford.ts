
const run = (graph, {startNode, weightAttribute}) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    state.nodes.predecessor[startNode] = startNode;
    state.nodes.distance[startNode] = 0;

    track(state);

    bellmanFord(state, graph, weightAttribute, track);

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
            predecessor: graph.nodes.map(() => null),
            distance: graph.nodes.map(() => Infinity),
        },
        edges: {
        },
        time: 0,
    }
}

const bellmanFord = (state, graph, weightAttr, track) => {
    for(let i=0;i<graph.nodes.length;i++) {
        let didRelex = false;
        for(let n=0;n<graph.nodes.length;n++) {
            for(let e=graph.nodes[n].length - 1;e>=0;e--) {
                didRelex = relax(state, graph, weightAttr, n, e) || didRelex;
            }
            track(state)
        }
        if(!didRelex) {
            return;
        }
    }
}

const relax = (state, graph, weightAttr, nodeId, edgeIndex) => {
    const targetNode = graph.nodes[nodeId][edgeIndex]
    const edgeCost = graph.attributes.edges[weightAttr][nodeId][edgeIndex];
    const sourceCost = state.nodes.distance[nodeId];
    const oldDistance = state.nodes.distance[targetNode]
    const newDistance = sourceCost + edgeCost;
    if(oldDistance > newDistance) {
        state.nodes.distance[targetNode] = newDistance;
        state.nodes.predecessor[targetNode] = nodeId;
        return true;
    }

    return false;
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "Belmann-Ford",
    parameters: {
        startNode: {
            type: 'NODE',
            label: 'Start at',
            required: true,
        },
        weightAttribute: {
            type: 'EDGE_ATTRIBUTE',
            label: 'Use for cost',
            required: true,
            typeRequirement: ['numeric'],
        },
    },
    dependencies: {
        nodes: [],
        edges: [],
    },
    requirements: {
        multiGraph: false,
    },
}
