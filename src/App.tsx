import * as React from 'react';
import {useReducer, useRef, useMemo, useEffect, useContext, useCallback, useState} from 'react';
import styled from 'styled-components';
import { useSize } from './react-hook-size';

import { useSelector, useDispatch } from 'react-redux'
import { ActionCreators } from 'redux-undo';

import {ALGORITHMS} from './reducers/algorithm/index';

import * as actions from './actions'

const Title = styled.h1`
    margin: 0;
    padding: 0;
    grid-column: 1 / 2;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: normal;
    padding: 0 0.3em;
    font-size: 1.3em;
    background: #333;
    color: #ccc;
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
    background: #fff;
    color: #111;
    font-size: 1.2em;
    min-height: 10em;
    resize: none;
`


const Scroller = styled.div`
    overflow-y:scroll;
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
    background: #444;
    padding: 1px;
    align-items: stretch;
    grid-column: 2 / -1;
`

const ToolbarSection = styled.div`
    display: flex;
    padding: 1px;
    align-items: center;
    justify-content: flex-start;
    padding: 0 0.5em;
    background: #222;
    color: #fff;
    margin: 1px;
`

const ToolbarForm = styled.form`
    display: flex;
    padding: 1px;
    align-items: center;
    justify-content: flex-start;
    padding: 0 0.5em;
    background: #222;
    color: #fff;
    margin: 1px;
`

const ToolButton = styled.button`
    background: #222;
    color: #fff;
    font: inherit;
    margin: 1px;
    padding: 4px 10px;
    cursor: pointer;
    display: flex;
    align-content: center;
    align-items: center;
    align-self: stretch;
    border: none;

    :hover {
        background: #333;
    }
    :disabled, [disabled],
    :disabled:active, [disabled]:active {
        background: #303030;
        color: #999;
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

const PlainButton = styled.button`
    background: inherit;
    color: inherit;
    border: none;
    padding: 0;
    margin: 0;
    font-size: inherit;
    cursor: pointer;
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
    } else if(['boolean'].includes(type)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={value===true} onChange={(evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.checked))} /></dd>
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
            <dd><input type={type} value={value+''} onChange={(evt) => dispatch(actions.setEdgeAttribute(nodeId, edgeIndex, attrKey, evt.target.value))} /></dd>
        </>
    } else if(['boolean'].includes(type)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={value===true} onChange={(evt) => dispatch(actions.setEdgeAttribute(nodeId, edgeIndex, attrKey, evt.target.checked))} /></dd>
        </>);
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
        <button onClick={() => dispatch(actions.deleteEdge(nodeId, edgeIndex))}>Delete</button>
        <DefinitionList>
        <dt>From</dt>
        <dd><Link onClick={() => dispatch(actions.selectNode(nodeId))}>Node #{nodeId}</Link></dd>
        <dt>To</dt>
        <dd><Link onClick={() => dispatch(actions.selectNode(target))}>Node #{target}</Link></dd>
        </DefinitionList>
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

const Tools = ({tools, currentTool, onSelectTool}) => {
    const dispatch = useDispatch();
    const canUndo = useSelector(state => state.past.length > 0)
    const canRedo = useSelector(state => state.future.length > 0)

    const undo = useCallback(() => dispatch(ActionCreators.undo()), [])
    const redo = useCallback(() => dispatch(ActionCreators.redo()), [])
    const layout = useCallback(() => dispatch(actions.autoLayout()), [])
    const clear = useCallback(() => dispatch(actions.clearGraph()), [])
    const clearEdges = useCallback(() => dispatch(actions.clearGraphEdges()), [])

    return <Toolbar>
        <ToolButton disabled={!canUndo} onClick={undo}>↶</ToolButton>
        <ToolButton disabled={!canRedo} onClick={redo}>↷</ToolButton>
        <ToolButton onClick={clear}>Clear</ToolButton>
        <ToolButton onClick={clearEdges}>Clear Edges</ToolButton>
        <ToolButton onClick={layout}>Auto Layout</ToolButton>
        {tools.map((t) =>
            <ToolButton key={t} disabled={t===currentTool} onClick={() => onSelectTool(t)}>{t}</ToolButton>
        )}
        <AlgorithmRunner />
    </Toolbar>
}

const meetRequirements = (alg, graph) => {
    return !alg.requirements || Object.entries(alg.requirements).every(([k,v]) => {
        return graph.flags[k] === v;
    })
}

const castAlgorithmParameter = (parameter, value) => {
    if(value === '') {
        return null;
    }
    switch(parameter.type) {
        case 'NODE':
            return parseInt(value, 10);
    }

    return value;
}

