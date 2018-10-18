import { Log } from "../models";
import firebase from "firebase";
import { state } from "..";

export function getCurrentDateTime(date: boolean = true, time: boolean = true): string {
    const currentDateTime = new Date();

    const currentTime = currentDateTime.getHours() + ":"
        + currentDateTime.getMinutes() + ":"
        + currentDateTime.getSeconds();

    const currentDate = currentDateTime.getDate() + "-"
        + (currentDateTime.getMonth() + 1) + "-"
        + currentDateTime.getFullYear();

    if (date && time) {
        return currentDate + '@' + currentTime;
    } else if (date && !time) {
        return currentDate;
    } else if (!date && time) {
        return currentTime;
    }
    return '';
}


export function logEvent(title: string, details: any): void {
    const log = new Log();
    log.title = title;
    log.details = typeof details !== 'string' ? JSON.stringify(details) : details;
    log.time = getCurrentDateTime();
    firebase.database().ref('Logs').child(state.uuid).push(log);
}
