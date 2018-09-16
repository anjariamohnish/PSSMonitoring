import firebase from 'firebase';
import { firebaseConfig } from '../firebase-config';
import { logEvent } from './app.helper';


export function initializeFirebase(): void {
    if (firebase.apps.length <= 0) {
        firebase.initializeApp(firebaseConfig);
    }
}

export function checkIfExist(dbReference: string): Promise<boolean> {
    return firebase.database().ref(dbReference).once('value')
        .then((snapshot) => {
            return snapshot.exists();
        })
        .catch((err) => {
            logEvent('Promise Error', err);
            return false;
        });
}
