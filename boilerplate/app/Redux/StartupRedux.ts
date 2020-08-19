import { createActions, createReducer } from 'reduxsauce'

/* ------------- Types and Action Creators ------------- */
const INITIAL_STATE = {}

const { Types, Creators } = createActions({
  startup: null
})

export const StartupTypes = Types
export default Creators

export const reducer = createReducer(INITIAL_STATE, {})
