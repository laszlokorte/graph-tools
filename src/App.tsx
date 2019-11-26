import React from 'react';
import {useReducer, useRef, useMemo, useEffect, useContext, useCallback} from 'react';
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
    font-family: sans-serif;
	height: 100vh;
	width: 100vw;
	display: grid;
	grid-template-columns: 1fr 3fr;
	grid-template-rows: 3em 3fr 1fr;
	grid-template-areas: "a b" "c d" "c d";
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
    min-height: 10em;
    resize: none;
    overflow: hidden;
`


const Scroller = styled.div`
    overflow:scroll;
    grid-area: c;
`

const Padding = styled.div`
    padding: 0.5em;
`

const LinkList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    &>li {
        padding: 1px 0;
    }
`

const Link = styled.span`
    text-decoration: underline;
    cursor: pointer;
`
const BadgeLink = styled.span`
    text-decoration: none;
    cursor: pointer;
    background-color: #555;
    color: #fff;
    display: inline-block;
    padding: 0 5px;
    border-radius: 3px;
    line-height: 1.5;
    vertical-align: baseline;
    margin: 0 5px;
`

const Section = styled.div`
`;

const SectionTitle = styled.h2`
    padding: 6px;
    margin: 0;
    font-size: 1em;
    font-weight: normal;
    background: #444;
    color: #fff;
    position: sticky;
    top: 0;
`

const SubSectionTitle = styled.h3`
    padding: 6px 1px;
    margin: 0;
    font-size: 1em;
    font-weight: 600;
    color: #000;
`

const SubSubSectionTitle = styled.h4`
    padding: 1px;
    margin: 0.5em 0;
    font-size: 1em;
    font-weight: 400;
    border-bottom: 1px solid gray;
    color: #000;
`

const SectionBody = styled.div`
    padding: 0.5em;
`

const Toolbar = styled.div`
    display: flex;
    padding: 1px;
`
const ToolButton = styled.button`
    background: #333;
    color: #fff;
    font: inherit;
    margin: 1px;
    padding: 4px 10px;
    cursor: pointer;
    display: flex;
    align-content: center;
    align-items: center;
    border: none;

    :hover {
        background: #3f3f3f;
    }
    :disabled, [disabled],
    :disabled:active, [disabled]:active {
        background: #999;
        cursor: default;
    }
    :active {
        background: #222;
    }
`

const CheckboxList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
`

const DefinitionList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 4fr;
    grid-gap: 4px;
`

const NodeAttribute = ({nodeId, attrKey}) => {
    const dispatch = useDispatch()
    const value = useSelector(state => state.present.graph.attributes.nodes[attrKey][nodeId])
    const type = useSelector(state => state.present.graph.attributeTypes.nodes[attrKey].type)


    if(['text','color','numeric'].includes(type)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="text" value={value || ''} onChange={(evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))} /></dd>
        </>);
    } else {
        return (<>
            <dt>{attrKey}:</dt>
            <dd><input type={type} value={JSON.stringify(value)} readOnly /></dd>
        </>);
    }
}

const NodeDetails = ({nodeId}) => {
    const dispatch = useDispatch()

    const neighbours = useSelector(state => state.present.graph.nodes[nodeId])
    const attributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.nodes))


    const onClick = useCallback(() => dispatch(actions.deleteNode(nodeId)), [nodeId]);

    return <div>
        <SubSectionTitle>Node (#{nodeId})</SubSectionTitle>
        <button onClick={onClick}>Delete</button>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
            {attributes.map((attrKey) =>
                <NodeAttribute key={attrKey} nodeId={nodeId} attrKey={attrKey} />
            )}
        </DefinitionList>
        <SubSubSectionTitle>Neighbourhood</SubSubSectionTitle>
        <LinkList>
            {neighbours.map((neighbour, idx) =>
               neighbour === nodeId ?
                <li key={idx}><BadgeLink onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>↩</BadgeLink> self</li> :
                <li key={idx}><BadgeLink onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>→</BadgeLink><Link onClick={() => dispatch(actions.selectNode(neighbour))}>Node #{neighbour}</Link></li>
            )}
        </LinkList>
    </div>
}

