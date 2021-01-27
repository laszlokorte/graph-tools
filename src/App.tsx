import * as React from 'react';
import {useRef, useMemo, useEffect, useLayoutEffect, useContext, useCallback} from 'react';
import styled from 'styled-components';
import { useSize } from './react-hook-size';

import { freeEdgePath } from './stores/graph/reducers/layout'

import { useSelector, useDispatch } from './stores/graph/context'
import { useSelector as useProjectsSelector } from './stores/projects/context'
import { ActionCreators } from 'redux-undo';
import {ALGORITHM_MAP} from './stores/graph/reducers/algorithm/index';
import * as actions from './actions'
import * as selectors from './stores/graph/selectors'

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

const EmptyBox = styled.div`
    text-align: center;
    padding: 1em;
    font-style: italic;
    color: #777;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const SectionTitleButton = styled.button`
    border-radius: 3px;
    padding: 3px 5px;
    background: #333;
    border: none;
    color: #fff;
    cursor: pointer;
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
    flex-direction: column;
    padding: 0 0.5em;
    background: #222;
    color: #fff;
    margin: 1px;
`

const ToolButton = styled.button`
    background: ${({active}) => active ? '#303030' : '#222'};
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

const AttributeField = styled.input`
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #3569B1;
    color: #3569B1;
    background-color: #e0f0ff;
    padding: 6px;

    &:focus {
      background-color: #fff;
      color: #000;
      border: 1px solid #3569B1;
    }
`

const NodeAttribute = ({nodeId, attrKey}) => {
    const dispatch = useDispatch()
    const attr = useSelector(selectors.nodeAttributeSelector(attrKey, nodeId))

    const typeName = attr.type.type

    const onChange = useCallback(
        (evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.value))
    , [nodeId, attrKey])

    const onCheck = useCallback(
        (evt) => dispatch(actions.setNodeAttribute(nodeId, attrKey, evt.target.checked))
    , [nodeId, attrKey])

    if(['text','color','numeric'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><AttributeField type="text" value={attr.value || ''} onChange={onChange} /></dd>
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
            <dd><AttributeField type={attr.type} value={JSON.stringify(attr.value)} readOnly /></dd>
        </>);

    }
}

const SelectedNodesAttribute = ({attrKey}) => {
    const dispatch = useDispatch()
    const attr = useSelector(selectors.selectedNodesAttributeSelector(attrKey))

    const typeName = attr.type.type
    const checkboxRef = useRef()

    useEffect(() => {
        if(checkboxRef.current) {
            checkboxRef.current.indeterminate = attr.mixed
        }
    }, [attr.mixed])

    const onChange = useCallback(
        (evt) => dispatch(actions.setSelectedNodesAttribute(attrKey, evt.target.value))
    , [attrKey])

    const onCheck = useCallback(
        (evt) => dispatch(actions.setSelectedNodesAttribute(attrKey, evt.target.checked))
    , [attrKey])

    if(['text','color','numeric'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><AttributeField placeholder={attr.mixed ? 'mixed' : ''} type="text" value={attr.mixed ? '' : (attr.value || '')} onChange={onChange} /></dd>
        </>);
    } else if(['boolean'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input ref={checkboxRef} type="checkbox" checked={!attr.mixed && attr.value===true} onChange={onCheck} /></dd>
        </>);
    } else if(['enum'].includes(typeName)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd>
                <select value={attr.mixed ? '_mixed' : attr.value || ''} onChange={onChange}>
                    {attr.mixed ? <option value={'_mixed'} disabled>mixed</option> : null}
                    {attr.type.required ? null : <option value={''}>---</option>}
                    {attr.type.options.map((v, i) => {
                        return <option key={i}>{v}</option>
                    })}
                </select>
            </dd>
        </>);
    } else {
        return (<>
            <dt>{attrKey}:</dt>
            <dd><AttributeField placeholder={attr.mixed ? 'mixed' : ''} type={attr.type} value={attr.mixed ? '' : JSON.stringify(attr.value)} readOnly /></dd>
        </>);
    }
}

const NodeDetails = ({index}) => {
    const dispatch = useDispatch()

    const nodeId = useSelector(selectors.selectedNodeSelector(index))
    const neighbours = useSelector(selectors.neighboursSelector(nodeId))
    const flags = useSelector(selectors.graphFlagsSelector)

    const attributes = useSelector(selectors.nodeVisibleAttributeTypesSelector)

    const deleteNode = useCallback(() => dispatch(actions.deleteNode(nodeId)), [nodeId]);

    const followEdge = useCallback((evt) =>
            dispatch(actions.selectEdge(parseInt(evt.target.getAttribute('data-node-id'), 10), parseInt(evt.target.getAttribute('data-idx'), 10))),
        [dispatch])

    const selectNode = useCallback((evt) =>
        dispatch(actions.selectNode(parseInt(evt.target.getAttribute('data-node-id'), 10)))
    ,[dispatch])

    return <DetailsBox>
        <DetailsBoxHead>
        <SubSectionTitle>Selected Node: #{nodeId}</SubSectionTitle>
        <DetailsBoxButton onClick={deleteNode}>Delete</DetailsBoxButton>
        </DetailsBoxHead>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
            {attributes.map((attrKey) =>
                <NodeAttribute key={attrKey} nodeId={nodeId} attrKey={attrKey} />
            )}
        </DefinitionList>
        <SubSubSectionTitle>Neighbourhood</SubSubSectionTitle>
        {neighbours.length === 0 ? <EmptyBox>No outgoing edges</EmptyBox> :
        <LinkList>
            {neighbours.map((neighbour, idx) =>
                    neighbour === nodeId ?
                    <li key={idx}><BadgeLink onClick={followEdge} data-node-id={nodeId} data-idx={idx}>↩</BadgeLink> self</li> :
                    <li key={idx}><BadgeLink onClick={followEdge} data-node-id={nodeId} data-idx={idx}>{flags.directed ? '→' : '↔'}</BadgeLink><Link onClick={selectNode} data-node-id={neighbour}>Node #{neighbour}</Link></li>
            )}
        </LinkList>
        }
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
            <dd><AttributeField type={attr.type.type} value={attr.value+''} onChange={onChangeText} /></dd>
        </>
    } else if(['boolean'].includes(attr.type.type)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={attr.value===true} onChange={onChangeCheckbox} /></dd>
        </>);
    } else {
        return <>
            <dt>{attrKey}:</dt>
            <dd><AttributeField type={attr.type.type} value={JSON.stringify(attr.value)} readOnly /></dd>
        </>
    }
}

