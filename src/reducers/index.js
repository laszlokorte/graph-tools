import { combineReducers } from 'redux'
import selection from './selection'
import graph from './graph'

export default combineReducers({
  selection,
  graph,
})