const EdgeAttribute = ({nodeId, edgeIndex, attrKey}) => {
    const dispatch = useDispatch()
    const value = useSelector(state => state.present.graph.attributes.edges[attrKey][nodeId][edgeIndex])
    const type = useSelector(state => state.present.graph.attributeTypes.edges[attrKey].type)

    if(['text','color','numeric'].includes(type)) {
        return <>
            <dt>{attrKey}:</dt>
            <dd><input type={type} value={value||''} onChange={(evt) => dispatch(actions.setEdgeAttribute(nodeId, edgeIndex, attrKey, evt.target.value))} /></dd>
        </>
    } else {
        return <>
            <dt>{attrKey}:</dt>
            <dd><input type={type} value={JSON.stringify(value)} readOnly /></dd>
        </>
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
        <SubSectionTitle>Edge</SubSectionTitle>
        <DefinitionList>
        <dt>From</dt>
        <dd><Link onClick={() => dispatch(actions.selectNode(nodeId))}>Node #{nodeId}</Link></dd>
        <dt>To</dt>
        <dd><Link onClick={() => dispatch(actions.selectNode(target))}>Node #{target}</Link></dd>
        </DefinitionList>
        <button onClick={() => dispatch(actions.deleteEdge(nodeId, edgeIndex))}>Delete</button>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
        {attributes.map((attrKey) =>
            <EdgeAttribute key={attrKey} nodeId={nodeId} edgeIndex={edgeIndex} attrKey={attrKey} />
        )}
        </DefinitionList>
        {!flags.multiGraph ? null : <div>
            <SubSubSectionTitle>Partner Edges</SubSubSectionTitle>
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

    return <CheckboxList>
        {Object.keys(flags).map((flagKey) =>
            <li key={flagKey}>
                <label>
                    <input type="checkbox" onChange={(e) => dispatch(actions.setFlag(flagKey, e.target.checked))} checked={flags[flagKey]} /> {flagKey}
                </label>
            </li>
        )}
    </CheckboxList>
}

const ViewOptions = () => {
    const dispatch = useDispatch()

    const edgeAttributes = useSelector(state => state.present.graph.attributeTypes.edges)
    const nodeAttributes = useSelector(state => state.present.graph.attributeTypes.nodes)

    return <div>
        <SubSectionTitle>Visible Edge Attributes</SubSectionTitle>
        <CheckboxList>
            {Object.keys(edgeAttributes).map((attrKey) =>
                <li key={attrKey}>
                    <label>
                    <input type="checkbox" onChange={(e) => dispatch(actions.setEdgeAttributeVisible(attrKey, e.target.checked))} checked={edgeAttributes[attrKey].visible === true} /> {attrKey}
                    </label>
                </li>
            )}
        </CheckboxList>
        <SubSectionTitle>Visible Node Attributes</SubSectionTitle>
        <CheckboxList>
        {Object.keys(nodeAttributes).map((attrKey) =>
            <li key={attrKey}>
                <label>
                <input type="checkbox" onChange={(e) => dispatch(actions.setNodeAttributeVisible(attrKey, e.target.checked))} checked={nodeAttributes[attrKey].visible === true} /> {attrKey}
                </label>
            </li>
        )}
        </CheckboxList>
    </div>
}

const History = () => {
    const dispatch = useDispatch();
    const canUndo = useSelector(state => state.past.length > 0)
    const canRedo = useSelector(state => state.future.length > 0)

    const undo = useCallback(() => dispatch(ActionCreators.undo()), [])
    const redo = useCallback(() => dispatch(ActionCreators.redo()), [])
    const layout = useCallback(() => dispatch(actions.autoLayout()), [])

    return <Toolbar>
        <ToolButton disabled={!canUndo} onClick={undo}>↶</ToolButton>
        <ToolButton disabled={!canRedo} onClick={redo}>↷</ToolButton>
        <ToolButton onClick={layout}>Auto Layout</ToolButton>
    </Toolbar>
}

const Menu = () => {
    const dispatch = useDispatch();
    const present = useSelector((state) => state.present)
    const nodes = useSelector(state => state.present.selection.nodes)
    const edges = useSelector(state => state.present.selection.edges)
    const empty = useSelector(state => state.present.selection.edges.length < 1 && state.present.selection.nodes.length < 1)

    const properties = useSelector(state => state.present.properties)
    const algorithms = useSelector(state => state.present.algorithms)

    return <Scroller>
            <Section>
            <SectionTitle>Graph Options</SectionTitle>
            <SectionBody>
                <GraphOptions/>
            </SectionBody>
            </Section>


            <Section>
            <SectionTitle>View Options</SectionTitle>
            <SectionBody>
                <ViewOptions/>
            </SectionBody>
            </Section>

            <Section>
            <SectionTitle>Properties</SectionTitle>
            <SectionBody>
            <DefinitionList>
                {Object.keys(properties).map((prop) =>
                    <React.Fragment key={prop}>
                    <dt>{prop}</dt>
                    <dd>{properties[prop] === true ? 'true' : properties[prop] === false ? 'false' : properties[prop]}</dd>
                    </React.Fragment>
                )}
            </DefinitionList>
            </SectionBody>
            </Section>

            <Section>
            <SectionTitle>Algorithms</SectionTitle>
            <SectionBody>
            <DefinitionList>
                {Object.keys(algorithms).map((alg) =>
                    <React.Fragment key={alg}>
                    <dt>{alg}</dt>
                    <dd><Link onClick={() => dispatch(actions.runAlgorithm(alg))}>▶️</Link>{algorithms[alg].result === null ? null:algorithms[alg].result?"✅":"❌"}</dd>
                    </React.Fragment>
                )}
            </DefinitionList>
            </SectionBody>
            </Section>

            <Section>
            <SectionTitle>Selected</SectionTitle>
            <SectionBody>
            {nodes.map((nodeId) =>
                <NodeDetails key={nodeId} nodeId={nodeId} />)}
            {edges.map(([nodeId, edgeIndex]) =>
                <EdgeDetails key={nodeId + "-" + edgeIndex} nodeId={nodeId} edgeIndex={edgeIndex} />
            )}
            {empty ? <p>Nothing Selected</p> : null}
            </SectionBody>
            </Section>
            <Section>
                <SectionTitle>Dump</SectionTitle>
                <Dump value={present} />
            </Section>
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
                const ctm = ref.current.getScreenCTM();
                if(!ctm) {
                    return {x,y};
                }
                const result = point.matrixTransform(ctm.inverse());

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
  const wheel = evt.deltaY / -40
  return Math.pow(
    1 + Math.abs(wheel) / 2,
    wheel > 0 ? 1 : -1
  )
}

const CanvasContext = React.createContext(({x,y}) => ({x,y}));
const useCanvasPos = () => {
    return useContext(CanvasContext);
}

const softClamp = (val, newVal, min, max) => {
    if(newVal > max && val > max) {
        return Math.min(newVal, val);
    } else if(newVal < min && val < min) {
        return Math.max(newVal, val);
    } else {
        return Math.min(Math.max(min, newVal), max);
    }
}

const clamp = (val, min, max) => {
    return Math.min(Math.max(min, val), max);
}

const cameraReducer = (camera, action) => {
    const bounds = camera.bounds;

    switch(action.type) {
        case 'clamp':
            return {
                ...camera,
                bounds: {
                    minX: action.box.minX,
                    maxX: action.box.maxX,
                    minY: action.box.minY,
                    maxY: action.box.maxY,
                    defaultZoom: Math.min(
                      action.screen.width/(action.box.maxX - action.box.minX),
                      action.screen.height/(action.box.maxY - action.box.minY),
                      20
                    ),
                    minZoom: Math.min(
                      action.screen.width / (action.box.maxX - action.box.minX),
                      action.screen.height / (action.box.maxY - action.box.minY),
                      0.8
                    ),
                    maxZoom: 6,
                },
            };
        case 'zoom':
            const newZoom = softClamp(camera.zoom, camera.zoom * action.factor, bounds.minZoom, bounds.maxZoom)
            const realFactor = newZoom / camera.zoom;
            const panFactor = 1 - 1 / realFactor;

            const newX = softClamp(camera.center.x, camera.center.x + (action.pivot.x - camera.center.x) * panFactor, bounds.minX, bounds.maxX)
            const newY = softClamp(camera.center.y, camera.center.y + (action.pivot.y - camera.center.y) * panFactor, bounds.minY, bounds.maxY)

            return {
              ...camera,
              zoom: newZoom,
              center: {
                  ...camera.center,
                  x: newX,
                  y: newY,
              },
            };
        case 'jumpZoom': {
            if(camera.rotation != 0) {
                return cameraReducer(camera, {type: 'reset'})
            } else if(Math.abs(camera.zoom / camera.bounds.defaultZoom) < 1.05) {
                return cameraReducer(camera, {type:'zoom', pivot: action.pivot, factor: camera.bounds.maxZoom / 2})
            } else {
                return cameraReducer(camera, {type: 'reset'})
                //cameraReducer(camera, {typ:'zoom', pivot:action.pivot,factor:bounds.defaultZoom / camera.zoom})
            }
        }
        case 'rotate':
            const pivot = action.pivot;
            const deltaAngle = action.deltaAngle;
            const dx = camera.center.x - pivot.x;
            const dy = camera.center.y - pivot.y;
            const rad = Math.PI * deltaAngle / 180;
            const sin = Math.sin(-rad)
            const cos = Math.cos(-rad)

            return {
              ...camera,
              center: {
                  ...camera.center,
                  x: pivot.x + cos * dx - sin * dy, //softClamp(camera.center.x, , bounds.minX, bounds.maxX),
                  y: pivot.y + sin * dx + cos * dy, //softClamp(camera.center.y, , bounds.minY, bounds.maxY),
              },
              rotation: (camera.rotation + deltaAngle) % 360,
            };
        case 'pan': {
            const sin = Math.sin(camera.rotation * Math.PI / 180)
            const cos = Math.cos(camera.rotation * Math.PI / 180)
            const dx = (cos * action.deltaX + sin * action.deltaY)  / camera.zoom
            const dy = (-sin * action.deltaX + cos * action.deltaY) / camera.zoom
            return {
              ...camera,
                center: {
                    ...camera.center,
                    x: softClamp(camera.center.x, camera.center.x + dx, bounds.minX, bounds.maxX),
                    y: softClamp(camera.center.y, camera.center.y + dy, bounds.minY, bounds.maxY),
                },
            }
        }
        case 'reset':
            return {
                ...camera,
                center: {
                    ...camera.center,
                    x: (bounds.minX + bounds.maxX) / 2,
                    y: (bounds.minY + bounds.maxY) / 2,
                },
                rotation: 0,
                zoom: bounds.defaultZoom,
            }
        case 'startPan':
            return {
                ...camera,
                panX: action.x,
                panY: action.y,
            }
        case 'stopPan':
            return {
                ...camera,
                panX: null,
                panY: null,
            }
        case 'movePan':
            if(camera.panX === null || camera.panY === null) {
                return camera;
            }
            const deltaX = action.x - camera.panX;
            const deltaY = action.y - camera.panY;
            return {
              ...camera,
                center: {
                    ...camera.center,
                    x: softClamp(camera.center.x, camera.center.x - deltaX, bounds.minX, bounds.maxX),
                    y: softClamp(camera.center.y, camera.center.y - deltaY, bounds.minY, bounds.maxY),
                },
            }

    }
    return camera;
}

const Canvas = ({children, box}) => {
    const screenRef = useRef();
    const screen = useSize(screenRef, 100, 100);
    const posRef = useRef();
    const svgPos = useSVGPosition(posRef);

    const [camera, dispatchCamera] = useReducer(cameraReducer, {
        center: {x: 0, y:0},
        rotation: 0,
        zoom: 1,
        bounds: {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
            defaultZoom: 1,
            minZoom: 1,
            maxZoom: 1,
        },
        panX: null,
        panY: null,
    })

    const bounds = useEffect(() => dispatchCamera({
        type: 'clamp',
        box, screen,
    }), [box, screen]);

    const viewBox = viewboxString(bounds, screen, camera);

    const onMouseMoveHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

        dispatchCamera({type: 'movePan', ...pos})
    }, [svgPos])

    const onClickHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

    }, [svgPos])

     const onDoubleClickHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})


        dispatchCamera({type: 'jumpZoom', pivot: pos})
    }, [svgPos])

    const onMouseDownHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

        e.preventDefault();
        e.stopPropagation();
        dispatchCamera({type: 'startPan', ...pos})
    }, [svgPos])

    const onMouseUpHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

        e.preventDefault();

        dispatchCamera({type: 'stopPan'})
    }, [svgPos])

    const onWheelHandler = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        const pivot = svgPos({x: e.clientX, y: e.clientY})
        const factor = wheelFactor(e);

        if(e.shiftKey) {
            dispatchCamera({type: 'pan', deltaX: e.deltaX, deltaY: e.deltaY})
        } else if(e.altKey) {
            dispatchCamera({type: 'rotate', pivot, deltaAngle: 10 * Math.log2(factor)})
        } else {
            dispatchCamera({type: 'zoom', pivot, factor})
        }
    }, [svgPos])

    const [left,top,width,height] = viewBox.split(' ');

    useEffect(() => {
        window.addEventListener('mouseup', onMouseUpHandler);

        return () => {
            window.removeEventListener('mouseup', onMouseUpHandler);
        }
    },[onMouseUpHandler])

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMoveHandler);

        return () => {
            window.removeEventListener('mousemove', onMouseMoveHandler);
        }
    },[onMouseMoveHandler])

    useEffect(() => {
        const c = screenRef.current;

        c.addEventListener('wheel', onWheelHandler, { passive: false });

        return () => {
            c.removeEventListener('wheel', onWheelHandler, { passive: false });
        }
    },[onWheelHandler, screenRef])

	return <Svg
        ref={screenRef}
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
                x={camera.bounds.minX}
                y={camera.bounds.minY}
                width={camera.bounds.maxX - camera.bounds.minX}
                height={camera.bounds.maxY - camera.bounds.minY}
                fill="#fff" />
			{children}
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
	pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
