import React, {useState, useRef, useMemo} from 'react';
import styled from 'styled-components';
import { useSize } from 'react-hook-size';

const Title = styled.h1`
	margin: 0;
	padding: 0;
	grid-column: 1 / -1;
`;

const Svg = styled.svg`
	display: block;
	width: 100%;
	height: 100%;
`;

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	display: grid;
	grid-template-columns: 1fr 3fr;
	grid-template-rows: 3em 1fr;
	grid-template-areas: "a b" "c d";
	justify-items: stretch;
	align-items: stretch;
`;

const Menu = () =>
	<div>

	</div>

const viewboxString = (screen, camera) =>
  (camera.center.x - screen.width / 2 / camera.zoom) + " " +
  (camera.center.y - screen.height / 2 / camera.zoom) + " " +
  (screen.width / camera.zoom) + " " +
  (screen.height / camera.zoom)

const Canvas = ({bounds = {
	minX: -400,
	minY: -400,
	maxX: +400,
	maxY: +400,
	minZoom: 0.5,
	maxZoom: 2
}, onMouseMove, children}) => {
	const [camera, setCamera] = useState({
		center: {x: 0, y:0},
		rotation: 0,
		zoom: 2,
	})

	const ref = useRef();
    const screen = useSize(ref);
    const svgPoint = useMemo(() => ref.current && ref.current.createSVGPoint(), [ref.current]);
    const screenCTM = useMemo(() => ref.current && ref.current.getScreenCTM(), [ref.current]);

    const box = {
    	width: bounds.maxX - bounds.minX,
    	height: bounds.maxY - bounds.minY,
    }
    const viewBox = viewboxString(box, camera);

    let moveHandler = null;

    if(onMouseMove) {
    	const svgEventPosition = (coords) => {
    		if(!svgPoint || !screenCTM) {
    			return;
    		}
			svgPoint.x = coords.x
			svgPoint.y = coords.y
			var result = svgPoint.matrixTransform(screenCTM.inverse());

			return {
				x: result.x,
				y: result.y,
			};
		}

    	moveHandler = (e) => {
    		const pos = svgEventPosition({x: e.clientX, y: e.clientY})
    		if(pos) {
    			onMouseMove(e, pos)
    		}
    	}
    }
	return <Svg onMouseMove={moveHandler} ref={ref} viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
		<g transform={`rotate(${camera.rotation} ${camera.center.x} ${camera.center.y})`}>
			<rect
				x={bounds.minX}
				y={bounds.minY}
				width={bounds.maxX - bounds.minX}
				height={bounds.maxY - bounds.minY}
				fill="#ccc" />
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
	stroke: #1EE7E7;
	stroke-width: 4;
`

const NodeBoxSelection = styled.rect`
	fill: none;
	stroke: #1EE7E7;
	stroke-width: 4;
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
	stroke: #1EE7E7;
	stroke-width: 2;
`

const EdgeLine = styled.path`
	fill: none;
	stroke:currentColor;
	stroke-width: 1;
	pointer-events: stroke;
`

const EdgeSelection = styled.path`
	fill: none;
	stroke: #1EE7E7;
	stroke-width: 4;
	pointer-events: stroke;
`

const EdgeLabel = styled.text`
	cursor: default;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'baseline' : 'central')};
`

const EdgeLabelSelection = styled.text`
	cursor: default;
	stroke: #1EE7E7;
	stroke-width: 2;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'baseline' : 'central')};
`

const ArrowHead = styled.polygon`
	fill: currentColor;
`

const ArrowHeadSelection = styled.polygon`
	stroke: #1EE7E7;
	stroke-width: 4;
`
const EdgeHead = ({x,y, angle, selected = false}) => {

	const size = 12
	const spike = 0.25 * Math.PI / 2;
	const a = `${x},${y}`;
	const b = `${x+size*Math.sin(angle-spike-Math.PI/2)},${y-size*Math.cos(angle-spike-Math.PI/2)}`;
	const c = `${x+size*Math.sin(angle+spike-Math.PI/2)},${y-size*Math.cos(angle+spike-Math.PI/2)}`;
	return <>
		{selected ?
			<ArrowHeadSelection points={`${a} ${b} ${c}`} />
			: null
		}
		<ArrowHead points={`${a} ${b} ${c}`} />
	</>
}

const Node = ({x,y, nodeType = 'circle', label, selected = false, onClick = false, style = {}, labelStyle = {}}) =>
	<g onClick={onClick}>
		{selected ?
			(nodeType === 'circle' ?
			<NodeCircleSelection cx={x} cy={y} r={20} /> :
			<NodeBoxSelection x={x - 17} y={y - 17} width={34} height={34} />
			) : null
		}
		<g style={style}>
		{nodeType === 'circle' ?
			<NodeCircle cx={x} cy={y} r={20} /> :
			<NodeBox x={x - 17} y={y - 17} width={34} height={34} />
		}
		</g>
		{selected ?
			<NodeLabelSelection x={x} y={y+20} dy="0.6em">{label}</NodeLabelSelection>
			: null
		}
		<NodeLabel x={x} y={y+20} dy="0.6em" style={labelStyle}>{label}</NodeLabel>
	</g>