const SelectedEdgesAttribute = ({attrKey}) => {
    const dispatch = useDispatch()
    const attr = useSelector(selectors.selectedEdgesAttributeSelector(attrKey))

    const onChangeText = useCallback(
        (evt) => dispatch(actions.setSelectedEdgesAttribute(attrKey, evt.target.value)),
        [attrKey, attr.type]
    );
    const onChangeCheckbox = useCallback(
        (evt) => dispatch(actions.setSelectedEdgesAttribute(attrKey, evt.target.checked)),
    [attrKey, attr.type]);

    if(['text','color','numeric'].includes(attr.type.type)) {
        return <>
            <dt>{attrKey}:</dt>
            <dd><AttributeField placeholder={attr.mixed ? 'mixed' : ''} type={attr.type.type} value={attr.mixed ? '' : attr.value+''} onChange={onChangeText} /></dd>
        </>
    } else if(['boolean'].includes(attr.type.type)) {
        return (<>
            <dt>{attrKey}*:</dt>
            <dd><input type="checkbox" checked={attr.mixed || attr.value===true} onChange={onChangeCheckbox} /></dd>
        </>);
    } else {
        return <>
            <dt>{attrKey}:</dt>
            <dd><AttributeField placeholder={attr.mixed ? 'mixed' : ''} type={attr.type.type} value={attr.mixed ? '' : JSON.stringify(attr.value)} readOnly /></dd>
        </>
    }
}

const SelectedEdgesDetails = () => {
    const dispatch = useDispatch()
    const count = useSelector(selectors.selectedEdgeCountSelector)
    const attributes =  useSelector(selectors.edgeVisibleAttributeTypesSelector)

    const deleteSelected = useCallback(() => {
        dispatch(actions.deleteSelectedEdges())
    }, [dispatch])


    return <DetailsBox>
        <DetailsBoxHead>
        <SubSectionTitle>{count} Edges Selected</SubSectionTitle>
        <DetailsBoxButton onClick={deleteSelected} >Delete Edges</DetailsBoxButton>
        </DetailsBoxHead>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
        {attributes.map((attrKey) =>
            <SelectedEdgesAttribute key={attrKey} attrKey={attrKey} />
        )}
        </DefinitionList>
    </DetailsBox>
}

const SelectedNodesDetails = () => {
    const dispatch = useDispatch()
    const count = useSelector(selectors.selectedNodeCountSelector)
    const attributes = useSelector(selectors.nodeVisibleAttributeTypesSelector)

    const deleteSelected = useCallback(() => {
        dispatch(actions.deleteSelectedNodes())
    }, [dispatch])


    return <DetailsBox>
        <DetailsBoxHead>
        <SubSectionTitle>{count} Nodes Selected</SubSectionTitle>
        <DetailsBoxButton onClick={deleteSelected} >Delete Nodes</DetailsBoxButton>
        </DetailsBoxHead>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
            {attributes.map((attrKey) =>
                <SelectedNodesAttribute key={attrKey} attrKey={attrKey} />
            )}
        </DefinitionList>
    </DetailsBox>
}


