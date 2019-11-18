import React, {useState, useRef, useMemo} from 'react';
import styled from 'styled-components';
import { useSize } from 'react-hook-size';

import { useSelector, useDispatch } from 'react-redux'

import * as actions from './actions'

const Title = styled.h1`
	margin: 0;
	padding: 0;
	grid-column: 2 / -1;
`;

const Svg = styled.svg`
	display: block;
	width: 100%;
	height: 100%;
    grid-area: d;
`;

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	display: grid;
	grid-template-columns: 1fr 3fr;
	grid-template-rows: 3em 3fr 1fr;
	grid-template-areas: "a b" "c d" "e d";
	justify-items: stretch;
	align-items: stretch;
`;

const Code = styled.div`
    white-space:pre-wrap;
    font-family: monospace;
    background: #333;
    color: #fff;
    font-size: 1.2em;
`


const Scroller = styled.div`
    overflow:scroll;
`

const Padding = styled.div`
    padding: 0.5em;
`

const LinkList = styled.ul`
    margin: 0;
    padding:0;
    list-style: none;
`

const Link = styled.span`
    text-decoration: underline;
    cursor: pointer;
`

const NodeDetails = ({nodeId}) => {
    const dispatch = useDispatch()

    const labels = useSelector(state => state.graph.attributes.nodes.label)
    const color = useSelector(state => state.graph.attributes.nodes.color[nodeId])
    const neighbours = useSelector(state => state.graph.nodes[nodeId])
    const edgeLabels = useSelector(state => state.graph.attributes.edges.label[nodeId])


    return <div>
        <h3>Node (#{nodeId})</h3>
        Label:
        <input type="text" value={labels[nodeId]} onChange={(evt) => dispatch(actions.setNodeLabel(nodeId, evt.target.value))} />
        <br />
        Color:
        <input type="text" value={JSON.stringify(color)} onChange={(evt) => dispatch(actions.setNodeColor(nodeId, JSON.parse(evt.target.value)))} />
        <br />
        <button onClick={() => dispatch(actions.deleteNode(nodeId))}>Delete</button>
        <h4>Neighbours</h4>
        <LinkList>
            {neighbours.map((neighbour, idx) =>
               neighbour === nodeId ?
                <li key={idx}><Link onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>{ edgeLabels[idx] } ↩ </Link>&nbsp;(self)</li> :
                <li key={idx}><Link onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>{ edgeLabels[idx] } → </Link>&nbsp;<Link onClick={() => dispatch(actions.selectNode(neighbour))}>Node #{neighbour} ({labels[neighbour]})</Link></li>
            )}
        </LinkList>
    </div>
}

const EdgeDetails = ({nodeId, edgeIndex}) => {
    const dispatch = useDispatch()

    const target = useSelector(state => state.graph.nodes[nodeId][edgeIndex])
    const label = useSelector(state => state.graph.attributes.edges.label[nodeId][edgeIndex])
    const weight = useSelector(state => state.graph.attributes.edges.weight[nodeId][edgeIndex])


    return <div>
        {target === nodeId ?
            <h3>Edge (<Link onClick={() => dispatch(actions.selectNode(nodeId))}>#{nodeId}</Link> ↩)</h3> :
            <h3>Edge (<Link onClick={() => dispatch(actions.selectNode(nodeId))}>#{nodeId}</Link> → <Link onClick={() => dispatch(actions.selectNode(target))}>#{target}</Link>)</h3>}
        Label:
        <input type="text" value={label} onChange={(evt) => dispatch(actions.setEdgeLabel(nodeId, edgeIndex, evt.target.value))} />
        <br />
        Weight:
        <input type="text" value={JSON.stringify(weight)} onChange={(evt) => dispatch(actions.setEdgeWeight(nodeId, edgeIndex, JSON.parse(evt.target.value)))} />
        <br />
        <button onClick={() => dispatch(actions.deleteEdge(nodeId, edgeIndex))}>Delete</button>
    </div>
}

const Menu = () => {
    const nodes = useSelector(state => state.selection.nodes)
    const edges = useSelector(state => state.selection.edges)
    const empty = useSelector(state => state.selection.edges.length < 1 && state.selection.nodes.length < 1)


    return <Scroller>
        <Padding>
            <h2>Selected</h2>
            {nodes.map((nodeId) =>
                <NodeDetails key={nodeId} nodeId={nodeId} />)}
            {edges.map(([nodeId, edgeIndex]) =>
                <EdgeDetails key={nodeId + "-" + edgeIndex} nodeId={nodeId} edgeIndex={edgeIndex} />
            )}
            {empty ? <p>Nothing Selected</p> : null}
        </Padding>
    </Scroller>
}

const Dump = ({value}) =>
    <Scroller>
    <Code>
        {JSON.stringify(value, null, 2)}
    </Code>
    </Scroller>

const viewboxString = (screen, camera) =>
  (camera.center.x - screen.width / 2 / camera.zoom) + " " +
  (camera.center.y - screen.height / 2 / camera.zoom) + " " +
  (screen.width / camera.zoom) + " " +
  (screen.height / camera.zoom)

const useSVGPosition = () => {
    const ref = useRef();
    const svgPoint = useMemo(() => ref.current ? ref.current.parentNode.createSVGPoint() : null, [ref.current]);

    const svgEventPosition = ({x,y}) => {
        if(!svgPoint) {
            return;
        }
        svgPoint.x = x
        svgPoint.y = y
        var result = svgPoint.matrixTransform(ref.current.getScreenCTM().inverse());

        return {
            x: result.x,
            y: result.y,
        };
    }

    return [svgEventPosition, ref];
}

const wheelFactor = (evt) => {
  var wheel = evt.deltaY / -40
  return Math.pow(
    1 + Math.abs(wheel) / 2,
    wheel > 0 ? 1 : -1
  )
}

const Canvas = ({bounds = {
	minX: -400,
	minY: -400,
	maxX: +400,
	maxY: +400,
	minZoom: 0.5,
	maxZoom: 10,
    defaultZoom: 1,
}, onMouseMove, onClick, onMouseDown, onMouseUp, children}) => {
	const [camera, setCamera] = useState({
        center: {x: 0, y:0},
        rotation: 0,
        zoom: 2,
    })

    const [dragState, setDragState] = useState({
        startX: null,
        startY: null,
    })

    const zoom = (pivot, factor) => {
      const newZoom = Math.max(bounds.minZoom, Math.min(bounds.maxZoom, camera.zoom * factor))
      const realFactor = newZoom / camera.zoom;
      const panFactor = 1 - 1 / realFactor;

      const newX = Math.max(bounds.minX, Math.min(bounds.maxX, camera.center.x + (pivot.x - camera.center.x) * panFactor))
      const newY = Math.max(bounds.minY, Math.min(bounds.maxY, camera.center.y + (pivot.y - camera.center.y) * panFactor))

      setCamera({
          ...camera,
          zoom: newZoom,
          center: {
              ...camera.center,
              x: newX,
              y: newY,
          },
      })
    }

    const rotate = (pivot, deltaAngle) => {
      var dx = camera.center.x - pivot.x;
      var dy = camera.center.y - pivot.y;
      var rad = Math.PI * deltaAngle / 180;
      var sin = Math.sin(-rad)
      var cos = Math.cos(-rad)


      setCamera({
          ...camera,
          center: {
              ...camera.center,
              x: Math.max(bounds.minX, Math.min(bounds.maxX, pivot.x + cos * dx - sin * dy)),
              y: Math.max(bounds.minY, Math.min(bounds.maxY, pivot.y + sin * dx + cos * dy)),
          },
          rotation: (camera.rotation + deltaAngle) % 360,
      })
    }

    const pan = (deltaX, deltaY) => {
        setCamera({
          ...camera,
            center: {
                ...camera.center,
                x: Math.max(bounds.minX, Math.min(bounds.maxX, camera.center.x - deltaX)),
                y: Math.max(bounds.minY, Math.min(bounds.maxY, camera.center.y - deltaY))
            },
        })
    }

    const resetCamera = () => {
        setCamera({
          ...camera,
            center: {
                ...camera.center,
                x: 0,
                y: 0
            },
            rotation: 0,
            zoom: bounds.defaultZoom,
        })
    }

	const ref = useRef();
    const screen = useSize(ref);
    const [svgPos, posRef] = useSVGPosition();

    const box = {
    	width: bounds.maxX - bounds.minX,
    	height: bounds.maxY - bounds.minY,
    }
    const viewBox = viewboxString(box, camera);

    const onMouseMoveHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})


        if(dragState.startX || dragState.startY) {
            pan(pos.x - dragState.startX, pos.y - dragState.startY)
        } else {
            if(pos && onMouseMove) {
                onMouseMove(e, pos)
            }
        }
    }

    const onClickHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

        if(pos && onClick) {
            onClick(e, pos)
        }
    }

     const onDoubleClickHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})


        if(camera.rotation != 0) {
            resetCamera()
        } else if(Math.abs(camera.zoom / bounds.defaultZoom) < 1.05) {
            zoom(pos, bounds.maxZoom / 2);
        } else {
            zoom(pos, bounds.defaultZoom / camera.zoom);
        }
    }

    const onMouseDownHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})
        if(pos && onMouseDown) {
            onMouseDown(e, pos)
        }

        e.preventDefault();
        e.stopPropagation();
        setDragState({
            startX: pos.x,
            startY: pos.y,
        })
    }

    const onMouseUpHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})
        if(pos && onMouseUp) {
            onMouseUp(e, pos)
        }

        e.preventDefault();

        setDragState({
            startX: null,
            startY: null,
        })
    }

    const onWheelHandler = (e) => {
        e.preventDefault();

        const pivot = svgPos({x: e.clientX, y: e.clientY})
        const factor = wheelFactor(e);

        if(e.altKey) {
            rotate(pivot, 10 * Math.log2(factor))
        } else {
            zoom(pivot, factor)
        }
    }

    const [left,top,width,height] = viewBox.split(' ');

	return <Svg
        ref={ref}
        onMouseMove={onMouseMoveHandler}
        onMouseDown={onMouseDownHandler}
        onMouseUp={onMouseUpHandler}
        onClick={onClickHandler}
        onDoubleClick={onDoubleClickHandler}
        onWheel={onWheelHandler}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice">
        <rect
                x={left}
                y={top}
                width={width}
                height={height}
                fill="#ccc" />
		<g ref={posRef} transform={`rotate(${camera.rotation} ${camera.center.x} ${camera.center.y})`}>
            <rect
                x={bounds.minX}
                y={bounds.minY}
                width={bounds.maxX - bounds.minX}
                height={bounds.maxY - bounds.minY}
                fill="#fff" />
			{children}
		</g>
	</Svg>;
}

const NodeCircle = styled.circle`
	fill:#eee;
	stroke:currentColor;
	stroke-width: 1;
