import { takeLatest, all } from 'redux-saga/effects'
import API from '../Services/api/api'
import FixtureAPI from '../Services/api/fixture'
import DebugConfig from '../config/env.dev'

/* ------------- Types ------------- */


/* ------------- Sagas ------------- */

/* ------------- API ------------- */

// The API we use is only used from Sagas, so we create it here and pass along
// to the sagas which need it.
//const api = DebugConfig.useFixtures ? FixtureAPI : API

/* ------------- Connect Types To Sagas ------------- */

export default function * root () {
  yield all([
    // some sagas only receive an action
  ])
}