const AlgorithmOptions = ({algorithm}) => {
    const dispatch = useDispatch();
    const graph = useSelector(state => state.present.graph)
    const alg = ALGORITHMS.find((a) => a.key === algorithm)
    const canRun = alg !== null && meetRequirements(alg, graph)
    const nodes = useSelector(state => state.present.graph.nodes)
    const edgeAttributes = useSelector(state => state.present.graph.attributeTypes.edges)
    const nodeAttributes = useSelector(state => state.present.graph.attributeTypes.edges)

    const run = useCallback((evt) => {
        evt.preventDefault();
        const formData = new FormData(evt.currentTarget);
        const parameters = Object.keys(alg.parameters).reduce((memo, k) => ({
          ...memo,
          [k]: castAlgorithmParameter(alg.parameters[k], formData.get(k)),
        }), {});

        dispatch(actions.runAlgorithm(alg.key, parameters))
    }, [dispatch, alg])

    return <ToolbarSection>
        <ToolbarForm onSubmit={run}>
        {Object.keys(alg.parameters).map((p) => {
            switch(alg.parameters[p].type) {
                case 'NODE': {
                    return <label key={algorithm+p}>
                        {alg.parameters[p].label}:<br/>
                        <select defaultValue={''} name={p}>
                            {alg.parameters[p].required ? null : <option value="">---</option>}
                            {nodes.map((_,nodeIdx) => <option key={nodeIdx} value={nodeIdx}>#{nodeIdx}</option>)}
                        </select>
                    </label>
                }
                case 'NODE_ATTRIBUTE': {
                    return <label key={algorithm+p}>
                        {alg.parameters[p].label}:<br/>
                        <select defaultValue={''} name={p}>
                            {alg.parameters[p].required ? null : <option value="">---</option>}
                            {Object.keys(nodeAttributes).filter((attr) =>
                                !alg.parameters[p].typeRequirement || alg.parameters[p].typeRequirement.includes(nodeAttributes[attr].type)
                            ).map((attr) => <option value={attr} key={attr}>{attr}</option>)}
                        </select>
                    </label>
                }
                case 'EDGE_ATTRIBUTE': {
                    return <label key={algorithm+p}>
                        {alg.parameters[p].label}:<br/>
                        <select defaultValue={''} name={p}>
                            {alg.parameters[p].required ? null : <option value="">---</option>}
                            {Object.keys(edgeAttributes).filter((attr) =>
                                !alg.parameters[p].typeRequirement || alg.parameters[p].typeRequirement.includes(edgeAttributes[attr].type)
                            ).map((attr) => <option value={attr} key={attr}>{attr}</option>)}
                        </select>
                    </label>
                }
            }

            return '?';
        })}
        {!canRun ? null : <ToolButton>▶️</ToolButton>}
        </ToolbarForm>
    </ToolbarSection>
}

const AlgorithmRunner = () => {
    const dispatch = useDispatch();
    const selectBox = useRef();
    const algorithmType = useSelector(state => state.present.algorithm.type)
    const flags = useSelector(state => state.present.graph.flags)
    const [alg, setAlg] = useState(ALGORITHMS[0].key);

    const run = useCallback(() => {
        const el : HTMLSelectElement = selectBox.current
        dispatch(actions.runAlgorithm(el.value, {}))
    }, [dispatch, selectBox])

    const selectAlg = useCallback((evt) => {
        const el : HTMLSelectElement = selectBox.current
        setAlg(el.value)
    }, [setAlg])

    useEffect(() => {
        if(algorithmType) {
            setAlg(algorithmType)
        }
    }, [algorithmType])

    const applicableAlgorithms = ALGORITHMS.filter((alg) => {
        return !alg.requirements || Object.entries(alg.requirements).every(([k,v]) => {
            return flags[k] === v;
        })
    })

    return <ToolbarSection>
        <div>
            <span>Run Algorithm:</span><br/>
            <select value={alg} onChange={selectAlg} ref={selectBox}>
                {applicableAlgorithms.map((a) =>
                    <option key={a.key} value={a.key}>{a.name}</option>
                )}
            </select>
        </div>
        <AlgorithmOptions algorithm={alg} />
        {alg !== algorithmType ? null : <AlgorithmResult />}
    </ToolbarSection>
}

const AlgorithmResult = () => {
    const dispatch = useDispatch();
    const algorithm = useSelector(state => state.present.algorithm)


    const stepFoward = useCallback(() => {
        dispatch(actions.stepAlgorithm(1))
    }, [dispatch]);

    const stepBackward = useCallback(() => {
        dispatch(actions.stepAlgorithm(-1))
    }, [dispatch]);

    if(algorithm.result === null) {
        return null;
    } else if (algorithm.result.steps) {
        return <div style={{textAlign: 'center'}}>
            {algorithm.focus + 1}/{algorithm.result.steps.length}
            <br/>
            <PlainButton onClick={stepBackward}>⏪</PlainButton>
            <PlainButton onClick={stepFoward}>⏩</PlainButton>
        </div>;
    } else {
        return <div>❌</div>;
    }
}

const Menu = () => {
    const dispatch = useDispatch();
    const present = useSelector((state) => state.present)
    const nodes = useSelector(state => state.present.selection.nodes)
    const edges = useSelector(state => state.present.selection.edges)
    const empty = useSelector(state => state.present.selection.edges.length < 1 && state.present.selection.nodes.length < 1)

    const properties = useSelector(state => state.present.properties)

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

const CameraContext = React.createContext(null);
const useCamera = () => {
    return useContext(CameraContext);
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
    const cameraRef = useRef();
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

    useEffect(() => {
        cameraRef.current = camera;
    }, [camera])

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
        const c : HTMLElement = screenRef.current;

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
                <CameraContext.Provider value={cameraRef}>
                <rect
                    x={camera.bounds.minX}
                    y={camera.bounds.minY}
                    width={camera.bounds.maxX - camera.bounds.minX}
                    height={camera.bounds.maxY - camera.bounds.minY}
                    fill="#fff" />
    			{children}
                </CameraContext.Provider>
            </CanvasContext.Provider>
		</g>
	</Svg>;
}

const NodeCircle = styled.circle`
    fill:#eee;
    stroke:currentColor;
    stroke-width: 1;
`

const NewNodeCircle = styled.circle`
    fill:#eee;
    stroke:currentColor;
    stroke-width: 1;
    stroke-dasharray: 3 3;
    opacity: 0.5;
`

const NodeBox = styled.rect`
	fill:#eee;
	stroke:currentColor;
	stroke-width: 1;
`

const NodeCircleSelection = styled.circle`
	fill: none;
	pointer-events: none;
    stroke: #37B1F6;
    opacity: 0.6;
	stroke-width: 6;
`

const NodeBoxSelection = styled.rect`
	fill: none;
    pointer-events: none;
    stroke: #37B1F6;
    opacity: 0.6;
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
    pointer-events: none;
    stroke: #37B1F6;
    opacity: 0.6;
	stroke-width: 4;
`

const EdgeLine = styled.path`
	fill: none;
	stroke:currentColor;
	stroke-width: 1;
	pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
`

const EdgeSelectionLine = styled.path`
	fill: none;
    pointer-events: none;
    stroke: #37B1F6;
    opacity: 0.6;
	stroke-width: 6;
`

const EdgeLabel = styled.text`
	cursor: default;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const EdgeLabelSelection = styled.text`
	cursor: default;
    pointer-events: none;
    stroke: #37B1F6;
    opacity: 0.6;
	stroke-width: 4;
	text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
	dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const ArrowHead = styled.polygon`
	fill: currentColor;
    pointer-events: ${({disabled}) => disabled ? 'none':'stroke'};
`

const ArrowHeadSelection = styled.polygon`
    pointer-events: none;
    stroke: #37B1F6;
    opacity: 0.6;
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

const EdgeHead = ({x,y, angle, disabled = false}) => {
	const size = 12
	const spike = 0.25 * Math.PI / 2;
	const a = `${x},${y}`;
	const b = `${x+size*Math.sin(angle-spike-Math.PI/2)},${y-size*Math.cos(angle-spike-Math.PI/2)}`;
	const c = `${x+size*Math.sin(angle+spike-Math.PI/2)},${y-size*Math.cos(angle+spike-Math.PI/2)}`;
	return <>
		<ArrowHead disabled={disabled} points={`${a} ${b} ${c}`} />
	</>
}

const Node = ({x, y, nodeType = 'circle', nodeId, selected = false, style = {}, labelStyle = {}, onClick = null, onDoubleClick = null}) => {
    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId)
    } : null, [nodeId, onClick]);

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId)
    } : null, [nodeId, onDoubleClick]);

    return <g style={style} onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
		{nodeType === 'circle' ?
			<NodeCircle cx={x} cy={y} r={20} /> :
			<NodeBox x={x - 17} y={y - 17} width={34} height={34} />
		}
	</g>
}

const edgePath = (directed, x0,y0,x1,y1, angle = 0) => {
    const midX = (x0 + x1) / 2
    const midY = (y0 + y1) / 2
    let dirX = x1 - x0
    let dirY = y1 - y0
    if(!dirX && !dirY) {
        dirX = Math.cos(angle - Math.PI / 2)
        dirY = Math.sin(angle - Math.PI / 2)
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

    return {
        textX,
        textY,
        headAngle,
        orientation,
        curve: `M${x0},${y0} C${caX},${caY} ${cbX},${cbY} ${x1},${y1}`,
    }
}

const Edge = ({nodeId, edgeIndex = null, x0,y0,x1,y1, selected = false, onClick = null, onDoubleClick = null, style = null, labelStyle = null, directed = true, disabled=false, angle = 0}) => {
	const path = edgePath(directed, x0, y0, x1, y1, angle)

    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onClick])

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onDoubleClick])

	return <g onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
		<g style={style}>
        {directed ?
            <EdgeHead disabled={disabled} x={x1} y={y1} angle={path.headAngle} />
            :null
        }
        <EdgeLine disabled={disabled} d={path.curve} />
        </g>
	</g>
}

const ReflexiveEdge = ({nodeId, edgeIndex, x, y, angle = 0, onClick = null, onDoubleClick = null, style = null}) =>
	<Edge
        nodeId={nodeId}
        edgeIndex={edgeIndex}
		x0={x + Math.cos(angle - Math.PI / 8) * 20}
		y0={y + Math.sin(angle - Math.PI / 8) * 20}
		x1={x + Math.cos(angle + Math.PI / 8) * 20}
		y1={y + Math.sin(angle + Math.PI / 8) * 20}
		onClick={onClick}
        onDoubleClick={onDoubleClick}
		style={style}
        directed={true}
	/>

const NodeEdge = ({nodeId, edgeIndex, x0, y0, x1, y1, onClick = null, onDoubleClick = null, style = null, directed = true}) => {
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
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={style}
        directed={directed}
    />
}

const NewEdge = ({nodeId, x0, y0, x1, y1, directed = true,offset=false, angle = 0}) => {
    let dirX = x1 - x0
    let dirY = y1 - y0
    if(!dirX && !dirY) {
        dirX = Math.cos(angle - Math.PI / 2)
        dirY = Math.sin(angle - Math.PI / 2)
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
        angle={angle}
        disabled={true}
        directed={directed}
    />
}

const NewNode = ({x, y}) => {
    return <NewNodeCircle style={{cursor:'copy'}} r="20" cx={x} cy={y} />
}

const NodeManipulator = ({x,y,nodeId,snapped=false,active=false,onClick=null,onDoubleClick=null, mouseDownConnect=null,mouseDownMove = null,mouseMove,mouseLeave}) => {
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
            } else if(state.movingNode !== null) {
                action.dispatch(actions.setNodeAttribute(state.movingNode, 'position', {x:state.x+state.offsetX, y:state.y+state.offsetY}))
            } else if(state.x !== null && state.y !== null) {
                action.dispatch(actions.createNode(state.x+state.offsetX, state.y+state.offsetY))
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
            if(state.connectionStart!==null || state.movingNode !== null || (state.x !== null && state.y !== null)) {
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
                connectionSnap: action.nodeId,
            }
        case 'startCreate':
            return {
                ...state,
                connectionStart: null,
                x: action.x,
                y: action.y,
                offsetX: 0,
                offsetY: 0,
                connectionSnap: null,
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

const GraphManipulator = ({box, nodeAngles}) => {
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

    const deleteEdge = useCallback((evt, nodeId, edgeIndex) => {
        evt.stopPropagation();
        dispatch(actions.deleteEdge(nodeId, edgeIndex));
    }, [dispatch])

    const deleteNode = useCallback((evt, nodeId) => {
        evt.stopPropagation();
        dispatch(actions.deleteNode(nodeId));
    }, [dispatch])


    const onMouseDown = useCallback((evt) => {
        if(evt.altKey) {
            return;
        }
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatchManipulation({type: 'startCreate', ...pos})
    }, [canvasPos, dispatchManipulation])

    return <g>
        <rect style={{pointerEvents: 'all',cursor:'copy'}} onMouseDown={onMouseDown} onMouseUp={onMouseUp} x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" />
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
                onDoubleClick={deleteNode} />
        )}
        {manipulation.connectionStart === null ? (
            (manipulation.movingNode !== null || manipulation.x === null || manipulation.y === null) ? null :
            <NewNode
                    x={manipulation.x + manipulation.offsetX}
                    y={manipulation.y + manipulation.offsetY}
                />
        ) : manipulation.connectionSnap !== null ?
            <NewEdge
                    nodeId={0}
                    x0={positions[manipulation.connectionStart].x}
                    y0={positions[manipulation.connectionStart].y}
                    x1={positions[manipulation.connectionSnap].x}
                    y1={positions[manipulation.connectionSnap].y}
                    directed={flags.directed}
                    offset={true}
                    angle={nodeAngles[manipulation.connectionSnap]}
                />
         :
            <NewEdge
                    nodeId={manipulation.connectionStart}
                    x0={positions[manipulation.connectionStart].x}
                    y0={positions[manipulation.connectionStart].y}
                    x1={manipulation.x}
                    y1={manipulation.y}
                    directed={flags.directed}
                    angle={0}
                />
        }
    </g>
}

const NodeSelectionCircle = styled.circle`
    fill: none;
    stroke: none;
    stroke-width: 0;
    pointer-events: all;
`

const NodeSelector = ({nodeId, x, y, onMouseDown}) => {
    const onMouseDownCallback = useCallback(onMouseDown ? (evt) => {
        onMouseDown(evt, nodeId)
    } : null, [nodeId, onMouseDown]);

    return <NodeSelectionCircle cx={x} cy={y} r="20" onMouseDown={onMouseDownCallback} />
}

const EdgeSelectorLine = styled.path`
    fill: none;
    stroke: none;
    stroke-width: 8;
    pointer-events: all;
`

const NodeEdgeSelector = ({x0,x1,y0,y1,nodeId,edgeIndex,onMouseDown,directed}) => {
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

    const path = edgePath(directed,
        x0 + 20 * cDirXNorm,
        y0 + 20 * cDirYNorm,
        x1 + 20 * cDirXNormr,
        y1 + 20 * cDirYNormr
    )

    const onMouseDownCallback = useCallback(onMouseDown ? (evt) => {
        onMouseDown(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onMouseDown])

    return <EdgeSelectorLine onMouseDown={onMouseDownCallback} d={path.curve} />
}

const ReflexiveEdgeSelector = ({x, y, angle = 0, nodeId, edgeIndex, onMouseDown, directed}) => {
    const path = edgePath(directed,
        x + Math.cos(angle - Math.PI / 8) * 20,
        y + Math.sin(angle - Math.PI / 8) * 20,
        x + Math.cos(angle + Math.PI / 8) * 20,
        y + Math.sin(angle + Math.PI / 8) * 20
    )

    const onMouseDownCallback = useCallback(onMouseDown ? (evt) => {
        onMouseDown(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onMouseDown])

    return <EdgeSelectorLine onMouseDown={onMouseDownCallback} d={path.curve} />
}

const selectionReducer = function(state, action) {
    switch(action.type) {
        case 'start': {
            return {
                ...state,
                x0:action.x,
                y0:action.y,
                x1:action.x,
                y1:action.y,
            }
        }
        case 'move': {
            if(state.x0 === null) {
                return state;
            }
            return {
                ...state,
                x1:action.x,
                y1:action.y,
            }
        }
        case 'end': {
            return {
                ...state,
                x0:null,
                y0:null,
                x1:null,
                y1:null,
            }
        }
    }
    return state;
}

const SelectionBox = styled.polygon`
    fill: none;
    stroke-width: 1;
    stroke: rgba(135, 208, 249, 1.0);
    stroke-dasharray: 3 3;
    fill: rgba(135, 208, 249, 0.4);
    vector-effect: non-scaling-stroke;
`

const GraphSelector = ({box, nodeAngles}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()
    // const camera = useCamera();

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)


    const selectNode = useCallback((evt, nodeId) => {
        dispatch(actions.selectNode(nodeId, evt.metaKey || evt.ctrlKey || evt.shiftKey, evt.metaKey || evt.ctrlKey));
    }, [dispatch])

    const selectEdge = useCallback((evt, nodeId, edgeIndex) => {
        dispatch(actions.selectEdge(nodeId, edgeIndex, evt.metaKey || evt.ctrlKey || evt.shiftKey, evt.metaKey || evt.ctrlKey));
    }, [dispatch])

    const clearSelection = useCallback((evt) => {
        if(!evt.metaKey && !evt.ctrlKey && !evt.shiftKey) {
            dispatch(actions.clearSelection());
        }
    }, [dispatch])


    const [range, dispatchRange] = useReducer(selectionReducer, {
        x0:null,
        y0:null,
        x1:null,
        y1:null,
    });

    const mouseDown = useCallback((evt) => {
        if(evt.altKey) {
            return;
        }
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatchRange({type:'start',...pos})
    }, [dispatchRange, canvasPos]);

    const mouseMove = useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatchRange({type:'move',...pos})
    }, [dispatchRange, canvasPos]);

    const mouseUp = useCallback((evt) => {
        dispatchRange({type:'end'})
    }, [dispatchRange]);

    useEffect(() => {
        window.addEventListener('mouseup', mouseUp);

        return () => {
            window.removeEventListener('mouseup', mouseUp);
        }
    },[mouseUp])

    useEffect(() => {
        window.addEventListener('mousemove', mouseMove);

        return () => {
            window.removeEventListener('mousemove', mouseMove);
        }
    },[mouseMove])

    // const sin = Math.sin(camera.rotation * Math.PI / 180)
    // const cos = Math.cos(camera.rotation * Math.PI / 180)

    // const dx = range.x1 - range.x0
    // const dy = range.y1 - range.y0
    // const ax = cos
    // const ay = -sin
    // const bx = sin
    // const by = cos
    // const boxWidth = ax * dx + ay * dy
    // const boxHeight = bx * dx + by * dy

    // const ps = `${range.x0 + 0} ${range.y0 + 0}
    // ${range.x0 + cos * 0 + sin * boxHeight} ${range.y0 -sin * 0 + cos * boxHeight}
    //  ${range.x0 + cos * boxWidth + sin * boxHeight} ${range.y0 -sin * boxWidth + cos * boxHeight}
    //  ${range.x0 + cos * boxWidth + sin * 0} ${range.y0 -sin * boxWidth + cos * 0}`;

    const ps2 = `${range.x0} ${range.y0}
    ${range.x0} ${range.y1}
     ${range.x1} ${range.y1}
     ${range.x1} ${range.y0}`;

    return <g onMouseDown={mouseDown}>
        <rect style={{pointerEvents:'all'}} onMouseDown={clearSelection} x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" />
        {range.x0 === null ? null :
            <SelectionBox points={ps2} />
        }
        {nodes.map((neighbors, nodeId) => {
            return <NodeSelector
                key={nodeId}
                nodeId={nodeId}
                x={positions[nodeId].x}
                y={positions[nodeId].y}
                onMouseDown={selectNode}
            />
        }

        )}
        {nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                return nodeId===neighbourId ?
                    <ReflexiveEdgeSelector
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        angle={nodeAngles[nodeId] + Math.PI}
                        x={positions[nodeId].x}
                        y={positions[nodeId].y}
                        onMouseDown={selectEdge}
                        directed={flags.directed}
                    /> :
                    <NodeEdgeSelector
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        x0={positions[nodeId].x}
                        y0={positions[nodeId].y}
                        x1={positions[neighbourId].x}
                        y1={positions[neighbourId].y}
                        onMouseDown={selectEdge}
                        directed={flags.directed}
                    />;
            })
        )}
    </g>
}