`

const NodeBox = styled.rect`
	fill:#eee;
	stroke:currentColor;
	stroke-width: 1;
`

const NodeCircleSelection = styled.circle`
	fill: none;
	pointer-events: stroke;
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 6;
`

const NodeBoxSelection = styled.rect`
	fill: none;
    pointer-events: stroke;
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 6;
`

const NodeId = styled.text`
    cursor: default;
    text-anchor: middle;
    dominant-baseline: central;
    fill: #777;
    font-size: 0.5em;
`

const NodeLabel = styled.text`
    cursor: default;
    text-anchor: middle;
    dominant-baseline: central;
`
const NodeLabelSelection = styled.text`
	cursor: default;
	text-anchor: middle;
	dominant-baseline: central;
    pointer-events: stroke;
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 4;
`

const EdgeLine = styled.path`
	fill: none;
	stroke:currentColor;
	stroke-width: 1;
	pointer-events: stroke;
`

const EdgeSelection = styled.path`
	fill: none;
    pointer-events: stroke;
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 6;
	pointer-events: stroke;
`

const EdgeLabel = styled.text`
	cursor: default;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const EdgeLabelSelection = styled.text`
	cursor: default;
    pointer-events: stroke;
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 4;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const ArrowHead = styled.polygon`
	fill: currentColor;
