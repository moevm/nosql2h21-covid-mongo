import { takeEvery, put, all } from 'redux-saga/effects'

import api from 'api/api'
import { apiActions, API_ACTIONS } from 'api/actions';

export function* onApiLoad({payload, type}) {
    const actionType = type.replace(`${API_ACTIONS.FETCH_START}_`, '').toLowerCase();
    try {
        const response = yield api.fetch(actionType, payload);
        yield put(apiActions.fetchSuccess(actionType, response));
    } catch (error) {
        yield put(apiActions.fetchFailure(actionType, error));
    }
}

export function* watchApiLoad() {
    yield takeEvery(action => action.type.startsWith(`${API_ACTIONS.FETCH_START}_`), onApiLoad)
}

export default function* apiRootSaga() {
    yield all([
        watchApiLoad()
    ])
}