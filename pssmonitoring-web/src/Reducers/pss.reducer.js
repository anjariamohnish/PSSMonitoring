import { TOGGLE_LOADER, CHANGE_LOADER_TEXT, SET_USER_INFO, SIGNOUT_USER } from '../Actions/types';

const initialState = {
    showLoader: false,
    loaderText: ''
};

export default function (state = initialState, action) {
    switch (action.type) {
        case TOGGLE_LOADER:
            return {
                ...state,
                showLoader: action.payload
            }
        case CHANGE_LOADER_TEXT:
            return {
                ...state,
                loaderText: action.payload
            }
        case SET_USER_INFO:
            return {
                ...state,
                userInfo: action.payload
            }
        case SIGNOUT_USER:
            return {
                ...state,
                userInfo: null
            }
        default:
            return state;
    }
}