const GraphLayerNodes = ({positions}) => {
    return <>
        {positions.map((pos, nodeId) => {
            return <Node
                key={nodeId}
                nodeId={nodeId}
                x={pos.x}
                y={pos.y}
            />
        })}
    </>
}

const GraphLayerEdges = ({directed, nodes, positions, angles}) => {
    return <>
        {nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                return nodeId===neighbourId ?
                    <ReflexiveEdge
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        angle={angles[nodeId] + Math.PI}
                        x={positions[nodeId].x}
                        y={positions[nodeId].y}
                    /> :
                    <NodeEdge
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        x0={positions[nodeId].x}
                        y0={positions[nodeId].y}
                        x1={positions[neighbourId].x}
                        y1={positions[neighbourId].y}
                        directed={directed}
                    />;
            })
        )}
    </>
}

const GraphLayerNodeLabels = ({positions, labels, labelKeys}) => {
    return <g>
        {labelKeys.map((k, i) => {
            return <g key={k}>
                {positions.map((pos, nodeId) => {
                    return <NodeLabel
                        key={nodeId}
                        x={pos.x}
                        y={30 + pos.y}
                        dy={15 * (1 + i - labelKeys.length / 2)}
                    >{k}: {JSON.stringify(labels[k][nodeId])}</NodeLabel>
                })}
            </g>
        })}
    </g>
}

