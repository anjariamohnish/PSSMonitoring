import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

admin.initializeApp();

export const getHistoryByDates = functions.https.onRequest((request, response) => {
    // tslint:disable-next-line:no-empty
    corsHandler(request, response, () => { });
    if (request.method === 'POST') {
        const filteredHistory = new Array();
        const deviceId = JSON.parse(request.body).id;
        const datesList = JSON.parse(request.body).dates;
        admin.database().ref('Devices').child(deviceId).child('BrowserHistory').once('value', (snapshots) => {
            snapshots.forEach((childSnapshot) => {
                if (datesList.includes(extractDate(childSnapshot.val().utc_time))) {
                    filteredHistory.push(childSnapshot.val());
                }
                return false;
            });
        }).then(() => {
            response.status(200).send(JSON.stringify(filteredHistory));
        }).catch((err) => {
            console.log('Promise Error', err, 'Payload', JSON.stringify(request.body));
            response.send(417);
        });
    }
});

function extractDate(timestamp = null) {
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