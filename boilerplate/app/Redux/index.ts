import { combineReducers } from 'redux'
import configureStore from './CreateStore'
import rootSaga from '../Sagas/'
import {reducer as StartupReducer} from './StartupRedux'

/* ------------- Assemble The Reducers ------------- */
export const reducers = combineReducers({
  Startup: StartupReducer,
})

export default () => {
  let { store, sagasManager, sagaMiddleware } = configureStore(reducers, rootSaga)

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./').reducers
      store.replaceReducer(nextRootReducer)

      const newYieldedSagas = require('../Sagas').default
      sagasManager.cancel()
      // @ts-ignore
      sagasManager.done.then(() => {
        // @ts-ignore
        sagasManager = sagaMiddleware(newYieldedSagas)
      })
    })
  }

  return store
}