const EdgeDetails = ({index}) => {
    const dispatch = useDispatch()

    const [nodeId, edgeIndex] = useSelector(selectors.selectedEdgeSelector(index))
    const target = useSelector(selectors.neighbourNodeSelector(nodeId, edgeIndex))
    const attributes =  useSelector(selectors.edgeVisibleAttributeTypesSelector)
    const flags = useSelector(selectors.graphFlagsSelector)
    const prev = useSelector(selectors.prevMultiEdgeIndex(nodeId, edgeIndex))
    const next = useSelector(selectors.nextMultiEdgeIndex(nodeId, edgeIndex))

    const deleteEdge = useCallback(
        (evt) => dispatch(actions.deleteEdge(parseInt(evt.target.getAttribute('data-node-id'), 10), parseInt(evt.target.getAttribute('data-idx'), 10)))
    , [dispatch])

    const selectNode = useCallback(
        (evt) => dispatch(actions.selectNode(parseInt(evt.target.getAttribute('data-node-id'), 10)))
    , [dispatch])

    const selectEdge = useCallback(
        (evt) => dispatch(actions.selectEdge(parseInt(evt.target.getAttribute('data-node-id'), 10), parseInt(evt.target.getAttribute('data-idx'), 10)))
    , [dispatch])

    return <DetailsBox>
        <DetailsBoxHead>
        <SubSectionTitle>Selected Edge: (#{nodeId}{flags.directed?'→':'–'}#{target})</SubSectionTitle>
        <DetailsBoxButton onClick={deleteEdge} data-node-id={nodeId} data-idx={edgeIndex}>Delete</DetailsBoxButton>
        </DetailsBoxHead>
        <SubSubSectionTitle>Attributes</SubSubSectionTitle>
        <DefinitionList>
        {attributes.map((attrKey) =>
            <EdgeAttribute key={attrKey} nodeId={nodeId} edgeIndex={edgeIndex} attrKey={attrKey} />
        )}
        </DefinitionList>
        <SubSubSectionTitle>Neighbourhood</SubSubSectionTitle>
        <DefinitionList>
        <dt>Source</dt>
        <dd><Link onClick={selectNode} data-node-id={nodeId}>Node #{nodeId}</Link></dd>
        <dt>Target</dt>
        <dd><Link onClick={selectNode} data-node-id={target}>Node #{target}</Link></dd>
        </DefinitionList>
        {!flags.multiGraph ? null : <div>
            <SubSubSectionTitle>Partner Edges</SubSubSectionTitle>
            {prev === null ? 'Prev' :
            <Link onClick={selectEdge} data-node-id={nodeId} data-idx={prev}>Prev</Link>}
            &nbsp;|&nbsp;
            {next === null ? 'Next' :
            <Link onClick={selectEdge} data-node-id={nodeId} data-idx={next}>Next</Link>}
        </div>}
    </DetailsBox>
}

const GraphOptions = () => {
    const dispatch = useDispatch()

    const flagKeys = useSelector(selectors.graphFlagKeysSelector)
    const flags = useSelector(selectors.graphFlagsSelector)
    const setFlag = (e) => dispatch(actions.setFlag(e.target.getAttribute('data-flag'), e.target.checked))

    return <CheckboxList>
        {flagKeys.map((flagKey) =>
            <CheckboxListItem key={flagKey}>
                <label>
                    <input type="checkbox" onChange={setFlag} data-flag={flagKey} checked={flags[flagKey]} /> {flagKey}
                </label>
            </CheckboxListItem>
        )}
    </CheckboxList>
}

const ViewOptions = () => {
    const dispatch = useDispatch()

    const edgeAttributes = useSelector(selectors.edgeAttributesSelector)
    const nodeAttributes = useSelector(selectors.nodeAttributesSelector)

    const setEdgeVisibility = useCallback(
        (e) => dispatch(actions.setEdgeAttributeVisible(e.target.name, e.target.checked))
    , [dispatch])

    const setNodeVisibility = useCallback(
        (e) => dispatch(actions.setNodeAttributeVisible(e.target.name, e.target.checked))
    , [dispatch])

    return <div style={{display:'flex'}}>
        <div>
        <SubSectionTitle>Visible Edge Attributes</SubSectionTitle>
        <CheckboxList>
            {Object.keys(edgeAttributes).map((attrKey) =>
                <CheckboxListItem key={attrKey}>
                    <label>
                    <input type="checkbox" name={attrKey} onChange={setEdgeVisibility} checked={edgeAttributes[attrKey].visible === true} /> {attrKey}
                    </label>
                </CheckboxListItem>
            )}
        </CheckboxList>
        </div>
        <div>
        <SubSectionTitle>Visible Node Attributes</SubSectionTitle>
        <CheckboxList>
        {Object.keys(nodeAttributes).map((attrKey) =>
            <CheckboxListItem key={attrKey}>
                <label>
                <input type="checkbox" name={attrKey} onChange={setNodeVisibility} checked={nodeAttributes[attrKey].visible === true} /> {attrKey}
                </label>
            </CheckboxListItem>
        )}
        </CheckboxList>
        </div>
    </div>
}

const Tools = () => {
    const dispatch = useDispatch();
    const canUndo = useSelector(selectors.canUndoSelector)
    const canRedo = useSelector(selectors.canRedoSelector)

    const currentTool = useSelector(selectors.toolSelectionSelector)
    const tools = {
        'edit': 'Edit',
        'select': 'Select',
    }

    const toggleDump = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleDump())
        }
    }, [dispatch])

    const toggleAlgorithm = useCallback(() => {
        dispatch(actions.toggleAlgorithm())
    }, [dispatch])

    const showAlgorithm = useSelector(selectors.showAlgorithmSelector)

    const selectTool = useCallback((evt) => {
        dispatch(actions.selectTool(evt.target.getAttribute('data-tool')))
    }, [dispatch])

    const toggleProjectList = useCallback(() => dispatch(actions.toggleProjectList()), [])
    const undo = useCallback(() => dispatch(ActionCreators.undo()), [])
    const redo = useCallback(() => dispatch(ActionCreators.redo()), [])
    const autoLayout = useCallback(() => dispatch(actions.autoLayout()), [])
    const alignX = useCallback(() => dispatch(actions.alignSelectedNodes('x')), [])
    const alignY = useCallback(() => dispatch(actions.alignSelectedNodes('y')), [])
    const spreadX = useCallback(() => dispatch(actions.alignSelectedNodes('x', 1, 1)), [])
    const spreadY = useCallback(() => dispatch(actions.alignSelectedNodes('y', 1, 1)), [])
    const clear = useCallback(() => dispatch(actions.clearGraph()), [])
    const clearEdges = useCallback(() => dispatch(actions.clearGraphEdges()), [])

    return <Toolbar>
        <ToolButton onClick={toggleProjectList}>Open</ToolButton>
        <ToolButton onClick={toggleDump}>Dump</ToolButton>
        <ToolButton disabled={!canUndo} onClick={undo}>Undo</ToolButton>
        <ToolButton disabled={!canRedo} onClick={redo}>Redo</ToolButton>
        <ToolButton onClick={clear}>Clear</ToolButton>
        <ToolButton onClick={clearEdges}>Clear Edges</ToolButton>
        <ToolButton onClick={autoLayout}>Auto Layout</ToolButton>
        <ToolButton onClick={alignX}>Align X</ToolButton>
        <ToolButton onClick={alignY}>Align Y</ToolButton>
        <ToolButton onClick={spreadX}>Spread X</ToolButton>
        <ToolButton onClick={spreadY}>Spread Y</ToolButton>
        {Object.keys(tools).map((t) =>
            <ToolButton key={t} disabled={t===currentTool} onClick={selectTool} data-tool={t}>{tools[t]}</ToolButton>
        )}
        <ToolButton active={showAlgorithm} onClick={toggleAlgorithm}>Algorithm</ToolButton>
    </Toolbar>
}


const AlgorithmOptions = () => {
    const dispatch = useDispatch();

    const algOptions = useSelector(selectors.selectedAlgorithmOptionKeysSelector)
    const canRun = useSelector(selectors.selectedAlgorithmCanRunSelector)

    const run = useCallback((evt) => {
        evt.preventDefault();
        dispatch(actions.runSelectedAlgorithm())
    }, [dispatch])

    return <>
        <form onSubmit={run}>
        {algOptions.length ?
            <fieldset>
                <legend>Options</legend>
            {algOptions.map((key) =>
                <div key={key}>
                    <AlgorithmOption optionKey={key} />
                </div>
            )}
        </fieldset> : null}
        {!canRun ? null : <ToolButton>Run️</ToolButton>}
        </form>
    </>
}

