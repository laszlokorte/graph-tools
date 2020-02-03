const COLOR_WHITE = 'WHITE';
const COLOR_A = 'DarkCyan';
const COLOR_B = 'DarkMagenta';
const COLOR_ERROR = 'RED';

const run = (graph, {startNode}) => {
    const steps = [];

    const track = (s) => {
        steps.push(copy(s))
    }

    const state = init(graph)

    track(state)

    const edges = graph.nodes.map(n => new Set(n))

    graph.nodes.forEach((ns, i) => ns.forEach((o) => {
        if(o !== i) {
            edges[o].add(i)
        }
    }))

    let r = (startNode !== null) ?
        bfs(state, edges, startNode, track) : true


    for(let i=0;r && i<graph.nodes.length;i++) {
        if(state.nodes.color[i] === COLOR_WHITE) {
            r = bfs(state, edges, i, track)
        }
    }

    return steps;
}


const bfs = (state, edges, nodeId, track) => {
    const q = [nodeId];
    state.nodes.color[nodeId] = COLOR_A;

    state.time++;
    track(state);

    while(q.length) {
        const currentNode = q.shift()
        for(let neighbour of edges[currentNode]) {
            if(state.nodes.color[neighbour] === COLOR_WHITE) {
                state.nodes.color[neighbour] = (state.nodes.color[currentNode] === COLOR_A) ? COLOR_B : COLOR_A;
                q.push(neighbour)

                state.time++;
                track(state);
            } else if(state.nodes.color[neighbour] === state.nodes.color[currentNode]) {
                state.nodes.color[currentNode] = COLOR_ERROR;

                state.time++;
                track(state);

                return false;
            }
        }
    }

    return true;
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map((_,idx) => COLOR_WHITE),
        },
        edges: {},
        time: 0,
        polygons: [],
    }
}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Two Color",
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
    },
    category: 'graph topology',
}
