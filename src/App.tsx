import React, {useState, useRef, useMemo} from 'react';
import styled from 'styled-components';
import { useSize } from 'react-hook-size';

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

const NodeDetails = ({deleteNode, setNodeLabel, setNodeColor, selectEdge, selectNode, nodeId, state}) =>
    <div>
        <h3>Node #{nodeId} ({state.labels.nodes[nodeId]})</h3>
        Label:
        <input type="text" value={state.labels.nodes[nodeId]} onChange={(evt) => setNodeLabel(nodeId, evt.target.value)} />
        <br />
        Color:
        <input type="text" value={JSON.stringify(state.graph.colors[nodeId])} onChange={(evt) => setNodeColor(nodeId, JSON.parse(evt.target.value))} />
        <br />
        <button onClick={() => deleteNode(nodeId)}>Delete</button>
        <h4>Neighbours</h4>
        <ul>
            {state.graph.nodes[nodeId].map((neighbour, idx) =>
               neighbour === nodeId ?
                    <li key={idx}><a onClick={() => selectEdge(nodeId, idx)}>{ state.labels.edges[nodeId][idx] } ↩ </a></li> :
                    <li key={idx}><a onClick={() => selectEdge(nodeId, idx)}>{ state.labels.edges[nodeId][idx] } → </a><a onClick={() => selectNode(neighbour)}>Node #{neighbour} ({state.labels.nodes[neighbour]})</a></li>
            )}
        </ul>
    </div>

const EdgeDetails = ({deleteEdge, setEdgeLabel, setEdgeWeight, selectNode, nodeId, edgeIndex, state}) =>
    <div>
        <h3>Edge #{nodeId}->#{state.graph.nodes[nodeId][edgeIndex]}</h3>
        Label:
        <input type="text" value={state.labels.edges[nodeId][edgeIndex]} onChange={(evt) => setEdgeLabel(nodeId, edgeIndex, evt.target.value)} />
        <br />
        Weight:
        <input type="text" value={JSON.stringify(state.graph.weights[nodeId][edgeIndex])} onChange={(evt) => setEdgeWeight(nodeId, edgeIndex, JSON.parse(evt.target.value))} />
        <br />
        <button onClick={() => deleteEdge(nodeId, edgeIndex)}>Delete</button>
        <br />
        From: <a onClick={() => selectNode(nodeId)}>Node #{nodeId} ({state.labels.nodes[nodeId]})</a>
        <br />
        To: <a onClick={() => selectNode(state.graph.nodes[nodeId][edgeIndex])}>Node #{state.graph.nodes[nodeId][edgeIndex]} ({state.labels.nodes[state.graph.nodes[nodeId][edgeIndex]]})</a>
    </div>


const Menu = ({state,deleteNode, deleteEdge, setNodeLabel, setNodeColor, setEdgeLabel, setEdgeWeight, selectEdge, selectNode}) =>
    <Scroller>
        <h2>Selected</h2>
        {state.selection.nodes.map((nodeId) =>
            <NodeDetails key={nodeId} deleteNode={deleteNode} setNodeLabel={setNodeLabel} setNodeColor={setNodeColor} selectEdge={selectEdge} selectNode={selectNode} nodeId={nodeId} state={state} />)}
        {state.selection.edges.map((edges, nodeId) => edges.map((edgeIndex) =>
            <EdgeDetails key={nodeId + "-" + edgeIndex} deleteEdge={deleteEdge} setEdgeLabel={setEdgeLabel} setEdgeWeight={setEdgeWeight} selectNode={selectNode} nodeId={nodeId} edgeIndex={edgeIndex} state={state} />
        ))}
    </Scroller>

const Dump = ({state}) =>
    <Scroller>
    <Code>
        {JSON.stringify(state, null, 2)}
    </Code>
    </Scroller>

const viewboxString = (screen, camera) =>
  (camera.center.x - screen.width / 2 / camera.zoom) + " " +
  (camera.center.y - screen.height / 2 / camera.zoom) + " " +
  (screen.width / camera.zoom) + " " +
  (screen.height / camera.zoom)