`

const EdgeSelection = styled.path`
	fill: none;
    pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 6;
`

const EdgeLabel = styled.text`
	cursor: default;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const EdgeLabelSelection = styled.text`
	cursor: default;
    pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
    stroke: ${({selected}) => selected ? '#1EE7E7' : 'none'};
	stroke-width: 4;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const ArrowHead = styled.polygon`
	fill: currentColor;
    pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
`

const ArrowHeadSelection = styled.polygon`
    pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
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
    fill: ${p => p.snapped ? '#FD9B1C' : p.active ? '#6EAEAE':'#84DBDB'};
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

const EdgeHead = ({x,y, angle, selected = false, disabled = false}) => {
	const size = 12
	const spike = 0.25 * Math.PI / 2;
	const a = `${x},${y}`;
	const b = `${x+size*Math.sin(angle-spike-Math.PI/2)},${y-size*Math.cos(angle-spike-Math.PI/2)}`;
	const c = `${x+size*Math.sin(angle+spike-Math.PI/2)},${y-size*Math.cos(angle+spike-Math.PI/2)}`;
	return <>
        <ArrowHeadSelection disabled={disabled} selected={selected} points={`${a} ${b} ${c}`} />
		<ArrowHead disabled={disabled} points={`${a} ${b} ${c}`} />
	</>
}

