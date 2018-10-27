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

export function extractDate(timestamp = null) {
    let date = null;
    if (timestamp) {
        date = new Date(timestamp);
    } else {
        date = new Date();
    }
    const currentDate = date.getDate() + "-"
        + (date.getMonth() + 1) + "-"
        + date.getFullYear();

    return currentDate;
}

export function extractTime(timestamp) {
    const date = new Date(timestamp);
    const currentTime = date.getHours() + ":"
        + date.getMinutes() + ":"
        + date.getSeconds();

    return currentTime;
}

export const loadingHints = [
    'Testing Springs',
    'Reaching a Safe Distance',
    'Patching Conics',
    'Combobulating Discombobulator',
    'Calculating Ultimate Answer',
    'Answering Ultimate Question',
    'Adding Rockets',
    'Recruiting Volunteers',
    'Locating The Lost Ark',
    'Inventing Witty Loading Hints',
    'Untangling Scotch Tape',
    'Biding Time',
    'Cleaning Air Filters',
    'Sacrificing Efficiency',
    'Herding Llamas',
    'Adding More Sauce',
    'Lithobraking',
    'Fetching Rover',
    'Hoarding Snacks',
    'Rescuing Bill',
    'Repacking Parachute',
    'Charging Batteries',
    'Taste-Testing Snacks',
    'Strapping Lasers to the Sun',
    'Motivating Volunteers',
    'Separating Eggs',
    'Reading Recipe Again',
    'Whipping to Soft Peaks',
    'Checking For Umami',
    'Seasoning To Taste',
    'Setting Up Flannel Graph',
    'Running Amok',
    'Herding Cats',
    'Finding Valuable Cash Prizes',
    'Switching To Decaf',
    'Cleaning Internet Tubes'
]