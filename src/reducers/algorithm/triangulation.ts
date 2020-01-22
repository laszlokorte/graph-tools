const run = (graph) => {
    const positioning = graph.attributes.nodes.position
    const steps = [];


    const track = (s) => {
        steps.push(copy(s))
    }

    const state = init(graph)

    const boxSize = positioning.reduce((a, {x,y}) => Math.max(Math.abs(x), Math.abs(y), a), 0)

    const triangles = [{
        a:{x:3*boxSize,y:0},
        b:{x:0,y:-3*boxSize},
        c:{x:-3*boxSize,y:3*boxSize},
        children: [],
    }]

    const rootTriangle = triangles[0];

    state.polygons.push([
        rootTriangle.a,
        rootTriangle.b,
        rootTriangle.c,
    ])

    track(state)

    for(let i=0;i<graph.nodes.length;i++) {
        const pos = positioning[i];

        const newTriangles = insertPoint(triangles, pos)

        state.polygons = triangles.map(({a,b,c}) => [a,b,c])
        track(state)
    }

    return steps;
}

const insertPoint = (triangles, pos) => {
    let currentTriangle = 0

    outer: while(triangles[currentTriangle].children.length) {
        for(let t=0;t<triangles[currentTriangle].children.length;t++) {
            if(pointInTriangle(pos, triangles[triangles[currentTriangle].children[t]])) {
                currentTriangle = triangles[currentTriangle].children[t];
                continue outer;
            }
        }
        break outer;
    }

    triangles.push({
        a:triangles[currentTriangle].a,
        b:triangles[currentTriangle].b,
        c:pos,
        children: [],
    })
    triangles[currentTriangle].children.push(triangles.length-1)

    triangles.push({
        a:triangles[currentTriangle].a,
        b:triangles[currentTriangle].c,
        c:pos,
        children: [],
    })
    triangles[currentTriangle].children.push(triangles.length-1)

    triangles.push({
        a:triangles[currentTriangle].b,
        b:triangles[currentTriangle].c,
        c:pos,
        children: [],
    })
    triangles[currentTriangle].children.push(triangles.length-1)

    return triangles
}

const sign = (p1, p2, p3) => {
    return (p1.x - p3.x) * (p2.y - p3.y) -
        (p2.x - p3.x) * (p1.y - p3.y)
}

const pointInTriangle = (pt, tri) => {
    const d1 = sign(pt, tri.a, tri.b)
    const d2 = sign(pt, tri.b, tri.c)
    const d3 = sign(pt, tri.c, tri.a)

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)

    return !(hasNeg && hasPos)
}

const init = (graph) => {
    return {
        nodes: {},
        edges: {},
        time: 0,
        polygons: [
            []
        ],
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Delaunay Triangulation",
    parameters: {
    },
    dependencies: {
        nodes: ['position'],
        edges: [],
    },
    requirements: {
    },
}