const Node = ({x, y, nodeType = 'circle', nodeId, label, selected = false, style = {}, labelStyle = {}, onClick = null, onDoubleClick = null}) => {
    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId)
    } : null, [nodeId, onClick]);

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId)
    } : null, [nodeId, onDoubleClick]);

    return <g onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
		{nodeType === 'circle' ?
			<NodeCircleSelection selected={selected} cx={x} cy={y} r={20} /> :
			<NodeBoxSelection selected={selected} x={x - 17} y={y - 17} width={34} height={34} />
		}
		<g style={style}>
		{nodeType === 'circle' ?
			<NodeCircle cx={x} cy={y} r={20} /> :
			<NodeBox x={x - 17} y={y - 17} width={34} height={34} />
		}
        <NodeId x={x} y={y}>#{nodeId}</NodeId>
		</g>
		<NodeLabelSelection selected={selected} x={x} y={y+20} dy="0.6em">{label}</NodeLabelSelection>
		<NodeLabel x={x} y={y+20} dy="0.6em" style={labelStyle}>{label}</NodeLabel>
	</g>
}

const Edge = ({nodeId, edgeIndex = null, x0,y0,x1,y1,label=null, selected = false, onClick = null, onDoubleClick = null, style = null, labelStyle = null, directed = true, disabled=false}) => {
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

    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onClick])

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onDoubleClick])

	return <g onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
		<EdgeSelection disabled={disabled} selected={selected} d={`M${x1},${y1} C${cbX},${cbY} ${caX},${caY} ${x0},${y0}`} />
		<g style={style}>
        {directed ?
            <EdgeHead disabled={disabled} x={x1} y={y1} angle={headAngle} selected={selected} />
            :null
        }
        <EdgeLine disabled={disabled} d={`M${x0},${y0} C${caX},${caY} ${cbX},${cbY} ${x1},${y1}`} />
        </g>
		{!label ? null : <>
		<EdgeLabelSelection disabled={disabled} selected={selected} orientation={orientation} x={textX} y={textY}>{label.split('<br>').map((l,i) => <tspan key={i} fontSize="10"> {l} </tspan>)}</EdgeLabelSelection>
        <EdgeLabel disabled={disabled} orientation={orientation} x={textX} y={textY} labelStyle={labelStyle}>{label.split('<br>').map((l,i) => <tspan key={i} fontSize="10"> {l} </tspan>)}</EdgeLabel>
        </>}
	</g>
}

