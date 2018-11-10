import firebase from '../firebase';
import { notifyUser, notifyType, TriggerStatus, TriggerType, extractDate, LockStatus, ListenerType, QuizCategory, shuffle } from '../Utils/pss.helper';
import {
    SIGNOUT_USER, SET_USER_INFO, SET_DEVICE_DATA, CHANGE_DEVICE_STATUS,
    UPDATE_BROWSER_HISTORY, SHOW_FILTERED_HISTORY, ADD_TRIGGER, UPDATE_TRIGGER, TRIGGER_LOADED, ADD_WEBCAM_IMAGE, ADD_SCREENSHOT_IMAGE, SET_LOCK_STATE, ADD_COMMAND, ADD_QUIZ_QUESTION, UPDATE_LIVE_STATUS
} from './types';

const firebaseListeners = [];
const intervals = [];

export const loginUser = (credentials) => dispatch => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
            .then((data) => {
                const user = data.user.email.split('@')[0];
                const userDbRef = firebase.database().ref('Users').child(user);
                userDbRef.once('value', (snapshot) => {
                    if (snapshot.val() === 0) {
                        firebase.auth().sendPasswordResetEmail(data.user.email)
                            .then(() => {
                                notifyUser('Password Reset Email has been sent successfully', notifyType.warning);
                                userDbRef.set(1);
                                firebase.auth().signOut();
                                reject();
                            })
                            .catch(() => {
                                notifyUser('Something Went Wrong', notifyType.error);
                                firebase.auth().signOut();
                                reject();
                            });
                    } else if (snapshot.val() === 1 && credentials.password !== 'pass@671968949441') {
                        firebase.database().ref('Devices').once('child_added', (snapshot) => {
                            const snapshotValue = snapshot.val();
                            dispatch({
                                type: SET_DEVICE_DATA,
                                payload: {
                                    deviceId: snapshot.key,
                                    deviceName: snapshotValue.DeviceName,
                                    isDeviceOnline: snapshotValue.DeviceStatus === 1 ? true : false,
                                    isDevicePinging: snapshotValue.DeviceStatus === 1 ? true : false
                                }
                            });
                            dispatch({
                                type: SET_USER_INFO,
                                payload: {
                                    uid: data.user.uid,
                                    name: data.user.displayName,
                                    email: data.user.email
                                }
                            });
                            resolve();
                        });
                    } else if (snapshot.val() === 1 && credentials.password === 'pass@671968949441') {
                        notifyUser('Please Complete your Password Reset', notifyType.error);
                        firebase.auth().signOut();
                        reject();
                    }
                });
            })
            .catch((err) => {
                if (err.code === 'auth/user-not-found') {
                    notifyUser('No such Email Exist', notifyType.error);
                } else {
                    notifyUser(err.message, notifyType.error);
                }
                reject();
            })
    });
};

export const sendForgotPasswordMail = (email) => dispatch => {
    return firebase.auth().sendPasswordResetEmail(email);
};

export const signOutUser = () => dispatch => {
    return new Promise((resolve, reject) => {
        firebase.auth().signOut().then(() => {
            dispatch({
                type: SIGNOUT_USER
            })
            resolve();
        }).catch(() => {
            reject();
        })
    });
}

export const trackDeviceStatus = (deviceId) => dispatch => {
    const deviceStatusRef = firebase.database().ref('Devices').child(deviceId).child('DeviceStatus');
    const pingRef = firebase.database().ref('Devices').child(deviceId).child('PING');

    let timestamp = null;
    let deviceStatus = false;

    pingRef.on('value', (snapshot) => {
        setTimeout(() => {
            if (snapshot.val() === 1) {
                pingRef.set(0);
                timestamp = Date.now();
            }
        }, 5000)
    });

    const pingInterval = setInterval(() => {
        if (timestamp) {
            const seconds = Math.abs(Math.floor((timestamp - Date.now()) / 1000));
            if (seconds >= 10 && deviceStatus) {
                deviceStatus = false;
                dispatch({
                    type: CHANGE_DEVICE_STATUS,
                    payload: false
                });
                deviceStatusRef.set(0);
            }
        }
    }, 7000)

    deviceStatusRef.on('value', (snapshot) => {
        if (snapshot.val() === 1) {
            deviceStatus = true;
            dispatch({
                type: CHANGE_DEVICE_STATUS,
                payload: true
            });
        } else {
            deviceStatus = false;
            dispatch({
                type: CHANGE_DEVICE_STATUS,
                payload: false
            });
        }
    });

    const deviceLockRef = firebase.database().ref('Devices').child(deviceId).child('Lock');

    deviceLockRef.on('value', (snapshot) => {
        const lock = snapshot.val();
        dispatch({
            type: SET_LOCK_STATE,
            payload: lock
        })
    });

    firebaseListeners.push({ type: -1, reference: deviceLockRef });
    firebaseListeners.push({ type: -1, reference: deviceStatusRef });
    firebaseListeners.push({ type: -1, reference: pingRef });
    intervals.push(pingInterval);
}

