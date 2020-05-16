import * as React from 'react';
import {useRef, useMemo, useEffect, useLayoutEffect, useContext, useCallback} from 'react';
import styled from 'styled-components';
import { useSize } from './react-hook-size';

import { freeEdgePath } from './stores/graph/reducers/layout'

import { useSelector, useDispatch } from './stores/graph/context'
import { useSelector as useProjectsSelector } from './stores/projects/context'
import { ActionCreators } from 'redux-undo';
import {ALGORITHMS} from './stores/graph/reducers/algorithm/index';
import * as actions from './actions'
import * as selectors from './stores/graph/selectors'
import {graphFlagsSelector} from "./stores/graph/selectors";

const id = x => x
const useGraphSelector = (fn = id) => {
    return useSelector(state => fn === id ? state.data.present.graph : fn(state.data.present.graph))
}


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

const Overlay = styled.div`
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  background: #333333dd;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  z-index: 100;
`

const Window = styled.div`
  background: #f0f0f0;
  color: #222;
  padding: 1em;
  margin: 3em;
  border: 4px solid white;
  display: flex;
  flex-direction: column;
`

const BigList = styled.ul`
    display: flex;
    flex-direction: column;
    padding: 0;
    list-style: none;
`

const BigListItem = styled.li`
    padding: 1em;
    cursor: pointer;
    border-bottom: 1px solid #aaa;

    &:hover {
      background-color: #fff;
    }

    &:active {
      background-color: #e0e0e0;
    }
`

const Code = styled.textarea`
    display: block;
    width: 100%;
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
    flex-grow: 1;
`


const Scroller = styled.div`
    overflow-y:scroll;
    grid-area: c;
`


const ErrorMessage = styled.div`
    background: #980715;
    color: #fff;
    border-radius: 3px;
    text-align: center;
    margin: 0.3em;
    padding: 0.5em;
    grid-area: d;
    align-self: end;
    z-index: 10;
    pointer-events: none;
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
    padding: 6px 6px 0 6px;
    margin: 0;
    font-size: 1em;
    font-weight: 400;
    color: #000;
    font-size: 0.9em;
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
    padding: 0;
`

const DetailsBox = styled.div`
    border-radius: 5px;
    margin: 5px;
    padding: 3px;
    background: #CEEBFC;
    border: 1px solid #2369B5;
`

const DetailsBoxButton = styled.button`
    border-radius: 3px;
    padding: 3px 5px;
    background: #2D69B3;
    border: none;
    color: #fff;
    cursor: pointer;
`

const DetailsBoxHead = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5em;
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
    margin: 0;
    padding: 0.2em;
    list-style: none;
`

const CheckboxListItem = styled.li`
    padding: 0.1em;
`

const DefinitionList = styled.dl`
    padding: 0.3em;
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
    const attr = useSelector(selectors.nodeAttributeSelector(attrKey, nodeId))

    const typeName = attr.type.type

    const onChange = useCallback(
        (evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))
    , [nodeId, attrKey])

    const onCheck = useCallback(
        (evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))
    , [nodeId, attrKey])

    if(['text','color','numeric'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="text" value={attr.value || ''} onChange={onChange} /></dd>
        </>);
    } else if(['boolean'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={attr.value===true} onChange={onCheck} /></dd>
        </>);
    } else if(['enum'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd>
                <select value={attr.value} onChange={onChange}>
                    {attr.type.required ? null : <option value={null}>---</option>}
                    {attr.type.options.map((v, i) => {
                        return <option key={i}>{v}</option>
                    })}
                </select>
            </dd>
        </>);
    } else {
        return (<>
            <dt>{attrKey}:</dt>
            <dd><input type={attr.type} value={JSON.stringify(attr.value)} readOnly /></dd>
        </>);

    }
}

const NodeDetails = ({nodeId}) => {
    const dispatch = useDispatch()

    const neighbours = useSelector(selectors.neighboursSelector(nodeId))

    const attributes = useSelector(selectors.nodeAttributeTypesSelector)

    const onClick = useCallback(() => dispatch(actions.deleteNode(nodeId)), [nodeId]);

    return <DetailsBox>
        <DetailsBoxHead>
        <SubSectionTitle>Node (#{nodeId})</SubSectionTitle>
        <DetailsBoxButton onClick={onClick}>Delete</DetailsBoxButton>
        </DetailsBoxHead>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
            {attributes.map((attrKey) =>
                <NodeAttribute key={attrKey} nodeId={nodeId} attrKey={attrKey} />
            )}
        </DefinitionList>
        <SubSubSectionTitle>Neighbourhood</SubSubSectionTitle>
        <LinkList>
            {neighbours.length === 0 ? <li>No outgoing edges</li> :
                neighbours.map((neighbour, idx) =>
                    neighbour === nodeId ?
                    <li key={idx}><BadgeLink onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>↩</BadgeLink> self</li> :
                    <li key={idx}><BadgeLink onClick={() => dispatch(actions.selectEdge(nodeId, idx))}>→</BadgeLink><Link onClick={() => dispatch(actions.selectNode(neighbour))}>Node #{neighbour}</Link></li>
            )}
        </LinkList>
    </DetailsBox>
}

const EdgeAttribute = ({nodeId, edgeIndex, attrKey}) => {
    const dispatch = useDispatch()
    const attr = useSelector(selectors.edgeAttributeSelector(attrKey, nodeId, edgeIndex))

    const onChangeText = useCallback(
        (evt) => dispatch(actions.setEdgeAttribute(nodeId, edgeIndex, attrKey, evt.target.value)),
        [attr.type]
    );
    const onChangeCheckbox = useCallback(
        (evt) => dispatch(actions.setEdgeAttribute(nodeId, edgeIndex, attrKey, evt.target.checked)),
    [attr.type]);

    if(['text','color','numeric'].includes(attr.type.type)) {
        return <>
            <dt>{attrKey}:</dt>
            <dd><input type={attr.type.type} value={attr.value+''} onChange={onChangeText} /></dd>
        </>
    } else if(['boolean'].includes(attr.type.type)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={attr.value===true} onChange={onChangeCheckbox} /></dd>
        </>);
    } else {
        return <>
            <dt>{attrKey}:</dt>
            <dd><input type={attr.type.type} value={JSON.stringify(attr.value)} readOnly /></dd>
        </>
    }
}

