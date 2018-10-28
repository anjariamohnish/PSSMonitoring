import {
    TOGGLE_LOADER, CHANGE_LOADER_TEXT, SET_USER_INFO, SIGNOUT_USER, SET_DEVICE_DATA,
    CHANGE_DEVICE_STATUS, UPDATE_BROWSER_HISTORY, SHOW_FILTERED_HISTORY,
    CLEAR_HISTORY_FILTER, ADD_TRIGGER, UPDATE_TRIGGER, TRIGGER_LOADED, REMOVE_TRIGGER, RESET_HISTORY_TAB_STATE
} from '../Actions/types';

const initialState = {
    showLoader: false,
    loaderText: '',
    browserHistory: [],
    savedHistory: [],
    triggers: [],
    isTriggerLoaded: false
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

            }
        case CLEAR_HISTORY_FILTER:
            return {
                ...state,
                browserHistory: state.savedHistory,
                savedHistory: []
            }
        case TRIGGER_LOADED:
            return {
                ...state,
                isTriggerLoaded: true
            }
        case ADD_TRIGGER:
            return {
                ...state,
                triggers: { ...state.triggers, [action.payload.key]: action.payload.data }
            }
        case UPDATE_TRIGGER:
            return {
                ...state,
                triggers: {
                    ...state.triggers,
                    [action.payload.key]: action.payload.data
                }
            }
        case REMOVE_TRIGGER:
            delete state.triggers[action.payload];
            return {
                ...state,
                triggers: state.triggers
            }
        case RESET_HISTORY_TAB_STATE:
            return {
                ...state,
                browserHistory: [],
                savedHistory: [],
            }
        default:
            return state;
    }
}
