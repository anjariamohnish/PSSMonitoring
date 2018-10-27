import firebase from '../firebase';
import { notifyUser, notifyType } from '../Utils/pss.helper';
import { SIGNOUT_USER, SET_USER_INFO, SET_DEVICE_DATA, CHANGE_DEVICE_STATUS, UPDATE_BROWSER_HISTORY, SHOW_FILTERED_HISTORY } from './types';

const firebaseListeners = new Array();

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
                console.log(err)
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
    console.log(deviceId);
    const pingRef = firebase.database().ref('Devices').child(deviceId).child('PING');
    const deviceStatusRef = firebase.database().ref('Devices').child(deviceId).child('DeviceStatus');
    // pingRef.on('value', (snapshot) => {
    //     if (snapshot.val() === 1) {
    //         pingRef.set(0);
    //     }
    // });

    deviceStatusRef.on('value', (snapshot) => {
        console.log(snapshot.val());
        if (snapshot.val() === 1) {
            dispatch({
                type: CHANGE_DEVICE_STATUS,
                payload: true
            });
        } else {
            dispatch({
                type: CHANGE_DEVICE_STATUS,
                payload: false
            });
        }
    });
    firebaseListeners.push(deviceStatusRef);
}

export const getBrowserHistory = (deviceId) => dispatch => {
    firebase.database().ref('Devices').child(deviceId).child('BrowserHistory').on('child_added', (snapshot) => {
        // console.log(snapshot.toJSON());
        // const data = new Array();
        // snapshot.forEach((element) => {
        //     const data2 = new Array();
        //     element.forEach((history) => {
        //         data2.push(history.val());
        //     });
        //     data[element.key] = data2;
        // });
        // console.log(data)

        // console.log(snapshot.toJSON());

        dispatch({
            type: UPDATE_BROWSER_HISTORY,
            payload: snapshot.toJSON()
        });

    });
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

export const stopAllListeners = () => dispatch => {
    firebaseListeners.forEach(listener => {
        listener.off();
    });
}