const ReflexiveEdge = ({nodeId, edgeIndex, x, y, label, angle = 0, selected = false, onClick = null, onDoubleClick = null, style = null}) =>
	<Edge
        nodeId={nodeId}
        edgeIndex={edgeIndex}
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

const NodeEdge = ({nodeId, edgeIndex, x0, y0, x1, y1, label, selected = false, onClick = null, onDoubleClick = null, style = null, directed = true}) => {
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
        nodeId={nodeId}
        edgeIndex={edgeIndex}
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

const NewEdge = ({nodeId, x0, y0, x1, y1, directed = true,offset=false}) => {
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
        nodeId={nodeId}
        x0={x0 + 20 * cDirXNorm}
        y0={y0 + 20 * cDirYNorm}
        x1={x1 + (offset ? 20 * cDirXNormr : 0)}
        y1={y1 + (offset ? 20 * cDirYNormr : 0)}
        style={{strokeDasharray: "10 10"}}
        disabled={true}
        directed={directed}
    />
}

const NodeManipulator = ({x,y,nodeId,snapped=false,active=false,onClick,onDoubleClick, mouseDownConnect=null,mouseDownMove = null,mouseMove,mouseLeave}) => {
    const mouseDownConnectCallback = useCallback(mouseDownConnect ? (evt) => {
        mouseDownConnect(evt, nodeId, x, y)
    } : null, [nodeId, mouseDownConnect, x, y])

    const mouseDownMoveCallback = useCallback(mouseDownMove ? (evt) => {
        mouseDownMove(evt, nodeId, x, y)
    } : null, [nodeId, mouseDownMove, x, y])

    const mouseMoveCallback = useCallback(mouseMove ? (evt) => {
        mouseMove(evt, nodeId)
    } : null, [nodeId, mouseMove])

    const mouseLeaveCallback = useCallback(mouseLeave ? (evt) => {
        mouseLeave(evt, nodeId)
    } : null, [nodeId, mouseLeave])


    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId)
    } : null, [nodeId, onClick])

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId)
    } : null, [nodeId, onDoubleClick])

    return <g
            onMouseMove={mouseMoveCallback}
            onMouseLeave={mouseLeaveCallback}>
        <NodeConnector d="M 0, 0
            m 0, -40
            a 40, 40, 0, 1, 0, 0, 80
            a 40, 40, 0, 1, 0, 0, -80
            Z"
            transform={`translate(${x} ${y})`}
            onMouseDown={mouseDownConnectCallback}
            fillRule="evenodd"
            snapped={snapped}
            active={active}
            />
         <NodeDragger d="M 0, 0
            m 0, -15
            a 15, 15, 0, 1, 0, 0, 30
            a 15, 15, 0, 1, 0, 0, -30"
            transform={`translate(${x} ${y})`}
            onMouseDown={mouseDownMoveCallback}
            onClick={onClickCallback}
            onDoubleClick={onDoubleClickCallback}
            fillRule="evenodd"
            fill="#111"
            />
    </g>
}