const GraphLayerEdgeLabels = ({directed, nodes, positions, labels, labelKeys, angles}) => {
    return <>
        {labelKeys.map((k, kdx) => {
            return <g key={k}>
                {nodes.map((neighbors, nodeId) =>
                    neighbors.map((neighbourId, edgeIdx) => {
                        const p = edgePath(directed, positions[nodeId].x, positions[nodeId].y, positions[neighbourId].x, positions[neighbourId].y, angles[nodeId]);
                        return <EdgeLabel key={nodeId + '-' + edgeIdx} x={p.textX} y={p.textY} dy={20 * (0.5 + kdx - labelKeys.length / 2)} orientation={p.orientation}>
                            {k}: {labels[k][nodeId][edgeIdx]}
                        </EdgeLabel>
                    })
                )}
            </g>
        })}
    </>
}

const Graph = ({box, nodeAngles}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(state => state.present.graph.flags)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)

    const nodeAttributes = useSelector(state => state.present.graph.attributes.nodes)
    const visibleNodeAttributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.nodes).filter((n) => state.present.graph.attributeTypes.nodes[n].visible))

    const edgeAttributes = useSelector(state => state.present.graph.attributes.edges)
    const visibleEdgeAttributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.edges).filter((e) => state.present.graph.attributeTypes.edges[e].visible))

    return <g>
        <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="white" />
        <GraphLayerNodes positions={positions} />
        <GraphLayerEdges angles={nodeAngles} directed={flags.directed} nodes={nodes} positions={positions} />
        <GraphLayerNodeLabels positions={positions} labels={nodeAttributes} labelKeys={visibleNodeAttributes} />
        <GraphLayerEdgeLabels angles={nodeAngles} directed={flags.directed} nodes={nodes} positions={positions} labels={edgeAttributes} labelKeys={visibleEdgeAttributes} />
    </g>
}


