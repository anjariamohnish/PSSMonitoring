import firebase from 'firebase';
import sysInfo, { Systeminformation } from 'systeminformation';
import Promise from 'promise';
import _ from 'lodash';
import hash from 'object-hash';
import screenshot from 'screenshot-desktop';
import { encode } from 'base64-arraybuffer';
import internetAvailable from 'internet-available';
import child_proccess from 'child_process';
import BrowserHistory from 'node-browser-history';
import { DEVICES_NODE } from './constants/constant';
import { initializeFirebase } from './helper/firebase.helper';
import { logEvent, getCurrentDateTime } from './helper/app.helper';
import { Device, DeviceInfo, LiveStatus, ScreenShot, BrowserHistoryInfo } from './models';
import { DeviceStatus, ImageStatus } from './enums';
import { TriggerType } from './enums/triggerType.enum';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import NodeWebcam from 'node-webcam';
import { sendgrid_apiKey } from './configs';
import { Trigger } from './models/trigger.model';

export const state = {
    email: '',
    password: '',
    uuid: ''
}

function startUp() {
    initializeFirebase();
    sysInfo.system().then(sysinfo => {
        let uuidarray = sysinfo.uuid.split('-');
        let email = uuidarray[0].toLowerCase() + '@pss.com';
        let password = uuidarray[uuidarray.length - 1].toLowerCase();
        state.email = email;
        state.password = password;
        state.uuid = sysinfo.uuid;
        loginMachine({ email: email, password: password })
            .then(() => {
                // start liveupdates // send mail
                liveMachineStats();
                logBrowsersHistory();
                logEvent('Starting Up', 'Ready');
                console.log('already regis starting live');
            })
            .catch((err) => {
                const NO_USER_FOUND = 'auth/user-not-found';
                if (err.code === NO_USER_FOUND) {
                    registerMachine()
                        .then(() => {
                            logEvent('Registration Success', 'Successfully Registered @' + getCurrentDateTime());
                            startUp();
                        }).catch((err) => {
                            logEvent('Promise Error', err);
                        });
                } else {
                    logEvent('Promise Error', err);
                }
            })
    });
    process.on('SIGTERM', shutDownSystem);
    process.on('SIGINT', shutDownSystem);
    process.on('exit', shutDownSystem);
}

function liveMachineStats() {
    const status = new LiveStatus();
    let oldStatus: any = null;
    setInterval(() => {
        Promise.all([ // promises
            sysInfo.battery().then(data => data.hasbatter ? status.BatteryInfo = data : null),
            sysInfo.mem().then(data => {
                status.RamInfo = { total: readableBytes(data.total), available: readableBytes(data.available), inUse: readableBytes(data.used) };
            }),
            sysInfo.users().then(data => {
                status.StartTime = data[0].time + ':00';
                status.UpTime = getTimeDifference(status.StartTime, getCurrentDateTime(false, true)).toString() + ' hrs';
            })
        ]).then(() => {
            if (oldStatus !== JSON.stringify(status)) {
                const dbReference = firebase.auth().currentUser!.displayName + '/LiveStatus';
                firebase.database().ref(DEVICES_NODE).child(dbReference).set(status, (err: any) => {
                    oldStatus = JSON.stringify(status);
                    if (err) {
                        logEvent('Database Set Error', err);
                    }
                })
            }
        }).catch(() => {
            logEvent('Promises Error', 'Error in live updates');
        })

    }, 5000);
}

