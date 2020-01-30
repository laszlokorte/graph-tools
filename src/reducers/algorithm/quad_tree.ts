const run = (graph) => {
    const positioning = graph.attributes.nodes.position
    const steps = [];

    const track = (s) => {
        steps.push(copy(s))
    }

    const state = init(graph)

    const tree = {
        x: positioning[0].x,
        y: positioning[0].y,
        data: 0,
        NE:null,
        NW:null,
        SW:null,
        SE:null,
    }

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
    }

    return steps;
}

const init = (graph) => {
    return {
        nodes: {
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
    name: "❌ Quad Tree",
    parameters: {
    },
    dependencies: {
        nodes: ['position'],
        edges: [],
    },
    requirements: {
    },
}