const AlgorithmOption = ({optionKey}) => {
    const dispatch = useDispatch();
    const algOption = useSelector(selectors.selectedAlgorithmOptionSelector(optionKey))
    const algOptionValue = useSelector(selectors.selectedAlgorithmOptionValueSelector(optionKey))

    const nodes = useSelector(selectors.nodeIdsSelector)
    const nodeAttributes = useSelector(selectors.nodeAttributesSelector)
    const edgeAttributes = useSelector(selectors.edgeAttributesSelector)

    const onChange = useCallback((evt) => {
        dispatch(actions.selectAlgorithmParameter(evt.target.name, evt.target.value))
    }, [dispatch])

    switch(algOption.type) {
        case 'NODE': {
            return <label>
                {algOption.label}:<br/>
                <select name={optionKey} onChange={onChange} value={algOptionValue === null || algOptionValue === undefined ? '' : algOptionValue}>
                    <option value="">---</option>
                    {nodes.map((_,nodeIdx) => <option key={nodeIdx} value={nodeIdx}>#{nodeIdx}</option>)}
                </select>
            </label>
        }
        case 'NODE_ATTRIBUTE': {
            return <label>
                {algOption.label}:<br/>
                <select name={optionKey} onChange={onChange} value={algOptionValue === null || algOptionValue === undefined ? '' : algOptionValue}>
                    <option value="">---</option>
                    {Object.keys(nodeAttributes).filter((attr) =>
                        !algOption.typeRequirement || algOption.typeRequirement.includes(nodeAttributes[attr].type)
                    ).map((attr) => <option value={attr} key={attr}>{attr}</option>)}
                </select>
            </label>
        }
        case 'EDGE_ATTRIBUTE': {
            return <label>
                {algOption.label}:<br/>
                <select name={optionKey} onChange={onChange} value={algOptionValue === null || algOptionValue === undefined ? '' : algOptionValue}>
                    <option value="">---</option>
                    {Object.keys(edgeAttributes).filter((attr) =>
                        !algOption.typeRequirement || algOption.typeRequirement.includes(edgeAttributes[attr].type)
                    ).map((attr) => <option value={attr} key={attr}>{attr}</option>)}
                </select>
            </label>
        }
    }

    return '?';
}

const AlgorithmRunner = () => {
    const dispatch = useDispatch();
    const algorithmSelection = useSelector(selectors.algorithmSelectionSelector);

    const selectAlg = useCallback((evt) => {
        dispatch(actions.selectAlgorithm(evt.target.value))
    }, [dispatch])

    const applicableAlgorithms = useSelector(selectors.selectableAlgorithmsSelector)

    return <>
        <div>
            <span>Algorithm:</span><br/>
            <select value={algorithmSelection || ''} onChange={selectAlg}>
                <option key='none' value=''>---</option>
                {applicableAlgorithms.map((a) =>
                    <option key={a} value={a}>{ALGORITHM_MAP[a].name}</option>
                )}
            </select>
        </div>
        <AlgorithmOptions />
        <AlgorithmResult />
    </>
}

const AlgorithmResult = () => {
    const dispatch = useDispatch();
    const algorithm = useSelector(selectors.algorithmSelector)
    const rerun = useSelector(selectors.algorithmRerunSelector)

    const toggleRerun = useCallback((evt) => {
        dispatch(actions.setAlgorithmRerun(evt.target.checked))
    }, [dispatch]);

    const stepFoward = useCallback(() => {
        dispatch(actions.stepAlgorithm(1))
    }, [dispatch]);

    const stepBackward = useCallback(() => {
        dispatch(actions.stepAlgorithm(-1))
    }, [dispatch]);

    const jumpStep = useCallback((evt) => {
        dispatch(actions.jumpStepAlgorithm(parseInt(evt.currentTarget.value, 10)))
    }, [dispatch])

    const clearResult = useCallback((evt) => {
        dispatch(actions.clearAlgorithmResult())
    }, [dispatch])

    if(algorithm.result === null) {
        return null;
    } else if (algorithm.result.steps) {
        return <div>
            <button onClick={clearResult}>Clear</button>
            <label>
                <input type="checkbox" onChange={toggleRerun} checked={rerun} /> Auto re-run
            </label>
            <br/>
            {algorithm.focus + 1}/{algorithm.result.steps.length}
            <br/>
            <PlainButton onClick={stepBackward}>⏪</PlainButton>
            <input onChange={jumpStep} type="range" value={algorithm.focus} min={0} max={algorithm.result.steps.length - 1} />
            <PlainButton onClick={stepFoward}>⏩</PlainButton>
        </div>;
    } else {
        return <div>❌</div>;
    }
}

const Menu = () => {
    const dispatch = useDispatch()

    const properties = useSelector(selectors.graphPropertiesSelector)
    const flags = useSelector(selectors.graphFlagsSelector)
    const empty = !useSelector(selectors.anyThingSelectedSelector)
    const nodeSelection = useSelector(selectors.selectedNodesIndicesSelector)
    const edgeSelection = useSelector(selectors.selectedEdgesIndicesSelector)


    const toggleSettings = useCallback((evt) => {
        if(evt.target === evt.currentTarget) {
            dispatch(actions.toggleSettings())
        }
    }, [dispatch])


    const deleteSelected = useCallback(() => {
        dispatch(actions.deleteSelected())
    }, [dispatch])


    return <Scroller>

            <Section>
            <SectionTitle>Properties <SectionTitleButton onClick={toggleSettings}>Settings</SectionTitleButton>
            </SectionTitle>
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
            <SectionTitle>
                Selection
                {empty ? null : <SectionTitleButton onClick={deleteSelected}>Delete all</SectionTitleButton>}
            </SectionTitle>
            <SectionBody>
            {nodeSelection.length === 1 ? nodeSelection.map((index) =>
                <NodeDetails key={"a" + index} index={index} />
            ) : null}
            {edgeSelection.length === 1 ? edgeSelection.map((index) =>
                <EdgeDetails key={"b" + index} index={index} />
            ) : null}
            {nodeSelection.length > 1 ? <SelectedNodesDetails /> : null}
            {edgeSelection.length > 1 ? <SelectedEdgesDetails /> : null}
            {empty ? <EmptyBox>Nothing Selected</EmptyBox> : null}
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

        const multiplier = e.ctrlKey ? 5 : 1;

        if(e.shiftKey) {
            if(e.altKey) {
                dispatch(actions.cameraPan(multiplier * e.deltaY, multiplier * e.deltaX))
            } else {
                dispatch(actions.cameraPan(multiplier * e.deltaX, multiplier * e.deltaY))
            }
        } else if(e.altKey) {
            dispatch(actions.cameraRotate(pivot.x, pivot.y, multiplier * 10 * Math.log2(factor)))
        } else {
            dispatch(actions.cameraZoom(pivot.x, pivot.y, Math.pow(factor, multiplier)))
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
            <rect
                x={camera.box.minX}
                y={camera.box.minY}
                width={camera.box.maxX - camera.box.minX}
                height={camera.box.maxY - camera.box.minY}
                fill="#fff" />
            <CanvasContext.Provider value={svgPos}>
    			{children}
            </CanvasContext.Provider>
		</g>
	</Svg>;
}

const NodeShape = styled.path`
    fill:#eee;
    stroke:currentColor;
    stroke-width: 1;
`

const NewNodeShape = styled.path`
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

const NodeShapeSelection = styled.path`
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

const Node = ({nodeId, style = {}, onClick = null, onDoubleClick = null}) => {
    const pos = useSelector(selectors.nodePositionSelector(nodeId))
    const shape = useSelector(selectors.nodeShapeSelector(nodeId))

    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId)
    } : null, [nodeId, onClick]);

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId)
    } : null, [nodeId, onDoubleClick]);

    return <g style={style} onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
        <NodeShape transform={`translate(${pos.x}, ${pos.y})`} d={shape} />
    </g>
}

const Edge = ({nodeId, edgeIndex = null, onClick = null, onDoubleClick = null, style = null, disabled=false}) => {
    const edgePath = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIndex))
    const flags = useSelector(selectors.graphFlagsSelector)
    const onClickCallback = useCallback(onClick ? (evt) => {
        onClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onClick])

    const onDoubleClickCallback = useCallback(onDoubleClick ? (evt) => {
        onDoubleClick(evt, nodeId, edgeIndex)
    } : null, [nodeId, edgeIndex, onDoubleClick])

	return <g onClick={onClickCallback} onDoubleClick={onDoubleClickCallback}>
		<g style={style}>
        {flags.directed ?
            <EdgeHead disabled={disabled} x={edgePath.tip.x} y={edgePath.tip.y} angle={edgePath.tip.angle} />
            :null
        }
        <EdgeLine disabled={disabled} d={edgePath.string} />
        </g>
	</g>
}