function registerMachine(): Promise<any> {
    return new Promise((resolve, rejects) => {
        let deviceInfo = new DeviceInfo();
        Promise.all([ // promises
            sysInfo.system().then(data => deviceInfo.SystemInfo = data),
            sysInfo.cpu().then(data => deviceInfo.CpuInfo = data),
            sysInfo.battery().then(data => data.hasbatter ? deviceInfo.BatteryInfo = data : null),
            sysInfo.graphics().then(data => deviceInfo.GraphicsInfo = data),
            sysInfo.osInfo().then(data => deviceInfo.OsInfo = data),
            sysInfo.users().then(data => deviceInfo.UserInfo = data),
            sysInfo.networkInterfaces().then(data => deviceInfo.EthernetInfo = data)])
            .then(() => {
                createMachineCredentials(deviceInfo.SystemInfo.uuid)
                    .then((credentials) => {
                        loginMachine(credentials)
                            .then(() => {
                                let device = new Device();
                                device.DeviceName = deviceInfo.OsInfo.hostname + '@' + deviceInfo.SystemInfo.manufacturer;
                                device.DeviceStatus = DeviceStatus.ON;
                                device.DeviceInfo = deviceInfo;
                                firebase.database().ref(DEVICES_NODE).child(deviceInfo.SystemInfo.uuid).set(device, (err: any) => {
                                    if (err) {
                                        rejects(new Error(err));
                                        logEvent('Database Set Error', err);
                                    } else {
                                        resolve();
                                    }
                                })
                            })
                            .catch((err) => {
                                rejects(new Error(err));
                                logEvent('Promises Error', err);
                            })
                    })
                    .catch((err) => {
                        rejects(new Error(err));
                        logEvent('Promises Error', err);
                    })
            }).catch((err) => {
                rejects(new Error(err));
                logEvent('Promises Error', err);
            });
    })
}

function createMachineCredentials(uuid: string): Promise<any> {
    return new Promise((resolve, rejects) => {
        let uuidarray = uuid.split('-');
        let email = uuidarray[0].toLowerCase() + '@pss.com';
        let password = uuidarray[uuidarray.length - 1].toLowerCase();
        firebase.auth().createUserWithEmailAndPassword(email, password).then((data: any) => {
            data.user.updateProfile({ displayName: uuid }).then(() => {
                resolve({ email: email, password: password });
            }).catch((err: any) => {
                rejects(err);
            });
        }).catch((err: any) => {
            rejects(err);
        })
    });
}

function loginMachine(credentials: any): Promise<any> {
    return new Promise((resolve, rejects) => {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
            .then(() => {
                changeDeviceState(DeviceStatus.ON);
                resolve();
            })
            .catch((err: any) => {
                rejects(err);
            })
    });
}

function readableBytes(bytes: any): any {
    const i = Math.floor(Math.log(bytes) / Math.log(1024)),
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    return Math.round((bytes / Math.pow(1024, i)) * 1 * 100) / 100 + '' + sizes[i];
}

function getTimeDifference(time1: string | undefined, time2: string | undefined): number {
    const timeStart = new Date("01/01/2018 " + time1).getHours();
    const timeEnd = new Date("01/01/2018 " + time2).getHours();

    return timeEnd - timeStart;
}

function logBrowsersHistory() {
    const DbNodeReference = firebase.auth().currentUser!.displayName + '/BrowserHistory';
    let browserHistoryList = new Array<BrowserHistoryInfo>();
    setInterval(() => {
        BrowserHistory.getAllHistory().then((historyList: any) => {
            historyList.forEach((entry: any) => {
                if (!(_.find(browserHistoryList, { hash: hash(entry) }))) {
                    entry.hash = hash(entry);
                    browserHistoryList.push(entry);
                    firebase.database().ref(DEVICES_NODE).child(DbNodeReference).child(getCurrentDateTime(true, false)).push().set(entry, (err: any) => {
                        if (err) {
                            logEvent('Database Set Error', err);
                        }
                    })
                }
            });
        })
    }, 5000);
}

function takeScreenshot() {
    screenshot().then((img: any) => {
        const DbNodeReference = firebase.auth().currentUser!.displayName + '/ScreenShots';
        let currentScreenshot = new ScreenShot();
        const currentDateTime = getCurrentDateTime();
        currentScreenshot.Base64 = encode(img);
        currentScreenshot.Status = ImageStatus.UNREAD;
        currentScreenshot.CreationDateTime = currentDateTime;
        currentScreenshot.ImageName = 'Screenshot@' + currentDateTime;
        firebase.database().ref(DEVICES_NODE).child(DbNodeReference).child(getCurrentDateTime(true, false)).push().set(currentScreenshot, (err: any) => {
            if (err) {
                logEvent('Database Set Error', err);
            }
        })
    }).catch((err: any) => {
        console.log(err)
    })


}