const EdgeStepperLine = styled.path`
    fill: none;
    pointer-events: none;
    opacity: 0.6;
    stroke-width: 6;
`

const ReflexiveEdgeStepper = ({x,y,angle, directed, color}) => {
    const path = edgePath(directed,
        x + Math.cos(angle - Math.PI / 8) * 20,
        y + Math.sin(angle - Math.PI / 8) * 20,
        x + Math.cos(angle + Math.PI / 8) * 20,
        y + Math.sin(angle + Math.PI / 8) * 20,
        angle
    )

    return <EdgeStepperLine stroke={color} d={path.curve} />
}

const NodeEdgeStepper = ({x0,y0,x1,y1,directed, color}) => {
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

    const path = edgePath(directed,
        x0 + 20 * cDirXNorm,
        y0 + 20 * cDirYNorm,
        x1 + 20 * cDirXNormr,
        y1 + 20 * cDirYNormr
    )

    return <EdgeStepperLine stroke={color} d={path.curve} />
}

const AlgorithmStepperNodeLabels = ({positions, nodeAttributes}) => {
    return <>
        {Object.keys(nodeAttributes).map((k, i, all) =>
            <g key={k}>
                {positions.map((pos, nodeId) => {
                    return <g key={nodeId}>
                        <text textAnchor="end" key={k} x={pos.x - 20} y={pos.y + 15 + 20 * i - 10 * all.length}>{k}: {nodeAttributes[k][nodeId]}</text>
                    </g>
                })}
            </g>
        )}
    </>
}

