import {createSelector, createStructuredSelector} from 'reselect';
import {ALGORITHM_MAP} from './reducers/algorithm/index';

export const presentSelector = (state) => state.data.present

export const canUndoSelector = (state) => state.data.past.length > 0
export const canRedoSelector = (state) => state.data.future.length > 0

export const algorithmSelectionSelector = (state) => state.algorithmSelection.type
export const algorithmSelectionParameterSelector = (state) => state.algorithmSelection.parameters

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
export const showAlgorithmSelector = (state) => state.showAlgorithm
export const showAlignmentSelector = (state) => state.showAlignment

export const selectionSelector = createSelector(
    presentSelector,
    (present) => present.selection
)


export const selectedNodesSelector = createSelector(
    selectionSelector,
    (selection) => selection.nodes
)

export const isNodeSelectedSelector = (nodeId) => createSelector(
    selectedNodesSelector,
    (selection) => selection.includes(nodeId)
)

export const selectedNodeCountSelector = createSelector(
    selectedNodesSelector,
    (nodes) => nodes.length
)

export const canAlignSelectedNodesSelector = createSelector(
    selectedNodeCountSelector,
    (count) => count > 1
)


export const canAutolayoutSelector = createSelector(
    selectedNodeCountSelector,
    (count) => count !== 1
)

export const selectedNodesIndicesSelector = createSelector(
    selectedNodeCountSelector,
    (count) => Array(count).fill(null).map((_,i) => i)
)

export const selectedNodeSelector = (index) => createSelector(
    selectedNodesSelector,
    (nodes) => nodes[index]
)



export const selectedEdgesSelector = createSelector(
    selectionSelector,
    (selection) => selection.edges
)

export const selectedEdgeCountSelector = createSelector(
    selectedEdgesSelector,
    (edges) => edges.length
)

export const selectedEdgesIndicesSelector = createSelector(
    selectedEdgeCountSelector,
    (count) => Array(count).fill(null).map((_,i) => i)
)

export const selectedEdgeSelector = (index) => createSelector(
    selectedEdgesSelector,
    (edges) => edges[index]
)

export const graphSelector = createSelector(
    presentSelector,
    (present) => present.graph
)

export const graphFlagsSelector = createSelector(
    graphSelector,
    (graph) => graph.flags
)

