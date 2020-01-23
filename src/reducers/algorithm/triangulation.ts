const run = (graph) => {
    const positioning = graph.attributes.nodes.position
    const steps = [];


    const track = (s) => {
        steps.push(copy(s))
    }

    const state = init(graph)

    const boxSize = positioning.reduce((a, {x,y}) => Math.max(Math.abs(x), Math.abs(y), a), 0)

    const geometry = {
        points: [
            {x:3*boxSize,y:0},
            {x:0,y:-3*boxSize},
            {x:-3*boxSize,y:3*boxSize},
        ],
        triangles: [
            {
                a: 0, b: 1, c: 2,
                children: [],
            }
        ]
    }

    state.polygons.push([
        geometry.points[geometry.triangles[0].a],
        geometry.points[geometry.triangles[0].b],
        geometry.points[geometry.triangles[0].c],
    ])

    track(state)

    const step = () => {
        state.polygons = geometry.triangles.
            filter(({children}) => children.length === 0).
            map(({a,b,c}) => [
                geometry.points[a],
                geometry.points[b],
                geometry.points[c]
            ])

        track(state)
    }

    for(let i=0;i<graph.nodes.length;i++) {
        state.time += 1
        const pos = positioning[i];

        const newTriangles = insertPoint(geometry, pos, step)
    }

    state.polygons = geometry.triangles.
        filter(({children}) => children.length === 0).
        filter(({a,b,c}) => a>=3 && b>=3 && c>=3).
        map(({a,b,c}) => [
            geometry.points[a],
            geometry.points[b],
            geometry.points[c]
        ])

    track(state)

    return steps;
}

const insertPoint = (geometry, pos, step) => {
    let currentTriangle = 0

    outer: while(geometry.triangles[currentTriangle].children.length) {
        for(let t=0;t<geometry.triangles[currentTriangle].children.length;t++) {
            const ps = geometry.triangles[geometry.triangles[currentTriangle].children[t]]

            if(pointInTriangle(pos, geometry.points[ps.a], geometry.points[ps.b], geometry.points[ps.c])) {
                currentTriangle = geometry.triangles[currentTriangle].children[t];
                continue outer;
            }
        }
        break outer;
    }

    geometry.points.push(pos)
    const newPointIdx = geometry.points.length - 1

    geometry.triangles.push({
        a:geometry.triangles[currentTriangle].a,
        b:geometry.triangles[currentTriangle].b,
        c:newPointIdx,
        children: [],
    })
    const t1 = geometry.triangles.length-1

    geometry.triangles[currentTriangle].children.push(t1)

    geometry.triangles.push({
        a:geometry.triangles[currentTriangle].a,
        b:geometry.triangles[currentTriangle].c,
        c:newPointIdx,
        children: [],
    })
    const t2 = geometry.triangles.length-1

    geometry.triangles[currentTriangle].children.push(t2)

    geometry.triangles.push({
        a:geometry.triangles[currentTriangle].b,
        b:geometry.triangles[currentTriangle].c,
        c:newPointIdx,
        children: [],
    })
    const t3 = geometry.triangles.length-1

    geometry.triangles[currentTriangle].children.push(t3)

    step()

    legalizEdge(newPointIdx, geometry.triangles[currentTriangle].a, geometry.triangles[currentTriangle].b, geometry, t1, step)
    legalizEdge(newPointIdx, geometry.triangles[currentTriangle].a, geometry.triangles[currentTriangle].c, geometry, t2, step)
    legalizEdge(newPointIdx, geometry.triangles[currentTriangle].b, geometry.triangles[currentTriangle].c, geometry, t3, step)

    return geometry
}

const legalizEdge = (pr, pi, pj, geometry, currentTriangle, step) => {
    const nbTri = geometry.triangles.
        findIndex((t, i) => {
            return i !== currentTriangle &&
                t.children.length === 0 &&
                (t.a === pi || t.b === pi || t.c === pi) &&
                (t.a === pj || t.b === pj || t.c === pj) &&
                (t.a !== pr && t.b !== pr && t.c !== pr)
        })

    if(nbTri < 0) {
        return
    }

    const pk = [geometry.triangles[nbTri].a, geometry.triangles[nbTri].b, geometry.triangles[nbTri].c].
        find((p) => p!==pi && p!==pj)

    if(pi >= 3 && pk >= 3 && pj >= 3) {

    } if(pi < 3 && pk >= 3 && pj >= 3) {
        // pi = pk
        // pj = pr
    } else if(pj < 3 && pk >= 3 && pi >= 3) {
        // pi = pk
        // pj = pr
    } else if(pk < 3 && pj >= 3 && pi >= 3) {
        return
    } else if(pi < 3 && pk < 3 && pj >= 3) {

    } else if(pj < 3 && pk < 3 && pi >= 3) {

    } else if (pi < 3 && pj < 3) {
        return
    }

    if(isIllegal(geometry.points[pi],geometry.points[pj],geometry.points[pk],geometry.points[pr])) {
        geometry.triangles.push({
            a:pr,
            b:pk,
            c:pj,
            children: [],
        })
        const t1 = geometry.triangles.length-1
        geometry.triangles.push({
            a:pr,
            b:pk,
            c:pi,
            children: [],
        })
        const t2 = geometry.triangles.length-1

        geometry.triangles[currentTriangle].children.push(t1)
        geometry.triangles[currentTriangle].children.push(t2)
        geometry.triangles[nbTri].children.push(t1)
        geometry.triangles[nbTri].children.push(t2)

        step()

        legalizEdge(pr, pj, pk, geometry, t1, step)
        legalizEdge(pr, pi, pk, geometry, t2, step)
    }
}

const isIllegal = (pi, pj, pk, pr) => {
    const A = pi.x * (pj.y - pk.y) - pi.y * (pj.x - pk.x) + pj.x * pk.y - pk.x * pj.y
    const B = (pi.x * pi.x + pi.y * pi.y) * (pk.y - pj.y) + (pj.x * pj.x + pj.y * pj.y) * (pi.y - pk.y) + (pk.x * pk.x + pk.y * pk.y) * (pj.y - pi.y)
    const C = (pi.x * pi.x + pi.y * pi.y) * (pj.x - pk.x) + (pj.x * pj.x + pj.y * pj.y) * (pk.x - pi.x) + (pk.x * pk.x + pk.y * pk.y) * (pi.x - pj.x)
    const D = (pi.x * pi.x + pi.y * pi.y) * (pk.x*pj.y - pj.x*pk.y) + (pj.x * pj.x + pj.y * pj.y) * (pi.x*pk.y - pk.x*pi.y) + (pk.x * pk.x + pk.y * pk.y) * (pj.x*pi.y - pi.x*pj.y)

    const r_2 = (B*B + C*C - 4 * A * D) / (4*A*A)
    const cx = -B/(2*A)
    const cy = -C/(2*A)

    const dx = pr.x - cx
    const dy = pr.y - cy

    return dx*dx + dy*dy < r_2
}

const sign = (p1, p2, p3) => {
    return (p1.x - p3.x) * (p2.y - p3.y) -
        (p2.x - p3.x) * (p1.y - p3.y)
}

const pointInTriangle = (pt, a, b, c) => {
    const d1 = sign(pt, a, b)
    const d2 = sign(pt, b, c)
    const d3 = sign(pt, c, a)

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)

    return !(hasNeg && hasPos)
}

const init = (graph) => {
    return {
        nodes: {},
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
