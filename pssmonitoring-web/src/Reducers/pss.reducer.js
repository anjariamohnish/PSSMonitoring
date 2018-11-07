import {
    TOGGLE_LOADER, CHANGE_LOADER_TEXT, SET_USER_INFO, SIGNOUT_USER, SET_DEVICE_DATA,
    CHANGE_DEVICE_STATUS, UPDATE_BROWSER_HISTORY, SHOW_FILTERED_HISTORY,
    CLEAR_HISTORY_FILTER, ADD_TRIGGER, UPDATE_TRIGGER, TRIGGER_LOADED, REMOVE_TRIGGER, RESET_HISTORY_TAB_STATE,
    ADD_WEBCAM_IMAGE, RESET_WEBCAM_TAB_STATE, ADD_SCREENSHOT_IMAGE, SET_LOCK_STATE, ADD_COMMAND, RESET_SCREENSHOT_TAB_STATE,
    RESET_REMOTECTRL_TAB_STATE, ADD_QUIZ_QUESTION, UPDATE_LIVE_STATUS, RESET_HOME_TAB_STATE
} from '../Actions/types';
import { LockStatus } from '../Utils/pss.helper';

const initialState = {
    showLoader: false,
    loaderText: '',
    browserHistory: [],
    savedHistory: [],
    triggers: [],
    isTriggerLoaded: false,
    webcamImages: [],
    screenshots: [],
    commands: [],
    quiz: [],
    liveStatus: null
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
        case ADD_WEBCAM_IMAGE:
            return {
                ...state,
                webcamImages: [...state.webcamImages, action.payload]
            }
        case RESET_WEBCAM_TAB_STATE:
            return {
                ...state,
                webcamImages: []
            }
        case ADD_SCREENSHOT_IMAGE:
            return {
                ...state,
                screenshots: [...state.screenshots, action.payload]
            }
        case RESET_SCREENSHOT_TAB_STATE:
            return {
                ...state,
                screenshots: []
            }
        case SET_LOCK_STATE:
            return {
                ...state,
                lock: action.payload
            }
        case ADD_COMMAND:
            return {
                ...state,
                commands: {
                    ...state.commands,
                    [action.payload.key]: action.payload.snapshot
                }
            }
        case RESET_REMOTECTRL_TAB_STATE:
            return {
                ...state,
                commands: []
            }
        case ADD_QUIZ_QUESTION:
            return {
                ...state,
                quiz: [...state.quiz, action.payload]
            }
        case UPDATE_LIVE_STATUS:
            return {
                ...state,
                liveStatus: action.payload
            }
        case RESET_HOME_TAB_STATE:
            return {
                ...state,
                liveStatus: null
            }
        default:
            return state;
    }
}
