import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';

import apiReducer from 'api/reducer';
import apiSaga from 'api/saga';

const composeEnchancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const reducers = combineReducers({
    api: apiReducer
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, composeEnchancer(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(apiSaga);

export default store;