const EdgeDetails = ({nodeId, edgeIndex}) => {
    const dispatch = useDispatch()

    const graph = useSelector(selectors.graphSelector)

    const target = useSelector(selectors.neighbourNodeSelector(nodeId, edgeIndex))
    const attributes =  useSelector(selectors.edgeAttributeTypesSelector)
    const flags = useSelector(selectors.graphFlagsSelector)
    const prev = useSelector(selectors.prevMultiEdgeIndex(nodeId, edgeIndex))
    const next = useSelector(selectors.nextMultiEdgeIndex(nodeId, edgeIndex))

    return <DetailsBox>
        <DetailsBoxHead>
        <SubSectionTitle>Edge</SubSectionTitle>
        <DetailsBoxButton onClick={() => dispatch(actions.deleteEdge(nodeId, edgeIndex))}>Delete</DetailsBoxButton>
        </DetailsBoxHead>
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
    </DetailsBox>
}

const GraphOptions = () => {
    const dispatch = useDispatch()

    const flags = useSelector(selectors.graphFlagsSelector)


    return <CheckboxList>
        {Object.keys(flags).map((flagKey) =>
            <CheckboxListItem key={flagKey}>
                <label>
                    <input type="checkbox" onChange={(e) => dispatch(actions.setFlag(flagKey, e.target.checked))} checked={flags[flagKey]} /> {flagKey}
                </label>
            </CheckboxListItem>
        )}
    </CheckboxList>
}

const ViewOptions = () => {
    const dispatch = useDispatch()

    const edgeAttributes = useSelector(selectors.edgeAttributesSelector)

    const nodeAttributes = useSelector(selectors.nodeAttributesSelector)


    return <div>
        <SubSectionTitle>Visible Edge Attributes</SubSectionTitle>
        <CheckboxList>
            {Object.keys(edgeAttributes).map((attrKey) =>
                <CheckboxListItem key={attrKey}>
                    <label>
                    <input type="checkbox" onChange={(e) => dispatch(actions.setEdgeAttributeVisible(attrKey, e.target.checked))} checked={edgeAttributes[attrKey].visible === true} /> {attrKey}
                    </label>
                </CheckboxListItem>
            )}
        </CheckboxList>
        <SubSectionTitle>Visible Node Attributes</SubSectionTitle>
        <CheckboxList>
        {Object.keys(nodeAttributes).map((attrKey) =>
            <CheckboxListItem key={attrKey}>
                <label>
                <input type="checkbox" onChange={(e) => dispatch(actions.setNodeAttributeVisible(attrKey, e.target.checked))} checked={nodeAttributes[attrKey].visible === true} /> {attrKey}
                </label>
            </CheckboxListItem>
        )}
        </CheckboxList>
    </div>
}

