const run = (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    track(state);

    const stack = [];

    const nodes = makeSymmetric(graph.nodes)

    for(let i=0;i<nodes.length;i++) {
        if(state.nodes.discovery[i] === 0) {
            visitNode(state, nodes, i, null, stack, track);
        }
    }

    console.log(state.edges.component)

    state.edges.color = state.edges.component.map((e) =>
        e.map((c) => `hsl(${c*360 / state.currentComponent}, 100%, 50%)`)
    )

    track(state)

    return steps;
}

const makeSymmetric = (nodes) => {
    const newNodes = nodes.map((n) => n.map((m) => m))

    for(let a=0;a<nodes.length;a++) {
        const neighbours = nodes[a]
        for(let b=0;b<neighbours.length;b++) {
            const neighbour = neighbours[b]
            newNodes[neighbour].push(a)
        }
    }

    return newNodes
}

const init = (graph) => {
    return {
        nodes: {
            lowpoint: graph.nodes.map(() => 0),
            discovery: graph.nodes.map(() => 0),
            color: graph.nodes.map(() => 'WHITE'),
        },
        edges: {
            color: graph.nodes.map((n) => n.map(() => null)),
            component: graph.nodes.map((n) => n.map(() => 0)),
        },
        time: 0,
        currentComponent: 1,
    }
}

const visitNode = (state, nodes, nodeId, parent, stack, track) => {
    state.time++;
    state.nodes.discovery[nodeId] = state.time;
    state.nodes.lowpoint[nodeId] = state.time;
    let numberOfComponents = 0;

    track(state);

    for(let i=0;i<nodes[nodeId].length;i++) {
        const neighbour = nodes[nodeId][i];
        const owner = nodeId < neighbour ? nodeId : neighbour
        const ownerIndex = nodeId < neighbour ? i : nodes[neighbour].indexOf(nodeId)

        if(state.nodes.discovery[neighbour] === 0) {
           stack.push({node: owner, edgeIndex: ownerIndex})
           visitNode(state, nodes, neighbour, nodeId, stack, track)

           state.nodes.lowpoint[nodeId] = Math.min(
               state.nodes.lowpoint[nodeId],
               state.nodes.lowpoint[neighbour]
           );

           if(state.nodes.lowpoint[neighbour] >= state.nodes.discovery[nodeId]) {
               let e
               do {
                   e = stack.pop()
                   if(e) {
                       state.edges.component[e.node][e.edgeIndex] = state.currentComponent
                   }
               } while(e && !(e.node === owner && e.index === ownerIndex))
               state.currentComponent += 1
               numberOfComponents += 1

               track(state);
           }
        } else if(nodeId !== parent && state.nodes.discovery[neighbour] < state.nodes.discovery[nodeId]) {
           stack.push({node: owner, edgeIndex: ownerIndex})

           state.nodes.lowpoint[nodeId] = Math.min(
               state.nodes.lowpoint[nodeId],
               state.nodes.discovery[neighbour]
           );
        }
    }

    if(numberOfComponents > 1 || (numberOfComponents > 0 && parent !== null)) {
       state.nodes.color[nodeId] = 'BLACK'
    }

    track(state);
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "Bi-Connected-Components",
    parameters: {
    },
    dependencies: {
        nodes: [],
        edges: [],
    },
    requirements: {
        multiGraph: false,
        directed: false,
    },
}
