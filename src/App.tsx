import React from 'react';
import {useState, useRef, useMemo, useEffect, useContext} from 'react';
import styled from 'styled-components';
import { useSize } from './react-hook-size';

import { useSelector, useDispatch } from 'react-redux'
import { ActionCreators } from 'redux-undo';

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

const Code = styled.textarea`
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    border: 0;
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

const NodeAttribute = ({nodeId, attrKey}) => {
    const dispatch = useDispatch()
    const value = useSelector(state => state.present.graph.attributes.nodes[attrKey][nodeId])
    const type = useSelector(state => state.present.graph.attributeTypes.nodes[attrKey].type)


    if(['text','color','numeric'].includes(type)) {
        return <div>
            {attrKey}:
            <input type="text" value={value || ''} onChange={(evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))} />
        </div>
    } else {
        return <div>{attrKey}: <input type={type} value={JSON.stringify(value)} readOnly /></div>
    }
}

const NodeDetails = ({nodeId}) => {
    const dispatch = useDispatch()

    const neighbours = useSelector(state => state.present.graph.nodes[nodeId])
    const edgeLabels = useSelector(state => state.present.graph.attributes.edges.label[nodeId])
    const nodeLabels = useSelector(state => state.present.graph.attributes.nodes.label[nodeId])
    const attributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.nodes))


    return <div>
        <h3>Node (#{nodeId})</h3>
        {attributes.map((attrKey) =>
            <NodeAttribute key={attrKey} nodeId={nodeId} attrKey={attrKey} />
        )}
        <button onClick={() => dispatch(actions.deleteNode(nodeId))}>Delete</button>
        <h4>Neighbours</h4>
        <LinkList>
            {neighbours.map((neighbour, idx) =>
               neighbour === nodeId ?
                <li key={idx}><Link onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>{ edgeLabels[idx] } ↩ </Link>&nbsp;(self)</li> :
                <li key={idx}><Link onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>{ edgeLabels[idx] } → </Link>&nbsp;<Link onClick={() => dispatch(actions.selectNode(neighbour))}>Node #{neighbour} ({nodeLabels[neighbour]})</Link></li>
            )}
        </LinkList>
    </div>
}

const EdgeAttribute = ({nodeId, edgeIndex, attrKey}) => {
    const dispatch = useDispatch()
    const value = useSelector(state => state.present.graph.attributes.edges[attrKey][nodeId][edgeIndex])
    const type = useSelector(state => state.present.graph.attributeTypes.edges[attrKey].type)

    if(['text','color','numeric'].includes(type)) {
        return <div>
            {attrKey}:
            <input type={type} value={value||''} onChange={(evt) => dispatch(actions.setEdgeAttribute(nodeId, edgeIndex, attrKey, evt.target.value))} />
        </div>
    } else {
        return <div>{attrKey}: <input type={type} value={JSON.stringify(value)} readOnly /></div>
    }
}

const EdgeDetails = ({nodeId, edgeIndex}) => {
    const dispatch = useDispatch()

    const target = useSelector(state => state.present.graph.nodes[nodeId][edgeIndex])
    const attributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.edges))
    const flags = useSelector(state => state.present.graph.flags)
    const prev = useSelector(state => edgeIndex > 0 && state.present.graph.nodes[nodeId][edgeIndex - 1] === target ? edgeIndex - 1 : null)
    const next = useSelector(state => edgeIndex < state.present.graph.nodes[nodeId].length && state.present.graph.nodes[nodeId][edgeIndex + 1] === target ? edgeIndex + 1 : null)

    return <div>
        {target === nodeId ?
            <h3>Edge (<Link onClick={() => dispatch(actions.selectNode(nodeId))}>#{nodeId}</Link> ↩)</h3> :
            <h3>Edge (<Link onClick={() => dispatch(actions.selectNode(nodeId))}>#{nodeId}</Link> → <Link onClick={() => dispatch(actions.selectNode(target))}>#{target}</Link>)</h3>}
        <button onClick={() => dispatch(actions.deleteEdge(nodeId, edgeIndex))}>Delete</button>
        <h4>Attributes</h4>
        {attributes.map((attrKey) =>
            <EdgeAttribute key={attrKey} nodeId={nodeId} edgeIndex={edgeIndex} attrKey={attrKey} />
        )}
        {!flags.multiGraph ? null : <div>
            <h4>Partner Edges</h4>
            {prev === null ? 'Prev' :
            <Link onClick={() => dispatch(actions.selectEdge(nodeId, prev))}>Prev</Link>}
            &nbsp;|&nbsp;
            {next === null ? 'Next' :
            <Link onClick={() => dispatch(actions.selectEdge(nodeId, next))}>Next</Link>}
        </div>}
    </div>
}

const GraphOptions = () => {
    const dispatch = useDispatch()

    const flags = useSelector(state => state.present.graph.flags)

    return <div>
        {Object.keys(flags).map((flagKey) =>
            <label key={flagKey}>
                <input type="checkbox" onChange={(e) => dispatch(actions.setFlag(flagKey, e.target.checked))} checked={flags[flagKey]} /> {flagKey}
            </label>
        )}
    </div>
}

const History = () => {
    const dispatch = useDispatch();
    const canUndo = useSelector(state => state.past.length > 0)
    const canRedo = useSelector(state => state.future.length > 0)

    const undo = () => dispatch(ActionCreators.undo())
    const redo = () => dispatch(ActionCreators.redo())

    return <Padding>
        <button disabled={!canUndo} onClick={undo}>Undo</button>
        <button disabled={!canRedo} onClick={redo}>Redo</button>
    </Padding>
}

const Menu = () => {
    const dispatch = useDispatch();
    const nodes = useSelector(state => state.present.selection.nodes)
    const edges = useSelector(state => state.present.selection.edges)
    const empty = useSelector(state => state.present.selection.edges.length < 1 && state.present.selection.nodes.length < 1)

    const properties = useSelector(state => state.present.properties)
    const algorithms = useSelector(state => state.present.algorithms)

    return <Scroller>
        <Padding>
            <h3>Graph Options</h3>
                <GraphOptions/>
            <h3>Properties</h3>
            <dl>
                {Object.keys(properties).map((prop) =>
                    <React.Fragment key={prop}>
                    <dt>{prop}</dt>
                    <dd>{properties[prop] === true ? 'true' : properties[prop] === false ? 'false' : properties[prop]}</dd>
                    </React.Fragment>
                )}
            </dl>
            <h3>Algorithms</h3>
            <dl>
                {Object.keys(algorithms).map((alg) =>
                    <React.Fragment key={alg}>
                    <dt>{alg}</dt>
                    <dd><Link onClick={() => dispatch(actions.runAlgorithm(alg))}>🔄</Link>{algorithms[alg].result !== null ? "✅":null}</dd>
                    </React.Fragment>
                )}
            </dl>
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
    <Code readOnly value={JSON.stringify(value, null, 2)}/>

const viewboxString = (bounds, screen, camera) =>
  (camera.center.x - screen.width / 2 / camera.zoom) + " " +
  (camera.center.y - screen.height / 2 / camera.zoom) + " " +
  (screen.width / camera.zoom) + " " +
  (screen.height / camera.zoom)

const useSVGPosition = (ref) => {
    return useMemo(() => {
        if(ref.current) {
            const point = ref.current.parentNode.createSVGPoint();
            return ({x,y}) => {
                point.x = x
                point.y = y
                var result = point.matrixTransform(ref.current.getScreenCTM().inverse());

                return {
                    x: result.x,
                    y: result.y,
                };
            }
        } else {
            return (id) => id
        }
    }, [ref.current]);
}

const wheelFactor = (evt) => {
  var wheel = evt.deltaY / -40
  return Math.pow(
    1 + Math.abs(wheel) / 2,
    wheel > 0 ? 1 : -1
  )
}

const CanvasContext = React.createContext(({x,y}) => ({x,y}));
const useCanvasPos = () => {
    return useContext(CanvasContext);
}

const Canvas = ({children}) => {
	const [bounds, setBounds] = useState({
        x: -400,
        y: -400,
        width: 800,
        height: 800,
        minX: -400,
        minY: -400,
        maxX: +400,
        maxY: +400,
        minZoom: 0.5,
        maxZoom: 10,
        defaultZoom: 1,
    });

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

    const screenRef = useRef();
    const posRef = useRef();
    const boundingRef = useRef();
    const screen = useSize(screenRef);
    const svgPos = useSVGPosition(posRef);

    useEffect(() => {
        const currentBB = boundingRef.current;
        if(currentBB) {
            const bbox = currentBB.getBBox();

            setBounds({
                x: bbox.x,
                y: bbox.y,
                width: bbox.width,
                height: bbox.height,
                minX: bbox.x,
                maxX: bbox.x + bbox.width,
                minY: bbox.y,
                maxY: bbox.y + bbox.height,
                defaultZoom: Math.min(
                  screen.width/bbox.width,
                  screen.height/bbox.height,
                  20
                ),
                minZoom: Math.min(
                  screen.width / (bbox.width),
                  screen.height / (bbox.height),
                  0.8
                ),
                maxZoom: 6,
            });
        }
    }, [children, boundingRef, screen]);

    const viewBox = viewboxString(bounds, screen, camera);

    const onMouseMoveHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})


        if(dragState.startX || dragState.startY) {
            pan(pos.x - dragState.startX, pos.y - dragState.startY)
        }
    }

    const onClickHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

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

        e.preventDefault();
        e.stopPropagation();
        setDragState({
            startX: pos.x,
            startY: pos.y,
        })
    }

    const onMouseUpHandler = (e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

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

    useEffect(() => {
        window.addEventListener('mouseup', onMouseUpHandler);

        return () => {
            window.removeEventListener('mouseup', onMouseUpHandler);
        }
    }, [])

	return <Svg
        ref={screenRef}
        onMouseMove={onMouseMoveHandler}
        onMouseDown={onMouseDownHandler}
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
            <CanvasContext.Provider value={svgPos}>
            <rect
                x={bounds.minX}
                y={bounds.minY}
                width={bounds.maxX - bounds.minX}
                height={bounds.maxY - bounds.minY}
                fill="#fff" />
            <g ref={boundingRef}>
			{children}
            </g>
            </CanvasContext.Provider>
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

const NodeDragger = styled.path`
    cursor: move;
    fill: #333;
    opacity: 0.5;
