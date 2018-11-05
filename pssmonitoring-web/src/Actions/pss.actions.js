import { TOGGLE_LOADER, CHANGE_LOADER_TEXT, CLEAR_HISTORY_FILTER, REMOVE_TRIGGER, RESET_HISTORY_TAB_STATE, RESET_WEBCAM_TAB_STATE, RESET_REMOTECTRL_TAB_STATE, RESET_SCREENSHOT_TAB_STATE } from './types';
import { stopListener } from './api.actions';
import { ListenerType } from '../Utils/pss.helper';


export const toggleLoader = (loaderState, loaderText = null) => dispatch => {
    dispatch({
        type: TOGGLE_LOADER,
        payload: loaderState
    })
    if (loaderText) {
        dispatch({
            type: CHANGE_LOADER_TEXT,
            payload: loaderText
        })
    }
}

export const changeLoaderText = (loaderText) => dispatch => {
    dispatch({
        type: CHANGE_LOADER_TEXT,
        payload: loaderText
    })
}

export const removeTrigger = (key) => dispatch => {
    dispatch({
        type: REMOVE_TRIGGER,
        payload: key
    })
}

export const clearFilteredHistory = () => dispatch => {
    dispatch({
        type: CLEAR_HISTORY_FILTER
    })
}

export const clearOldTabState = (tab) => dispatch => {
    return new Promise((resolve, reject) => {
        switch (tab) {
            case 'Home':
                // do nothing
                break;
            case 'Browser History':
                stopListener(ListenerType.BrowserHistoryRef);
                dispatch({ type: RESET_HISTORY_TAB_STATE })
                break;
            case 'Webcam':
                stopListener(ListenerType.WebcamRef);
                dispatch({ type: RESET_WEBCAM_TAB_STATE })
                break;
            case 'Screenshot':
                stopListener(ListenerType.ScreenshotRef);
                dispatch({ type: RESET_SCREENSHOT_TAB_STATE })
                break;
            case 'RemoteControl':
                stopListener(ListenerType.RemoteControlRef);
                dispatch({ type: RESET_REMOTECTRL_TAB_STATE })
                break;
            case 'Settings':
                // do nothing
                break;
            default:
        }
        resolve();
    });
}