const NewEdge = ({loop = false, startNode, endNode, startX, startY, endX, endY, offset=false}) => {
    const startPos = useSelector(selectors.nodePositionSelector(startNode))
    const endPos = useSelector(selectors.nodePositionSelector(endNode))
    const x0 = startPos ? startPos.x : startX
    const y0 = startPos ? startPos.y : startY
    const x1 = endPos ? endPos.x : endX
    const y1 = endPos ? endPos.y : endY
    const flags = useSelector(selectors.graphFlagsSelector)
    const angle = useSelector(selectors.manipulatorStartNodeAngleSelector)
    const path = freeEdgePath(20, loop, x0, y0, x1, y1, angle, flags.directed, offset)

    let pathString = "M" + path.points[0] + ' ' + path.points[1];

    for(let p=2;p<path.points.length;p+=6) {
        pathString += 'C ' + path.points[p] + ' ' + path.points[p+1] + ' ' + path.points[p+2] + ' ' + path.points[p+3] + ' ' + path.points[p+4] + ' ' + path.points[p+5]
    }

    return <>
        <path pointerEvents="none" fill="none" d={pathString} stroke="black" />
        {flags.directed ? <EdgeHead angle={path.tip.angle} x={path.tip.x} y={path.tip.y} disabled={true} /> : null}
    </>;
}

const NewNode = ({x, y}) => {
    const shape = useSelector(selectors.newNodeShapeSelector)

    return <NewNodeShape  transform={`translate(${x}, ${y})`} style={{cursor:'copy'}} d={shape} />
}

const NodeManipulator = ({x = null,y = null,nodeId,snapped=false,active=false,onClick=null,onDoubleClick=null, mouseDownConnect=null,mouseDownMove = null,mouseMove,mouseLeave}) => {
    const pos = useSelector(selectors.nodePositionSelector(nodeId))
    const shape = useSelector(selectors.nodeShapeSelector(nodeId))

    if(x === null || y === null) {
        x = pos.x
        y = pos.y
    }


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
        <NodeConnector d={shape}
            transform={`translate(${x} ${y}) scale(2.5)`}
            onMouseDown={mouseDownConnectCallback}
            fillRule="evenodd"
            snapped={snapped}
            active={active}
            />
         <NodeDragger d={shape}
            transform={`translate(${x} ${y}) scale(0.7)`}
            onMouseDown={mouseDownMoveCallback}
            onClick={onClickCallback}
            onDoubleClick={onDoubleClickCallback}
            fillRule="evenodd"
            fill="#111"
            />
    </g>
}

const EdgeManipulator = ({selectEdge, deleteEdge, nodeId, edgeIdx}) => {
    const onClickCallback = useCallback((evt) => {
        evt.preventDefault();
        selectEdge(evt, nodeId, edgeIdx)
    }, [deleteEdge, nodeId, edgeIdx])

    const onDoubleCallback = useCallback((evt) => {
        evt.preventDefault();
        deleteEdge(evt, nodeId, edgeIdx)
    }, [deleteEdge, nodeId, edgeIdx])

    const edgePath = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIdx))


    return <EdgeSelectorLine
        onMouseDown={onClickCallback}
        onDoubleClick={onDoubleCallback}
        d={edgePath.string}
    />
}

const EdgeGrabber = ({nodeId, edgeIdx, mouseDown}) => {
    const edgePath = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIdx))
    const neighbourId = useSelector(selectors.neighbourNodeSelector(nodeId, edgeIdx))

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

const EdgesManipulator = ({selectEdge, deleteEdge}) => {
    const nodes = useSelector(selectors.nodesSelector)

    return <>
    {nodes.map((neighbors, nodeId) =>
        neighbors.map((neighbourId, edgeIdx) => {

            return <EdgeManipulator
                key={nodeId + '-' + edgeIdx}
                deleteEdge={deleteEdge}
                selectEdge={selectEdge}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
            />
        })
    )}
    </>
}


const EdgesGrabber = ({grabEdge}) => {
    const selectedEdges = useSelector(selectors.selectedEdgesSelector)

    return <>
        {selectedEdges.map((e) => {
            const nodeId = e[0];
            const edgeIdx = e[1];

            return <EdgeGrabber
                key={nodeId + '-' + edgeIdx}
                mouseDown={grabEdge}
                nodeId={nodeId}
                edgeIdx={edgeIdx}
            />
        })}
    </>
}



const EdgePathManipulator = ({nodeId, edgeIdx, mouseDownControl, doubleClickControl}) => {
    const result = [];

    const targetNode = useSelector(selectors.neighbourNodeSelector(nodeId, edgeIdx))
    const controls = useSelector(selectors.edgePathSelector(nodeId, edgeIdx))
    const edgePath = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIdx))

    const mouseDownNew = useCallback((evt) => {
        evt.stopPropagation();
        const c = 1*evt.target.getAttribute('data-c');
        const x = 1*evt.target.getAttribute('data-x');
        const y = 1*evt.target.getAttribute('data-y');
        mouseDownControl(nodeId, edgeIdx, c, controls, x, y, true)
    }, [nodeId, edgeIdx, mouseDownControl, controls])

    const mouseDownExisting = useCallback((evt) => {
        evt.stopPropagation();
        const c = 1*evt.target.getAttribute('data-c');
        const x = 1*evt.target.getAttribute('data-x');
        const y = 1*evt.target.getAttribute('data-y');
        mouseDownControl(nodeId, edgeIdx, c, controls, x, y, false)
    }, [nodeId, edgeIdx, mouseDownControl, controls])

    const doubleClick = useCallback((evt) => {
        const c = 1*evt.target.getAttribute('data-c');
        doubleClickControl(nodeId, edgeIdx, c, controls, evt)
    }, [nodeId, edgeIdx, doubleClickControl, controls])

    if(targetNode === nodeId) {
        return null
    }

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

