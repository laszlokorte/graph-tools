import heap from './heap';

const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const EDGE_FORWARD = 'forward';
const EDGE_CROSS = 'cross';
const EDGE_BACK = 'back';

export default (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    track(state);
    for(let i=0;i<graph.nodes.length;i++) {
        if(state.nodes.distance[i] === Infinity) {
            bfs(state, graph, i, track);
        }
    }

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map(() => COLOR_WHITE),
            predecessor: graph.nodes.map(() => null),
            distance: graph.nodes.map(() => Infinity),
        },
        edges: {
            type: graph.nodes.map((n) => n.map(() => null))
        },
        time: 0,
    }
}

const bfs = (state, graph, nodeId, track) => {
    const q = heap();
    state.nodes.distance[nodeId] = 0;
    state.nodes.color[nodeId] = COLOR_GRAY;
    state.time++;
    q.enqueue(0, nodeId)
    track(state);

    while(q.size()) {
        const currentNode = q.dequeue()

        state.time++;
        state.nodes.color[currentNode] = COLOR_BLACK;
        track(state);

        for(let i=0;i<graph.nodes[currentNode].length;i++) {
            const neighbour = graph.nodes[currentNode][i];
            if(state.nodes.color[neighbour] === COLOR_GRAY) {
                continue;
            }
            const edgeLength = graph.attributes.edges.cost[currentNode][i];
            const prevDistance = state.nodes.distance[neighbour];
            const newDistance = state.nodes.distance[currentNode] + edgeLength;

            if(newDistance < prevDistance) {
                state.nodes.distance[neighbour] = newDistance;
                state.nodes.predecessor[neighbour] = currentNode;
                state.nodes.color[neighbour] = COLOR_GRAY;
                q.enqueueOrUpdate(newDistance, neighbour)
                track(state);
            }
        }
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}
