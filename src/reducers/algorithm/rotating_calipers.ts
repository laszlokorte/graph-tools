const COLOR_WHITE = 'WHITE';
const COLOR_GRAY = 'GRAY';
const COLOR_BLACK = 'BLACK';

const run = (graph) => {
    const positioning = graph.attributes.nodes.position
    const steps = [];

    const track = (s) => {
        steps.push(copy(s))
    }

    const hull = convexHull(graph.nodes, positioning)

    const state = init(graph)


    state.polygons = [
        {
            points: hull.map((i) => positioning[i]),
        }
    ]

    const pairs = rotate(positioning, hull)

    for(let [a,p1,p2] of pairs) {
        state.lines = [
            {
                x: positioning[hull[p1]].x,
                y: positioning[hull[p1]].y,
                dx: Math.cos(a),
                dy: Math.sin(a)
            },
            {
                x: positioning[hull[p2]].x,
                y: positioning[hull[p2]].y,
                dx: Math.cos(a),
                dy: Math.sin(a)
            },
        ]
        track(state)
    }

    return steps;
}

const rotate = (positioning, hull) => {
    const m = hull.length;
    const result = [];
    let i = 0;
    let j = 1;

    while (angle(hull, positioning, i, j) < Math.PI) {
        j++
    }
    result.push([0, i,j])

    while (j % m !== 0) {
        let a = 2*Math.PI - angle(hull, positioning, i, j) // clockwise angle
        if(a === Math.PI) {
            result.push([0,(i+1)%m, j%m])
            result.push([0,i%m, (j+1)%m])
            result.push([0,(i+1)%m, (j+1)%m])
            i++
            j++
        } else if(a < Math.PI) {
            result.push([0,(i+1)%m, j%m])
            i++
        } else {
            result.push([0,i%m, (j+1)%m])
            j++
        }
    }

    return result;
}

const angle = (hull, positioning, i, j) => {
    const i1 = hull[(i + 1) % hull.length]
    const i0 = hull[i % hull.length]
    const j1 = hull[(j + 1) % hull.length]
    const j0 = hull[j % hull.length]

    const dx = positioning[i1].x - positioning[i0].x
    const dy = -positioning[i1].y + positioning[i0].y

    const dx2 = positioning[j1].x - positioning[j0].x
    const dy2 = -positioning[j1].y + positioning[j0].y

    const dot = dx * dx2 + dy * dy2
    const det = dx*dy2 - dy*dx2

    return Math.atan2(-det, -dot) + Math.PI
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map((_,idx) => COLOR_WHITE),
        },
        edges: {},
        time: 0,
        polygons: [],
        lines: [],
    }
}

const convexHull = (nodes, positioning) => {
    const minNode = nodes.reduce((best, _, idx) => {
        if(positioning[idx].y >
           positioning[best].y) {
            return idx
        } else {
            return best;
        }
    }, 0)

    const posBest = positioning[minNode]

    const sortedNodes = nodes.map((_,idx) => idx).sort((a,b) => {
        if(a === minNode) return -1
        if(b === minNode) return 1

        const posA = positioning[a]
        const posB = positioning[b]

        return Math.atan2(posB.y - posBest.y, posB.x - posBest.x) - Math.atan2(posA.y - posBest.y, posA.x - posBest.x)
    })

    const stack = [0, 1]
    const N = nodes.length
    let i = 2

    while (i < N) {
        const p1 = stack[stack.length - 1]
        const p2 = stack[stack.length - 2]

        const pos1 = positioning[sortedNodes[p1]]
        const pos2 = positioning[sortedNodes[p2]]
        const posI = positioning[sortedNodes[i]]

        const cw = (pos2.y - pos1.y) * (posI.x - pos2.x) -
                  (pos2.x - pos1.x) * (posI.y - pos2.y) < 0

        if(stack.length == 2 || cw) {
            stack.push(i)
            i += 1
        } else {
            const no = stack.pop()
        }
    }

    return stack.map((i) => sortedNodes[i])
}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Rotating Calipers",
    parameters: {
    },
    dependencies: {
        nodes: ['position'],
        edges: [],
    },
    requirements: {
    },
}
