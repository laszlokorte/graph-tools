export default (graph) => {
    return graph.nodes.reduce((a,es) => a + es.length, 0)
}
