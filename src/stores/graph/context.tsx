import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import {
  Provider,
  createStoreHook,
  createDispatchHook,
  createSelectorHook
} from 'react-redux'
import reducers from './reducers'

const GraphContext = React.createContext(null)

export const useStore = createStoreHook(GraphContext)
export const useDispatch = createDispatchHook(GraphContext)
export const useSelector = createSelectorHook(GraphContext)


const myStore = createStore(reducers, applyMiddleware())

export function GraphProvider({ children }) {
  return (
    <Provider context={GraphContext} store={myStore}>
      {children}
    </Provider>
  )
}
