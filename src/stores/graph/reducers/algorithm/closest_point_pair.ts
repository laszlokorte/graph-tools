const run = (graph) => {
    const state = init(graph);
    const steps = [];
    const track = (s) => {
        steps.push(copy(s))
    }

    track(state);
    const positioning = graph.attributes.nodes.position

    const points = graph.nodes.map((_,i) => i)
    const sortX = points.slice()
    sortX.sort((a,b) => {
        return positioning[a].x - positioning[b].x
    })
    const sortY = points.slice()
    sortY.sort((a,b) => {
        return positioning[a].y - positioning[b].y
    })

    closestPoints(sortX, sortY, positioning)

    return steps;
}

const closestPoints = (sortX, sortY, positioning) => {
    return dcClosestPoints(sortX, sortY, positioning, positioning.length);
}

const dcClosestPoints = (sortX, sortY, positioning, length) => {
    if(length <= 3) {

    }
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
    name: "Closest Point Pair",
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
