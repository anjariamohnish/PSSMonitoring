import { NotificationManager } from 'react-notifications';

export const notifyType = Object.freeze({ 'info': 1, 'success': 2, 'warning': 3, 'error': 4 });
export const loaderState = Object.freeze({ 'ON': true, 'OFF': false });
// eslint-disable-next-line
export const emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

export function notifyUser(message, type, title = null) {
    switch (type) {
        case notifyType.info:
            NotificationManager.info(message);
            break;
        case notifyType.success:
            NotificationManager.success(message, title, 3000);
            break;
        case notifyType.warning:
            NotificationManager.warning(message, title, 3000);
            break;
        case notifyType.error:
            NotificationManager.error(message, title, 3000);
            break;
        default:
    }

}

export function validateUserInputs(input, regex) {
    return regex.test(input);
}