const Edge = ({x0,y0,x1,y1,label, selected = false, onClick = null, style, labelStyle}) => {
	const midX = (x0 + x1) / 2
	const midY = (y0 + y1) / 2
	const dirX = x1 - x0
	const dirY = y1 - y0
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

	return <g onClick={onClick}>
		{selected ?
			<EdgeSelection d={`M${x1},${y1} C${cbX},${cbY} ${caX},${caY} ${x0},${y0}`} />
			: null
		}
		<g style={style}>
		<EdgeHead x={x1} y={y1} angle={headAngle} selected={selected} />
		<EdgeLine d={`M${x0},${y0} C${caX},${caY} ${cbX},${cbY} ${x1},${y1}`} />
		</g>
		{selected ?
			<EdgeLabelSelection orientation={orientation} x={textX} y={textY}>{label}</EdgeLabelSelection>
			: null
		}
		<EdgeLabel orientation={orientation} x={textX} y={textY} labelStyle={labelStyle}>{label}</EdgeLabel>
	</g>
}

const ReflexiveEdge = ({x, y, label, angle = 0, selected = false, onClick = null, style}) =>
	<Edge
		x0={x + Math.cos(angle - Math.PI / 8) * 20}
		y0={y + Math.sin(angle - Math.PI / 8) * 20}
		x1={x + Math.cos(angle + Math.PI / 8) * 20}
		y1={y + Math.sin(angle + Math.PI / 8) * 20}
		selected={selected}
		label={label}
		onClick={onClick}
		style={style}
	/>

const NodeEdge = ({x0, y0, x1, y1, label, selected = false, onClick = null, style}) => {
	const dirX = x1 - x0
	const dirY = y1 - y0
	const length2 = dirX*dirX + dirY*dirY
	const length = Math.sqrt(length2)
	const normX = dirX/length
	const normY = dirY/length
	const midX = (x0 + x1) / 2
	const midY = (y0 + y1) / 2
	const bend = 20

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
		style={style}
	/>
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

	const selectNode = (n) =>
		setState({
			...state,
			selection: {
				...state.selection,
				nodes: [n],
				edges: state.graph.nodes.map(
					(neighbors, node) => []
				),
			},
		});

	const selectEdge = (from,edgeIdx) =>
		setState({
			...state,
			selection: {
				...state.selection,
				nodes: [],
				edges: state.graph.nodes.map(
					(neighbors, node) => node===from ?
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

	return <Container>
		<Title>Graphs</Title>
		<Menu />
		<Canvas onMouseMove={(e, {x,y}) => e.altKey && state.selection.nodes.length === 1 && setPosition(state.selection.nodes[0], x, y)}>
			{state.graph.nodes.map((neighbors, nodeId) =>
				<Node
					key={nodeId}
					selected={state.selection.nodes.includes(nodeId)}
					onClick={() => selectNode(nodeId)}
					x={state.positions[2*nodeId]}
					y={state.positions[2*nodeId+1]}
					label={state.labels.nodes[nodeId]}
					style={{color: null && state.graph.colors[nodeId]}}
					nodeType={state.partitions[1] && state.partitions[1].includes(nodeId) ? 'rect' : 'circle'}
				/>
			)}
			{state.graph.nodes.map((neighbors, nodeId) =>
				neighbors.map((neighbourId, edgeIdx) =>
					nodeId===neighbourId ?
					<ReflexiveEdge
						key={`${nodeId}-${edgeIdx}`}
						angle={Math.PI/1}
						x={state.positions[2*nodeId]}
						y={state.positions[2*nodeId+1]}
						label={`${state.labels.edges[nodeId][edgeIdx]} (${state.graph.weights[nodeId][edgeIdx]})`}
						selected={state.selection.edges[nodeId].includes(edgeIdx)}
						onClick={() => selectEdge(nodeId,edgeIdx)}
					/> :
					<NodeEdge
						key={`${nodeId}-${edgeIdx}`}
						x0={state.positions[2*nodeId]}
						y0={state.positions[2*nodeId+1]}
						x1={state.positions[2*neighbourId]}
						y1={state.positions[2*neighbourId+1]}
						label={`${state.labels.edges[nodeId][edgeIdx]} (${state.graph.weights[nodeId][edgeIdx]})`}
						selected={state.selection.edges[nodeId].includes(edgeIdx)}
						style={{color: '#005', strokeDasharray: '5 5'}}
						onClick={() => selectEdge(nodeId,edgeIdx)}
					/>
				)
			)}
			</Canvas>
	</Container>
}