const manipulationReducer = (state, action) => {
    switch(action.type) {
        case 'stop':
            if(state.connectionStart !== null && state.connectionSnap !== null) {
                action.dispatch(actions.addEdge(state.connectionStart, state.connectionSnap))
            } else if(state.connectionStart !== null) {
                action.dispatch(actions.createNode(state.x+state.offsetX, state.y+state.offsetY, state.connectionStart))
            }
            if(state.movingNode !== null) {
                action.dispatch(actions.setNodeAttribute(state.movingNode, 'position', {x:state.x+state.offsetX, y:state.y+state.offsetY}))
            }

            return {
                connectionStart: null,
                connectionSnap: null,
                x: null,
                y: null,
                offsetX: 0,
                offsetY: 0,
                movingNode: null,
            };
        case 'move':
            if(state.connectionStart!==null || state.movingNode !== null) {
                return {
                    ...state,
                    x: action.x,
                    y: action.y,
                }
            } else {
                return state;
            }
        case 'startConnect':
            return {
                ...state,
                connectionStart: action.nodeId,
                x: action.x,
                y: action.y,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
                connectionSnap:null,
            }
        case 'snapConnect':
            if(state.connectionStart === null) {
                return state;
            }
            return {
                ...state,
                x: null,
                y: null,
                connectionSnap:action.nodeId,
            }
        case 'unsnapConnect':
            if(state.connectionStart === null) {
                return state;
            }
            return {
                ...state,
                x: action.x,
                y: action.y,
                connectionSnap:null,
            }
        case 'startMove':
            return {
                ...state,
                x: action.x,
                y: action.y,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
                movingNode: action.nodeId,
            }
    }
    return state;
}

