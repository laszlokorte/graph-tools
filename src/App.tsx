import * as React from 'react';
import {useReducer, useRef, useMemo, useEffect, useContext, useCallback, useState} from 'react';
import styled from 'styled-components';
import { useSize } from './react-hook-size';

import { useSelector, useDispatch } from './stores/graph/context'
import { useSelector as useProjectsSelector, useDispatch as useProjectsDispatch } from './stores/projects/context'
import { ActionCreators } from 'redux-undo';

import {ALGORITHMS} from './stores/graph/reducers/algorithm/index';

import * as actions from './actions'

const Title = styled.h1`
    margin: 0;
    padding: 0;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
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
	grid-template-columns: 2fr 4fr 2fr;
	grid-template-rows: 3em 3fr 2fr;
	grid-template-areas: "a b b" "c d d" "c d d";
	justify-items: stretch;
	align-items: stretch;
`;

const OverlayBox = styled.div`
    grid-row: 2 / 4;
    grid-column: 3 / 4;
    background: white;
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 1em;
    overflow: auto;
`

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
    grid-row: 1 / 2;
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
    const type = useSelector(state => state.present.graph.attributeTypes.nodes[attrKey])
    const typeName = type.type

    const onChange = useCallback(
        (evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))
    , [nodeId, attrKey])

    const onCheck = useCallback(
        (evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))
    , [nodeId, attrKey])

    if(['text','color','numeric'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="text" value={value || ''} onChange={onChange} /></dd>
        </>);
    } else if(['boolean'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={value===true} onChange={onCheck} /></dd>
        </>);
    } else if(['enum'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd>
                <select value={value} onChange={onChange}>
                    {type.required ? null : <option value={null}>---</option>}
                    {type.options.map((v, i) => {
                        return <option key={i}>{v}</option>
                    })}
                </select>
            </dd>
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
    const savedGraphs = useProjectsSelector(state => state)
    const savedGraphNames = Object.keys(savedGraphs)

    const undo = useCallback(() => dispatch(ActionCreators.undo()), [])
    const redo = useCallback(() => dispatch(ActionCreators.redo()), [])
    const layout = useCallback(() => dispatch(actions.autoLayout()), [])
    const clear = useCallback(() => dispatch(actions.clearGraph()), [])
    const clearEdges = useCallback(() => dispatch(actions.clearGraphEdges()), [])
    const openGraph = useCallback((evt) => dispatch(actions.loadGraph(savedGraphs[evt.target.value])), [savedGraphs])

    return <Toolbar>
        <ToolbarSection>
            <select value={''} onChange={openGraph}>
                <option value={''}>Open…</option>
                {savedGraphNames.map((a, i) =>
                    <option key={i} value={a}>{a}</option>
                )}
            </select>
        </ToolbarSection>
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
            <select style={{maxWidth: '10em'}} value={alg} onChange={selectAlg} ref={selectBox}>
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
                <Dump value={present.graph} />
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
    stroke-linecap: round;
	stroke-width: 6;
`

const EdgeLabel = styled.text`
    cursor: default;
    text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
    dominant-baseline: ${({orientation: o}) => o===1 ? 'hanging' : (o===3 ? 'initial' : 'central')};
`

const TransientEdgeLabel = styled.text`
    cursor: default;
    font-style: italic;
    fill: #555;
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

const EdgeHandle = styled.circle`
    cursor: default;
    fill: #c0c0c0;
    opacity: 0.5;
`;

const EdgeHandleAdvanced = styled.circle`
    cursor: default;
    fill: #84DBDB;
    opacity: 0.5;
    cursor: alias;
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

const PathHandle = styled.circle`
	stroke: none;
	fill: none;
	pointer-events: all;
	cursor: move;
`

const PathHandleDot = styled.circle`
	fill: #396DF2;
	pointer-events: none;
`

const PathHandleDotSmall = styled.circle`
	fill: #396DF2;
	pointer-events: none;
`

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
            <NodeCircle cx={x} cy={y} r={20}/> :
            <NodeBox x={x - 17} y={y - 17} width={34} height={34}/>
        }
    </g>
}

const Edge = ({nodeId, edgeIndex = null, edgePath, selected = false, onClick = null, onDoubleClick = null, style = null, labelStyle = null, directed = true, disabled=false, angle = 0}) => {
    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onClick])

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onDoubleClick])

	return <g onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
		<g style={style}>
        {directed ?
            <EdgeHead disabled={disabled} x={edgePath.tip.x} y={edgePath.tip.y} angle={edgePath.tip.angle} />
            :null
        }
        <EdgeLine disabled={disabled} d={edgePath.string} />
        </g>
	</g>
}

const NodeEdge = ({nodeId, edgeIndex, edgePath, onClick = null, onDoubleClick = null, style = null, directed = true}) => {
    return <Edge
        nodeId={nodeId}
        edgeIndex={edgeIndex}
        edgePath={edgePath}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={style}
        directed={directed}
    />
}

const NewEdge = ({nodeId, x0, y0, x1, y1, directed = true,offset=false, angle = 0}) => {

    return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="black" />;
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

const EdgeManipulator = ({selectEdge, deleteEdge, nodeId, edgeIdx, edgePath}) => {
    const onClickCallback = useCallback((evt) => {
        evt.preventDefault();
        selectEdge(evt, nodeId, edgeIdx)
    }, [deleteEdge, nodeId, edgeIdx])

    const onDoubleCallback = useCallback((evt) => {
        evt.preventDefault();
        deleteEdge(evt, nodeId, edgeIdx)
    }, [deleteEdge, nodeId, edgeIdx])


    return <EdgeSelectorLine
        onMouseDown={onClickCallback}
        onDoubleClick={onDoubleCallback}
        d={edgePath.string}
    />
}

const EdgeGrabber = ({selectEdge, deleteEdge, nodeId, edgeIdx, edgePath, mouseDown}) => {
    const mouseDownCallback = useCallback(mouseDown ? (evt) => {
        const nodeId = 1*evt.target.getAttribute('data-node-id')
        const x = 1*evt.target.getAttribute('data-x')
        const y = 1*evt.target.getAttribute('data-y')
        const control = 1*evt.target.getAttribute('data-control')
        mouseDown(evt, nodeId, edgeIdx, x, y, control)
    } : null, [mouseDown])

    const handles = []

    for(let i=0;i<edgePath.anchors.length;i+=2) {
        handles.push(<EdgeHandleAdvanced
            onMouseDown={mouseDownCallback}
            key={"a" + i}
            cx={edgePath.anchors[i]}
            cy={edgePath.anchors[i+1]}
            data-x={edgePath.anchors[i]}
            data-y={edgePath.anchors[i+1]}
            data-node-id={nodeId}
            data-control={i/2}
            r={20} />
        )
    }

    return <>
        {handles}
    </>
}

const EdgesManipulator = ({nodes, nodeAngles, edgePaths, selectEdge, deleteEdge}) => {
    return <>
    {nodes.map((neighbors, nodeId) =>
        neighbors.map((neighbourId, edgeIdx) => {
            if(nodeId === neighbourId) {
                return null
            }

            return <EdgeManipulator
                key={nodeId + '-' + edgeIdx}
                deleteEdge={deleteEdge}
                selectEdge={selectEdge}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
                neighbourId={neighbourId}
                nodeAngle ={nodeAngles[nodeId]}
                edgePath={edgePaths[nodeId][edgeIdx]}
            />
        })
    )}
    </>
}



const EdgesGrabber = ({nodes, nodeAngles, edgePaths, grabEdge, selectedEdges}) => {
    return <>
        {selectedEdges.map((e) => {
            const nodeId = e[0];
            const edgeIdx = e[1];
            const neighbourId = nodes[nodeId][edgeIdx];

            if(nodeId === neighbourId) {
                return null
            }

            return <EdgeGrabber
                key={nodeId + '-' + edgeIdx}
                mouseDown={grabEdge}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
                neighbourId={neighbourId}
                nodeAngle ={nodeAngles[nodeId]}
                edgePath={edgePaths[nodeId][edgeIdx]}
            />
        })}
    </>
}

const pathManipulationReducer = (state, action) => {
    switch(action.type) {
        case 'stop':
            return {
                ...state,
                nodeIdx: null,
                edgeIdx: null,
                controlIdx: null,
                path:null,
                offsetX: 0,
                offsetY: 0,
            };
        case 'move':
            if(state.nodeIdx != null) {
                return {
                    ...state,
                    path: [...state.path.slice(0, state.controlIdx*2), action.x, action.y, ...state.path.slice(state.controlIdx*2 + 2)],
                }
            } else {
                return state;
            }
        case 'startCreate':
            return {
                ...state,
                nodeIdx: action.nodeIdx,
                edgeIdx: action.edgeIdx,
                controlIdx: action.controlIdx,
                path: [...action.path.slice(0, action.controlIdx*2), action.x, action.y, ...action.path.slice(action.controlIdx*2)],
                offsetX: 0,
                offsetY: 0,
            }
        case 'startMove':
            return {
                ...state,
                nodeIdx: action.nodeIdx,
                edgeIdx: action.edgeIdx,
                controlIdx: action.controlIdx,
                path: [...action.path.slice(0, action.controlIdx*2), action.x, action.y, ...action.path.slice(action.controlIdx*2 + 2)],
                offsetX: 0,
                offsetY: 0,
            }
    }
    return state;
}

const EdgePathManipulator = ({nodeId, edgeIdx, controls, startPosition, endPosition, directed, angle, edgePath, mouseDownControl, doubleClickControl}) => {
    const result = [];

    const mouseDownNew = useCallback((evt) => {
        evt.stopPropagation();
        const c = 1*evt.target.getAttribute('data-c');
        const x = 1*evt.target.getAttribute('data-x');
        const y = 1*evt.target.getAttribute('data-y');
        mouseDownControl(nodeId, edgeIdx, c, x, y, true)
    }, [nodeId, edgeIdx, mouseDownControl, controls])

    const mouseDownExisting = useCallback((evt) => {
        evt.stopPropagation();
        const c = 1*evt.target.getAttribute('data-c');
        const x = 1*evt.target.getAttribute('data-x');
        const y = 1*evt.target.getAttribute('data-y');
        mouseDownControl(nodeId, edgeIdx, c, x, y, false)
    }, [nodeId, edgeIdx, mouseDownControl, controls])

    const doubleClick = useCallback((evt) => {
        const c = 1*evt.target.getAttribute('data-c');
        doubleClickControl(nodeId, edgeIdx, c, evt)
    }, [nodeId, edgeIdx, doubleClickControl, controls])

    for (let i = 2; i < edgePath.curve.length - 5; i += 6)
    {
        let cx = 0.125 * edgePath.curve[i-2] + 0.75 * 0.5 * edgePath.curve[i] + 1.5 * 0.25 * edgePath.curve[i+2] + 0.125 * edgePath.curve[i+4];
        let cy = 0.125 * edgePath.curve[i-1] + 0.75 * 0.5 * edgePath.curve[i+1] + 1.5 * 0.25 * edgePath.curve[i+3] + 0.125 * edgePath.curve[i+5];

        if(controls.length) {
            result.push(<PathHandle onMouseDown={mouseDownNew} data-c={(i-2)/6} data-x={cx} data-y={cy} key={"a"+i} cx={cx} cy={cy} r={7} />)
            result.push(<PathHandleDotSmall key={"b"+i} cx={cx} cy={cy} r={3} />)
        } else if(i === 2) {
            result.push(<PathHandle onMouseDown={mouseDownNew} data-c={(i-2)/6}  data-x={edgePath.curve[i+4]} data-y={edgePath.curve[i+5]} key={"a"+i} cx={edgePath.curve[i+4]} cy={edgePath.curve[i+5]} r={7} />)
            result.push(<PathHandleDotSmall key={"b"+i} cx={edgePath.curve[i+4]} cy={edgePath.curve[i+5]} r={3} />)
        }
    }

    for(let i=0; i<controls.length; i += 2) {
        const cx = controls[i];
        const cy = controls[i + 1];
        result.push(<PathHandle onMouseDown={mouseDownExisting} onDoubleClick={doubleClick} data-c={i/2} data-x={cx} data-y={cy} key={"c"+i} cx={cx} cy={cy} r={7} />)
        result.push(<PathHandleDot  key={"d"+i} cx={cx} cy={cy} r={5} />)
    }

    return result;
}

const EdgesPathManipulator = ({nodes, directed, positions, paths, nodeAngles, edgePaths, selectedEdges}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const pathattr = useSelector(state => state.present.graph.attributeTypes.edges.path)
    const visible = pathattr && pathattr.visible

    const [manipulation, dispatchManipulation] = useReducer(pathManipulationReducer, {
        nodeIdx: null,
        edgeIdx: null,
        controlIdx: null,
        path: null,
        offsetX: 0,
        offsetY: 0,
    });

    const onMouseUp = useCallback((evt) => {
        if(manipulation.nodeIdx != null) {
            dispatch(actions.setEdgeAttribute(manipulation.nodeIdx, manipulation.edgeIdx, 'path', manipulation.path))
        }
        dispatchManipulation({type: 'stop'})
    }, [manipulation, dispatchManipulation, dispatch])

    const onMouseMove = useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});
        dispatchManipulation({type: 'move', ...pos})
    }, [dispatchManipulation, canvasPos])

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [onMouseUp, onMouseMove])

    const mouseDownControl = useCallback((nodeIdx, edgeIdx, controlIdx, x, y, init) => {
        const oldPath = paths[nodeIdx][edgeIdx];
        if(init) {
            dispatchManipulation({type: 'startCreate', nodeIdx, edgeIdx, controlIdx, path: oldPath, x, y})
        } else {
            dispatchManipulation({type: 'startMove', nodeIdx, edgeIdx, controlIdx, path: oldPath, x, y})
        }
    }, [paths, dispatch])

    const doubleClickControl = useCallback((n, e, c, evt) => {
        evt.stopPropagation();
        const oldPath = paths[n][e];
        const newPath = [...oldPath.slice(0, c*2), ...oldPath.slice(c*2 + 2)]
        dispatch(actions.setEdgeAttribute(n, e, 'path', newPath))
    }, [paths, dispatch])

    if(!visible) {
        return null
    }

    return <>
        {selectedEdges.map((e) => {
            const nodeId = e[0];
            const edgeIdx = e[1];
            const neighbourId = nodes[nodeId][edgeIdx];

            if(nodeId == neighbourId) {
                return null;
            }

            let controls = paths[nodeId][edgeIdx]
            if(manipulation.nodeIdx === nodeId && manipulation.edgeIdx == edgeIdx) {
                controls = manipulation.path;
            }

            return <EdgePathManipulator
                key={nodeId + '-' + edgeIdx}
                edgePath={edgePaths[nodeId][edgeIdx]}
                controls={controls}
                startPosition={positions[nodeId]}
                endPosition={positions[neighbourId]}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
                mouseDownControl={mouseDownControl}
                doubleClickControl={doubleClickControl}
                directed={directed}
                angle={nodeAngles[nodeId]} />
        })}
    </>
}

const manipulationReducer = (state, action) => {
    switch(action.type) {
        case 'stop':
            return {
                ...state,
                connectionStart: null,
                connectionSnap: null,
                x: null,
                y: null,
                offsetX: 0,
                offsetY: 0,
                movingNode: null,
                edgeIndex: null,
                control: null,
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
            const hasEdge = typeof action.edgeIndex !== 'undefined';
            const hasControl = typeof action.control !== 'undefined';

            return {
                ...state,
                connectionStart: action.nodeId,
                x: action.x,
                y: action.y,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
                connectionSnap: hasEdge ? null : action.nodeId,
                edgeIndex: hasEdge ? action.edgeIndex : null,
                control: hasControl ? action.control : null,
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
                edgeIndex: null,
                control: null,
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
                control: null,
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
                control: null,
            }
        case 'startMove':
            return {
                ...state,
                x: action.x,
                y: action.y,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
                movingNode: action.nodeId,
                edgeIndex: null,
                control: null,
            }
    }
    return state;
}

const GraphManipulator = ({box, nodeAngles, edgePaths}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)
    const paths = useSelector(state => state.present.graph.attributes.edges.path)

    const [manipulation, dispatchManipulation] = useReducer(manipulationReducer, {
        connectionStart: null,
        edgeIndex: null,
        connectionSnap: null,
        x: null,
        y: null,
        movingNode: null,
        offsetX: 0,
        offsetY: 0,
        control: null,
    });

    const onMouseUp = useCallback((evt) => {
        if(manipulation.connectionStart !== null && manipulation.connectionSnap !== null) {
            dispatch(actions.addEdge(
                manipulation.connectionStart,
                manipulation.connectionSnap
            ))
        } else if(manipulation.connectionStart !== null) {
            dispatch(actions.createNode(
                manipulation.x+manipulation.offsetX,
                manipulation.y+manipulation.offsetY,
                manipulation.connectionStart,
                manipulation.edgeIndex,
                evt.shiftKey,
                manipulation.control
            ))
        } else if(manipulation.movingNode !== null) {
            dispatch(actions.setNodeAttribute(
                manipulation.movingNode,
                'position',
                {x:manipulation.x+manipulation.offsetX, y:manipulation.y+manipulation.offsetY}
            ))
        } else if(manipulation.x !== null && manipulation.y !== null) {
            dispatch(actions.createNode(
                manipulation.x+manipulation.offsetX,
                manipulation.y+manipulation.offsetY
            ))
        }

        dispatchManipulation({type: 'stop'})
    }, [dispatchManipulation, manipulation, dispatch]);

    useEffect(() => {
        const prevMouseUp = onMouseUp
        window.addEventListener('mouseup', prevMouseUp)

        return () => {
            window.removeEventListener('mouseup', prevMouseUp)
        }
    }, [onMouseUp]);

    const onMouseMove =  useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});
        dispatchManipulation({type: 'move', ...pos})
    }, [canvasPos])


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

    const selectEdge = useCallback((evt, nodeId, edgeIndex) => {
        evt.stopPropagation();
        dispatch(actions.selectEdge(nodeId, edgeIndex, evt.metaKey || evt.ctrlKey || evt.shiftKey, evt.metaKey || evt.ctrlKey));
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

    const onGrabEdge = useCallback((evt, nodeId, edgeIndex, cx, cy, control) => {
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatchManipulation({type: 'startConnect', ...pos, nodeId, edgeIndex, offsetX: cx - pos.x, offsetY: cy - pos.y, control})
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
        {
            manipulation.x === null && manipulation.y === null &&
            manipulation.connectionStart === null && manipulation.movingNode === null ?
            <EdgesManipulator
                nodes={nodes}
                nodeAngles={nodeAngles}
                edgePaths={edgePaths}
                selectEdge={selectEdge}
                deleteEdge={deleteEdge}
            /> : null
        }
        {
            <EdgesGrabber
                nodes={nodes}
                grabEdge={onGrabEdge}
                nodeAngles ={nodeAngles}
                edgePaths={edgePaths}
                selectedEdges={selectedEdges}
            />
        }
        {
            manipulation.x === null && manipulation.y === null &&
            manipulation.connectionStart === null && manipulation.movingNode === null ?
            <EdgesPathManipulator
                nodes={nodes}
                directed={flags.directed}
                positions={positions}
                paths={paths}
                nodeAngles={nodeAngles}
                edgePaths={edgePaths}
                selectedEdges={selectedEdges}
            /> : null
        }
        {(manipulation.connectionStart === null || manipulation.edgeIndex !== null) ? (
            (manipulation.movingNode !== null || manipulation.x === null || manipulation.y === null || manipulation.connectionStart !== null) ? null :
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
        {
            (manipulation.connectionStart !== null && manipulation.edgeIndex !== null) ?
            [<NewNode
                key="midpoint-node"
                x={manipulation.x + manipulation.offsetX}
                y={manipulation.y + manipulation.offsetY}
            />,
            <NewEdge
                key="midpoint-pre-edge"
                nodeId={0}
                x0={positions[manipulation.connectionStart].x}
                y0={positions[manipulation.connectionStart].y}
                x1={manipulation.x + manipulation.offsetX}
                y1={manipulation.y + manipulation.offsetY}
                directed={flags.directed}
                offset={true}
                angle={0}
            />,
            <NewEdge
                key="midpoint-post-edge"
                nodeId={0}
                x0={manipulation.x + manipulation.offsetX}
                y0={manipulation.y + manipulation.offsetY}
                x1={positions[nodes[manipulation.connectionStart][manipulation.edgeIndex]].x}
                y1={positions[nodes[manipulation.connectionStart][manipulation.edgeIndex]].y}
                directed={flags.directed}
                offset={true}
                angle={0}
            />,
            ]
            : null
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
    stroke-width: 20;
    pointer-events: all;
    cursor: default;
`

const NodeEdgeSelector = ({nodeId,edgeIndex,edgePath,onMouseDown,directed}) => {
    const onMouseDownCallback = useCallback(onMouseDown ? (evt) => {
        onMouseDown(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onMouseDown])

    return <EdgeSelectorLine onMouseDown={onMouseDownCallback} d={edgePath.string} />
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

const GraphSelector = ({box, nodeAngles, edgePaths}) => {
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

    const rect = useRef();


    return <g onMouseDown={mouseDown}>
        <rect style={{pointerEvents:'all'}} onMouseDown={clearSelection} x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" />
        {range.x0 === null ? null :
            <SelectionBox ref={rect} points={ps2} />
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
                return <NodeEdgeSelector
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        edgePath={edgePaths[nodeId][edgeIdx]}
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

const GraphLayerEdges = ({directed, nodes, positions, edgePaths, angles}) => {
    return <>
        {nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                return <NodeEdge
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        edgePath={edgePaths[nodeId][edgeIdx]}
                        directed={directed}
                    />
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

const GraphLayerEdgeLabels = ({directed, nodes, positions, labels, labelKeys, angles, edgePaths}) => {
    return <>
        {labelKeys.map((k, kdx) => {
            return <g key={k}>
                {nodes.map((neighbors, nodeId) =>
                    neighbors.map((neighbourId, edgeIdx) => {
                        const e = edgePaths[nodeId][edgeIdx];
                        return <EdgeLabel key={nodeId + '-' + edgeIdx} x={e.text.x + 20 * e.text.normX} y={e.text.y + 20 * e.text.normY} dy={20 * (0.5 + kdx) - 20 * (1-e.text.normY) * 0.5*labelKeys.length} orientation={e.text.orientation}>
                            {k}: {String(labels[k][nodeId][edgeIdx])}
                        </EdgeLabel>
                    })
                )}
            </g>
        })}
    </>
}

const Graph = ({box, nodeAngles, edgePaths}) => {
    const dispatch = useDispatch()
    const excludedEdgeAttributes = ['path']
    const excludedNodeAttributes = ['position']

    const flags = useSelector(state => state.present.graph.flags)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)

    const nodeAttributes = useSelector(state => state.present.graph.attributes.nodes)
    const visibleNodeAttributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.nodes).filter((n) => !excludedNodeAttributes.includes(n) && state.present.graph.attributeTypes.nodes[n].visible))

    const edgeAttributes = useSelector(state => state.present.graph.attributes.edges)
    const visibleEdgeAttributes = useSelector(state => Object.keys(state.present.graph.attributeTypes.edges).filter((e) => !excludedEdgeAttributes.includes(e) && state.present.graph.attributeTypes.edges[e].visible))

    return <g>
        <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="white" />
        <GraphLayerNodes positions={positions} />
        <GraphLayerEdges angles={nodeAngles} edgePaths={edgePaths} directed={flags.directed} nodes={nodes} positions={positions} />
        <GraphLayerNodeLabels positions={positions} labels={nodeAttributes} labelKeys={visibleNodeAttributes} />
        <GraphLayerEdgeLabels angles={nodeAngles} edgePaths={edgePaths}  directed={flags.directed} nodes={nodes} positions={positions} labels={edgeAttributes} labelKeys={visibleEdgeAttributes} />
    </g>
}


const EdgeStepperLine = styled.path`
    fill: none;
    pointer-events: none;
    opacity: 0.6;
    stroke-width: 6;
    stroke-linecap: round;
`

const AlgorithmStepperLine = styled.line`
    pointer-events: none;
    stroke-width: 1;
    stroke-linecap: round;
`

const AlgorithmStepperPolygon = styled.polygon`
    pointer-events: none;
    fill-opacity: 0.3;
    stroke-width: 2;
    stroke-linecap: round;
`

const NodeEdgeStepper = ({directed, color, edgePath}) => {
    return <EdgeStepperLine stroke={color} d={edgePath.string} />
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
            return <AlgorithmStepperPolygon key={i} stroke={stroke||'green'} fill={fill||'lightgreen'} points={points.map(({x,y}) => `${x} ${y},`).join(' ')} />
        }) : null}
    </>
}

const AlgorithmStepperLines = ({lines, length = 100}) => {
    return <>
        {lines ? lines.map(({dashArray = null, points, stroke, x, y, dx, dy}, i) => {
            return <AlgorithmStepperLine strokeDasharray={dashArray} key={i} stroke={stroke||'green'} x1={x - dx * length} y1={y - dy * length} x2={x + dx * length} y2={y + dy * length} />
        }) : null}
    </>
}

const AlgorithmStepperEdgeLabels = ({positions, nodes, edgeAttributes, angles, edgePaths, directed, verticalOffset}) => {
    return <>
        {Object.keys(edgeAttributes).map((k, i, all) =>
            <g key={k}>
                {nodes.map((neighbors, nodeId) =>
                    neighbors.map((neighbourId, edgeIdx) => {
                        const p = edgePaths[nodeId][edgeIdx];
                        return <TransientEdgeLabel key={nodeId + '-' + edgeIdx} x={p.median.x} y={p.median.y} dy={20 * (1.5 + i - all.length / 2 + verticalOffset / 2)} orientation={p.text.orientation}>
                            {k}: {edgeAttributes[k][nodeId][edgeIdx]}
                        </TransientEdgeLabel>
                    })
                )}
            </g>
        )}
    </>
}

const AlgorithmStepperEdgeColoring = ({directed, positions, angles, edgePaths, nodes, colors}) => {
    if(!colors) {
        return <></>;
    }

    return <g>
        {nodes.map((neighbors, nodeId) =>
                neighbors.map((neighbourId, edgeIdx) => {
                    const color = colors[nodeId][edgeIdx]

                    return <NodeEdgeStepper
                            key={`${nodeId}-${edgeIdx}`}
                            edgePath={edgePaths[nodeId][edgeIdx]}
                            directed={directed}
                            color={color}
                        />
                })
            )}
    </g>
}

const AlgorithmStepper = ({box, nodeAngles, edgePaths}) => {
    const dispatch = useDispatch()

    const flags = useSelector(state => state.present.graph.flags)
    const selectedNodes = useSelector(state => state.present.selection.nodes)
    const selectedEdges = useSelector(state => state.present.selection.edges)
    const nodes = useSelector(state => state.present.graph.nodes)
    const positions = useSelector(state => state.present.graph.attributes.nodes.position)
    const visibleEdgeAttributesCount = useSelector(state => Object.keys(state.present.graph.attributeTypes.edges).filter((e) => state.present.graph.attributeTypes.edges[e].visible).length)

    const algorithm = useSelector(state => state.present.algorithm)

    const edgeColors = useMemo(() => algorithm.result && algorithm.result.steps.length && algorithm.result.steps[algorithm.focus].edges.color
    , [algorithm.result, algorithm.focus]);

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
            <AlgorithmStepperEdgeColoring angles={nodeAngles} directed={flags.directed} positions={positions} edgePaths={edgePaths} nodes={nodes} colors={edgeColors} />
            <AlgorithmStepperEdgeLabels verticalOffset={visibleEdgeAttributesCount} angles={nodeAngles} edgePaths={edgePaths} directed={flags.directed} positions={positions} nodes={nodes} edgeAttributes={edgeAttributes} />
        </g>
    }
}

const AlgorithmDetails = () => {
    const algorithm = useSelector(state => state.present.algorithm)

    if(algorithm.result && algorithm.result.steps && algorithm.result.steps[algorithm.focus]) {
        const matrices = algorithm.result.steps[algorithm.focus].matrices

        if(matrices) {
            return <OverlayBox>
            {Object.keys(matrices).map((k) => {
                const matrix = matrices[k]
                return <div key={k}>
                    <h2>{k} matrix</h2>
                    <table cellSpacing={5}>
                        <tbody>
                           {matrix.map((row, y) => {
                               return <tr key={y}>
                                   {row.map((d, x) => {
                                       return <td key={x}>
                                           {d != null ? d : "∞"}
                                       </td>
                                   })}
                               </tr>
                           })}
                        </tbody>
                    </table>
                </div>
            })}
            </OverlayBox>
        }
    }

    return <></>
}


const NodeSelection = ({x,y}) => {
    return <NodeCircleSelection cx={x} cy={y} r={20} />
}


const NodeEdgeSelection = ({edgePath,directed}) => {
    return <EdgeSelectionLine d={edgePath.string} />
}

const GraphSelection = ({box, nodeAngles, edgePaths}) => {
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

            return <NodeEdgeSelection
                key={`${from}-${edgeIdx}`}
                edgePath={edgePaths[from][edgeIdx]}
                directed={flags.directed}
            />;
        })}
    </g>
}

