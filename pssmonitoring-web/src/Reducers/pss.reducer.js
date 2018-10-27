import { TOGGLE_LOADER, CHANGE_LOADER_TEXT, SET_USER_INFO, SIGNOUT_USER, SET_DEVICE_DATA, CHANGE_DEVICE_STATUS, UPDATE_BROWSER_HISTORY, SHOW_FILTERED_HISTORY, CLEAR_HISTORY_FILTER } from '../Actions/types';

const initialState = {
    showLoader: false,
    loaderText: '',
    browserHistory: [],
    savedHistory: []
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
            return initialState
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
        case SHOW_FILTERED_HISTORY:
            return {
                ...state,
                savedHistory: state.browserHistory,
                browserHistory: action.payload
                // savedHistory:action.payload

            }
        case CLEAR_HISTORY_FILTER:
            return {
                ...state,
                browserHistory: state.savedHistory,
                savedHistory: []
            }
        default:
            return state;
    }
}
