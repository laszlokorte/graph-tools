
import select from './utils/select'

const run = (graph, {startNode, weightAttribute}) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    const snap = () => {
        track(state);
    }

    const positioning = graph.attributes.nodes.position;
    const dimensions = ['x','y']

    const box = dimensions.map(d => ({
        min: Math.min(...positioning.map(p => p[d])) - 100,
        max: Math.max(...positioning.map(p => p[d])) + 100,
    }))

    const kd = buildKDTree(positioning, dimensions, 0)

    drawKD(kd, dimensions, box, 0, state.polygons, snap)


    return steps;
}

const buildKDTree = (points, dimensions, depth) => {
    if(points.length === 0) {
        return null
    } else if(points.length === 1) {
        return {
            left: null,
            right: null,
            data: points[0]
        }
    }
    const di = depth % dimensions.length
    const dim = dimensions[di]
    const places = points.map((p) => p[dim])
    const medianPos = select(places, Math.floor(points.length / 2), 0, points.length - 1)
    const median = places[medianPos]

    if(places.length === 2) {
        if(places[0] <= places[1]) {
            return {
                left: buildKDTree([points[0]], dimensions, depth + 1),
                right: buildKDTree([points[1]], dimensions, depth + 1),
                position: median,
            }
        } else {
            return {
                left: buildKDTree([points[1]], dimensions, depth + 1),
                right: buildKDTree([points[0]], dimensions, depth + 1),
                position: median,
            }
        }
    }


    const p1 = points.filter((p) => p[dim] <= median)
    const p2 = points.filter((p) => p[dim] > median)

    return {
        left: buildKDTree(p1, dimensions, depth + 1),
        right: buildKDTree(p2, dimensions, depth + 1),
        position: median,
    }
}

const drawKD = (kd, dimensions, box, depth, result, snap) => {
    if(!kd || !kd.hasOwnProperty('position')) {
        return
    }
    const di = depth%dimensions.length;
    const d = dimensions[di]
    const dd = dimensions[(depth+1)%dimensions.length]

    const a = kd.position
    const b = box[(depth + 1)%dimensions.length]

    const poly = {
        fill: 'purple',
        stroke: 'none',
        points: [
            {[d]: a, [dd]: b.min},
            {[d]: a, [dd]: b.max},
            {[d]: a+5, [dd]: b.max},
            {[d]: a+5, [dd]: b.min},
        ]
    }

    result.push(poly)
    snap()

    drawKD(kd.left, dimensions, box.map((keep,i) => i === di ? {
        min: box[di].min,
        max: a,
    } : keep), depth + 1, result, snap)

    drawKD(kd.right, dimensions, box.map((keep,i) => i === di ? {
        min: a,
        max: box[di].max,
    } : keep), depth + 1, result, snap)
}

const init = (graph) => {
    return {
        nodes: {
        },
        edges: {
        },
        time: 0,
        polygons: [],
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}


export default {
    run,
    name: "KD Tree",
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
