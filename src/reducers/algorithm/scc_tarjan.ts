const run = (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    track(state);

    let currentComponent = 0;
    const stack = [];

    for(let i=0;i<graph.nodes.length;i++) {
        if(state.nodes.discovery[i] === null) {
            currentComponent = visitNode(state, graph, i, stack, currentComponent, track);
        }
    }

    state.nodes.color = state.nodes.component.map((c) => {
        return `hsl(${c*360 / currentComponent}, 100%, 50%)`
    })

    track(state)

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
            component: graph.nodes.map(() => null),
            lowpoint: graph.nodes.map(() => null),
            discovery: graph.nodes.map(() => null),
            finishing: graph.nodes.map(() => null),
            onStack: graph.nodes.map(() => false),
            color: graph.nodes.map(() => null),
        },
        edges: {
        },
        time: 0,
    }
}

const visitNode = (state, graph, nodeId, stack, currentComponent, track) => {
    state.time++;
    state.nodes.discovery[nodeId] = state.time;
    state.nodes.lowpoint[nodeId] = state.time;
    stack.push(nodeId)
    state.nodes.onStack[nodeId] = false

    track(state);

    for(let i=0;i<graph.nodes[nodeId].length;i++) {
        const neighbour = graph.nodes[nodeId][i];
        if(state.nodes.discovery[neighbour] === null) {
            currentComponent = visitNode(state, graph, neighbour, stack, currentComponent, track);
            state.nodes.lowpoint[nodeId] = Math.min(state.nodes.lowpoint[nodeId], state.nodes.lowpoint[neighbour]);
        } else if(state.nodes.discovery[neighbour] < state.nodes.discovery[nodeId]) {
            if(state.nodes.finishing[neighbour] === null || (state.nodes.finishing[neighbour] !== null && state.nodes.onStack[neighbour])) {
                state.nodes.lowpoint[nodeId] = state.nodes.discovery[neighbour];
            }
        }
    }

    if(state.nodes.lowpoint[nodeId] === state.nodes.discovery[nodeId]) {
        currentComponent += 1
        let v
        do {
            v = stack.pop()
            state.nodes.onStack[v] = false
            state.nodes.component[v] = currentComponent
        } while(v !== nodeId)
    }

    state.time++;
    state.nodes.finishing[nodeId] = state.time;
    track(state);

    return currentComponent
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "Strongly Connected Components (Tarjan)",
    parameters: {
    },
    dependencies: {
        nodes: [],
        edges: [],
    },
    requirements: {
        multiGraph: false,
        directed: true,
    },
}
