const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const EDGE_FORWARD = 'forward';
const EDGE_CROSS = 'cross';
const EDGE_BACK = 'back';


const run = (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    track(state);

    return; ///////////// TODO

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
        },
        edges: {
        },
        time: 0,
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "❌ Push Relabel",
    parameters: {
    },
    dependencies: {
        nodes: [],
        edges: ['capacity'],
    },
    requirements: {
        multiGraph: false,
        directed: true,
    },
    category: 'flow',
}