`

const ArrowHeadSelection = styled.polygon`
    pointer-events: stroke;
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 6;
    stroke-dasharray: none;
`
const EdgeHead = ({x,y, angle, selected = false}) => {

	const size = 12
	const spike = 0.25 * Math.PI / 2;
	const a = `${x},${y}`;
	const b = `${x+size*Math.sin(angle-spike-Math.PI/2)},${y-size*Math.cos(angle-spike-Math.PI/2)}`;
	const c = `${x+size*Math.sin(angle+spike-Math.PI/2)},${y-size*Math.cos(angle+spike-Math.PI/2)}`;
	return <>
        <ArrowHeadSelection selected={selected} points={`${a} ${b} ${c}`} />
		<ArrowHead points={`${a} ${b} ${c}`} />
	</>
}

const Node = ({x, y, nodeType = 'circle', id, label, selected = false, onClick = null, onDoubleClick = null, onMouseDown = null, style = {}, labelStyle = {}}) =>
	<g onClick={onClick} onDoubleClick={onDoubleClick} onMouseDown={onMouseDown}>
		{nodeType === 'circle' ?
			<NodeCircleSelection selected={selected} cx={x} cy={y} r={20} /> :
			<NodeBoxSelection selected={selected} x={x - 17} y={y - 17} width={34} height={34} />
		}
		<g style={style}>
		{nodeType === 'circle' ?
			<NodeCircle cx={x} cy={y} r={20} /> :
			<NodeBox x={x - 17} y={y - 17} width={34} height={34} />
		}
        <NodeId x={x} y={y}>#{id}</NodeId>
		</g>
		<NodeLabelSelection selected={selected} x={x} y={y+20} dy="0.6em">{label}</NodeLabelSelection>
		<NodeLabel x={x} y={y+20} dy="0.6em" style={labelStyle}>{label}</NodeLabel>
	</g>

const Edge = ({x0,y0,x1,y1,label, selected = false, onClick = null, onDoubleClick = null, style, labelStyle}) => {
	const midX = (x0 + x1) / 2
	const midY = (y0 + y1) / 2
	let dirX = x1 - x0
	let dirY = y1 - y0
    if(!dirX && !dirY) {
        dirX = 1
        dirY = 0
    }
	const length2 = dirX*dirX + dirY*dirY
	const length = Math.sqrt(length2)
	const normX = dirX/length
	const normY = dirY/length
	const bendA = 80/Math.log(Math.max(3, length))
	const bendB = 80/Math.log(Math.max(3, length))

	const orientation = Math.round(((Math.atan2(normY, normX) + Math.PI) / Math.PI + 0.5) * 2) % 4

	const caX = midX + bendA * normY - bendB*normX
	const caY = midY - bendA * normX - bendB*normY

	const cbX = midX + bendA * normY + bendB*normX
	const cbY = midY - bendA * normX + bendB*normY

	const textX = midX + 0.9 * bendA * normY
	const textY = midY - 0.9 * bendA * normX

	const headAngle = Math.atan2(y1 - cbY + bendB*normY/2, x1 - cbX + bendB*normX/2);

	return <g onClick={onClick} onDoubleClick={onDoubleClick}>
		<EdgeSelection selected={selected} d={`M${x1},${y1} C${cbX},${cbY} ${caX},${caY} ${x0},${y0}`} />
		<g style={style}>
		<EdgeHead x={x1} y={y1} angle={headAngle} selected={selected} />
		<EdgeLine d={`M${x0},${y0} C${caX},${caY} ${cbX},${cbY} ${x1},${y1}`} />
		</g>
		<EdgeLabelSelection selected={selected} orientation={orientation} x={textX} y={textY}>{label.split('<br>').map((l,i) => <tspan key={i} fontSize="10"> {l} </tspan>)}</EdgeLabelSelection>
		<EdgeLabel orientation={orientation} x={textX} y={textY} labelStyle={labelStyle}>{label.split('<br>').map((l,i) => <tspan key={i} fontSize="10"> {l} </tspan>)}</EdgeLabel>
	</g>
}

const ReflexiveEdge = ({x, y, label, angle = 0, selected = false, onClick = null, onDoubleClick = null, style}) =>
	<Edge
		x0={x + Math.cos(angle - Math.PI / 8) * 20}
		y0={y + Math.sin(angle - Math.PI / 8) * 20}
		x1={x + Math.cos(angle + Math.PI / 8) * 20}
		y1={y + Math.sin(angle + Math.PI / 8) * 20}
		selected={selected}
		label={label}
		onClick={onClick}
        onDoubleClick={onDoubleClick}
		style={style}
	/>

const NodeEdge = ({x0, y0, x1, y1, label, selected = false, onClick = null, onDoubleClick = null, style}) => {
	let dirX = x1 - x0
	let dirY = y1 - y0
    if(!dirX && !dirY) {
        dirX = 1
        dirY = 0
    }
	const length2 = dirX*dirX + dirY*dirY
	const length = Math.sqrt(length2)
	const normX = dirX/length
	const normY = dirY/length
	const midX = (x0 + x1) / 2
	const midY = (y0 + y1) / 2
	const bend = 30

	const cX = midX + bend * normY
	const cY = midY - bend * normX

	const cDirX = cX - x0
	const cDirY = cY - y0
	const cDirLength = Math.sqrt(cDirX*cDirX + cDirY*cDirY)
	const cDirXNorm = cDirX / cDirLength
	const cDirYNorm = cDirY / cDirLength

	const cDirXr = cX - x1
	const cDirYr = cY - y1
	const cDirLengthr = Math.sqrt(cDirXr*cDirXr + cDirYr*cDirYr)
	const cDirXNormr = cDirXr / cDirLengthr
	const cDirYNormr = cDirYr / cDirLengthr

	return <Edge
		x0={x0 + 20 * cDirXNorm}
		y0={y0 + 20 * cDirYNorm}
		x1={x1 + 20 * cDirXNormr}
		y1={y1 + 20 * cDirYNormr}
		label={label}
		selected={selected}
		onClick={onClick}
        onDoubleClick={onDoubleClick}
		style={style}
	/>
}

const Graph = ({onNodePress}) => {
    const dispatch = useDispatch()

    const selectedNodes = useSelector(state => state.selection.nodes)
    const selectedEdges = useSelector(state => state.selection.edges)
    const nodes = useSelector(state => state.graph.nodes)
    const positions = useSelector(state => state.graph.attributes.nodes.position)
    const nodeLabels = useSelector(state => state.graph.attributes.nodes.label)
    const nodeColors = useSelector(state => state.graph.attributes.nodes.color)
    const edgeLabels = useSelector(state => state.graph.attributes.edges.label)
    const edgeWeights = useSelector(state => state.graph.attributes.edges.weight)

    return <>
        {nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) =>
                nodeId===neighbourId ?
                <ReflexiveEdge
                    key={`${nodeId}-${edgeIdx}`}
                    angle={Math.PI/1}
                    x={positions[nodeId].x}
                    y={positions[nodeId].y}
                    label={`${edgeLabels[nodeId][edgeIdx]}<br>(${edgeWeights[nodeId][edgeIdx]})`}
                    selected={selectedEdges.some(([s,t]) => s===nodeId && t === edgeIdx)}
                    onClick={(e) => {e.stopPropagation(); dispatch(actions.selectEdge(nodeId,edgeIdx,e.shiftKey))}}
                    onDoubleClick={(e) => {e.stopPropagation(); dispatch(actions.deleteEdge(nodeId, edgeIdx))}}
                /> :
                <NodeEdge
                    key={`${nodeId}-${edgeIdx}`}
                    x0={positions[nodeId].x}
                    y0={positions[nodeId].y}
                    x1={positions[neighbourId].x}
                    y1={positions[neighbourId].y}
                    label={`${edgeLabels[nodeId][edgeIdx]}<br>(${edgeWeights[nodeId][edgeIdx]})`}
                    selected={selectedEdges.some(([s,t]) => s===nodeId && t === edgeIdx)}
                    onClick={(e) => {e.stopPropagation(); dispatch(actions.selectEdge(nodeId,edgeIdx,e.shiftKey))}}
                    onDoubleClick={(e) => {e.stopPropagation(); dispatch(actions.deleteEdge(nodeId, edgeIdx))}}
                />
            )
        )}
        {nodes.map((neighbors, nodeId) =>
            <Node
                key={nodeId}
                id={nodeId}
                selected={selectedNodes.includes(nodeId)}
                onClick={(e) => {e.stopPropagation(); e.metaKey && (selectedNodes.length === 1) ? dispatch(actions.addEdge(selectedNodes[0], nodeId)) : dispatch(actions.selectNode(nodeId, e.shiftKey))}}
                onMouseDown={(e) => onNodePress && onNodePress(e, nodeId)}
                onDoubleClick={(e) => {e.stopPropagation(); dispatch(actions.deleteNode(nodeId))}}
                x={positions[nodeId].x}
                y={positions[nodeId].y}
                label={nodeLabels[nodeId]}
                style={{color: null && nodeColors[nodeId]}}
            />
        )}
    </>
}


export default () => {
    const initialGraph = {
        graph: {
            nodes: [
                [0,1],
                [0,2],
                [0,1],
                []
            ],
            weights: [
                [1,1],
                [3,1],
                [1,1],
                []
            ],
            colors: [
                'cyan',
                'magenta',
                'yellow',
                'white',
            ]
        },
        partitions: [
            [0,1,2,3],
        ],
        labels: {
            nodes: [
                'a','b','c','d'
            ],
            edges: [
                ['p','q'],
                ['r',''],
                ['s','t'],
                [],
            ],
        },
        positions: [
            -100,-100,
            100,100,
            -100,100,
            100, -100,
        ],
        attributes: {
            edges: {
                label: [[]],
                weight: [[]]
            },
            nodes: {
                label: [],
                color: [],
            }
        }
    };

	return <GraphEditor />
}

const GraphEditor = () => {
    const dispatch = useDispatch()
    const fullState = useSelector((state) => state)

    const [pressedNode, setPressedNode] = useState(null);

    dispatch({type: 'foo'})

    return <Container onMouseUp={() => setPressedNode(null)}>
            <Title>Graph</Title>
            <Menu />
            <Dump value={fullState} />
            <Canvas
                onClick={(e,{x,y}) => {if(e.metaKey) { dispatch(actions.createNode(x,y)) } else if(!e.shiftKey) { dispatch(actions.clearSelection()) } }}
                onMouseMove={(e, {x,y}) => pressedNode!==null && dispatch(actions.setPosition(pressedNode, x, y))}>
                <Graph
                    onNodePress={(e, nodeId) => (e.stopPropagation(), e.preventDefault(), setPressedNode(nodeId))}
                />
            </Canvas>
        </Container>;
}