const Tools = ({tools, currentTool, onSelectTool}) => {
    const dispatch = useDispatch();
    const canUndo = useSelector(selectors.canUndoSelector)


    const canRedo = useSelector(selectors.canRedoSelector)

    const toggleProjectList = useCallback(() => dispatch(actions.toggleProjectList()), [])
    const undo = useCallback(() => dispatch(ActionCreators.undo()), [])
    const redo = useCallback(() => dispatch(ActionCreators.redo()), [])
    const layout = useCallback(() => dispatch(actions.autoLayout()), [])
    const clear = useCallback(() => dispatch(actions.clearGraph()), [])
    const clearEdges = useCallback(() => dispatch(actions.clearGraphEdges()), [])

    return <Toolbar>
        <ToolButton onClick={toggleProjectList}>Open</ToolButton>
        <ToolButton disabled={!canUndo} onClick={undo}>↶</ToolButton>
        <ToolButton disabled={!canRedo} onClick={redo}>↷</ToolButton>
        <ToolButton onClick={clear}>Clear</ToolButton>
        <ToolButton onClick={clearEdges}>Clear Edges</ToolButton>
        <ToolButton onClick={layout}>Auto Layout</ToolButton>
        {Object.keys(tools).map((t) =>
            <ToolButton key={t} disabled={t===currentTool} onClick={() => onSelectTool(t)}>{tools[t]}</ToolButton>
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
    const graph = useSelector(selectors.graphSelector)

    const alg = ALGORITHMS.find((a) => a.key === algorithm)
    const canRun = alg !== null && meetRequirements(alg, graph)
    const nodes = graph.nodes
    const edgeAttributes = graph.attributeTypes.edges
    const nodeAttributes = graph.attributeTypes.edges

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
    const algorithm = useSelector(selectors.algorithmSelector);
    const algorithmSelection = useSelector(selectors.algorithmSelectionSelector);

    const algorithmType = algorithm.type
    const flags = useSelector(graphFlagsSelector)

    const selectAlg = useCallback((evt) => {
        dispatch(actions.selectAlgorithm(evt.target.value))
    }, [dispatch])


    const applicableAlgorithms = ALGORITHMS.filter((alg) => {
        return !alg.requirements || Object.entries(alg.requirements).every(([k,v]) => {
            return flags[k] === v;
        })
    })

    return <ToolbarSection>
        <div>
            <span>Run Algorithm:</span><br/>
            <select style={{maxWidth: '10em'}} value={algorithmSelection} onChange={selectAlg}>
                {applicableAlgorithms.map((a) =>
                    <option key={a.key} value={a.key}>{a.name}</option>
                )}
            </select>
        </div>
        <AlgorithmOptions algorithm={algorithmSelection} />
        {algorithmSelection !== algorithmType ? null : <AlgorithmResult />}
    </ToolbarSection>
}

const AlgorithmResult = () => {
    const dispatch = useDispatch();
    const algorithm = useSelector(selectors.algorithmSelector)


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
    const dispatch = useDispatch()

    const selection = useSelector(selectors.selectionSelector)
    const properties = useSelector(selectors.graphPropertiesSelector)
    const flags = useSelector(selectors.graphFlagsSelector)
    const nodes = selection.nodes
    const edges = selection.edges
    const empty = edges.length < 1 && nodes.length < 1

    const toggleSettings = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleSettings())
        }
    }, [dispatch])

    const toggleDump = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleDump())
        }
    }, [dispatch])

    return <Scroller>
            <ToolButton onClick={toggleSettings}>Settings</ToolButton>
            <ToolButton onClick={toggleDump}>Dump</ToolButton>

            <Section>
            <SectionTitle>Properties</SectionTitle>
            <SectionBody>
            <DefinitionList>
                <dt>Type</dt>
                <dd>{flags.directed ? 'Directed' : 'Undirected'} {flags.multiGraph ? 'Multi-Graph' : 'Graph'}</dd>
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
    </Scroller>
}


const Dump = ({value}) =>
    <Code readOnly value={JSON.stringify(value, null, 2)}/>

const viewboxString = (screen, camera) =>
  (camera.center.x - screen.width / 2 / camera.zoom) + " " +
  (camera.center.y - screen.height / 2 / camera.zoom) + " " +
  (screen.width / camera.zoom) + " " +
  (screen.height / camera.zoom)

const useSVGPosition = (ref) => {
    return useMemo(() => {
        let point
        return ({x,y}) => {
            if(!ref.current) {
                return {x,y}
            }
            if(!point) {
                point = ref.current.parentNode.createSVGPoint();
            }
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
    }, [ref]);
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


const cam = (s) => s.camera
const Canvas = ({children}) => {
    const screenRef = useRef();
    const screen = useSize(screenRef, 100, 100);
    const posRef = useRef();
    const svgPos = useSVGPosition(posRef);
    const dispatch = useDispatch();
    const camera = useSelector(selectors.cameraSelector);


    const currentCamera = useRef(camera);
    useLayoutEffect(() => {
        currentCamera.current = camera
    }, [camera])

    useEffect(() => {
        dispatch(actions.cameraUpdateScreen(screen))
    }, [screen]);

    const viewBox = viewboxString(screen, camera);

    const onMouseMoveHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

        if(currentCamera.current.panX !== null) {
            dispatch(actions.cameraMovePan(pos.x, pos.y))
        }
    }, [svgPos,currentCamera])

     const onDoubleClickHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

         dispatch(actions.cameraJumpZoom(pos.x, pos.y))
    }, [svgPos])

    const onMouseDownHandler = useCallback((e) => {
        const pos = svgPos({x: e.clientX, y: e.clientY})

        e.preventDefault();
        e.stopPropagation();
        dispatch(actions.cameraStartPan(pos.x, pos.y))
    }, [svgPos])

    const onMouseUpHandler = useCallback((e) => {
        e.preventDefault();

        dispatch(actions.cameraStopPan())
    }, [svgPos])

    const onWheelHandler = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        const pivot = svgPos({x: e.clientX, y: e.clientY})
        const factor = wheelFactor(e);

        if(e.shiftKey) {
            dispatch(actions.cameraPan(e.deltaX, e.deltaY))
        } else if(e.altKey) {
            dispatch(actions.cameraRotate(pivot.x, pivot.y, 10 * Math.log2(factor)))
        } else {
            dispatch(actions.cameraZoom(pivot.x, pivot.y, factor))
        }
    }, [dispatch, svgPos])

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
        onDoubleClick={onDoubleClickHandler}
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
                    x={camera.box.minX}
                    y={camera.box.minY}
                    width={camera.box.maxX - camera.box.minX}
                    height={camera.box.maxY - camera.box.minY}
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

const NodeLabelKey = styled.text`
    pointer-events: none;
    text-anchor: end;
    font-size: 0.6em;
    fill: gray;
    text-transform: uppercase;
`


const NodeLabelValue = styled.text`
    cursor: default;
    text-anchor: start;
`