const EdgesPathManipulator = () => {
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const selectedEdges = useSelector(selectors.selectedEdgesSelector)
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

    const mouseDownControl = useCallback((nodeIdx, edgeIdx, controlIdx, oldPath, x, y, init) => {
        if(init) {
            dispatch(actions.pathManipulatorCreate(nodeIdx, edgeIdx, controlIdx, oldPath, x, y))
        } else {
            dispatch(actions.pathManipulatorStartMove(nodeIdx, edgeIdx, controlIdx, oldPath, x, y))
        }
    }, [dispatch])

    const doubleClickControl = useCallback((n, e, c, oldPath, evt) => {
        evt.stopPropagation();
        const newPath = [...oldPath.slice(0, c*2), ...oldPath.slice(c*2 + 2)]
        dispatch(actions.setEdgeAttribute(n, e, 'path', newPath))
    }, [dispatch])

    return <>
        {selectedEdges.map((e) => {
            const nodeId = e[0];
            const edgeIdx = e[1];

            return <g key={nodeId + '-' + edgeIdx}>
                {
                    (manipulation.nodeIdx === nodeId && manipulation.edgeIdx == edgeIdx) ?
                    <PathHandleDot r="8" cx={manipulation.path[manipulation.controlIdx * 2]} cy={manipulation.path[manipulation.controlIdx * 2 + 1]} />
                    : null }
                    <EdgePathManipulator
                        key={nodeId + '-' + edgeIdx}
                        nodeId={nodeId}
                        edgeIdx={edgeIdx}
                        mouseDownControl={mouseDownControl}
                        doubleClickControl={doubleClickControl} />
            </g>
        })}
    </>
}

const GraphManipulator = () => {
    const box = useSelector(selectors.cameraBoxSelector);
    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const nodeIds = useSelector(selectors.nodeIdsSelector)

    const manipulation = useSelector(selectors.manipulatorSelector)
    const manipulationRef = useRef(manipulation)

    const endNode = useSelector(selectors.manipulatorTargetNodeSelector)

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
        {nodeIds.map((nodeId) =>
            <NodeManipulator
                key={nodeId}
                nodeId={nodeId}
                x={manipulation.movingNode === nodeId ? (manipulation.x + manipulation.offsetX) : null}
                y={manipulation.movingNode === nodeId ? (manipulation.y + manipulation.offsetY) : null}
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
                selectEdge={selectEdge}
                deleteEdge={deleteEdge}
            /> : null
        }
        {
            <EdgesGrabber
                grabEdge={onGrabEdge}
            />
        }
        {
            manipulation.x === null && manipulation.y === null &&
            manipulation.connectionStart === null && manipulation.movingNode === null ?
            <EdgesPathManipulator/> : null
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
                    startNode={manipulation.connectionStart}
                    endNode={manipulation.connectionSnap}
                    offset={true}
                />
         :
            <NewEdge
                    startNode={manipulation.connectionStart}
                    endX={manipulation.x}
                    endY={manipulation.y}
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
                startNode={manipulation.connectionStart}
                endX={manipulation.x + manipulation.offsetX}
                endY={manipulation.y + manipulation.offsetY}
                offset={true}
            />,
            <NewEdge
                key="midpoint-post-edge"
                startX={manipulation.x + manipulation.offsetX}
                startY={manipulation.y + manipulation.offsetY}
                endNode={endNode}
                offset={true}
            />,
            ]
            : null
        }
    </g>
}

const NodeSelectionShape = styled.path`
    fill: none;
    stroke: none;
    stroke-width: 0;
    pointer-events: all;
`

const NodeSelector = ({nodeId, onMouseDown}) => {
    const pos = useSelector(selectors.nodePositionSelector(nodeId))
    const shape = useSelector(selectors.nodeShapeSelector(nodeId))

    const onMouseDownCallback = useCallback(onMouseDown ? (evt) => {
        onMouseDown(evt, nodeId)
    } : null, [nodeId, onMouseDown]);

    return <NodeSelectionShape  transform={`translate(${pos.x}, ${pos.y})`} d={shape} onMouseDown={onMouseDownCallback} />
}

const EdgeSelectorLine = styled.path`
    fill: none;
    stroke: none;
    stroke-width: 20;
    pointer-events: stroke;
    cursor: default;
`

const NodeEdgeSelector = ({nodeId,edgeIndex,onMouseDown}) => {
    const edgePath = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIndex))
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

