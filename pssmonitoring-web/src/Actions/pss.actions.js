import { TOGGLE_LOADER, CHANGE_LOADER_TEXT, CLEAR_HISTORY_FILTER, REMOVE_TRIGGER, RESET_HISTORY_TAB_STATE, RESET_WEBCAM_TAB_STATE } from './types';


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
                dispatch({ type: RESET_HISTORY_TAB_STATE })
                break;
            case 'Webcam':
                dispatch({ type: RESET_WEBCAM_TAB_STATE })
                break;
            case 'Screenshot':
                // do nothing
                break;
            case 'RemoteControl':
                // do nothing
                break;
            case 'Settings':
                // do nothing
                break;
            default:
        }
        resolve();
    });
}