const EdgeLine = styled.path`
	fill: none;
	stroke:currentColor;
	stroke-width: 1;
	stroke-linejoin: round;
	stroke-linecap: round;
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
    pointer-events: none;
    text-anchor: ${({orientation: o}) => o===2 ? 'end' : (o===0 ? 'start' : 'middle')};
`

const EdgeLabelKey = styled.tspan`
   font-size: 0.6em;
   fill: gray;
   text-transform: uppercase;
`

const EdgeLabelValue = styled.tspan`
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

const EdgeHandleAdvanced = styled.circle`
    cursor: default;
    fill: #84DBDB;
    opacity: 0.5;
    cursor: alias;
    pointer-events: fill;
    stroke: none;
    stroke-width: 3;

    &:hover {
      stroke: #84DBDB;
    }
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
	cursor: move;
`

const PathHandleDotSmall = styled.circle`
	fill: #396DF2;
	cursor: move;
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

const Edge = ({nodeId, edgeIndex = null, edgePath, onClick = null, onDoubleClick = null, style = null, directed = true, disabled=false}) => {
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

const NewEdge = ({loop = false, x0, y0, x1, y1, directed = true, offset=false, angle = 0}) => {
    const path = freeEdgePath(20, loop, x0, y0, x1, y1, angle, directed, offset)

    let pathString = "M" + path.points[0] + ' ' + path.points[1];

    for(let p=2;p<path.points.length;p+=6) {
        pathString += 'C ' + path.points[p] + ' ' + path.points[p+1] + ' ' + path.points[p+2] + ' ' + path.points[p+3] + ' ' + path.points[p+4] + ' ' + path.points[p+5]
    }

    return <>
        <path pointerEvents="none" fill="none" d={pathString} stroke="black" />
        {directed ? <EdgeHead angle={path.tip.angle} x={path.tip.x} y={path.tip.y} disabled={true} /> : null}
    </>;
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

const EdgeGrabber = ({nodeId, neighbourId, edgeIdx, edgePath, mouseDown}) => {
    const mouseDownCallback = useCallback(mouseDown ? (evt) => {
        const node = 1*evt.target.getAttribute('data-node-id')
        const x = 1*evt.target.getAttribute('data-x')
        const y = 1*evt.target.getAttribute('data-y')
        const control = 1*evt.target.getAttribute('data-control')
        mouseDown(evt, node, edgeIdx, x, y, control)
    } : null, [mouseDown])


    if(neighbourId == nodeId) {
        return <EdgeHandleAdvanced
        onMouseDown={mouseDownCallback}
        cx={edgePath.median.x - 3 * edgePath.median.normX}
        cy={edgePath.median.y - 3 * edgePath.median.normY}
        data-x={edgePath.median.x - 3 * edgePath.median.normX}
        data-y={edgePath.median.y - 3 * edgePath.median.normY}
        data-node-id={nodeId}
        data-control={edgePath.anchors.length / 2}
        r={7} />
    } else {
    return <EdgeHandleAdvanced
        onMouseDown={mouseDownCallback}
        cx={edgePath.median.x - 20 * edgePath.median.normX}
        cy={edgePath.median.y - 20 * edgePath.median.normY}
        data-x={edgePath.median.x - 20 * edgePath.median.normX}
        data-y={edgePath.median.y - 20 * edgePath.median.normY}
        data-node-id={nodeId}
        data-control={edgePath.anchors.length / 2}
        r={10} />
    }
}

const EdgesManipulator = ({nodes, layout, selectEdge, deleteEdge}) => {
    return <>
    {nodes.map((neighbors, nodeId) =>
        neighbors.map((neighbourId, edgeIdx) => {

            return <EdgeManipulator
                key={nodeId + '-' + edgeIdx}
                deleteEdge={deleteEdge}
                selectEdge={selectEdge}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
                edgePath={layout.edgePaths[nodeId][edgeIdx]}
            />
        })
    )}
    </>
}


const EdgesGrabber = ({nodes, layout, grabEdge, selectedEdges}) => {
    return <>
        {selectedEdges.map((e) => {
            const nodeId = e[0];
            const edgeIdx = e[1];
            const neighbourId = nodes[nodeId][edgeIdx];


            return <EdgeGrabber
                key={nodeId + '-' + edgeIdx}
                mouseDown={grabEdge}
                nodeId={nodeId}
                neighbourId={neighbourId}
                edgeIdx={edgeIdx}
                edgePath={layout.edgePaths[nodeId][edgeIdx]}
            />
        })}
    </>
}



const EdgePathManipulator = ({nodeId, edgeIdx, controls, edgePath, mouseDownControl, doubleClickControl}) => {
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
            result.push(<PathHandleDotSmall key={"b"+i} cx={cx} cy={cy} r={3} />)
            result.push(<PathHandle onMouseDown={mouseDownNew} data-c={(i-2)/6} data-x={cx} data-y={cy} key={"a"+i} cx={cx} cy={cy} r={7} />)
        } else if(i === 2) {
            result.push(<PathHandleDotSmall key={"b"+i} cx={edgePath.curve[i+4]} cy={edgePath.curve[i+5]} r={3} />)
            result.push(<PathHandle onMouseDown={mouseDownNew} data-c={(i-2)/6}  data-x={edgePath.curve[i+4]} data-y={edgePath.curve[i+5]} key={"a"+i} cx={edgePath.curve[i+4]} cy={edgePath.curve[i+5]} r={7} />)
        }
    }

    for(let i=0; i<controls.length; i += 2) {
        const cx = controls[i];
        const cy = controls[i + 1];
        result.push(<PathHandleDot  key={"d"+i} cx={cx} cy={cy} r={5} />)
        result.push(<PathHandle onMouseDown={mouseDownExisting} onDoubleClick={doubleClick} data-c={i/2} data-x={cx} data-y={cy} key={"c"+i} cx={cx} cy={cy} r={7} />)
    }

    return result;
}

