import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter as Router, routerMiddleware } from 'react-router-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import createHistory from 'history/createBrowserHistory';

import App from './App';
import rootReducer from './Reducers';


const initialState = {};
const middleware = [thunk, logger];
const history = createHistory();
const store = createStore(
    rootReducer,
    initialState,
    compose(
        applyMiddleware(
            routerMiddleware(history),
            ...middleware
        ),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    )
);


ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);
