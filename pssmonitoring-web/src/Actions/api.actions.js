import firebase from '../firebase';
import { notifyUser, notifyType } from '../Utils/pss.helper';
import { SIGNOUT_USER, SET_USER_INFO } from './types';

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
                        dispatch({
                            type: SET_USER_INFO,
                            payload: {
                                uid: data.user.uid,
                                name: data.user.displayName,
                                email: data.user.email
                            }
                        })
                        resolve();
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