const GraphManipulator = ({box}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)

    const [manipulation, dispatchManipulation] = useReducer(manipulationReducer, {
        connectionStart: null,
        connectionSnap: null,
        x: null,
        y: null,
        movingNode: null,
        offsetX: 0,
        offsetY: 0,
    });

    const onMouseUp = useCallback((evt) => {
        dispatchManipulation({type: 'stop', dispatch})
    }, [dispatchManipulation]);

    useEffect(() => {
        const prevMouseUp = onMouseUp
        window.addEventListener('mouseup', prevMouseUp)

        return () => {
            window.removeEventListener('mouseup', prevMouseUp)
        }
    }, [onMouseUp]);

    const onMouseMove =  useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});
        dispatchManipulation({type: 'move', ...pos, dispatch})
    }, [canvasPos, dispatch])


    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
        }
    }, [onMouseMove]);

    const connectStart = useCallback((evt, nodeId, cx, cy) => {
        evt.stopPropagation();
        evt.preventDefault();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatchManipulation({type: 'startConnect', ...pos, nodeId, offsetX: cx - pos.x, offsetY: cy - pos.y,})
    }, [dispatchManipulation, canvasPos]);

    const snap = useCallback((evt, nodeId) => {
        dispatchManipulation({type: 'snapConnect', nodeId})
    }, [dispatchManipulation]);

    const unsnap = useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});
        dispatchManipulation({type: 'unsnapConnect', ...pos})
    }, [canvasPos,dispatchManipulation]);

    const moveStart = useCallback((evt, nodeId, cx, cy) => {
        evt.preventDefault();
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatchManipulation({type: 'startMove', nodeId, ...pos, offsetX: cx - pos.x, offsetY: cy - pos.y,})
    }, [canvasPos, dispatchManipulation]);

    const selectNode = useCallback((evt, nodeId) => {
        evt.stopPropagation();
        dispatch(actions.selectNode(nodeId, evt.shiftKey));
    }, [dispatch])

    const selectEdge = useCallback((evt, nodeId, edgeIndex) => {
        evt.stopPropagation();
        dispatch(actions.selectEdge(nodeId, edgeIndex, evt.shiftKey));
    }, [dispatch])

    const deleteEdge = useCallback((evt, nodeId, edgeIndex) => {
        evt.stopPropagation();
        dispatch(actions.deleteEdge(nodeId, edgeIndex));
    }, [dispatch])

    const deleteNode = useCallback((evt, nodeId) => {
        evt.stopPropagation();
        dispatch(actions.deleteNode(nodeId));
    }, [dispatch])
    return <g>
        <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" />
        {nodes.map((neighbors, nodeId) =>
            <NodeManipulator
                key={nodeId}
                nodeId={nodeId}
                x={manipulation.movingNode === nodeId ? (manipulation.x + manipulation.offsetX) : positions[nodeId].x}
                y={manipulation.movingNode === nodeId ? (manipulation.y + manipulation.offsetY) : positions[nodeId].y}
                mouseDownConnect={connectStart}
                mouseDownMove={moveStart}
                mouseMove={snap}
                mouseLeave={unsnap}
                active={nodeId === manipulation.connectionStart}
                snapped={nodeId === manipulation.connectionSnap}
                onClick={selectNode}
                onDoubleClick={deleteNode} />
        )}
        {manipulation.connectionStart === null ? null : manipulation.connectionSnap !== null ?

            <NewEdge
                    nodeId={0}
                    x0={positions[manipulation.connectionStart].x}
                    y0={positions[manipulation.connectionStart].y}
                    x1={positions[manipulation.connectionSnap].x}
                    y1={positions[manipulation.connectionSnap].y}
                    directed={flags.directed}
                    offset={true}
                />
         :
            <NewEdge
                    nodeId={manipulation.connectionStart}
                    x0={positions[manipulation.connectionStart].x}
                    y0={positions[manipulation.connectionStart].y}
                    x1={manipulation.x}
                    y1={manipulation.y}
                    directed={flags.directed}
                />
        }
    </g>
}

