const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

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
    console.log(startNode)

    if(startNode !== null) {
        visitNode(state, graph, startNode, track);
    } else {
        for(let i=0;i<graph.nodes.length;i++) {
            if(state.nodes.color[i] === COLOR_WHITE) {
                visitNode(state, graph, i, track);
            }
        }
    }

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map(() => COLOR_WHITE),
            predecessor: graph.nodes.map(() => null),
            discovery: graph.nodes.map(() => null),
            finishing: graph.nodes.map(() => null),
        },
        edges: {
            type: graph.nodes.map((n) => n.map(() => null))
        },
        time: 0,
    }
}

const visitNode = (state, graph, nodeId, track) => {
    state.time++;
    state.nodes.color[nodeId] = COLOR_GRAY;
    state.nodes.discovery[nodeId] = state.time;
    track(state);

    for(let i=0;i<graph.nodes[nodeId].length;i++) {
        const neighbour = graph.nodes[nodeId][i];
        if(state.nodes.color[neighbour] === COLOR_WHITE) {
            state.nodes.predecessor[neighbour] = nodeId;
            state.edges.type[nodeId][i] = EDGE_FORWARD;
            visitNode(state, graph, neighbour, track);
        } else if(state.nodes.color[neighbour] === COLOR_GRAY) {
            state.edges.type[nodeId][i] = EDGE_BACK;
            track(state);
        } else if(state.nodes.color[neighbour] === COLOR_BLACK) {
            state.edges.type[nodeId][i] = EDGE_CROSS;
            track(state);
        }
    }

    state.time++;
    state.nodes.color[nodeId] = COLOR_BLACK;
    state.nodes.finishing[nodeId] = state.time;
    track(state);
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "Depth-First-Search",
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
}
