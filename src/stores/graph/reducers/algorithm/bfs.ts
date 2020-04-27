const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const COLOR_GREEN = 'GREEN';
const COLOR_RED = 'RED';
const COLOR_BLUE = 'BLUE';

const EDGE_FORWARD = 'forward';
const EDGE_CROSS = 'cross';
const EDGE_BACK = 'back';

const run = (graph, {startNode}) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    track(state);

    if(startNode!== null) {
        bfs(state, graph, startNode, track);
    } else {
        for(let i=0;i<graph.nodes.length;i++) {
            if(state.nodes.color[i] === COLOR_WHITE) {
                bfs(state, graph, i, track);
            }
        }
    }

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map(() => COLOR_WHITE),
            discovery: graph.nodes.map(() => null),
            finishing: graph.nodes.map(() => null),
            predecessor: graph.nodes.map(() => null),
        },
        edges: {
            type: graph.nodes.map((n) => n.map(() => null)),
            color: graph.nodes.map((n) => n.map(() => null)),
        },
        time: 0,
    }
}

const bfs = (state, graph, nodeId, track) => {
    const q = [nodeId];
    while(q.length) {
        const currentNode = q.shift()
        state.time++;
        state.nodes.color[currentNode] = COLOR_GRAY;
        state.nodes.discovery[currentNode] = state.time;
        track(state);

        for(let i=0;i<graph.nodes[currentNode].length;i++) {
            const neighbour = graph.nodes[currentNode][i];
            if(state.nodes.color[neighbour] === COLOR_WHITE) {
                state.nodes.predecessor[neighbour] = currentNode;
                state.edges.type[currentNode][i] = EDGE_FORWARD;
                state.edges.color[currentNode][i] = COLOR_GREEN;
                state.nodes.color[neighbour] = COLOR_GRAY;
                state.nodes.discovery[currentNode] = state.time;
                q.push(neighbour)
            } else if(state.nodes.color[neighbour] === COLOR_GRAY) {
                state.edges.type[currentNode][i] = EDGE_BACK;
                state.edges.color[currentNode][i] = COLOR_RED;
            } else if(state.nodes.color[neighbour] === COLOR_BLACK) {
                state.edges.type[currentNode][i] = EDGE_CROSS;
                state.edges.color[currentNode][i] = COLOR_BLUE;
            }
            track(state);
        }

        state.time++;
        state.nodes.color[currentNode] = COLOR_BLACK;
        state.nodes.finishing[currentNode] = state.time;
        track(state);
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Breadth-First-Search",
    parameters: {
        startNode: {
            type: 'NODE',
            label: 'Start at',
            required: false,
        },
    },
    dependencies: {
        nodes: [],
        edges: [],
    },
    requirements: {
        multiGraph: false,
    },
    category: 'graph traversal',
}
