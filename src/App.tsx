import * as React from 'react';
import {useRef, useMemo, useEffect, useLayoutEffect, useContext, useCallback, useState} from 'react';
import styled from 'styled-components';
import { useSize } from './react-hook-size';

import { useSelector, useDispatch } from './stores/graph/context'
import { useSelector as useProjectsSelector, useDispatch as useProjectsDispatch } from './stores/projects/context'
import { ActionCreators } from 'redux-undo';
import {ALGORITHMS} from './stores/graph/reducers/algorithm/index';
import * as actions from './actions'

const useGraphSelector = () => {
    return useSelector(state => state.data.present.graph)

}

const useSelectionSelector = () => {
    return useSelector(state => state.data.present.selection)

}

const useAlgorithmSelector = () => {
    return useSelector(state => state.data.present.algorithm)

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
    const value = (useGraphSelector().attributes.nodes[attrKey][nodeId])
    const type = (useGraphSelector().attributeTypes.nodes[attrKey])
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

    const graph = useGraphSelector()
    const neighbours = (useGraphSelector().nodes[nodeId])
    const attributes = Object.keys(graph.attributeTypes.nodes)


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
    const value = (useGraphSelector().attributes.edges[attrKey][nodeId][edgeIndex])
    const type = (useGraphSelector().attributeTypes.edges[attrKey].type)

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

    const graph = useGraphSelector()
    const target = (useGraphSelector().nodes[nodeId][edgeIndex])
    const attributes =  Object.keys(graph.attributeTypes.edges)
    const flags = (useGraphSelector().flags)
    const prev = edgeIndex > 0 && graph.nodes[nodeId][edgeIndex - 1] === target ? edgeIndex - 1 : null
    const next = edgeIndex < graph.nodes[nodeId].length && graph.nodes[nodeId][edgeIndex + 1] === target ? edgeIndex + 1 : null

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

    const flags = (useGraphSelector().flags)

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

    const edgeAttributes = (useGraphSelector().attributeTypes.edges)
    const nodeAttributes = (useGraphSelector().attributeTypes.nodes)

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
    const canUndo = useSelector(state => state.data.past.length > 0)

    const canRedo = useSelector(state => state.data.future.length > 0)

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
            <select value="" onChange={openGraph}>
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
    const graph = useGraphSelector()
    const alg = ALGORITHMS.find((a) => a.key === algorithm)
    const canRun = alg !== null && meetRequirements(alg, graph)
    const nodes = (useGraphSelector().nodes)
    const edgeAttributes = (useGraphSelector().attributeTypes.edges)
    const nodeAttributes = (useGraphSelector().attributeTypes.edges)

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
    const algorithm = useAlgorithmSelector();
    const algorithmType = algorithm.type
    const flags = (useGraphSelector().flags)
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
    const algorithm = useAlgorithmSelector()


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
    const present = useSelector((s) => s.data.present)

    const selection = present.selection
    const nodes = selection.nodes
    const edges = selection.edges
    const empty = edges.length < 1 && nodes.length < 1

    const properties = present.properties

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


const Canvas = ({children}) => {
    const screenRef = useRef();
    const screen = useSize(screenRef, 100, 100);
    const posRef = useRef();
    const svgPos = useSVGPosition(posRef);
    const dispatch = useDispatch();
    const camera = useSelector((s) => s.camera);

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

const NewEdge = ({loop = false, x0, y0, x1, y1, directed = true, offset=false, angle = 0}) => {

    if(loop) {
        const nodeRadius = 20
        const bow = 50
        const gap = 5
        const normX = Math.cos(angle + Math.PI);
        const normY = Math.sin(angle + Math.PI);

        const tangX = normY
        const tangY = -normX

        const startX = x0 + nodeRadius * normX - gap * tangX
        const startY = y0 + nodeRadius * normY - gap * tangY

        const endX = x0 + nodeRadius * normX + gap * tangX
        const endY = y0 + nodeRadius * normY + gap * tangY

        const cp1x = x0 + nodeRadius * normX + bow * normX - bow * tangX
        const cp1y = y0 + nodeRadius * normY + bow * normY - bow * tangY

        const cp2x = x0 + nodeRadius * normX + bow * normX + bow * tangX
        const cp2y = y0 + nodeRadius * normY + bow * normY + bow * tangY

        const tipAngle = Math.atan2(endY - cp2y, endX - cp2x);

        return <>
            <path pointerEvents="none" fill="none" d={
                "M" + startX + ' ' + startY +
                'C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + endX + ' ' + endY
            } stroke="black" />
            {directed ? <EdgeHead angle={tipAngle} x={endX} y={endY} disabled={true} /> : null}
        </>;
    }

    const dirX = x0 - x1
    const dirY = y0 - y1
    const length = Math.sqrt(dirX*dirX + dirY*dirY)
    const normX = dirX / length
    const normY = dirY / length
    const perpX = normY
    const perpY = -normX

    const cX = (x0 + x1) / 2 + (directed ? 20 * perpX : 0)
    const cY = (y0 + y1) / 2 + (directed ? 20 * perpY : 0)

    const departX = cX - x0
    const departY = cY - y0
    const arivX = cX - x1
    const arivY = cY - y1

    const departLength = Math.sqrt(departX * departX + departY * departY)
    const arivLength = Math.sqrt(arivX * arivX + arivY * arivY)
    const departXNorm = departX / departLength
    const departYNorm = departY / departLength
    const arivXNorm = arivX / arivLength
    const arivYNorm = arivY / arivLength

    const startX = x0 + departXNorm * 20
    const startY = y0 + departYNorm * 20
    const endX = x1 + arivXNorm * 20
    const endY = y1 + arivYNorm * 20

    const t = 0.8;

    let cp1x = startX + (cX - startX) / 6 * t;
    let cp1y = startY + (cY - startY) / 6 * t;

    let cp2x = cX - (endX - startX) / 6 * t;
    let cp2y = cY - (endY - startY) / 6 * t;

    let cp3x = cX + (endX - startX) / 6 * t;
    let cp3y = cY + (endY - startY) / 6 * t;

    let cp4x = endX - (endX - cX) / 6 * t;
    let cp4y = endY - (endY - cY) / 6 * t;

    const realX = (offset ? endX : x1)
    const realY = (offset ? endY : y1)
    const tipAngle = Math.atan2(endY - cY, endX - cX);

    return <>
        <path pointerEvents="none" fill="none" d={
            "M" + startX + ' ' + startY +
            'C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + cX + ' ' + cY  +
            'C ' + cp3x + ' ' + cp3y + ' ' + cp4x + ' ' + cp4y + ' ' + realX + ' ' + realY
        } stroke="black" />
        {directed ? <EdgeHead angle={tipAngle} x={realX} y={realY} disabled={true} /> : null}
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
        const nodeId = 1*evt.target.getAttribute('data-node-id')
        const x = 1*evt.target.getAttribute('data-x')
        const y = 1*evt.target.getAttribute('data-y')
        const control = 1*evt.target.getAttribute('data-control')
        mouseDown(evt, nodeId, edgeIdx, x, y, control)
    } : null, [mouseDown])


    if(neighbourId == nodeId) {
        return <EdgeHandleAdvanced
        onMouseDown={mouseDownCallback}
        cx={edgePath.median.x - 3 * edgePath.median.normX}
        cy={edgePath.median.y - 3 * edgePath.median.normY}
        data-x={edgePath.median.x - 3 * edgePath.median.normX}
        data-y={edgePath.median.y - 3 * edgePath.median.normY}
        data-node-id={nodeId}
        data-control={Math.floor(edgePath.anchors.length / 4)}
        r={7} />
    } else {
    return <EdgeHandleAdvanced
        onMouseDown={mouseDownCallback}
        cx={edgePath.median.x - 20 * edgePath.median.normX}
        cy={edgePath.median.y - 20 * edgePath.median.normY}
        data-x={edgePath.median.x - 20 * edgePath.median.normX}
        data-y={edgePath.median.y - 20 * edgePath.median.normY}
        data-node-id={nodeId}
        data-control={Math.floor(edgePath.anchors.length / 4)}
        r={10} />
    }
}