const GraphSelector = () => {
    const box = useSelector(selectors.cameraBoxSelector);

    const dispatch = useDispatch()
    const canvasPos = useCanvasPos()

    const nodeIds = useSelector(selectors.nodeIdsSelector)

    const range = useSelector(selectors.selectionBoxSelector)

    const selectNode = useCallback((evt, nodeId) => {
        dispatch(actions.selectNode(nodeId, evt.metaKey || evt.ctrlKey || evt.shiftKey, evt.metaKey || evt.ctrlKey));
    }, [dispatch])

    const selectEdge = useCallback((evt, nodeId, edgeIndex) => {
        dispatch(actions.selectEdge(nodeId, edgeIndex, evt.metaKey || evt.ctrlKey || evt.shiftKey, evt.metaKey || evt.ctrlKey));
    }, [dispatch])

    const clearSelection = useCallback((evt) => {
        if(!evt.metaKey && !evt.ctrlKey && !evt.shiftKey && !evt.altKey) {
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
        dispatch(actions.selectionBoxStop(evt.shiftKey, evt.ctrlKey))
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
        {nodeIds.map((nodeId) => {
            return <React.Fragment key={nodeId}>
                <NodeSelector
                    nodeId={nodeId}
                    onMouseDown={selectNode}
                />
                <NodeEdgesSelector nodeId={nodeId} selectEdge={selectEdge} />
            </React.Fragment>
        })}
    </g>
}

const NodeEdgesSelector = ({nodeId, selectEdge}) => {
    const neighbors = useSelector(selectors.neighboursSelector(nodeId))

    return <>
        {neighbors.map((neighbourId, edgeIdx) => {
            return <NodeEdgeSelector
                    nodeId={nodeId}
                    edgeIndex={edgeIdx}
                    key={`${nodeId}-${edgeIdx}`}
                    onMouseDown={selectEdge}
                />;
        })}
    </>
}

const GraphLayerNodes = () => {
    const nodeIds = useSelector(selectors.nodeIdsSelector)
    return <React.Fragment>
        {nodeIds.map((pos, nodeId) => {
            return <Node
                key={nodeId}
                nodeId={nodeId}
            />
        })}
    </React.Fragment>
}

const GraphLayerEdges = () => {
    const nodeIds = useSelector(selectors.nodeIdsSelector)

    return <>
        {nodeIds.map((nodeId) =>
            <GraphLayerNodeEdges
                nodeId={nodeId}
                key={nodeId}
            />
        )}
    </>
}

const GraphLayerNodeEdges = ({nodeId}) => {
    const edgeCount = useSelector(selectors.neighbourCountSelector(nodeId))

    return <>
        {Array(edgeCount).fill(null).map((_, edgeIdx) =>
            <Edge
                nodeId={nodeId}
                edgeIndex={edgeIdx}
                key={edgeIdx}
            />)
        }
    </>
}

const GraphLayerNodeLabels = () => {
    const labelKeys = useSelector(selectors.visibleNodeAttributesSelector)
    const nodeIds = useSelector(selectors.nodeIdsSelector)

    return <g>
        {labelKeys.map((k, i) =>
            <g key={k}>
                {nodeIds.map((nodeId) =>
                    <GraphLayoutSigleNodeLabel key={nodeId} nodeId={nodeId} labelIndex={i} labelKey={k} />
                )}
            </g>
        )}
    </g>
}

const GraphLayoutSigleNodeLabel = ({nodeId, labelIndex, labelKey}) => {
    const pos = useSelector(selectors.nodePositionSelector(nodeId))
    const labelValue = useSelector(selectors.nodeAttributeValueSelector(labelKey, nodeId))
    return <React.Fragment
            key={nodeId}>
        <NodeLabelKey
            x={pos.x}
            y={30 + pos.y}
            dy={20 * (0.5 + labelIndex)}
        >{labelKey}: </NodeLabelKey>
        <NodeLabelValue
            x={pos.x}
            y={30 + pos.y}
            dx={6}
            dy={20 * (0.5 + labelIndex)}
        >{JSON.stringify(labelValue)}</NodeLabelValue>
    </React.Fragment>
}


const GraphLayerEdgeLabels = () => {
    const labelKeys = useSelector(selectors.visibleEdgeAttributesSelector)
    const nodeIds = useSelector(selectors.nodeIdsSelector)

    return <>
        {labelKeys.map((k, kdx) => {
            return <g key={k}>
                {nodeIds.map((nodeId) =>
                    <GraphLayerNodeEdgeLabels key={nodeId} nodeId={nodeId} labelCount={labelKeys.length} labelKey={k} labelIndex={kdx} />
                )}
            </g>
        })}
    </>
}

const GraphLayerNodeEdgeLabels = ({nodeId, labelKey, labelIndex, labelCount}) => {
    const edgeIndices = useSelector(selectors.edgeIndicesSelector(nodeId))
    return <>
        {
            edgeIndices.map((_, edgeIdx) =>
                <GraphLayerNodeEdgeLabel key={edgeIdx} nodeId={nodeId} edgeIdx={edgeIdx} labelCount={labelCount} labelKey={labelKey} labelIndex={labelIndex} />
            )
        }
    </>
}

const GraphLayerNodeEdgeLabel = ({nodeId, edgeIdx, labelKey, labelIndex, labelCount}) => {
    const labelValue = useSelector(selectors.edgeAttributeValueSelector(labelKey, nodeId, edgeIdx))
    const e = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIdx))
    return <EdgeLabel key={nodeId + '-' + edgeIdx} x={e.text.x + 10 * e.text.normX - Math.abs(10 * e.text.normY)} y={e.text.y + 10 * (0.5+e.text.normY)} dy={15 * (0.5 + labelIndex) - 15 * (1-e.text.normY) * 0.5*labelCount} orientation={e.text.orientation}>
        <EdgeLabelKey>{labelKey}:</EdgeLabelKey>
        <EdgeLabelValue dx={5}>{labelValue}</EdgeLabelValue>
    </EdgeLabel>
}

const Graph = () => {
    const box = useSelector(selectors.cameraBoxSelector);

    return <g>
        <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="white" />
        <GraphLayerNodes />
        <GraphLayerEdges />
        <GraphLayerNodeLabels />
        <GraphLayerEdgeLabels />
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

const NodeEdgeStepper = ({nodeId, edgeIdx}) => {
    const color = useSelector(selectors.algorithmStepEdgeColor(nodeId, edgeIdx))
    const edgePath = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIdx))
    return <EdgeStepperLine stroke={color} d={edgePath.string} />
}

const AlgorithmStepperNodeLabels = ({verticalOffset}) => {
    const nodeAttributes = useSelector(selectors.algorithmStepNodeLabels)
    const nodeIds = useSelector(selectors.nodeIdsSelector)

    return <>
        {nodeAttributes.map((k, i) =>
            <g key={k}>
                {nodeIds.map((nodeId) => {
                    return <AlgorithmStepperNodeLabel
                        key={nodeId}
                        nodeId={nodeId}
                        verticalOffset={verticalOffset}
                        labelIndex={i}
                        labelKey={k}
                    />
                })}
            </g>
        )}
    </>
}

const AlgorithmStepperNodeLabel = ({nodeId, labelIndex, labelKey, verticalOffset}) => {
    const pos = useSelector(selectors.nodePositionSelector(nodeId))
    const labelValue = useSelector(selectors.algorithmStepNodeLabel(nodeId, labelKey))

    return <g key={nodeId}>
        <NodeLabelKey
            x={pos.x}
            y={30 + pos.y}
            dy={20 * (0.5 + labelIndex + verticalOffset)}
        >{labelKey}: </NodeLabelKey>
        <NodeLabelValue
            x={pos.x}
            y={30 + pos.y}
            dx={6}
            dy={20 * (0.5 + labelIndex + verticalOffset)}
        >{labelValue}</NodeLabelValue>
    </g>
}

const AlgorithmStepperNodeColoring = () => {
    const hasColors = useSelector(selectors.algorithmStepHasNodeColors)
    const nodeIds = useSelector(selectors.nodeIdsSelector)

    if(!hasColors) {
        return <></>;
    }

    return <g>
        {nodeIds.map((color, nodeId) =>
            <AlgorithmStepperColoredNode key={nodeId} nodeId={nodeId} />
        )}
    </g>
}

const AlgorithmStepperColoredNode = ({nodeId}) => {
    const pos = useSelector(selectors.nodePositionSelector(nodeId))
    const color = useSelector(selectors.algorithmStepNodeColor(nodeId))

    return <path stroke="black" fill={color} key={nodeId} r="10" cx={pos.x} cy={pos.y} />
}


const AlgorithmStepperPolygons = () => {
    const polygons = useSelector(selectors.algorithmStepPolygons)

    return <>
        {polygons ? polygons.map(({points, stroke, fill}, i) => {
            return <AlgorithmStepperPolygon key={i} stroke={stroke||'green'} fill={fill||'lightgreen'} points={points.map(({x,y}) => `${x} ${y},`).join(' ')} />
        }) : null}
    </>
}

const AlgorithmStepperLines = () => {
    const lines = useSelector(selectors.algorithmStepLines)

    return <>
        {lines ? lines.map(({dashArray = null, length=100, points, stroke, x, y, dx, dy}, i) => {
            return <AlgorithmStepperLine strokeDasharray={dashArray} key={i} stroke={stroke||'green'} x1={x - dx * length} y1={y - dy * length} x2={x + dx * length} y2={y + dy * length} />
        }) : null}
    </>
}

