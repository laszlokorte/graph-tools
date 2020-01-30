import heap from './heap';

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

    track(state);

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map(() => COLOR_WHITE),
            distance: graph.nodes.map(() => Infinity),
        },
        edges: {
            type: graph.nodes.map((n) => n.map(() => null))
        },
        time: 0,
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "❌ Floyd-Warshall",
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
    },
}