export const graphFlagKeysSelector = createSelector(
    graphFlagsSelector,
    (flags) => Object.keys(flags)
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

export const nodeIdsSelector = createSelector(
    nodesSelector,
    (nodes) => Array(nodes.length).fill(null).map((_,i) => i)
)

export const outgoingNeighboursSelector = (nodeId) => createSelector(
    nodesSelector,
    (nodes) => nodes[nodeId]
)

export const outgoingNeighbourCountSelector = (nodeId) => createSelector(
    outgoingNeighboursSelector(nodeId),
    (outgoingNeighbours) => outgoingNeighbours.length
)

export const edgeIndicesSelector = (nodeId) => createSelector(
    outgoingNeighboursSelector(nodeId),
    (outgoingNeighbours) => Array(outgoingNeighbours.length).fill(null).map((_,i) => i)
)

export const outgoingNeighbourNodeSelector = (nodeId, edgeIndex) => createSelector(
    outgoingNeighboursSelector(nodeId),
    (outgoingNeighbours) => outgoingNeighbours[edgeIndex]
)

export const allEdgesSelector = createSelector(
    nodesSelector,
    (nodes) => nodes.flatMap((edges, source) => edges.map((target, edgeIndex) => ({source, edgeIndex, target})))
)

export const incomingNeighboursSelector = (nodeId) => createSelector(
    allEdgesSelector,
    (edges) => edges.filter(({target}) => target === nodeId)
)

export const allNodesAttributeValueSelector  = (attrKey) => createSelector(graphSelector, g => g.attributes.nodes[attrKey])
export const allEdgesAttributeValueSelector  = (attrKey) => createSelector(graphSelector, g => g.attributes.edges[attrKey])
export const nodeAttributeValueSelector  = (attrKey, nodeId) => createSelector(
    allNodesAttributeValueSelector(attrKey),
    attrs => attrs ? attrs[nodeId] : null
)
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

export const edgeVisibleAttributeTypesSelector = createSelector(edgeAttributesSelector, attr => Object.keys(attr).filter((k) => attr[k].visible))
export const nodeVisibleAttributeTypesSelector = createSelector(nodeAttributesSelector, attr => Object.keys(attr).filter((k) => attr[k].visible))

export const nodesPositionsSelector = allNodesAttributeValueSelector('position')
export const nodePositionSelector = (nodeId) => nodeAttributeValueSelector('position', nodeId)
export const edgesPathsSelector = allEdgesAttributeValueSelector('path')
export const edgePathSelector = (nodeId, edgeIdx) => edgeAttributeValueSelector('path', nodeId, edgeIdx)
export const edgePathLayoutSelector = (nodeId, edgeIdx) => createSelector(layoutSelector, (layout) => layout.edgePaths[nodeId][edgeIdx])


export const prevMultiEdgeIndex = (nodeId, edgeIndex) => createSelector(
    outgoingNeighbourNodeSelector(nodeId, edgeIndex),
    outgoingNeighbourNodeSelector(nodeId, edgeIndex - 1),
    (current, next) => current !== null && next === current ? edgeIndex - 1 : null
)

export const nextMultiEdgeIndex = (nodeId, edgeIndex) => createSelector(
    outgoingNeighbourNodeSelector(nodeId, edgeIndex),
    outgoingNeighbourNodeSelector(nodeId, edgeIndex + 1),
    (current, next) => current !== null && next === current ? edgeIndex + 1 : null
)

export const manipulatorTargetNodeSelector = createSelector(
    nodesSelector,
    manipulatorSelector,
    (nodes, manipulator) => {
        if(manipulator.connectionStart !== null && manipulator.edgeIndex !== null) {
            return nodes[manipulator.connectionStart][manipulator.edgeIndex]
        } else {
            return null
        }
    }
)

export const manipulatorDeltaSelector = createSelector(
    nodesPositionsSelector,
    manipulatorSelector,
    (positions, manipulator) => {
        if(manipulator.movingNode === null) {
            return null
        }
        const nodePos = positions[manipulator.movingNode]

        return {
            x: manipulator.x - nodePos.x + manipulator.offsetX,
            y: manipulator.y - nodePos.y + manipulator.offsetY,
        }
    }
)

const manipulatorMovingNodeSelector = createSelector(
    manipulatorSelector,
    (manipulator) => {
        return manipulator.movingNode
    }
)

const manipulatorMovingNodeSelectedSelector = createSelector(
    selectedNodesSelector,
    manipulatorSelector,
    (selection, manipulator) => {
        return selection.includes(manipulator.movingNode)
    }
)

export const nodeManipulatorPositionSelector = (nodeId) =>
    createSelector(
        manipulatorMovingNodeSelectedSelector,
        nodePositionSelector(nodeId),
        isNodeSelectedSelector(nodeId),
        manipulatorDeltaSelector,
        manipulatorMovingNodeSelector,
        (movingSelected, nodePosition, isSelected, delta, moving) => {
            return (!isSelected||!movingSelected)&&(moving!=nodeId)||!delta ? nodePosition : {x: nodePosition.x + delta.x, y: nodePosition.y + delta.y}
        }
    )


export const visibleNodeAttributesSelector = createSelector(
    nodeAttributesSelector,
    (attrs) => Object.keys(attrs).filter((n) => !['position'].includes(n) && attrs[n].visible)
)


export const visibleNodeAttributesCountSelector = createSelector(
    nodeAttributesSelector,
    (attrs) => Object.keys(attrs).filter((n) => !['position'].includes(n) && attrs[n].visible).length
)

export const visibleEdgeAttributesSelector = createSelector(
    edgeAttributesSelector,
    (attrs) => Object.keys(attrs).filter((n) => !['path'].includes(n) && attrs[n].visible)
)

export const visibleEdgeAttributesCountSelector = createSelector(
    edgeAttributesSelector,
    (attrs) => Object.keys(attrs).filter((n) => !['path'].includes(n) && attrs[n].visible).length
)

export const manipulatorStartNodeAngleSelector = createSelector(
    layoutSelector,
    manipulatorSelector,
    (layout, manipulator) => {
        if(manipulator.connectionStart !== null) {
            return layout.nodeAngles[manipulator.connectionStart]
        } else {
            return 0
        }
    }
)

export const algorithmStepEdgeLabel = (nodeId, edgeIdx, labelKey) => createSelector(
    algorithmSelector,
    (alg) => alg.result.steps[alg.focus].edges[labelKey][nodeId][edgeIdx]
)

export const algorithmStepNodeLabel = (nodeId, labelKey) => createSelector(
    algorithmSelector,
    (alg) => alg.result.steps[alg.focus].nodes[labelKey][nodeId]
)

export const algorithmStepEdgeLabels = createSelector(
    algorithmSelector,
    (alg) => Object.keys(alg.result.steps[alg.focus].edges)
)

export const algorithmStepNodeLabels = createSelector(
    algorithmSelector,
    (alg) => Object.keys(alg.result.steps[alg.focus].nodes)
)

export const algorithmStepNodeColor = (nodeId) => algorithmStepNodeLabel(nodeId, 'color')

export const algorithmStepEdgeColor = (nodeId, edgeIdx) => algorithmStepEdgeLabel(nodeId, edgeIdx, 'color')


export const algorithmStepHasEdgeColors = createSelector(
    algorithmSelector,
    (alg) => !!alg.result.steps[alg.focus].edges.color
)

export const algorithmStepHasNodeColors = createSelector(
    algorithmSelector,
    (alg) => !!alg.result.steps[alg.focus].nodes.color
)

export const algorithmStepPolygons = createSelector(
    algorithmSelector,
    (alg) => alg.result.steps[alg.focus].polygons
)

export const algorithmStepLines = createSelector(
    algorithmSelector,
    (alg) => alg.result.steps[alg.focus].lines
)

export const algorithmHasResult = createSelector(
    algorithmSelector,
    (alg) => alg && alg.result && alg.result.steps && alg.result.steps.length > 0
)

export const selectedNodePositionSelector = (index) => createSelector(
    nodesPositionsSelector,
    selectedNodesSelector,
    (positions, selectedNodes) => positions[selectedNodes[index]]
)


export const selectedEdgePathLayoutSelector = (index) => createSelector(
    layoutSelector,
    selectedEdgesSelector,
    (layout, edges) => {
        const e = edges[index]
        return layout.edgePaths[e[0]][e[1]]
    }
)

export const anyThingSelectedSelector = createSelector(
    selectedEdgesSelector,
    selectedNodesSelector,
    (edges, nodes) => edges.length > 0 || nodes.length > 0
)


const meetRequirements = (alg, graph) => {
    return !alg.requirements || Object.entries(alg.requirements).every(([k,v]) => {
        return graph.flags[k] === v;
    })
}

export const selectableAlgorithmsSelector = createSelector(
    graphSelector,
    (graph) => Object.keys(ALGORITHM_MAP).filter((k) => meetRequirements(ALGORITHM_MAP[k], graph))
)

export const selectedAlgorithmOptionsSelector = createSelector(
    algorithmSelectionSelector,
    (selected) => (selected && ALGORITHM_MAP[selected].parameters) || ({})
)

export const selectedAlgorithmOptionKeysSelector = createSelector(
    selectedAlgorithmOptionsSelector,
    (options) => Object.keys(options)
)

export const selectedAlgorithmOptionSelector = (key) => createSelector(
    selectedAlgorithmOptionsSelector,
    (options) => options[key]
)


export const selectedAlgorithmOptionValueSelector = (key) => createSelector(
    algorithmSelectionParameterSelector,
    (parameters) => parameters[key]
)


export const selectedAlgorithmCanRunSelector = createSelector(
    algorithmSelectionSelector,
    graphSelector,
    (selected, graph) => selected && meetRequirements(ALGORITHM_MAP[selected], graph)
)

export const algorithmRerunSelector = createSelector(
    algorithmSelector,
    (alg) => alg.rerun
)

const selectedNodesAttributeIsMixedSelector = (attr) => createSelector(
    selectedNodesSelector,
    allNodesAttributeValueSelector(attr),
    (nodeIds, attr) => !nodeIds.reduce((same, id) => same && attr[id] === attr[nodeIds[0]], true)
)

const selectedEdgesAttributeIsMixedSelector = (attr) => createSelector(
    selectedEdgesSelector,
    allEdgesAttributeValueSelector(attr),
    (edges, attr) => !edges.reduce((same, [n, i]) => same && attr[n][i] === attr[edges[0][0]][edges[0][1]], true)
)

const selectedNodesAttributeValueSelector = (attr) => createSelector(
    selectedNodesSelector,
    allNodesAttributeValueSelector(attr),
    (nodeIds, attr) => {
        const n = nodeIds.reduce((other, id) => attr[other] === attr[id] ? other : null)
        if(n !== null) {
            return attr[n]
        } else {
            return null
        }
    }
)

const selectedEdgesAttributeValueSelector = (attr) => createSelector(
    selectedEdgesSelector,
    allEdgesAttributeValueSelector(attr),
    (edges, attr) => {
        if(edges.length < 1) {
            return null
        }
        const e = edges.reduce((c, [n, i]) => c && attr[c[0]][c[1]] === attr[n][i] ? c : null, edges[0])
        if(e) {
            return attr[e[0]][e[1]]
        } else {
            return null
        }
    }
)

export const selectedEdgesAttributeSelector = (attrKey) => createStructuredSelector({
    type: edgeAttributeTypeSelector(attrKey),
    value: selectedEdgesAttributeValueSelector(attrKey),
    mixed: selectedEdgesAttributeIsMixedSelector(attrKey),
})

export const selectedNodesAttributeSelector = (attrKey) => createStructuredSelector({
    type: nodeAttributeTypeSelector(attrKey),
    value: selectedNodesAttributeValueSelector(attrKey),
    mixed: selectedNodesAttributeIsMixedSelector(attrKey),
})

const typeToShape = (type) => {
    if(type === 'place') {
        return 'm 0 20 a 20 20 0 1 0 0 -40 a 20 20 0 1 0 0 40'
    } else if(type === 'transition') {
        return 'm 0 20 h -20 v -40 h 40 v 40 z'
    } else if(type === 'triangle') {
        return 'm 0 10 h -20 l 20 -30 l 20 30 z'
    } else {
        return 'm 0 20 a 20 20 0 1 0 0 -40 a 20 20 0 1 0 0 40'
    }
}

export const nodeShapeSelector = (nodeId) => createSelector(
    nodeAttributeValueSelector('type', nodeId),
    typeToShape
)
export const selectedNodeShapeSelector = (index) => createSelector(
    allNodesAttributeValueSelector('type'),
    selectedNodesSelector,
    (types, selection) => {
        const type = types ? types[selection[index]] : null

        return typeToShape(type)
    }
)

export const newNodeShapeSelector = createSelector((state) => 'm 0 20 a 20 20 0 1 0 0 -40 a 20 20 0 1 0 0 40')

export const isNodePositionHandleActive = createSelector(
    pathManipulatorSelector,
    manipulatorSelector,
    (pm, m) => m.connectionStart === null && pm.controlIdx === null
)