export const getBrowserHistory = (deviceId) => dispatch => {
    const browserRef = firebase.database().ref('Devices').child(deviceId).child('BrowserHistory');
    browserRef.on('child_added', (snapshot) => {
        dispatch({
            type: UPDATE_BROWSER_HISTORY,
            payload: snapshot.toJSON()
        });

    });

    firebaseListeners.push({ reference: browserRef, type: ListenerType.BrowserHistoryRef });
}

export const getBrowserHistoryByDate = (deviceId, dates) => dispatch => {
    return new Promise((resolve, reject) => {
        fetch('https://us-central1-pss-monitoring.cloudfunctions.net/getHistoryByDates', {
            method: 'POST',
            body: JSON.stringify({ id: deviceId, dates: dates })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.toString() === '') {
                    reject('No History Found For Specified Dates');
                } else {
                    resolve();
                    dispatch({
                        type: SHOW_FILTERED_HISTORY,
                        payload: data
                    });
                }
            }).catch(() => {
                reject('Sever Error');
            })
    });
}

export const addTrigger = (deviceId, trigger) => dispatch => {
    return new Promise((resolve, reject) => {
        const key = firebase.database().ref().push().key;
        firebase.database().ref('Devices').child(deviceId).child('Triggers').child(key).set(trigger)
            .then(() => {
                dispatch({
                    type: ADD_TRIGGER,
                    payload: { key: key, data: trigger }
                });
                resolve();
            })
            .catch(() => {
                reject();
            });
    });
}

export const enableTriggerListener = (deviceId, userInfo) => dispatch => {
    const triggerRef = firebase.database().ref('Devices').child(deviceId).child('Triggers').orderByChild('User/uid').equalTo(userInfo.uid);

    //load triggers once:
    triggerRef.once('value', (snapshots) => {
        let counter = 0;
        snapshots.forEach((snapshot) => {
            counter++;
            if (snapshot.val().TriggerStatus === TriggerStatus.PENDING) {
                dispatch({
                    type: ADD_TRIGGER,
                    payload: { key: snapshot.key, data: snapshot.val() }
                })
            }
            if (snapshots.numChildren() === counter) {
                dispatch({
                    type: TRIGGER_LOADED
                })
            }
        });
    });

    triggerRef.on('child_changed', (snapshot) => {
        dispatch({
            type: UPDATE_TRIGGER,
            payload: { key: snapshot.key, data: snapshot.val() }
        })
    });
    firebaseListeners.push({ reference: triggerRef, type: ListenerType.triggerRef });
}

export const getWebcamImages = (deviceId, userInfo) => dispatch => {
    const webcamRef = firebase.database().ref('Devices').child(deviceId).child('Triggers').orderByChild('User/uid').equalTo(userInfo.uid);

    webcamRef.on('value', (snapshots) => {
        let keys = [];
        let timestamps = [];
        snapshots.forEach((snapshot) => {
            if (snapshot.val().TriggerType === TriggerType.TAKEPICTURE && snapshot.val().TriggerStatus === TriggerStatus.SUCCESS) {
                keys.push(snapshot.key);
                timestamps[snapshot.key] = snapshot.val().Timestamp;
            }
        });
        if (keys && keys.length > 0)
            firebase.database().ref('Devices').child(deviceId).child('Webcam').child(extractDate())
                .once('value', (snapshots) => {
                    snapshots.forEach((snapshot) => {
                        if (keys.includes(snapshot.val().key)) {
                            dispatch({
                                type: ADD_WEBCAM_IMAGE,
                                payload: { snapshot: snapshot.val(), timestamp: timestamps[snapshot.val().key] }
                            })
                        }
                    })
                })
    });

    firebaseListeners.push({ reference: webcamRef, type: ListenerType.WebcamRef });
}