const AlgorithmStepperNodeColoring = ({positions, colors}) => {
    if(!colors) {
        return <></>;
    }

    return <g>
        {positions.map((pos, nodeId) =>
            <circle stroke="black" fill={colors[nodeId]} key={nodeId} r="10" cx={pos.x} cy={pos.y} />
        )}
    </g>
}


const AlgorithmStepperPolygons = ({polygons}) => {
    return <>
        {polygons ? polygons.map(({points, stroke, fill}, i) => {
            return <polygon key={i} stroke={stroke||'green'} fill={fill||'lightgreen'} fillOpacity="0.3" points={points.map(({x,y}) => `${x} ${y},`).join(' ')} />
        }) : null}
    </>
}

const AlgorithmStepperLines = ({lines, length = 100}) => {
    return <>
        {lines ? lines.map(({points, stroke, x, y, dx, dy}, i) => {
            return <line key={i} strokeWidth="5" stroke={stroke||'green'} x1={x - dx * length} y1={y - dy * length} x2={x + dx * length} y2={y + dy * length} />
        }) : null}
    </>
}

const AlgorithmStepperEdgeLabels = ({positions, nodes, edgeAttributes, angles}) => {
    return <>
        {/*TODO: Implement*/}
    </>
}

const AlgorithmStepperEdgeColoring = ({directed, positions, angles, nodes, colors}) => {
    if(!colors) {
        return <></>;
    }

    return <g>
        {nodes.map((neighbors, nodeId) =>
                neighbors.map((neighbourId, edgeIdx) => {
                    const color = colors[nodeId][edgeIdx]

                    return nodeId===neighbourId ?
                        <ReflexiveEdgeStepper
                            key={`${nodeId}-${edgeIdx}`}
                            angle={angles[nodeId] + Math.PI}
                            x={positions[nodeId].x}
                            y={positions[nodeId].y}
                            directed={directed}
                            color={color}
                        /> :
                        <NodeEdgeStepper
                            key={`${nodeId}-${edgeIdx}`}
                            x0={positions[nodeId].x}
                            y0={positions[nodeId].y}
                            x1={positions[neighbourId].x}
                            y1={positions[neighbourId].y}
                            directed={directed}
                            color={color}
                        />;
                })
            )}
    </g>
}

