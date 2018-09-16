import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'
import pssReducer from './pss.reducer';

export default combineReducers({
    router: routerReducer,
    pssReducer: pssReducer
});
