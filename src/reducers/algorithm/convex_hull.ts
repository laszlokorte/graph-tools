const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const run = (graph) => {
    const steps = [];

    const track = (s) => {
        steps.push(copy(s))
    }

    const minNode = graph.nodes.reduce((best, _, idx) => {
        if(graph.attributes.nodes.position[idx].y >
           graph.attributes.nodes.position[best].y) {
            return idx
        } else {
            return best;
        }
    }, 0)

    const posBest = graph.attributes.nodes.position[minNode]

    const sortedNodes = graph.nodes.map((_,idx) => idx).sort((a,b) => {
        if(a === minNode) return -1
        if(b === minNode) return 1

        const posA = graph.attributes.nodes.position[a]
        const posB = graph.attributes.nodes.position[b]

        return Math.atan2(posA.y - posBest.y, posA.x - posBest.x) - Math.atan2(posB.y - posBest.y, posB.x - posBest.x)
    })

    const state = init(graph, sortedNodes)

    track(state)

    const stack = [0, 1]
    const N = graph.nodes.length
    let i = 2

    state.nodes.color[sortedNodes[0]] = COLOR_BLACK
    state.nodes.color[sortedNodes[1]] = COLOR_BLACK


    while (i < N) {
        const p1 = stack[stack.length - 1]
        const p2 = stack[stack.length - 2]

        const pos1 = graph.attributes.nodes.position[sortedNodes[p1]]
        const pos2 = graph.attributes.nodes.position[sortedNodes[p2]]
        const posI = graph.attributes.nodes.position[sortedNodes[i]]

        const cw = (pos2.y - pos1.y) * (posI.x - pos2.x) -
                  (pos2.x - pos1.x) * (posI.y - pos2.y) >= 0

        if(stack.length == 2 || cw) {
            state.nodes.color[sortedNodes[i]] = COLOR_BLACK
            stack.push(i)
            i += 1
        } else {
            const no = stack.pop()
            state.nodes.color[sortedNodes[no]] = COLOR_GRAY
        }
        track(state)
    }

    return steps;
}

const init = (graph, sortedNodes) => {
    const sortLabels = []
    for(let k=0;k<sortedNodes.length;k++) {
        sortLabels[sortedNodes[k]] = k
    }

    return {
        nodes: {
            sort: sortLabels,
            color: graph.nodes.map((_,idx) => idx === sortedNodes[0] ? COLOR_BLACK : COLOR_WHITE),
        },
        edges: {},
        time: 0,
    }
}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Graham Scan (Convex Hull)",
    parameters: {
    },
    dependencies: {
        nodes: ['position'],
        edges: [],
    },
    requirements: {
        directed: false,
    },
}