const AlgorithmStepper = ({box, nodeAngles}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)

    const algorithm = useSelector(state => state.present.algorithm)

    const edgeColors = useMemo(() => algorithm.result && algorithm.result.steps.length && algorithm.result.steps[algorithm.focus].edges.type && algorithm.result.steps[algorithm.focus].edges.type.map((cs) => cs.map((c) => {
         return c === null ? 'none' : {
            'forward': 'green',
            'cross': 'red',
            'back': 'blue',
        }[c];
    })), [algorithm.result, algorithm.focus]);

    if(!algorithm.result || !algorithm.result.steps || !algorithm.result.steps.length) {
        return <></>;
    } else {
        const step = algorithm.result.steps[algorithm.focus];
        const edgeAttributes = step.edges
        const nodeAttributes = step.nodes
        const nodeColors = nodeAttributes.color


        return <g style={{pointerEvents: 'none'}}>
            <AlgorithmStepperPolygons polygons={step.polygons} />
            <AlgorithmStepperLines lines={step.lines} />
            <AlgorithmStepperNodeColoring positions={positions} colors={nodeColors} />
            <AlgorithmStepperNodeLabels positions={positions} nodeAttributes={nodeAttributes} />
            <AlgorithmStepperEdgeColoring angles={nodeAngles} directed={flags.directed} positions={positions} nodes={nodes} colors={edgeColors} />
            <AlgorithmStepperEdgeLabels angles={nodeAngles} positions={positions} nodes={nodes} edgeAttributes={edgeAttributes} />
        </g>
    }
}