const EdgesManipulator = ({nodes, nodeAngles, edgePaths, selectEdge, deleteEdge}) => {
    return <>
    {nodes.map((neighbors, nodeId) =>
        neighbors.map((neighbourId, edgeIdx) => {

            return <EdgeManipulator
                key={nodeId + '-' + edgeIdx}
                deleteEdge={deleteEdge}
                selectEdge={selectEdge}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
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


            return <EdgeGrabber
                key={nodeId + '-' + edgeIdx}
                mouseDown={grabEdge}
                nodeId={nodeId}
                neighbourId={neighbourId}
                edgeIdx={edgeIdx}
                edgePath={edgePaths[nodeId][edgeIdx]}
            />
        })}
    </>
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

const EdgesPathManipulator = ({nodes, directed, positions, paths, nodeAngles, edgePaths, selectedEdges}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const manipulation = useSelector((state) => state.pathManipulator)


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
                        edgePath={edgePaths[nodeId][edgeIdx]}
                        controls={paths[nodeId][edgeIdx]}
                        startPosition={positions[nodeId]}
                        endPosition={positions[neighbourId]}
                        nodeId={nodeId}
                        edgeIdx={edgeIdx}
                        mouseDownControl={mouseDownControl}
                        doubleClickControl={doubleClickControl}
                        directed={directed}
                        angle={nodeAngles[nodeId]} />
            </g>
        })}
    </>
}



