const run = (graph) => {
    return false;
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
        },
    },
    dependencies: {
        edges: ['cost'],
    },
    requirements: {
        multiGraph: false,
    },
}
