const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const run = (graph) => {
    const positioning = graph.attributes.nodes.position
    const steps = [];

    const track = (s) => {
        steps.push(copy(s))
    }

    const minNode = graph.nodes.reduce((best, _, idx) => {
        if(positioning[idx].y >
           positioning[best].y) {
            return idx
        } else {
            return best;
        }
    }, 0)

    const posBest = positioning[minNode]

    const sortedNodes = graph.nodes.map((_,idx) => idx).sort((a,b) => {
        if(a === minNode) return -1
        if(b === minNode) return 1

        const posA = positioning[a]
        const posB = positioning[b]

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
        state.time++;

        const p1 = stack[stack.length - 1]
        const p2 = stack[stack.length - 2]

        const pos1 = positioning[sortedNodes[p1]]
        const pos2 = positioning[sortedNodes[p2]]
        const posI = positioning[sortedNodes[i]]

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

        state.polygons = [
            {
                points: stack.map((i) => positioning[sortedNodes[i]]),
            }
        ]

        track(state)
    }

    return steps;
}

const init = (graph, sortedNodes) => {
    const sortLabels = []
    for(let k=0; k<sortedNodes.length; k++) {
        sortLabels[sortedNodes[k]] = k
    }

    return {
        nodes: {
            polarSort: sortLabels,
            color: graph.nodes.map((_,idx) => idx === sortedNodes[0] ? COLOR_BLACK : COLOR_WHITE),
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
    name: "Graham Scan (Convex Hull)",
    parameters: {
    },
    dependencies: {
        nodes: ['position'],
        edges: [],
    },
    requirements: {
    },
    category: 'geometry',
}
