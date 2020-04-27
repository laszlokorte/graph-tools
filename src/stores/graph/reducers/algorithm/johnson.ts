import heap from './utils/heap';

const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const EDGE_FORWARD = 'forward';
const EDGE_CROSS = 'cross';
const EDGE_BACK = 'back';

const run = (graph, {weightAttribute}) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    const nodes = graph.nodes.map((e) => e.map((m) => m))
    const cost = graph.attributes.edges[weightAttribute].map((a) => a.map((c) => c))

    nodes.push(nodes.map((_,i) => i))
    cost.push(nodes.map((_,i) => 0))

    const distance = Array(nodes.length).fill(null)

    bellmanFord(distance, nodes, cost)

    const adjustedCost = cost.map((edges, nodeIndex) => edges.map((cost, edgeIndex) => cost + distance[nodeIndex] - distance[nodes[nodeIndex][edgeIndex]]))

    state.edges.newWeight = adjustedCost.slice(0,graph.nodes.length)

    state.matrices.distance = nodes.map(() => nodes.map(() => Infinity))
    state.matrices.predecessor = nodes.map(() => nodes.map(() => null))

    track(state);

    for(let n=0;n<nodes.length;n++) {
        const distance = state.matrices.distance[n]
        const predecessor = state.matrices.predecessor[n]
        const color = nodes.map(() => COLOR_WHITE)
        dijkstra(distance, predecessor, color, nodes, n, adjustedCost)

        state.time += 1

        track(state);
    }

    return steps;
}



const bellmanFord = (distance, nodes, cost) => {
    for(let i=0;i<nodes.length;i++) {
        let didRelex = false;
        for(let n=0;n<nodes.length;n++) {
            for(let e=nodes[n].length - 1;e>=0;e--) {
                didRelex = relax(distance, nodes, cost, n, e) || didRelex;
            }
        }
        if(!didRelex) {
            return;
        }
    }
}

const relax = (distance, nodes, cost, nodeId, edgeIndex) => {
    const targetNode = nodes[nodeId][edgeIndex]
    const edgeCost = cost[nodeId][edgeIndex];
    const sourceCost = distance[nodeId];
    const oldDistance = distance[targetNode]
    const newDistance = sourceCost + edgeCost;
    if(oldDistance > newDistance) {
        distance[targetNode] = newDistance;
        return true;
    }

    return false;
}



const dijkstra = (distance, predecessor, color, nodes, nodeId, cost) => {
    const q = heap();
    distance[nodeId] = 0;
    color[nodeId] = COLOR_GRAY;
    q.enqueue(0, nodeId)

    while(q.size()) {
        const currentNode = q.dequeue()

        color[currentNode] = COLOR_BLACK;

        for(let i=0;i<nodes[currentNode].length;i++) {
            const neighbour = nodes[currentNode][i];
            if(color[neighbour] === COLOR_GRAY) {
                continue;
            }
            const edgeLength = cost[currentNode][i];
            const prevDistance = distance[neighbour];
            const newDistance = distance[currentNode] + edgeLength;

            if(newDistance < prevDistance) {
                distance[neighbour] = newDistance;
                predecessor[neighbour] = currentNode;
                color[neighbour] = COLOR_GRAY;
                q.enqueueOrUpdate(newDistance, neighbour)
            }
        }
    }
}

const init = (graph) => {
    return {
        nodes: {
        },
        edges: {
            newWeight: graph.nodes.map((neighbours) => neighbours.map(() => null))
        },
        time: 0,
        matrices: {
            distance: [],
            predecessor: [],
        }
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Johnson",
    parameters: {
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
        directed: true,
    },
    category: 'graph shortest path',
}
