const run = (graph) => {
    const positioning = graph.attributes.nodes.position
    const steps = [];

    const track = (s) => {
        steps.push(copy(s))
    }

    const state = init(graph)

    if(graph.nodes.length === 0) {
        return steps
    }

    const minX = positioning.reduce((a,b) => Math.min(a,b.x), Infinity) - 100
    const maxX = positioning.reduce((a,b) => Math.max(a,b.x), -Infinity) + 100
    const minY = positioning.reduce((a,b) => Math.min(a,b.y), Infinity) - 100
    const maxY = positioning.reduce((a,b) => Math.max(a,b.y), -Infinity) + 100

    const tree = {
        x: positioning[0].x,
        y: positioning[0].y,
        data: 0,
        NE:null,
        NW:null,
        SW:null,
        SE:null,
    }

    state.nodes.color[0] = 'BLACK'

    draw(tree, 'gray', minX, minY, maxX, maxY, state.polygons)

    track(state)

    for(let p=1;p<graph.nodes.length;p++) {
        let node = tree
        let dir = null

        do {
            if(dir) {
                node = node[dir]
            }

            if(node.x < positioning[p].x) {
                if(node.y < positioning[p].y) {
                    dir = 'NW'
                } else {
                    dir = 'SW'
                }
            } else {
                if(node.y < positioning[p].y) {
                    dir = 'NE'
                } else {
                    dir = 'SE'
                }
            }
        } while(node[dir])

        node[dir] = {
            x: positioning[p].x,
            y: positioning[p].y,
            data: p,
            NE:null,
            NW:null,
            SW:null,
            SE:null,
        }

        state.polygons.length = 0
        state.nodes.color[p] = 'BLACK'
        draw(tree, 'gray', minX, minY, maxX, maxY, state.polygons)
        track(state)
    }

    return steps;
}

const draw = (tree, color, minX, minY, maxX, maxY, polygons) => {
    polygons.push({
        fill: color,
        stroke: 'none',
        points: [
            {
                x: minX,
                y: minY,
            },{
                x: minX,
                y: maxY,
            },{
                x: maxX,
                y: maxY,
            },{
                x: maxX,
                y: minY,
            }
        ]
    })

    if(tree && (tree.SE || tree.SW || tree.NE || tree.NW)) {
        draw(tree.SE, 'red', minX, minY, tree.x, tree.y, polygons)
        draw(tree.SW, 'green', tree.x, minY, maxX, tree.y, polygons)
        draw(tree.NE, 'blue', minX, tree.y, tree.x, maxY, polygons)
        draw(tree.NW, 'yellow', tree.x, tree.y, maxX, maxY, polygons)
    }
}

const init = (graph) => {
    return {
        nodes: {
            color: graph.nodes.map(() => 'WHITE')
        },
        edges: {},
        time: 0,
        polygons: [],
        lines: [],
    }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export default {
    run,
    name: "Quad Tree",
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
