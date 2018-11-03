import { NotificationManager } from 'react-notifications';

export const notifyType = Object.freeze({ 'info': 1, 'success': 2, 'warning': 3, 'error': 4 });
export const loaderState = Object.freeze({ 'ON': true, 'OFF': false });
export const TriggerStatus = Object.freeze({ 'SUCCESS': 0, 'FAILED': 1, 'PENDING': 2, 'STOPPED': 3 });
export const TriggerType = Object.freeze({ 'SHUTDOWN': 0, 'RESTART': 1, 'LOCK': 2, 'SIGNOUT': 3, 'SHOW_MESSAGE': 4, 'TAKEPICTURE': 5, 'SCREENSHOT': 6 });
export const LockStatus = Object.freeze({ 'UNLOCKED': 0, 'LOCK': 1 });
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

export function createTrigger(triggerType, userInfo) {
    return { Timestamp: Date.now(), TriggerStatus: TriggerStatus.PENDING, TriggerType: triggerType, User: userInfo };
}

export function createMessage(triggerType, triggerStatus) {
    let status = '';
    switch (triggerStatus) {
        case TriggerStatus.SUCCESS:
            status = 'Successful';
            break;
        case TriggerStatus.STOPPED:
            status = 'Stopped';
            break;
        case TriggerStatus.FAILED:
            status = 'Failed';
            break;
        default:
    }
    switch (triggerType) {
        case TriggerType.TAKEPICTURE:
            return 'Capture Webcam Image was ' + status;
        case TriggerType.SHUTDOWN:
            return 'Shutdown Process was ' + status
        case TriggerType.SIGNOUT:
            return 'Signout Process was ' + status
        case TriggerType.SCREENSHOT:
            return 'Capture Screenshot was ' + status
        case TriggerType.RESTART:
            return 'Restart Process was ' + status
        case TriggerType.SHOW_MESSAGE:
            return 'Message was shown' + status
        default:
    }
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