`;

const NodeConnector = styled.path`
    cursor: alias;
    fill: #3290E8;
    opacity: 0.5;
`;

const NodeConnectorTarget = styled.path`
    cursor: alias;
    fill: #FB7423;
    opacity: 0.5;
    :hover {
        fill: #895440
    }
`;

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

const Node = ({children, x, y, nodeType = 'circle', id, label, selected = false, style = {}, labelStyle = {}, onClick}) =>
	<g onClick={onClick}>
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
        {children}
	</g>

const Edge = ({x0,y0,x1,y1,label, selected = false, onClick = null, onDoubleClick = null, style, labelStyle, directed = true}) => {
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
	const bendA = directed ? 80/Math.log(Math.max(3, length)) : 0
	const bendB = directed ? 80/Math.log(Math.max(3, length)) : 0

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
        {directed ?
            <EdgeHead x={x1} y={y1} angle={headAngle} selected={selected} />
            :null
        }
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
        directed={true}
	/>

const NodeEdge = ({x0, y0, x1, y1, label, selected = false, onClick = null, onDoubleClick = null, style, directed = true}) => {
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
	const bend = directed ? 30 : 0

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
        directed={directed}
	/>
}

const Graph = ({onNodePress}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos();

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)
    const nodeLabels = useSelector(state => state.present.graph.attributes.nodes.label)
    const nodeColors = useSelector(state => state.present.graph.attributes.nodes.color)
    const edgeLabels = useSelector(state => state.present.graph.attributes.edges.label)
    const edgeWeights = useSelector(state => state.present.graph.attributes.edges.weight)

    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const onMouseUp = (evt) => {

            setConnection(null)
        }

        window.addEventListener('mouseup', onMouseUp)

        return () => {
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, []);

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
                    directed={flags.directed}
                />
            )
        )}
        {nodes.map((neighbors, nodeId) =>
            <Node
                key={nodeId}
                id={nodeId}
                selected={selectedNodes.includes(nodeId)}
                x={positions[nodeId].x}
                y={positions[nodeId].y}
                label={nodeLabels[nodeId]}
                style={{color: null && nodeColors[nodeId]}}
                onClick={(e) => {e.stopPropagation(); dispatch(actions.selectNode(nodeId, e.shiftKey))}}
            >
                {selectedNodes.includes(nodeId) ?
                <>
                <NodeConnector d="M 0, 0
                    m 0, -40
                    a 40, 40, 0, 1, 0, 0, 80
                    a 40, 40, 0, 1, 0, 0, -80
                    Z
                    m 0 20
                    a 20, 20, 0, 1, 1, 0, 40
                    a 20, 20, 0, 1, 1, 0, -40
                    Z"
                    transform={`translate(${positions[nodeId].x} ${positions[nodeId].y})`}
                    onClick={(e) => {e.stopPropagation(); e.metaKey && (selectedNodes.length === 1) && dispatch(actions.addEdge(selectedNodes[0], nodeId))}}
                    onMouseDown={(e) => (e.stopPropagation(), setConnection(nodeId))}
                    fillRule="evenodd"
                    />
                 <NodeDragger d="M 0, 0
                    m 0, -15
                    a 15, 15, 0, 1, 0, 0, 30
                    a 15, 15, 0, 1, 0, 0, -30"
                    transform={`translate(${positions[nodeId].x} ${positions[nodeId].y})`}
                    onMouseDown={(e) => onNodePress && onNodePress(e, nodeId)}
                    onDoubleClick={(e) => (e.stopPropasgation(), dispatch(actions.deleteNode(nodeId)))}
                    fillRule="evenodd"
                    fill="#111"
                    />
                 </> : null}
                 {
                   (connection !== null ?
                    <NodeConnectorTarget d="M 0, 0
                    m 0, -40
                    a 40, 40, 0, 1, 0, 0, 80
                    a 40, 40, 0, 1, 0, 0, -80
                    Z"
                    transform={`translate(${positions[nodeId].x} ${positions[nodeId].y})`}
                    onMouseUp={(e) => dispatch(actions.addEdge(connection, nodeId))}
                    fillRule="evenodd"
                    fill="#111"
                    />
                    : null)
                }
            </Node>
        )}
    </>
}


export default () => {
	return <GraphEditor />
}

const GraphEditor = () => {
    const dispatch = useDispatch()
    const present = useSelector((state) => state.present)

    const [pressedNode, setPressedNode] = useState(null);

    return <Container onMouseUp={() => setPressedNode(null)}>
            <History />
            <Title>Graph</Title>
            <Menu />
            <Dump value={present} />
            <Canvas>
                <Graph
                    onNodePress={(e, nodeId) => (e.stopPropagation(), e.preventDefault(), setPressedNode(nodeId))}
                />
            </Canvas>
        </Container>;
}