const EdgesPathManipulator = ({nodes, directed, positions, paths, layout, selectedEdges}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const manipulation = useSelector(selectors.pathManipulatorSelector)

    const manipulationRef = useRef(manipulation)

    useLayoutEffect(() => {
        manipulationRef.current = manipulation
    }, [manipulation])

    const onMouseUp = useCallback((evt) => {
        if(manipulationRef.current.nodeIdx != null) {
            dispatch(actions.setEdgeAttribute(manipulationRef.current.nodeIdx, manipulationRef.current.edgeIdx, 'path', manipulationRef.current.path))
        }
        if(manipulationRef.current.nodeIdx !== null) {
            dispatch(actions.pathManipulatorStop())
        }
    }, [manipulationRef, dispatch])

    const onMouseMove = useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});
        if(manipulationRef.current.nodeIdx !== null) {
            dispatch(actions.pathManipulatorMove(pos.x, pos.y))
        }
    }, [dispatch, canvasPos, manipulationRef])

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
            dispatch(actions.pathManipulatorCreate(nodeIdx, edgeIdx, controlIdx, oldPath, x, y))
        } else {
            dispatch(actions.pathManipulatorStartMove(nodeIdx, edgeIdx, controlIdx, oldPath, x, y))
        }
    }, [paths, dispatch])

    const doubleClickControl = useCallback((n, e, c, evt) => {
        evt.stopPropagation();
        const oldPath = paths[n][e];
        const newPath = [...oldPath.slice(0, c*2), ...oldPath.slice(c*2 + 2)]
        dispatch(actions.setEdgeAttribute(n, e, 'path', newPath))
    }, [paths, dispatch])

    return <>
        {selectedEdges.map((e) => {
            const nodeId = e[0];
            const edgeIdx = e[1];
            const neighbourId = nodes[nodeId][edgeIdx];

            if(nodeId == neighbourId) {
                return null;
            }

            return <g key={nodeId + '-' + edgeIdx}>
                {
                    (manipulation.nodeIdx === nodeId && manipulation.edgeIdx == edgeIdx) ?
                    <PathHandleDot r="8" cx={manipulation.path[manipulation.controlIdx * 2]} cy={manipulation.path[manipulation.controlIdx * 2 + 1]} />
                    : null }
                    <EdgePathManipulator
                        key={nodeId + '-' + edgeIdx}
                        edgePath={layout.edgePaths[nodeId][edgeIdx]}
                        controls={paths[nodeId][edgeIdx]}
                        endPosition={positions[neighbourId]}
                        nodeId={nodeId}
                        edgeIdx={edgeIdx}
                        mouseDownControl={mouseDownControl}
                        doubleClickControl={doubleClickControl}
                        directed={directed} />
            </g>
        })}
    </>
}



