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

    const distanceMatrix = graph.nodes.map((_,i) => graph.nodes.map((_,j) => Infinity))
    const predecessorMatrix = graph.nodes.map((_,i) => graph.nodes.map((_,j) => null))

    const step = () => {
        if(!graph.flags.directed) {
            for(let j=0;j<distanceMatrix.length;j++) {
                for(let k=0;k<j;k++) {
                    distanceMatrix[j][k] = distanceMatrix[k][j]
                    predecessorMatrix[j][k] = predecessorMatrix[k][j]
                }
            }
        }
        track(state)
    }

    state.matrices = {
        distance: distanceMatrix,
        predecessor: predecessorMatrix,
    }

    for(let i=0;i<graph.nodes.length;i++) {
        const neighbours = graph.nodes[i]
        distanceMatrix[i][i] = 0

        for(let j=0;j<neighbours.length;j++) {
            const neighbour = neighbours[j]

            predecessorMatrix[i][neighbour] = i

            distanceMatrix[i][neighbour] = Math.min(
                distanceMatrix[i][neighbour],
                graph.attributes.edges[weightAttribute][i][j]
            )
        }
    }

    track(state)


    floydWarshall(distanceMatrix, predecessorMatrix, step)

    return steps;
}

const floydWarshall = (distance, predecessor, step) => {
    for(let i=0;i<distance.length;i++) {
        const row = distance[i]
        for(let j=0;j<row.length;j++) {
            for(let k=0;k<distance.length;k++) {
                const newDistance = distance[i][k] + distance[k][j]
                if(distance[i][j] > newDistance) {
                    distance[i][j] = newDistance
                    predecessor[i][j] = predecessor[k][j]
                }
            }
        }

        step()
    }
}

const init = (graph) => {
    return {
        nodes: {
        },
        edges: {
        },
        time: 0,
        matrices: {
            distance: null,
            predecessor: null,
        },
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Floyd-Warshall",
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