const AlgorithmStepperEdgeLabels = ({verticalOffset}) => {
    const nodeIds = useSelector(selectors.nodeIdsSelector)
    const labelKeys = useSelector(selectors.algorithmStepEdgeLabels)
    return <>
        {labelKeys.map((labelKey, labelIndex, all) =>
            <g key={labelKey}>
                {nodeIds.map((nodeId) =>
                    <AlgorithmStepperSingleNodeEdgeLabels key={nodeId} keyCount={labelKeys.length} labelKey={labelKey} labelIndex={labelIndex} nodeId={nodeId} verticalOffset={verticalOffset} />
                )}
            </g>
        )}
    </>
}

const AlgorithmStepperSingleNodeEdgeLabels = ({nodeId, verticalOffset, labelIndex, labelKey, keyCount}) => {
    const edgeIds = useSelector(selectors.edgeIndicesSelector(nodeId))
    return <>
        {edgeIds.map((edgeIdx) =>
            <AlgorithmStepperSingleEdgeLabels key={edgeIdx} keyCount={keyCount} nodeId={nodeId} edgeIdx={edgeIdx} labelIndex={labelIndex} labelKey={labelKey} verticalOffset={verticalOffset} />
        )}
    </>
}

const AlgorithmStepperSingleEdgeLabels = ({nodeId, edgeIdx, labelIndex, labelKey, verticalOffset, keyCount}) => {
    const e = useSelector(selectors.edgePathLayoutSelector(nodeId, edgeIdx));
    const labelValue = useSelector(selectors.algorithmStepEdgeLabel(nodeId, edgeIdx, labelKey))
    return <EdgeLabel key={nodeId + '-' + edgeIdx} x={e.text.x + 10 * e.text.normX - Math.abs(10 * e.text.normY)} y={e.text.y + 10 * (0.5+e.text.normY)} dy={15 * (0.5 + labelIndex + Math.sign(e.text.normY) * verticalOffset) - 15 * (1-e.text.normY) * 0.5*keyCount} orientation={e.text.orientation}>
        <EdgeLabelKey>{labelKey}:</EdgeLabelKey>
        <EdgeLabelValue dx={5}>{labelValue}</EdgeLabelValue>
    </EdgeLabel>
}

const AlgorithmStepperEdgeColoring = () => {
    const hasColors = useSelector(selectors.algorithmStepHasEdgeColors)
    const nodeIds = useSelector(selectors.nodeIdsSelector)

    if(!hasColors) {
        return <></>;
    }


    return <g>
        {nodeIds.map((nodeId) =>
            <AlgorithmStepperSingleNodeEdgeColoring key={nodeId} nodeId={nodeId} />
        )}
    </g>
}

const AlgorithmStepperSingleNodeEdgeColoring = ({nodeId}) => {
    const edgeIndices = useSelector(selectors.edgeIndicesSelector(nodeId))
    return <>
        {edgeIndices.map((edgeIdx) => {
            return <NodeEdgeStepper
                    nodeId={nodeId}
                    edgeIdx={edgeIdx}
                    key={edgeIdx}
                />
        })}
    </>
}

const AlgorithmStepper = () => {
    const visibleEdgeAttributesCount = useSelector(selectors.visibleEdgeAttributesCountSelector)
    const visibleNodeAttributesCount = useSelector(selectors.visibleNodeAttributesCountSelector)

    const algorithmHasResult = useSelector(selectors.algorithmHasResult)

    if(!algorithmHasResult) {
        return <></>;
    } else {
        return <g style={{pointerEvents: 'none'}}>
            <AlgorithmStepperPolygons />
            <AlgorithmStepperLines />
            <AlgorithmStepperNodeColoring />
            <AlgorithmStepperNodeLabels verticalOffset={visibleNodeAttributesCount} />
            <AlgorithmStepperEdgeColoring />
            <AlgorithmStepperEdgeLabels verticalOffset={visibleEdgeAttributesCount} />
        </g>
    }
}

const AlgorithmDetails = () => {
    const algorithm = useSelector(selectors.algorithmSelector)
    const showAlgorithm = useSelector(selectors.showAlgorithmSelector)

    if(showAlgorithm) {
        let matrices

        if(algorithm.result && algorithm.result.steps && algorithm.result.steps[algorithm.focus]) {
            matrices = algorithm.result.steps[algorithm.focus].matrices
        }

        return <OverlayBox>
            <AlgorithmRunner />

            {matrices ? Object.keys(matrices).map((k) => {
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
            }) : null}
            </OverlayBox>
    } else {
        return <></>
    }
}


const NodeSelection = ({index}) => {
    const pos = useSelector(selectors.selectedNodePositionSelector(index))
    const shape = useSelector(selectors.selectedNodeShapeSelector(index))

    return <NodeShapeSelection transform={`translate(${pos.x}, ${pos.y})`} d={shape} />
}


const NodeEdgeSelection = ({index}) => {
    const edgePath = useSelector(selectors.selectedEdgePathLayoutSelector(index))
    return <EdgeSelectionLine d={edgePath.string} />
}

const GraphSelection = () => {
    const selectedNodes = useSelector(selectors.selectedNodesIndicesSelector)
    const selectedEdges = useSelector(selectors.selectedEdgesIndicesSelector)

    return <g>
        {selectedNodes.map((index) => {
            return <NodeSelection key={"n"+index} index={index} />
        })}
        {selectedEdges.map((index) => {
            return <NodeEdgeSelection
                key={"e"+index}
                index={index}
            />;
        })}
    </g>
}

const GithubBadge = () => {
    return <a title="Form me on GitHub" href="https://github.com/laszlokorte/graph-tools">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 250 250" fill="#444444" style={{position: 'absolute', right: 0, top: '0'}}>
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

const ErrorBar = () => {
    const error = useSelector(selectors.errorSelector);
    return error ?  <ErrorMessage>{error}</ErrorMessage> : null
}

const GraphEditor = () => {
    const content = useMemo(() => <CanvasContent/>, [])

    return <Container>
            <Title>
                Graph Editor
            </Title>
            <Tools />
            <Menu />
            <ErrorBar />
            <Canvas>
                {content}
            </Canvas>
            <ProjectList />
            <Settings />
            <DumpWindow />
            <AlgorithmDetails />
        </Container>;
}

const CanvasContent = () => {
    const currentTool = useSelector(selectors.toolSelectionSelector)

    const toolComponents = {
        select: GraphSelector,
        edit: GraphManipulator,
        none: () => null,
    }

    const ToolComponent = toolComponents[currentTool] || toolComponents['none'];

    return <>
        <Graph />
        <GraphSelection />
        <ToolComponent />
        <AlgorithmStepper/>
    </>
}