export const getScreenshots = (deviceId, userInfo) => dispatch => {
    const screenShotRef = firebase.database().ref('Devices').child(deviceId).child('Triggers').orderByChild('User/uid').equalTo(userInfo.uid);

    screenShotRef.on('value', (snapshots) => {
        let keys = [];
        let timestamps = [];
        snapshots.forEach((snapshot) => {
            if (snapshot.val().TriggerType === TriggerType.SCREENSHOT && snapshot.val().TriggerStatus === TriggerStatus.SUCCESS) {
                keys.push(snapshot.key);
                timestamps[snapshot.key] = snapshot.val().Timestamp;
            }
        });
        if (keys && keys.length > 0)
            firebase.database().ref('Devices').child(deviceId).child('Screenshots').child(extractDate())
                .once('value', (snapshots) => {
                    snapshots.forEach((snapshot) => {
                        if (keys.includes(snapshot.val().key)) {
                            dispatch({
                                type: ADD_SCREENSHOT_IMAGE,
                                payload: { snapshot: snapshot.val(), timestamp: timestamps[snapshot.val().key] }
                            })
                        }
                    })
                })
    });

    firebaseListeners.push({ reference: screenShotRef, type: ListenerType.ScreenshotRef });
}

export const checkIfExist = (databaseReference, listenerType) => dispatch => {
    return new Promise((resolve, reject) => {
        firebase.database().ref(databaseReference).once(listenerType, (snapshot) => {
            snapshot.exists() ? resolve() : reject();
        }).then().catch(() => { reject() });
    });
}

export const lockSystem = (deviceId, lock) => dispatch => {
    return firebase.database().ref('Devices').child(deviceId).child('Lock').set(lock)
}

export const unlockSystem = (deviceId, pin) => dispatch => {
    return new Promise((resolve, reject) => {
        firebase.database().ref('Devices').child(deviceId).child('Lock').once('value', (snapshot) => {
            if (snapshot.val().pin === pin) {
                firebase.database().ref('Devices').child(deviceId).child('Lock').child('status').set(LockStatus.UNLOCKED).then(() => {
                    resolve(true);
                }).catch(() => {
                    reject();
                })
            } else {
                resolve(false)
            }
        }).then().catch(() => { reject() });
    });
}

export const getCommands = (deviceId, userInfo) => dispatch => {
    const commandsRef = firebase.database().ref('Devices').child(deviceId).child('Triggers').orderByChild('User/uid').equalTo(userInfo.uid);
    commandsRef.on('value', (snapshots) => {
        snapshots.forEach((snapshot) => {
            switch (snapshot.val().TriggerType) {
                case TriggerType.SHUTDOWN:
                case TriggerType.RESTART:
                case TriggerType.SHOW_MESSAGE:
                case TriggerType.SIGNOUT:
                case TriggerType.LOCK:
                    dispatch({
                        type: ADD_COMMAND,
                        payload: { snapshot: snapshot.val(), key: snapshot.key }
                    })
                    break;
                default:
            }
        });
    });

    firebaseListeners.push({ reference: commandsRef, type: ListenerType.RemoteControlRef });
}

export const getQuestions = () => dispatch => {
    const apiBaseUrl = 'https://opentdb.com/api.php?amount=5&difficulty=easy';
    QuizCategory.forEach((category) => {
        fetch(`${apiBaseUrl}&category=${category}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.results) {
                    shuffle(data.results).forEach((quiz) => {
                        if (quiz.type === 'multiple') {
                            const options = [];
                            quiz.incorrect_answers.forEach((answer) => {
                                options.push(answer);
                            });
                            options.push(quiz.correct_answer);
                            quiz.options = shuffle(options);
                        }
                        delete quiz.category;
                        delete quiz.difficulty;
                        delete quiz.incorrect_answers;
                        dispatch({
                            type: ADD_QUIZ_QUESTION,
                            payload: quiz
                        });
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
    });
}

export const getLiveStatus = (deviceId) => dispatch => {
    const liveStatRef = firebase.database().ref('Devices').child(deviceId).child('LiveStatus');
    liveStatRef.on('value', (snapshot) => {
        dispatch({
            type: UPDATE_LIVE_STATUS,
            payload: { StartTime: snapshot.val().StartTime, UpTime: snapshot.val().UpTime.replace('-', '') }
        })
    });
    firebaseListeners.push({ reference: liveStatRef, type: ListenerType.liveStatusRef });
}

export const stopListener = (type) => {
    const index = firebaseListeners.findIndex(x => x.type === type);
    if (index && firebaseListeners[index]) {
        firebaseListeners[index].reference.off();
        firebaseListeners.splice(index, 1);
    }
}

export const stopAllListeners = () => dispatch => {
    firebaseListeners.forEach(listener => {
        listener.reference.off();
    });

    intervals.forEach(interval => {
        clearInterval(interval);
    });
}