const GithubBadge = () => {
    return <a title="Form me on GitHub" href="https://github.com/laszlokorte/graph-tools">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 250 250" fill="#444444" style={{position: 'absolute', right: 0, top: '3em'}}>
          <path d="M0 0l115 115h15l12 27 108 108V0z" fill="#444444"/>
          <path fill="#CCCCCC" d="M128 109c-15-9-9-19-9-19 3-7 2-11 2-11-1-7 3-2 3-2 4 5 2 11 2 11-3 10 5 15 9 16" />
          <path fill="#CCCCCC" d="M115 115s4 2 5 0l14-14c3-2 6-3 8-3-8-11-15-24 2-41 5-5 10-7 16-7 1-2 3-7 12-11 0 0 5 3 7 16 4 2 8 5 12 9s7 8 9 12c14 3 17 7 17 7-4 8-9 11-11 11 0 6-2 11-7 16-16 16-30 10-41 2 0 3-1 7-5 11l-12 11c-1 1 1 5 1 5z"/>
        </svg>
    </a>
}

export default () => {
	return <div>
        <GithubBadge />
        <GraphEditor />
    </div>
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

    const edgePaths = useSelector(state => {
        const positions = state.present.graph.attributes.nodes.position
        const paths = state.present.graph.attributes.edges.path
        const nodes = state.present.graph.nodes
        const t = 0.8;

        return nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                if(neighbourId == nodeId) {
                    const angle = nodeAngles[nodeId] + Math.PI;
                    const normX = Math.cos(angle);
                    const normY = Math.sin(angle);
                    const orientation = Math.round(((Math.atan2(normX, normY) + Math.PI) / Math.PI + 0.5) * 2) % 4

                    return {
                        string: 'M 0 0',
                        curve: [0,0],
                        midpoints: [],
                        anchors: [],
                        median: {
                            x: positions[nodeId].x + normX * 50,
                            y: positions[nodeId].y + normY * 50,
                            normX: normX,
                            normY: normY,
                        },
                        text: {
                            x: positions[nodeId].x + normX * 50,
                            y: positions[nodeId].y + normY * 50,
                            normX: normX,
                            normY: normY,
                            orientation: orientation
                        },
                        tip: {
                            x: positions[nodeId].x + normX * 50,
                            y: positions[nodeId].y + normY * 50,
                            angle: 0,
                        }
                    }
                }

                let controls = paths[nodeId][edgeIdx]
                let points = [...controls]

                const startPosition = positions[nodeId];
                const endPosition = positions[neighbourId];

                if(controls.length == 0) {
                    const deltaX = startPosition.x - endPosition.x;
                    const deltaY = startPosition.y - endPosition.y;
                    const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
                    const normX = deltaX / distance;
                    const normY = deltaY / distance;
                    points = [
                        (startPosition.x + endPosition.x) / 2 + 20 * normY,
                        (startPosition.y + endPosition.y) / 2 - 20 * normX,
                    ]
                }

                const lastX = points[points.length-2]
                const lastY = points[points.length-1]
                const firstX = points[0]
                const firstY = points[1]

                const departX = firstX - startPosition.x
                const departY = firstY - startPosition.y
                const arivX = lastX - endPosition.x
                const arivY = lastY - endPosition.y

                const departLength = Math.sqrt(departX * departX + departY * departY)
                const arivLength = Math.sqrt(arivX * arivX + arivY * arivY)
                const departXNorm = departX / departLength
                const departYNorm = departY / departLength
                const arivXNorm = arivX / arivLength
                const arivYNorm = arivY / arivLength

                points.unshift(startPosition.y + departYNorm * 20)
                points.unshift(startPosition.x + departXNorm * 20)

                points.push(endPosition.x + arivXNorm * 20, endPosition.y + arivYNorm * 20)

                const curvePath = [];
                const stringPath = [];

                curvePath.push(points[0], points[1]);
                stringPath.push('M' + points[0] + ' ' + points[1]);

                const cs = []

                for (let i = 0; i < points.length - 3; i += 2)
                {
                    let p0x = (i > 0) ? points[i - 2] : points[0];
                    let p0y = (i > 0) ? points[i - 1] : points[1];
                    let p1x = points[i];
                    let p1y = points[i+1];
                    let p2x = points[i + 2];
                    let p2y = points[i + 3];
                    let p3x = (i != points.length - 4) ? points[i + 4] : p2x;
                    let p3y = (i != points.length - 4) ? points[i + 5] : p2y;

                    let cp1x = p1x + (p2x - p0x) / 6 * t;
                    let cp1y = p1y + (p2y - p0y) / 6 * t;

                    let cp2x = p2x - (p3x - p1x) / 6 * t;
                    let cp2y = p2y - (p3y - p1y) / 6 * t;

                    let cx = 0.125 * p1x + 0.75 * 0.5 * cp1x + 1.5 * 0.25 * cp2x + 0.125 * p2x;
                    let cy = 0.125 * p1y + 0.75 * 0.5 * cp1y + 1.5 * 0.25 * cp2y + 0.125 * p2y;

                    cs.push(cx,cy)

                    curvePath.push(cp1x, cp1y, cp2x, cp2y, p2x, p2y);
                    stringPath.push("C"+ cp1x +' '+ cp1y +' '+ cp2x +' '+ cp2y +' '+ p2x +' '+ p2y);
                }

                let mx, my, medianAngle, mNormX, mNormY

                if(points.length%4 != 0) {
                    mx = points[points.length / 2 - 1]
                    my = points[points.length / 2]
                    const p1x = cs[cs.length / 2 - 2]
                    const p1y = cs[cs.length / 2 - 1]
                    const p2x = cs[cs.length / 2]
                    const p2y = cs[cs.length / 2+1]
                    const d1x = p1x - mx
                    const d1y = p1y - my
                    const d2x = p2x - mx
                    const d2y = p2y - my
                    const l1 = Math.sqrt(d1x * d1x + d1y * d1y)
                    const l2 = Math.sqrt(d2x * d2x + d2y * d2y)
                    const dx = (d1x/l1 + d2x/l2) / 2
                    const dy = (d1y/l1 + d2y/l2) / 2
                    mNormX = -dx
                    mNormY = -dy
                } else {
                    mx = cs[cs.length / 2 - 1]
                    my = cs[cs.length / 2]
                    const p1x = points[points.length / 2 - 2]
                    const p1y = points[points.length / 2 - 1]
                    const p2x = points[points.length / 2]
                    const p2y = points[points.length / 2+1]
                    const d1x = p1x - mx
                    const d1y = p1y - my
                    const d2x = p2x - mx
                    const d2y = p2y - my
                    const l1 = Math.sqrt(d1x * d1x + d1y * d1y)
                    const l2 = Math.sqrt(d2x * d2x + d2y * d2y)
                    const dx = (d1x/l1 + d2x/l2) / 2
                    const dy = (d1y/l1 + d2y/l2) / 2
                    mNormX = -dx
                    mNormY = -dy
                }

                const norm = Math.sqrt(mNormX*mNormX + mNormY*mNormY);
                mNormX /= norm
                mNormY /= norm
                const orientation = Math.round(((Math.atan2(mNormX, mNormY) + Math.PI) / Math.PI + 0.5) * 2) % 4

                const angle = Math.atan2(
                    curvePath[curvePath.length-1] - cs[cs.length-1],
                    curvePath[curvePath.length-2] - cs[cs.length-2]
                )

                return {
                    string: stringPath.join(" "),
                    curve: curvePath,
                    midpoints: cs,
                    anchors: points.slice(2, -2),
                    median: {
                        x: mx,
                        y: my,
                        normX: mNormX,
                        normY: mNormY,
                    },
                    text: {
                        x: mx,
                        y: my,
                        normX: mNormX,
                        normY: mNormY,
                        orientation: orientation
                    },
                    tip: {
                        x: endPosition.x + arivXNorm * 20,
                        y: endPosition.y + arivYNorm * 20,
                        angle: angle,
                    }
                }
            })
        )
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
                    edgePaths={edgePaths}
                />
                <GraphSelection
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                    edgePaths={edgePaths}
                />
                <ToolComponent
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                    edgePaths={edgePaths}
                />
                <AlgorithmStepper
                    box={nonInfBox}
                    nodeAngles={nodeAngles}
                    edgePaths={edgePaths}
                />
            </Canvas>
            <AlgorithmDetails />
        </Container>;
}
