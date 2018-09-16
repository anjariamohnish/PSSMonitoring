import { TOGGLE_LOADER, CHANGE_LOADER_TEXT } from '../Actions/types';

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
        default:
            return state;
    }
}