const useSVGPosition = () => {
    const ref = useRef();
    const svgPoint = useMemo(() => ref.current && ref.current.parentNode.createSVGPoint(), [ref.current]);

    const svgEventPosition = (coords) => {
        if(!svgPoint) {
            return;
        }
        svgPoint.x = coords.x
        svgPoint.y = coords.y
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
	maxZoom: 2,
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

    const resetCamera = (deltaX, deltaY) => {
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

        if(pos && onClick && e.metaKey) {
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

const Node = ({x,y, nodeType = 'circle', label, selected = false, onClick = null, onDoubleClick = null, style = {}, labelStyle = {}}) =>
	<g onClick={onClick} onDoubleClick={onDoubleClick}>
		{nodeType === 'circle' ?
			<NodeCircleSelection selected={selected} cx={x} cy={y} r={20} /> :
			<NodeBoxSelection selected={selected} x={x - 17} y={y - 17} width={34} height={34} />
		}
		<g style={style}>
		{nodeType === 'circle' ?
			<NodeCircle cx={x} cy={y} r={20} /> :
			<NodeBox x={x - 17} y={y - 17} width={34} height={34} />
		}
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

const Graph = ({state, selectEdge, selectNode, deleteNode, addEdge, deleteEdge}) => {
    return <>
        {state.graph.nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) =>
                nodeId===neighbourId ?
                <ReflexiveEdge
                    key={`${nodeId}-${edgeIdx}`}
                    angle={Math.PI/1}
                    x={state.positions[2*nodeId]}
                    y={state.positions[2*nodeId+1]}
                    label={`${state.labels.edges[nodeId][edgeIdx]}<br>(${state.graph.weights[nodeId][edgeIdx]})`}
                    selected={state.selection.edges[nodeId].includes(edgeIdx)}
                    onClick={(e) => {e.stopPropagation(); selectEdge(nodeId,edgeIdx,e.shiftKey)}}
                    onDoubleClick={(e) => {e.stopPropagation(); deleteEdge(nodeId, edgeIdx)}}
                /> :
                <NodeEdge
                    key={`${nodeId}-${edgeIdx}`}
                    x0={state.positions[2*nodeId]}
                    y0={state.positions[2*nodeId+1]}
                    x1={state.positions[2*neighbourId]}
                    y1={state.positions[2*neighbourId+1]}
                    label={`${state.labels.edges[nodeId][edgeIdx]}<br>(${state.graph.weights[nodeId][edgeIdx]})`}
                    selected={state.selection.edges[nodeId].includes(edgeIdx)}
                    onClick={(e) => {e.stopPropagation(); selectEdge(nodeId,edgeIdx,e.shiftKey)}}
                    onDoubleClick={(e) => {e.stopPropagation(); deleteEdge(nodeId, edgeIdx)}}
                />
            )
        )}
        {state.graph.nodes.map((neighbors, nodeId) =>
            <Node
                key={nodeId}
                selected={state.selection.nodes.includes(nodeId)}
                onClick={(e) => {e.stopPropagation(); e.metaKey && (state.selection.nodes.length === 1) ? addEdge(state.selection.nodes[0], nodeId) : selectNode(nodeId, e.shiftKey)}}
                onDoubleClick={(e) => {e.stopPropagation(); deleteNode(nodeId)}}
                x={state.positions[2*nodeId]}
                y={state.positions[2*nodeId+1]}
                label={state.labels.nodes[nodeId]}
                style={{color: null && state.graph.colors[nodeId]}}
                nodeType={state.partitions[1] && state.partitions[1].includes(nodeId) ? 'rect' : 'circle'}
            />
        )}
    </>
}

export default () => {
	const [state, setState] = useState({
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
		selection: {
			nodes: [0],
			edges: [
				[],
				[],
				[0],
				[],
			]
		}
	});

	const selectNode = (n, add = false) =>
		setState({
			...state,
			selection: {
				...state.selection,
				nodes: add ?
                    [...state.selection.nodes.filter(x=>x!==n), n] :
                    [n],
				edges: add ?
                    state.selection.edges :
                    state.graph.nodes.map(
					(neighbors, node) => []
				),
			},
		});

	const selectEdge = (from, edgeIdx, add = false) =>
		setState({
			...state,
			selection: {
				...state.selection,
				nodes: add ?
                    state.selection.nodes : [],
				edges: state.graph.nodes.map(
					(neighbors, node) => add ?
                        (node===from ?
                        [...state.selection.edges[node].filter(x=>x!==edgeIdx), edgeIdx] : state.selection.edges[node]) :
                        node===from ?
                        [edgeIdx] : []
				),
			},
		});

	const setPosition = (nodeId, x, y) =>
        setState({
            ...state,
            positions: [
                ...state.positions.slice(0, 2*nodeId),
                x, y,
                ...state.positions.slice(2*(nodeId+1)),
            ],
        });

    const addEdge = (from, to) =>
        state.graph.nodes[from].includes(to) ? state :
        setState({
            ...state,
            graph: {
                ...state.graph,
                nodes: [
                    ...state.graph.nodes.slice(0, from),
                    [...state.graph.nodes[from], to],
                    ...state.graph.nodes.slice(from+1)
                ],
                weights: [
                    ...state.graph.weights.slice(0, from),
                    [...state.graph.weights[from], 1],
                    ...state.graph.weights.slice(from+1)
                ],
            },
            labels: {
                ...state.labels,
                edges: [
                    ...state.labels.edges.slice(0, from),
                    [...state.labels.edges[from], "new"],
                    ...state.labels.edges.slice(from+1)
                ],
            },
            selection: {
                ...state.selection,
                edges: state.graph.nodes.map((_,n) => n===from ? [state.graph.nodes[from].length] : []),
            },
        });

    const _removeNodeIndex = (nodeId, list) =>
        list
            .filter((n) => n !== nodeId)
            .map((n) => n > nodeId ? n-1 : n)

    const deleteNode = (nodeId) =>
        setState({
            ...state,
            graph: {
                ...state.graph,
                nodes: [
                    ...state.graph.nodes.slice(0, nodeId),
                    ...state.graph.nodes.slice(nodeId+1)
                ].map((neighbours) =>
                    _removeNodeIndex(nodeId, neighbours)),
                weights: [
                    ...state.graph.weights.slice(0, nodeId),
                    ...state.graph.weights.slice(nodeId+1)
                ].map((neighbours, n) =>
                    neighbours.filter((_, i) =>
                        state.graph.nodes[n][i] !== nodeId)),
                colors: [
                    ...state.graph.colors.slice(0, nodeId),
                    ...state.graph.colors.slice(nodeId+1)
                ],
            },
            partitions: [
                ..._removeNodeIndex(nodeId, state.partitions)
            ],
            labels: {
                nodes: [
                    ...state.labels.nodes.slice(0, nodeId),
                    ...state.labels.nodes.slice(nodeId+1)
                ],
                edges: [
                    ...state.labels.edges.slice(0, nodeId),
                    ...state.labels.edges.slice(nodeId+1)
                ].map((neighbours, n) =>
                    neighbours.filter((_, i) =>
                        state.graph.nodes[n][i] !== nodeId)),
            },
            positions: [
                 ...state.positions.slice(0, 2 * nodeId),
                 ...state.positions.slice(2 * (nodeId + 1)),
            ],
            selection: {
                nodes: [],
                edges: state.graph.nodes.map(() => []),
            },
        });

    const createNode = (x, y) =>
        setState({
            ...state,
            graph: {
                ...state.graph,
                nodes: [
                    ...state.graph.nodes,
                    []
                ],
                weights: [
                    ...state.graph.weights,
                    []
                ],
                colors: [
                    ...state.graph.colors,
                    null
                ],
            },
            partitions: [
                ...state.partitions
            ],
            labels: {
                nodes: [
                    ...state.labels.nodes,
                    'new'
                ],
                edges: [
                    ...state.labels.edges,
                    []
                ],
            },
            positions: [
                 ...state.positions, x, y
            ],
            selection: {
                nodes: [state.graph.nodes.length],
                edges: state.graph.nodes.map(() => []),
            },
        });

    const deleteEdge = (nodeId, edgeIndex) =>
        setState({
            ...state,
            graph: {
                ...state.graph,
                nodes: [
                    ...state.graph.nodes.slice(0, nodeId),
                    [
                        ...state.graph.nodes[nodeId].slice(0, edgeIndex),
                        ...state.graph.nodes[nodeId].slice(edgeIndex + 1)
                    ],
                    ...state.graph.nodes.slice(nodeId+1)
                ],
                weights: [
                    ...state.graph.weights.slice(0, nodeId),
                    [
                        ...state.graph.weights[nodeId].slice(0, edgeIndex),
                        ...state.graph.weights[nodeId].slice(edgeIndex + 1)
                    ],
                    ...state.graph.weights.slice(nodeId+1)
                ],
            },
            labels: {
                ...state.labels,
                edges: [
                    ...state.labels.edges.slice(0, nodeId),
                    [
                        ...state.labels.edges[nodeId].slice(0, edgeIndex),
                        ...state.labels.edges[nodeId].slice(edgeIndex + 1)
                    ],
                    ...state.labels.edges.slice(nodeId+1)
                ],
            },
            selection: {
                ...state.selection,
                edges: state.graph.nodes.map((_,n) => []),
            },
        });

    const setEdgeLabel = (nodeId, edgeIndex, label) =>
        setState({
            ...state,
            labels: {
                ...state.labels,
                edges: [
                    ...state.labels.edges.slice(0, nodeId),
                    [
                        ...state.labels.edges[nodeId].slice(0, edgeIndex),
                        label,
                        ...state.labels.edges[nodeId].slice(edgeIndex + 1),
                    ],
                    ...state.labels.edges.slice(nodeId+1)
                ],
            },
        })

    const setEdgeWeight = (nodeId, edgeIndex, weight) =>
        setState({
            ...state,
            graph: {
                ...state.graph,
                weights: [
                    ...state.graph.weights.slice(0, nodeId),
                    [
                        ...state.graph.weights[nodeId].slice(0, edgeIndex),
                        weight,
                        ...state.graph.weights[nodeId].slice(edgeIndex + 1),
                    ],
                    ...state.graph.weights.slice(nodeId+1)
                ],
            }
        })

    const setNodeLabel = (nodeId, label) =>
        setState({
            ...state,
            labels: {
                ...state.labels,
                nodes: [
                    ...state.labels.nodes.slice(0, nodeId),
                    label,
                    ...state.labels.nodes.slice(nodeId+1)
                ],
            },
        })


    const setNodeColor = (nodeId, color) =>
        setState({
            ...state,
            graph: {
                ...state.graph,
                colors: [
                    ...state.graph.colors.slice(0, nodeId),
                    color,
                    ...state.graph.colors.slice(nodeId+1)
                ],
            },
        })

	return <Container>
		<Title>Graph</Title>
        <Menu
            state={state}
            deleteEdge={deleteEdge}
            deleteNode={deleteNode}
            setEdgeLabel={setEdgeLabel}
            setEdgeWeight={setEdgeWeight}
            setNodeLabel={setNodeLabel}
            setNodeColor={setNodeColor}
            selectEdge={selectEdge}
            selectNode={selectNode}
        />
        <Dump state={state} />
		<Canvas
            onClick={(e,{x,y}) => createNode(x,y)}
            onMouseMove={(e, {x,y}) => e.altKey && state.selection.nodes.length === 1 && setPosition(state.selection.nodes[0], x, y)}>
		    <Graph
                state={state}
                selectNode={selectNode}
                selectEdge={selectEdge}
                addEdge={addEdge}
                deleteNode={deleteNode}
                deleteEdge={deleteEdge}
            />
		</Canvas>
	</Container>
}