const GraphManipulator = ({box, nodeAngles, edgePaths}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()
    const graph = useGraphSelector()
    const selection = useSelectionSelector()

    const flags = (graph.flags)
    const selectedNodes = selection.nodes
    const selectedEdges = selection.edges
    const nodes = (graph.nodes)
    const positions = (graph.attributes.nodes.position)
    const paths = (graph.attributes.edges.path)

    const manipulation = useSelector((state) => state.manipulator)

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
                    loop={manipulation.connectionStart == manipulation.connectionSnap}
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

const NodeEdgeSelector = ({nodeId,edgeIndex,edgePath,onMouseDown,directed}) => {
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

const GraphSelector = ({box, nodeAngles, edgePaths}) => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const flags = (useGraphSelector().flags)
    const selectedNodes = (useSelectionSelector().nodes)
    const selectedEdges = (useSelectionSelector().edges)
    const nodes = (useGraphSelector().nodes)
    const positions = (useGraphSelector().attributes.nodes.position)
    const range = useSelector((state) => state.selectionBox)


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

const AlgorithmStepperLines = ({lines}) => {
    return <>
        {lines ? lines.map(({dashArray = null, length=100, points, stroke, x, y, dx, dy}, i) => {
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

    const graph = useGraphSelector()
    const selection = useSelectionSelector()
    const flags = (graph.flags)
    const selectedNodes = (selection.nodes)
    const selectedEdges = (selection.edges)
    const nodes = (graph.nodes)
    const positions = (graph.attributes.nodes.position)
    const visibleEdgeAttributesCount = Object.keys(graph.attributeTypes.edges).filter((e) => graph.attributeTypes.edges[e].visible).length

    const algorithm = useSelector(state => state.data.present.algorithm)


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
    const algorithm = useSelector(state => state.data.present.algorithm)


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

const GraphSelection = ({box, nodeAngles, edgePaths}) => {
    const selection = useSelectionSelector()
    const graph = useGraphSelector()
    const flags = (graph.flags)
    const selectedNodes = (selection.nodes)
    const selectedEdges = (selection.edges)
    const nodes = (graph.nodes)
    const positions = (graph.attributes.nodes.position)

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
    const graph = useGraphSelector();
    const box = useSelector((s) => s.camera.box);
    const error = useSelector((s) => s.data.present.error);

    const nodeAngles = useMemo(() => {
        const positions = graph.attributes.nodes.position
        const paths = graph.attributes.edges.path

        return graph.nodes.map((neighbours, idx) => {
            const ownPos = positions[idx]
            const outgoing = neighbours.map((n, edx) => {
                if(n === idx) {
                    return null;
                }

                const p = paths[idx][edx]
                if(p && p.length) {
                    return Math.atan2(p[1] - ownPos.y, p[0] - ownPos.x)
                } else {
                    return Math.atan2(positions[n].y - ownPos.y, positions[n].x - ownPos.x)
                }

            }).filter(a => a !== null)

            const incoming = graph.nodes.map((others, o) => {
                const edx = others.indexOf(idx)
                if (o === idx || edx < 0) {
                   return null;
                }

                const p = paths[o][edx]
                if(p && p.length) {
                    return Math.atan2(p[p.length-1] - ownPos.y, p[p.length-2] - ownPos.x)
                } else {
                    return Math.atan2(positions[o].y - ownPos.y, positions[o].x - ownPos.x)
                }
            }).filter(a => a !== null)

            const cosSum = outgoing.reduce((acc, angle) => acc + Math.cos(angle), 0) +
                incoming.reduce((acc, angle) => acc + Math.cos(angle), 0)

            const sinSum = outgoing.reduce((acc, angle) => acc + Math.sin(angle), 0) +
                incoming.reduce((acc, angle) => acc + Math.sin(angle), 0)

            return Math.atan2(sinSum, cosSum)
        })
    }, [graph])

    const edgePaths = useMemo(() => {
        const directed = graph.flags.directed
        const positions = graph.attributes.nodes.position
        const paths = graph.attributes.edges.path
        const nodes = graph.nodes
        const t = 0.8;

        return nodes.map((neighbors, nodeId) =>
            neighbors.map((neighbourId, edgeIdx) => {
                if(neighbourId == nodeId) {
                    const nodeRadius = 20
                    const bow = 50
                    const gap = 5
                    const center = positions[nodeId]
                    const angle = nodeAngles[nodeId];
                    const normX = Math.cos(angle + Math.PI);
                    const normY = Math.sin(angle + Math.PI);
                    const orientation = Math.round(((Math.atan2(normX, normY) + Math.PI) / Math.PI + 0.5) * 2) % 4

                    const tangX = normY
                    const tangY = -normX

                    const startX = center.x + nodeRadius * normX - gap * tangX
                    const startY = center.y + nodeRadius * normY - gap * tangY

                    const endX = center.x + nodeRadius * normX + gap * tangX
                    const endY = center.y + nodeRadius * normY + gap * tangY

                    const c1x = center.x + nodeRadius * normX + bow * normX - bow * tangX
                    const c1y = center.y + nodeRadius * normY + bow * normY - bow * tangY

                    const c2x = center.x + nodeRadius * normX + bow * normX + bow * tangX
                    const c2y = center.y + nodeRadius * normY + bow * normY + bow * tangY

                    return {
                        string: 'M ' + startX + ' ' + startY + 'C '+ c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + endX + ' ' + endY,
                        curve: [startX, startY, c1x, c1y, c2x, c2y, endX, endY],
                        midpoints: [],
                        anchors: [],
                        median: {
                            x: positions[nodeId].x + normX * bow,
                            y: positions[nodeId].y + normY * bow,
                            normX: normX,
                            normY: normY,
                        },
                        text: {
                            x: positions[nodeId].x + normX * bow,
                            y: positions[nodeId].y + normY * bow,
                            normX: normX,
                            normY: normY,
                            orientation: orientation
                        },
                        tip: {
                            x: endX,
                            y: endY,
                            angle: Math.atan2(endY - c2y, endX - c2x),
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
                        (startPosition.x + endPosition.x) / 2 + (directed ? 20 * normY : 0),
                        (startPosition.y + endPosition.y) / 2 - (directed ? 20 * normX : 0),
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

                    if(mNormX*mNormX + mNormY*mNormY < 0.001) {
                        mNormX = -d2y/l2
                        mNormY = d2x/l2
                    }
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

                    if(mNormX*mNormX + mNormY*mNormY < 0.001) {
                        mNormX = -d2y/l2
                        mNormY = d2x/l2
                    }
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
    }, [graph])

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
            {
                error?
                <ErrorMessage>{error}</ErrorMessage>
                :null
            }
            <Canvas>
                <CanvasContent
                    box={box}
                    nodeAngles={nodeAngles}
                    edgePaths={edgePaths}
                    ToolComponent={ToolComponent}
                />
            </Canvas>
            <AlgorithmDetails />
        </Container>;
}

const CanvasContent = React.memo(({ToolComponent, box, nodeAngles, edgePaths}) => {
    return <>
        <Graph
            box={box}
            nodeAngles={nodeAngles}
            edgePaths={edgePaths}
        />
        <GraphSelection
            box={box}
            nodeAngles={nodeAngles}
            edgePaths={edgePaths}
        />
        <ToolComponent
            box={box}
            nodeAngles={nodeAngles}
            edgePaths={edgePaths}
        />
        <AlgorithmStepper
            box={box}
            nodeAngles={nodeAngles}
            edgePaths={edgePaths}
        />
    </>
})
