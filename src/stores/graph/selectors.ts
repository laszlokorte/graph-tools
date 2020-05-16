import {createSelector, createStructuredSelector} from "reselect";

export const presentSelector = (state) => state.data.present

export const canUndoSelector = (state) => state.data.past.length > 0
export const canRedoSelector = (state) => state.data.future.length > 0

export const algorithmSelectionSelector = (state) => state.algorithmSelection

export const algorithmSelector = createSelector(
    presentSelector,
    (present) => present.algorithm
)

export const cameraSelector = (state) => state.camera

export const cameraBoxSelector = createSelector(cameraSelector, (cam) => cam.box);

export const errorSelector = createSelector(presentSelector, (present) => present.error)
export const layoutSelector = (s) => s.layout

export const pathManipulatorSelector = (state) => state.pathManipulator

export const manipulatorSelector = (state) => state.manipulator

export const selectionBoxSelector = (state) => state.selectionBox
export const toolSelectionSelector = (state) => state.toolSelection

export const showProjectsSelector = (state) => state.showProjects
export const showDumpSelector = (state) => state.showDump
export const showSettingsSelector = (state) => state.showSettings

export const selectionSelector = createSelector(
    presentSelector,
    (present) => present.selection
)

export const selectedNodesSelector = createSelector(
    selectionSelector,
    (selection) => selection.nodes
)

export const selectedEdgesSelector = createSelector(
    selectionSelector,
    (selection) => selection.edges
)

export const graphSelector = createSelector(
    presentSelector,
    (present) => present.graph
)

export const graphFlagsSelector = createSelector(
    graphSelector,
    (graph) => graph.flags
)

export const graphPropertiesSelector = createSelector(
    presentSelector,
    (present) => present.properties
)

export const nodesSelector = createSelector(
    graphSelector,
    (graph) => graph.nodes
)

export const nodeCountSelector = createSelector(
    nodesSelector,
    (nodes) => nodes.length
)

export const neighboursSelector = (nodeId) => createSelector(
    nodesSelector,
    (nodes) => nodes[nodeId]
)

export const neighbourCountSelector = (nodeId) => createSelector(
    neighboursSelector(nodeId),
    (neighbours) => neighbours.length
)

export const neighbourNodeSelector = (nodeId, edgeIndex) => createSelector(
    neighboursSelector(nodeId),
    (neighbours) => neighbours[edgeIndex]
)

export const allNodesAttributeValueSelector  = (attrKey) => createSelector(graphSelector, g => g.attributes.nodes[attrKey])
export const allEdgesAttributeValueSelector  = (attrKey) => createSelector(graphSelector, g => g.attributes.edges[attrKey])
export const nodeAttributeValueSelector  = (attrKey, nodeId) => createSelector(graphSelector, g => g.attributes.nodes[attrKey][nodeId])
export const nodeAttributeTypeSelector = (attrKey) => createSelector(graphSelector, g => g.attributeTypes.nodes[attrKey])
export const nodeAttributeSelector = (attrKey, nodeId) => createStructuredSelector({
    type: nodeAttributeTypeSelector(attrKey),
    value: nodeAttributeValueSelector(attrKey, nodeId),
})


export const edgeAttributeValueSelector  = (attrKey, nodeId, edgeIdx) => createSelector(graphSelector, g => g.attributes.edges[attrKey][nodeId][edgeIdx])
export const edgeAttributeTypeSelector = (attrKey) => createSelector(graphSelector, g => g.attributeTypes.edges[attrKey])
export const edgeAttributeSelector = (attrKey, nodeId, edgeIdx) => createStructuredSelector({
    type: edgeAttributeTypeSelector(attrKey),
    value: edgeAttributeValueSelector(attrKey, nodeId, edgeIdx),
})

export const edgeAttributesSelector = createSelector(
    graphSelector,
    (g) => g.attributeTypes.edges
)

export const nodeAttributesSelector = createSelector(
    graphSelector,
    (g) => g.attributeTypes.nodes
)

export const edgeAttributeTypesSelector = createSelector(edgeAttributesSelector, attr => Object.keys(attr))
export const nodeAttributeTypesSelector = createSelector(nodeAttributesSelector, attr => Object.keys(attr))

export const nodesPositionsSelector = allNodesAttributeValueSelector('position')
export const nodePositionSelector = (nodeId) => nodeAttributeValueSelector('position', nodeId)
export const edgesPathsSelector = allEdgesAttributeValueSelector('path')
export const edgePathSelector = (nodeId, edgeIdx) => edgeAttributeValueSelector('path', nodeId, edgeIdx)


export const prevMultiEdgeIndex = (nodeId, edgeIndex) => createSelector(
    neighbourNodeSelector(nodeId, edgeIndex),
    neighbourNodeSelector(nodeId, edgeIndex - 1),
    (current, next) => current !== null && next === current ? edgeIndex - 1 : null
)

export const nextMultiEdgeIndex = (nodeId, edgeIndex) => createSelector(
    neighbourNodeSelector(nodeId, edgeIndex),
    neighbourNodeSelector(nodeId, edgeIndex + 1),
    (current, next) => current !== null && next === current ? edgeIndex + 1 : null
)
