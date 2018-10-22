import { TOGGLE_LOADER, CHANGE_LOADER_TEXT, SET_USER_INFO, SIGNOUT_USER, SET_DEVICE_DATA, CHANGE_DEVICE_STATUS, UPDATE_BROWSER_HISTORY } from '../Actions/types';

const initialState = {
    showLoader: false,
    loaderText: '',
    browserHistory: []
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
                userInfo: null,
                deviceInfo: null
            }
        case SET_DEVICE_DATA:
            return {
                ...state,
                deviceInfo: action.payload
            }
        case CHANGE_DEVICE_STATUS:
            return {
                ...state,
                deviceInfo: {
                    ...state.deviceInfo,
                    isDeviceOnline: action.payload,
                    isDevicePinging: action.payload
                }
            }
        case UPDATE_BROWSER_HISTORY:
            return {
                ...state,
                browserHistory: [...state.browserHistory, action.payload]
            }
        default:
            return state;
    }
}
