import { TOGGLE_LOADER, CHANGE_LOADER_TEXT, CLEAR_HISTORY_FILTER } from './types';


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

export const clearFilteredHistory = () => dispatch => {
    dispatch({
        type: CLEAR_HISTORY_FILTER
    })
}