const GraphManipulator = ({box, layout}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()
    const graph = useSelector(selectors.graphSelector)

    const selection = useSelector(selectors.selectionSelector)

    const flags = (graph.flags)
    const selectedEdges = selection.edges
    const nodes = (graph.nodes)
    const positions = (graph.attributes.nodes.position)
    const paths = (graph.attributes.edges.path)

    const manipulation = useSelector(selectors.manipulatorSelector)


    const manipulationRef = useRef(manipulation)

    useLayoutEffect(() => {
        manipulationRef.current = manipulation
    }, [manipulation])

    const onMouseUp = useCallback((evt) => {
        if(manipulationRef.current.connectionStart !== null && manipulationRef.current.connectionSnap !== null) {
            dispatch(actions.addEdge(
                manipulationRef.current.connectionStart,
                manipulationRef.current.connectionSnap
            ))
        } else if(manipulationRef.current.connectionStart !== null) {
            dispatch(actions.createNode(
                manipulationRef.current.x+manipulationRef.current.offsetX,
                manipulationRef.current.y+manipulationRef.current.offsetY,
                manipulationRef.current.connectionStart,
                manipulationRef.current.edgeIndex,
                evt.altKey,
                manipulationRef.current.control
            ))
        } else if(manipulationRef.current.movingNode !== null) {
            if(manipulationRef.current.hasMoved) {
                dispatch(actions.setNodeAttribute(
                    manipulationRef.current.movingNode,
                    'position',
                    {x:manipulationRef.current.x+manipulationRef.current.offsetX, y:manipulationRef.current.y+manipulationRef.current.offsetY}
                ))
            } else {
                dispatch(actions.selectNode(manipulationRef.current.movingNode, evt.metaKey || evt.ctrlKey || evt.shiftKey, evt.metaKey || evt.ctrlKey));
            }
        } else if(manipulationRef.current.x !== null && manipulationRef.current.y !== null) {
            dispatch(actions.createNode(
                manipulationRef.current.x+manipulationRef.current.offsetX,
                manipulationRef.current.y+manipulationRef.current.offsetY
            ))
        }

        dispatch(actions.manipulatorStop())
    }, [dispatch]);

    useEffect(() => {
        const prevMouseUp = onMouseUp
        window.addEventListener('mouseup', prevMouseUp)

        return () => {
            window.removeEventListener('mouseup', prevMouseUp)
        }
    }, [onMouseUp]);

    const onMouseMove =  useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});
        if(manipulationRef.current.x !== null || manipulationRef.current.connectionSnap !== null) {
            dispatch(actions.manipulatorMove(pos.x, pos.y))
        }
    }, [canvasPos, manipulationRef])


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

        dispatch(actions.manipulatorStartConnect(nodeId, pos.x, pos.y, cx - pos.x, cy - pos.y))
    }, [dispatch, canvasPos]);

    const snap = useCallback((evt, nodeId) => {
        if(manipulationRef.current.connectionStart !== null) {
            dispatch(actions.manipulatorSnapConnect(nodeId))
        }
    }, [dispatch, manipulationRef]);

    const unsnap = useCallback((evt) => {
        if(manipulationRef.current.connectionStart !== null) {
            const pos = canvasPos({x: evt.clientX, y: evt.clientY});
            dispatch(actions.manipulatorUnsnapConnect(pos.x, pos.y))
        }
    }, [canvasPos,dispatch, manipulationRef]);

    const moveStart = useCallback((evt, nodeId, cx, cy) => {
        evt.preventDefault();
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatch(actions.manipulatorStartMove(nodeId, pos.x, pos.y, cx - pos.x, cy - pos.y))
    }, [canvasPos, dispatch]);

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

        dispatch(actions.manipulatorStartCreate(pos.x, pos.y))
    }, [canvasPos, dispatch])

    const onGrabEdge = useCallback((evt, nodeId, edgeIndex, cx, cy, control) => {
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatch(actions.manipulatorStartConnect(nodeId, pos.x, pos.y, cx - pos.x, cy - pos.y, edgeIndex, control))
    }, [canvasPos, dispatch])

    return <g>
        <rect style={{pointerEvents: 'all',cursor:'copy'}} onMouseDown={onMouseDown} x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" />
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
                layout={layout}
                selectEdge={selectEdge}
                deleteEdge={deleteEdge}
            /> : null
        }
        {
            <EdgesGrabber
                nodes={nodes}
                grabEdge={onGrabEdge}
                layout={layout}
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
                layout={layout}
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
                    loop={manipulation.connectionStart == manipulation.connectionSnap}
                    x0={positions[manipulation.connectionStart].x}
                    y0={positions[manipulation.connectionStart].y}
                    x1={positions[manipulation.connectionSnap].x}
                    y1={positions[manipulation.connectionSnap].y}
                    directed={flags.directed}
                    offset={true}
                    angle={layout.nodeAngles[manipulation.connectionStart]}
                />
         :
            <NewEdge
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
    pointer-events: stroke;
    cursor: default;
`

const NodeEdgeSelector = ({nodeId,edgeIndex,edgePath,onMouseDown}) => {
    const onMouseDownCallback = useCallback(onMouseDown ? (evt) => {
        onMouseDown(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onMouseDown])

    return <EdgeSelectorLine onMouseDown={onMouseDownCallback} d={edgePath.string} />
}



const SelectionBox = styled.polygon`
    fill: none;
    stroke-width: 1;
    stroke: rgba(135, 208, 249, 1.0);
    stroke-dasharray: 3 3;
    fill: rgba(135, 208, 249, 0.4);
    vector-effect: non-scaling-stroke;
`

const GraphSelector = ({box, layout}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = useSelector(selectors.graphFlagsSelector)

    const nodes = useSelector(selectors.nodesSelector)

    const positions = useSelector(selectors.nodesPositionsSelector)

    const range = useSelector(selectors.selectionBoxSelector)



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


    const mouseDown = useCallback((evt) => {
        if(evt.altKey) {
            return;
        }
        evt.stopPropagation();
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        dispatch(actions.selectionBoxStart(pos.x, pos.y))
    }, [dispatch, canvasPos]);

    const mouseMove = useCallback((evt) => {
        const pos = canvasPos({x: evt.clientX, y: evt.clientY});

        if(range.x0 !== null) {
            dispatch(actions.selectionBoxMove(pos.x, pos.y))
        }
    }, [dispatch, canvasPos, range]);

    const mouseUp = useCallback((evt) => {
        dispatch(actions.selectionBoxStop())
    }, [dispatch]);

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
        <rect style={{pointerEvents:'all'}} onClick={clearSelection} x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" />
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
                        edgePath={layout.edgePaths[nodeId][edgeIdx]}
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

const GraphLayerEdges = ({directed, nodes, layout}) => {
    return <>
        {nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                return <NodeEdge
                        nodeId={nodeId}
                        edgeIndex={edgeIdx}
                        key={`${nodeId}-${edgeIdx}`}
                        edgePath={layout.edgePaths[nodeId][edgeIdx]}
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
                    return <React.Fragment
                            key={nodeId}>
                        <NodeLabelKey
                            x={pos.x}
                            y={30 + pos.y}
                            dy={20 * (0.5 + i)}
                        >{k}: </NodeLabelKey>
                        <NodeLabelValue
                            x={pos.x}
                            y={30 + pos.y}
                            dx={6}
                            dy={20 * (0.5 + i)}
                        >{JSON.stringify(labels[k][nodeId])}</NodeLabelValue>
                    </React.Fragment>
                })}
            </g>
        })}
    </g>
}

const GraphLayerEdgeLabels = ({nodes, labels, labelKeys, layout}) => {
    return <>
        {labelKeys.map((k, kdx) => {
            return <g key={k}>
                {nodes.map((neighbors, nodeId) =>
                    neighbors.map((neighbourId, edgeIdx) => {
                        const e = layout.edgePaths[nodeId][edgeIdx];
                        return <EdgeLabel key={nodeId + '-' + edgeIdx} x={e.text.x + 10 * e.text.normX - Math.abs(10 * e.text.normY)} y={e.text.y + 10 * (0.5+e.text.normY)} dy={15 * (0.5 + kdx) - 15 * (1-e.text.normY) * 0.5*labelKeys.length} orientation={e.text.orientation}>
                            <EdgeLabelKey>{k}:</EdgeLabelKey>
                            <EdgeLabelValue dx={5}>{String(labels[k][nodeId][edgeIdx])}</EdgeLabelValue>
                        </EdgeLabel>
                    })
                )}
            </g>
        })}
    </>
}

const Graph = ({box, layout}) => {
    const excludedEdgeAttributes = ['path']
    const excludedNodeAttributes = ['position']

    const graph =  useGraphSelector()

    const flags = (graph.flags)
    const nodes = (graph.nodes)
    const positions = (graph.attributes.nodes.position)

    const nodeAttributes = (graph.attributes.nodes)
    const visibleNodeAttributes = Object.keys(graph.attributeTypes.nodes).filter((n) => !excludedNodeAttributes.includes(n) && graph.attributeTypes.nodes[n].visible)

    const edgeAttributes = (graph.attributes.edges)
    const visibleEdgeAttributes = Object.keys(graph.attributeTypes.edges).filter((e) => !excludedEdgeAttributes.includes(e) && graph.attributeTypes.edges[e].visible)

    return <g>
        <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="white" />
        <GraphLayerNodes positions={positions} />
        <GraphLayerEdges layout={layout} directed={flags.directed} nodes={nodes} />
        <GraphLayerNodeLabels positions={positions} labels={nodeAttributes} labelKeys={visibleNodeAttributes} />
        <GraphLayerEdgeLabels layout={layout}  nodes={nodes} positions={positions} labels={edgeAttributes} labelKeys={visibleEdgeAttributes} />
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

const NodeEdgeStepper = ({color, edgePath}) => {
    return <EdgeStepperLine stroke={color} d={edgePath.string} />
}

const AlgorithmStepperNodeLabels = ({positions, nodeAttributes, verticalOffset}) => {
    return <>
        {Object.keys(nodeAttributes).map((k, i, all) =>
            <g key={k}>
                {positions.map((pos, nodeId) => {
                    return <g key={nodeId}>
                        <NodeLabelKey
                            x={pos.x}
                            y={30 + pos.y}
                            dy={20 * (0.5 + i + verticalOffset)}
                        >{k}: </NodeLabelKey>
                        <NodeLabelValue
                            x={pos.x}
                            y={30 + pos.y}
                            dx={6}
                            dy={20 * (0.5 + i + verticalOffset)}
                        >{nodeAttributes[k][nodeId]}</NodeLabelValue>
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

const AlgorithmStepperLines = ({lines}) => {
    return <>
        {lines ? lines.map(({dashArray = null, length=100, points, stroke, x, y, dx, dy}, i) => {
            return <AlgorithmStepperLine strokeDasharray={dashArray} key={i} stroke={stroke||'green'} x1={x - dx * length} y1={y - dy * length} x2={x + dx * length} y2={y + dy * length} />
        }) : null}
    </>
}

const AlgorithmStepperEdgeLabels = ({nodes, edgeAttributes, layout, verticalOffset}) => {
    return <>
        {Object.keys(edgeAttributes).map((k, i, all) =>
            <g key={k}>
                {nodes.map((neighbors, nodeId) =>
                    neighbors.map((neighbourId, edgeIdx) => {
                        const e = layout.edgePaths[nodeId][edgeIdx];
                        return <EdgeLabel key={nodeId + '-' + edgeIdx} x={e.text.x + 10 * e.text.normX - Math.abs(10 * e.text.normY)} y={e.text.y + 10 * (0.5+e.text.normY)} dy={15 * (0.5 + i + Math.sign(e.text.normY) * verticalOffset) - 15 * (1-e.text.normY) * 0.5*all.length} orientation={e.text.orientation}>
                            <EdgeLabelKey>{k}:</EdgeLabelKey>
                            <EdgeLabelValue dx={5}>{edgeAttributes[k][nodeId][edgeIdx]}</EdgeLabelValue>
                        </EdgeLabel>
                    })
                )}
            </g>
        )}
    </>
}

const AlgorithmStepperEdgeColoring = ({layout, nodes, colors}) => {
    if(!colors) {
        return <></>;
    }

    return <g>
        {nodes.map((neighbors, nodeId) =>
                neighbors.map((neighbourId, edgeIdx) => {
                    const color = colors[nodeId][edgeIdx]

                    return <NodeEdgeStepper
                            key={`${nodeId}-${edgeIdx}`}
                            edgePath={layout.edgePaths[nodeId][edgeIdx]}
                            color={color}
                        />
                })
            )}
    </g>
}

const AlgorithmStepper = ({box, layout}) => {
    const graph = useSelector(selectors.graphSelector)

    const nodes = (graph.nodes)
    const positions = (graph.attributes.nodes.position)
    const visibleEdgeAttributesCount = Object.keys(graph.attributeTypes.edges).filter((e) => graph.attributeTypes.edges[e].visible).length
    const visibleNodeAttributesCount = Object.keys(graph.attributeTypes.nodes).filter((e) => graph.attributeTypes.nodes[e].visible).length

    const algorithm = useSelector(selectors.algorithmSelector)



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
            <AlgorithmStepperNodeLabels verticalOffset={visibleNodeAttributesCount} positions={positions} nodeAttributes={nodeAttributes} />
            <AlgorithmStepperEdgeColoring positions={positions} layout={layout} nodes={nodes} colors={edgeColors} />
            <AlgorithmStepperEdgeLabels verticalOffset={visibleEdgeAttributesCount} layout={layout} positions={positions} nodes={nodes} edgeAttributes={edgeAttributes} />
        </g>
    }
}

const AlgorithmDetails = () => {
    const algorithm = useSelector(selectors.algorithmSelector)


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


const NodeEdgeSelection = ({edgePath}) => {
    return <EdgeSelectionLine d={edgePath.string} />
}

const GraphSelection = ({layout}) => {
    const selection = useSelector(selectors.selectionSelector)
    const selectedNodes = (selection.nodes)
    const selectedEdges = (selection.edges)
    const positions = useSelector(selectors.nodesPositionsSelector)


    return <g>
        {selectedNodes.map((nodeId, i) => {
            return <NodeSelection key={i} x={positions[nodeId].x} y={positions[nodeId].y} />
        })}
        {selectedEdges.map((e) => {
            const from = e[0];
            const edgeIdx = e[1];

            return <NodeEdgeSelection
                key={`${from}-${edgeIdx}`}
                edgePath={layout.edgePaths[from][edgeIdx]}
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

const ProjectList = () => {
    const dispatch = useDispatch()
    const showProjects = useSelector(selectors.showProjectsSelector);
    const savedGraphs = useProjectsSelector(state => state)
    const savedGraphNames = Object.keys(savedGraphs)
    const openGraph = useCallback((evt) => dispatch(actions.loadGraph(savedGraphs[evt.target.getAttribute('data-value')])), [savedGraphs])
    const cancel = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleProjectList())
        }
    }, [])

    return showProjects ? <Overlay onClick={cancel}>
        <Window>
            <span style={{cursor:'pointer'}} onClick={cancel}>Cancel</span>
            <h1>Open Graph</h1>
            <BigList>
                {savedGraphNames.map((a, i) => <BigListItem key={i} onClick={openGraph} data-value={a}>{a}</BigListItem>)}
            </BigList>
        </Window>
    </Overlay> : null
}

const Settings = () => {
    const dispatch = useDispatch()
    const showSettings = useSelector(selectors.showSettingsSelector);
    const cancel = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleSettings())
        }
    }, [])

    return showSettings ? <Overlay onClick={cancel}>
        <Window>
            <span style={{cursor:'pointer'}} onClick={cancel}>Close</span>
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
        </Window>
    </Overlay> : null
}

const DumpWindow = () => {
    const dispatch = useDispatch()
    const showDump = useSelector(selectors.showDumpSelector);
    const graph = useSelector(selectors.graphSelector)

    const cancel = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleDump())
        }
    }, [])

    return showDump ? <Overlay onClick={cancel}>
        <Window>
            <span style={{cursor:'pointer'}} onClick={cancel}>Close</span>

            <h1>Dump</h1>
            <Dump value={graph} />
        </Window>
    </Overlay> : null
}

const GraphEditor = () => {
    const dispatch = useDispatch();

    const box = useSelector(selectors.cameraBoxSelector);

    const error = useSelector(selectors.errorSelector);
    const layout = useSelector(selectors.layoutSelector);

    const selectTool = useCallback((tool) => {
        dispatch(actions.selectTool(tool))
    }, [dispatch])

    const currentTool = useSelector(selectors.toolSelectionSelector)

    const tools = {
        select: 'Select',
        edit: 'Edit',
    };

    const toolComponents = {
        select: GraphSelector,
        edit: GraphManipulator,
        none: () => null,
    }

    const ToolComponent = toolComponents[currentTool] || toolComponents['none'];

    return <Container>
            <Title>
                Graph Editor
            </Title>
            <Tools tools={tools} currentTool={currentTool} onSelectTool={selectTool} />
            <Menu />
            {
                error?
                <ErrorMessage>{error}</ErrorMessage>
                :null
            }
            <Canvas>
                <CanvasContent
                    box={box}
                    layout={layout}
                    ToolComponent={ToolComponent}
                />
            </Canvas>
            <ProjectList />
            <Settings />
            <DumpWindow />
            <AlgorithmDetails />
        </Container>;
}

const CanvasContent = React.memo(({ToolComponent, box, layout}) => {


    return <>
        <Graph
            box={box}
            layout={layout}
        />
        <GraphSelection
            box={box}
            layout={layout}
        />
        <ToolComponent
            box={box}
            layout={layout}
        />
        <AlgorithmStepper
            box={box}
            layout={layout}
        />
    </>
})