function sendUserEmail(to: Array<string>, subject: string, text: string, attachments: Array<any>) {
    sgMail.setApiKey(sendgrid_apiKey);
    const msg = {
        to,
        from: 'noreplypss@pssmonitoring.com',
        subject,
        text,
        attachments
    };
    sgMail.send(msg).then((response) => {
        if (response['0'].statusCode === 202) {
            logEvent('Mail Sent', msg.to.toString() + '|' + msg.subject + '|' + msg.text);
        } else {
            logEvent('Mail Send Error', response['0'].statusCode + '||' + msg.to.toString() + '|' + msg.subject + '|' + msg.text);
        }
    }).catch((err) => {
        logEvent('Mail Send Error', JSON.stringify(err) + '||' + msg.to.toString() + '|' + msg.subject + '|' + msg.text);
    });
}

function takePicture() {
    sysInfo.graphics().then((info) => {
        const width = info.displays[0].sizex;
        const height = info.displays[0].sizey;
        var opts = {
            width: width,
            height: height,
            quality: 100,
            delay: 0,
            saveShots: true,
            output: "jpeg",
            device: false,
            verbose: false,
            callbackReturn: "base64"
        };
        const Webcam = NodeWebcam.create(opts);
        Webcam.capture("webcam", function (err: any, data: any) {
            if (err) {
                logEvent('Webcam Capture Error', JSON.stringify(err));
            }
            if (data) {
                // send to firebase
                sendUserEmail(
                    ['anjariamohnish@gmail.com'],
                    'Webcam',
                    'Picture Click on ',
                    [{ filename: 'webcam.jpg', content: data.replace('data:image/jpeg;base64,', ''), contentId: 'webcam' }]);
            }
        });
    }).catch((err) => {
        logEvent('Take Picture Error Sysinfo', JSON.stringify(err));
    })
}

function checkForInternet() {
    internetAvailable({
        timeout: 5000,
        retries: 10
    }).then(() => {
        console.log("Internet available Restarting System");
    }).catch(() => {
        console.log('stoopping system')
        checkForInternet();
    });
}

function runCommand(triggerType: TriggerType, message: any = null) {
    if (message) {
        const createCommand = '@echo ' + message + '> "%temp%\\pss.txt"';
        const openCommand = 'start notepad.exe "%temp%\\pss.txt"';
        execCommand(createCommand, triggerType, '[Create]', (status: boolean) => {
            if (status) {
                execCommand(openCommand, triggerType, '[Open]', null);
            }
        });
    } else {
        const file = 'batchfiles\\' + TriggerType[triggerType].toLowerCase() + '.bat';
        execCommand(file, triggerType, null, null);
    }
}

function execCommand(commandFile: string, triggerType: TriggerType, note: any = '', _callback: any) {
    child_proccess.exec(commandFile, (error, stdout, stderr) => {
        logEvent('Command Exec Request', TriggerType[triggerType].toString() + note);
        _callback(true);
        if (error) {
            logEvent('Command Exec Error', error);
            _callback(false);
        }
    });
}

function changeDeviceState(deviceStatus: DeviceStatus) {
    return new Promise((resolve, rejects) => {
        firebase.database().ref(DEVICES_NODE).child(state.uuid).child('DeviceStatus').set(deviceStatus).then(() => {
            resolve();
        }).catch((err) => {
            rejects();
            logEvent('Unable To Change Status', err);
        })
    })
}

function shutDownSystem() {
    changeDeviceState(DeviceStatus.OFF)
        .then(() => {
            //send browser history,send device up time on mail
            process.exit();
        })
}

function initializeListners() {
    state.uuid = '4C4C4544-0059-3110-804B-B3C04F385231';
    console.log('Hello');
    initializeFirebase();
    // firebase.database().ref(DEVICES_NODE).child(state.uuid).child('Triggers').push(new Trigger());
    // firebase.database().ref(DEVICES_NODE).child(state.uuid).child('Triggers').push(new Trigger());    firebase.database().ref(DEVICES_NODE).child(state.uuid).child('Triggers').push(new Trigger());
  
  
    const triggerRef = firebase.database().ref(DEVICES_NODE).child(state.uuid).child('Triggers').orderByChild('isCompleted').equalTo('false');

triggerRef.once('value',(snapshot)=>{
console.log(snapshot.key,snapshot.val());
});

    // triggerRef.on('child_added', (data: any) => {
    //     console.log('child_added', data.val());
    // })


    // triggerRef.on('child_changed', (data: any) => {
    //     console.log('child_changed', data.val());
    // })


    // triggerRef.on('child_removed', (data: any) => {
    //     console.log('child_removed', data.val());
    // })

}

initializeListners();
// startUp();