const Graph = ({box}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)
    const nodeLabels = useSelector(state => state.present.graph.attributes.nodes.label)
    const nodeColors = useSelector(state => state.present.graph.attributes.nodes.color)
    const visibleEdgeAttributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.edges).filter((e) => state.present.graph.attributeTypes.edges[e].visible))
    const visibleNodeAttributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.nodes).filter((n) => state.present.graph.attributeTypes.nodes[n].visible))

    const edgeAttributes = useSelector(state => state.present.graph.attributes.edges)
    const nodeAttributes = useSelector(state => state.present.graph.attributes.nodes)

    const selectNode = useCallback((evt, nodeId) => {
        evt.stopPropagation();
        dispatch(actions.selectNode(nodeId, evt.shiftKey));
    }, [dispatch])

    const selectEdge = useCallback((evt, nodeId, edgeIndex) => {
        evt.stopPropagation();
        dispatch(actions.selectEdge(nodeId, edgeIndex, evt.shiftKey));
    }, [dispatch])

    const deleteEdge = useCallback((evt, nodeId, edgeIndex) => {
        evt.stopPropagation();
        dispatch(actions.deleteEdge(nodeId, edgeIndex));
    }, [dispatch])

    const deleteNode = useCallback((evt, nodeId) => {
        evt.stopPropagation();
        dispatch(actions.deleteNode(nodeId));
    }, [dispatch])



    const onClick = useCallback((evt) => {
        if(evt.metaKey || evt.ctrlKey) {
            const {x,y} = canvasPos({x: evt.clientX, y: evt.clientY});
            dispatch(actions.createNode(x,y));
        }
    }, [canvasPos, dispatch])


    return <g onClick={onClick}>
        <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="white" />
        {nodes.map((neighbors, nodeId) => {
            const nodeLabel = visibleNodeAttributes.map((attr) => nodeAttributes[attr][nodeId]).filter(x=>x).join(', ');

            return <Node
                key={nodeId}
                nodeId={nodeId}
                selected={selectedNodes.includes(nodeId)}
                x={positions[nodeId].x}
                y={positions[nodeId].y}
                label={nodeLabel}
                style={{color: null && nodeColors[nodeId]}}
                onClick={selectNode}
                onDoubleClick={deleteNode}
            />
        }

        )}
        {nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                const edgeLabel = visibleEdgeAttributes.map((attr) => edgeAttributes[attr][nodeId][edgeIdx]).filter(x=>x).join(', ');

                return nodeId===neighbourId ?
                    <ReflexiveEdge
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        angle={Math.PI/1}
                        x={positions[nodeId].x}
                        y={positions[nodeId].y}
                        label={edgeLabel}
                        selected={selectedEdges.some(([s,t]) => s===nodeId && t === edgeIdx)}
                        onClick={selectEdge}
                        onDoubleClick={deleteEdge}
                    /> :
                    <NodeEdge
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        x0={positions[nodeId].x}
                        y0={positions[nodeId].y}
                        x1={positions[neighbourId].x}
                        y1={positions[neighbourId].y}
                        label={edgeLabel}
                        selected={selectedEdges.some(([s,t]) => s===nodeId && t === edgeIdx)}
                        onClick={selectEdge}
                        onDoubleClick={deleteEdge}
                        directed={flags.directed}
                    />;
            })
        )}
    </g>
}


export default () => {
	return <GraphEditor />
}

const GraphEditor = () => {
    const dispatch = useDispatch()
    const present = useSelector((state) => state.present)

    const margin = 100;
    const box = useMemo(() =>
        present.graph.attributes.nodes.position.reduce((acc, p) => ({
            minX: Math.min(acc.minX + margin, p.x) - margin,
            maxX: Math.max(acc.maxX - margin, p.x) + margin,
            minY: Math.min(acc.minY + margin, p.y) - margin,
            maxY: Math.max(acc.maxY - margin, p.y) + margin,
        }), ({
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
        }))
    , [present.graph]);

    return <Container>
            <History />
            <Title>Graph</Title>
            <Menu />
            <Canvas box={box}>
                <Graph
                    box={box}
                />
                <GraphManipulator
                    box={box}
                />
            </Canvas>
        </Container>;
}