const NodeSelection = ({x,y}) => {
    return <NodeCircleSelection cx={x} cy={y} r={20} />
}

const ReflexiveEdgeSelection = ({x,y,angle, directed}) => {
    const path = edgePath(directed,
        x + Math.cos(angle - Math.PI / 8) * 20,
        y + Math.sin(angle - Math.PI / 8) * 20,
        x + Math.cos(angle + Math.PI / 8) * 20,
        y + Math.sin(angle + Math.PI / 8) * 20,
        angle
    )

    return <EdgeSelectionLine d={path.curve} />
}

const NodeEdgeSelection = ({x0,y0,x1,y1,directed}) => {
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

    const path = edgePath(directed,
        x0 + 20 * cDirXNorm,
        y0 + 20 * cDirYNorm,
        x1 + 20 * cDirXNormr,
        y1 + 20 * cDirYNormr
    )

    return <EdgeSelectionLine d={path.curve} />
}

const GraphSelection = ({box, nodeAngles}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)

    return <g>
        {selectedNodes.map((nodeId, i) => {
            return <NodeSelection key={i} x={positions[nodeId].x} y={positions[nodeId].y} />
        })}
        {selectedEdges.map((e) => {
            const from = e[0];
            const edgeIdx = e[1];
            const to = nodes[from][edgeIdx];

            return from===to ?
                    <ReflexiveEdgeSelection
                        key={`${from}-${edgeIdx}`}
                        angle={nodeAngles[from] + Math.PI}
                        x={positions[from].x}
                        y={positions[from].y}
                        directed={flags.directed}
                    /> :
                    <NodeEdgeSelection
                        key={`${from}-${edgeIdx}`}
                        x0={positions[from].x}
                        y0={positions[from].y}
                        x1={positions[to].x}
                        y1={positions[to].y}
                        directed={flags.directed}
                    />;
        })}
    </g>
}


export default () => {
	return <GraphEditor />
}

const GraphEditor = () => {
    const dispatch = useDispatch()
    const present = useSelector((state) => state.present)

    const margin = 200;

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

    const nodeAngles = useSelector(state => {
        const positions = state.present.graph.attributes.nodes.position

        return state.present.graph.nodes.map((neighbours, idx) => {
            const ownPos = positions[idx]
            const outgoing = neighbours.map((n) => n !== idx ? Math.atan2(positions[n].y - ownPos.y, positions[n].x - ownPos.x) : null).filter(a => a !== null)
            const incoming = state.present.graph.nodes.map((others, o) => (o !== idx && others.includes(idx)) ? Math.atan2(positions[o].y - ownPos.y, positions[o].x - ownPos.x) : null).filter(a => a !== null)

            const cosSum = outgoing.reduce((acc, angle) => acc + Math.cos(angle), 0) +
                incoming.reduce((acc, angle) => acc + Math.cos(angle), 0)

            const sinSum = outgoing.reduce((acc, angle) => acc + Math.sin(angle), 0) +
                incoming.reduce((acc, angle) => acc + Math.sin(angle), 0)

            return Math.atan2(sinSum, cosSum)
        })
    })

    const nonInfBox = {
        minX: box.minX===Infinity ? -1*margin : box.minX,
        maxX: box.maxX===-Infinity ? 1*margin : box.maxX,
        minY: box.minY===Infinity ? -1*margin : box.minY,
        maxY: box.maxY===-Infinity ? 1*margin : box.maxY,
    }

    const [currentTool, selectTool] = useState('Edit')

    const tools = [
        'Select',
        'Edit',
    ];

    const toolComponents = {
        Select: GraphSelector,
        Edit: GraphManipulator,
    }

    const ToolComponent = toolComponents[currentTool] || toolComponents['None'];

    return <Container>
            <Title>
                Graph Editor
            </Title>
            <Tools tools={tools} currentTool={currentTool} onSelectTool={selectTool} />
            <Menu />
            <Canvas box={nonInfBox}>
                <Graph
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                />
                <GraphSelection
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                />
                <ToolComponent
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                />
                <AlgorithmStepper
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                />
            </Canvas>
        </Container>;
}
