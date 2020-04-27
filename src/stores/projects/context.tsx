import React from 'react'
import { createStore } from 'redux'
import {
  Provider,
  createStoreHook,
  createDispatchHook,
  createSelectorHook
} from 'react-redux'
import reducers from './reducers'


const Context = React.createContext(null)

export const useStore = createStoreHook(Context)
export const useDispatch = createDispatchHook(Context)
export const useSelector = createSelectorHook(Context)

const myStore = createStore(reducers)

export function ProjectsProvider({ children }) {
  return (
    <Provider context={Context} store={myStore}>
      {children}
    </Provider>
  )
}
