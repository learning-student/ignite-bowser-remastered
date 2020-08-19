import { combineReducers } from 'redux'
import configureStore from './CreateStore'
import rootSaga from '../Sagas/'

/* ------------- Assemble The Reducers ------------- */
export const reducers = combineReducers({})

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
