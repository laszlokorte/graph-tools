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
    name: "❌ Maximal Matching",
    parameters: {
    },
    dependencies: {
        nodes: [],
        edges: ['value'],
    },
    requirements: {
        multiGraph: false,
        directed: true,
    },
}
