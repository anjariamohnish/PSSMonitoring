import firebase from 'firebase';
import sysInfo, { Systeminformation } from 'systeminformation';
import Promise from 'promise';
import _ from 'lodash';
import hash from 'object-hash';
import screenshot from 'screenshot-desktop';
import { encode } from 'base64-arraybuffer';
import child_proccess from 'child_process';
import BrowserHistory from 'node-browser-history';
import { DEVICES_NODE } from './constants/constant';
import { initializeFirebase } from './helper/firebase.helper';
import { logEvent, getCurrentDateTime, extractDateTime } from './helper/app.helper';
import { Device, DeviceInfo, LiveStatus, ScreenShot, BrowserHistoryInfo } from './models';
import { DeviceStatus, ImageStatus } from './enums';
import { TriggerType } from './enums/triggerType.enum';
import sgMail from '@sendgrid/mail';
import NodeWebcam from 'node-webcam';
import { sendgrid_apiKey } from './configs';
import { Trigger } from './models/trigger.model';
import HashMap from 'hashmap';
import { TriggerStatus } from './enums/triggerStatus.enum';
import WatchJS from 'melanke-watchjs';


const watch = WatchJS.watch;
const unwatch = WatchJS.unwatch;
const hashMap = new HashMap();
const browserHistoryList = new Array<BrowserHistoryInfo>();
const setIntervals = new Array<NodeJS.Timer>();
let triggerRef: firebase.database.Query;
let connectedRef: firebase.database.Query;
let pingRef: firebase.database.Reference;

export const state = {
    email: '',
    password: '',
    uuid: '',
    upTime: '',
    isInternetActive: false
}

initializeFirebase();
checkForInternetConnection();

watch(state, ['isInternetActive'], () => {
    if (state.isInternetActive) {
        startUp();
    } else {
        pauseSystem();
    }
});

function startUp() {
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
                initializeListeners();
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
    const liveStatusInterval = setInterval(() => {
        Promise.all([ // promises
            sysInfo.battery().then(data => data.hasbatter ? status.BatteryInfo = data : null),
            sysInfo.mem().then(data => {
                status.RamInfo = { Total: readableBytes(data.total), Available: readableBytes(data.available), InUse: readableBytes(data.used) };
            }),
            sysInfo.users().then(data => {
                status.StartTime = data[0].time + ':00';
                status.UpTime = getTimeDifference(status.StartTime, getCurrentDateTime(false, true));
            })
        ]).then(() => {
            if (oldStatus !== JSON.stringify(status)) {
                const dbReference = firebase.auth().currentUser!.displayName + '/LiveStatus';
                firebase.database().ref(DEVICES_NODE).child(dbReference).set(status, (err: any) => {
                    state.upTime = status.UpTime;
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
    setIntervals.push(liveStatusInterval);
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

function getTimeDifference(time1: string | undefined, time2: string | undefined): string {
    const timeStart = new Date("01/01/2018 " + time1).getHours();
    const timeEnd = new Date("01/01/2018 " + time2).getHours();
    if (timeEnd - timeStart === 0) {
        return new Date("01/01/2018 " + time1).getMinutes() - new Date("01/01/2018 " + time2).getMinutes() + ' Mins';
    } else {
        return timeEnd - timeStart + ' Hrs';
    }
}

function logBrowsersHistory() {
    const DbNodeReference = state.uuid + '/BrowserHistory';
    let browserHistoryInterval = setInterval(() => {
        BrowserHistory.getAllHistory().then((historyList: any) => {
            historyList.forEach((entry: any) => {
                if (!(_.find(browserHistoryList, { hash: hash(entry) }))) {
                    entry.hash = hash(entry);
                    browserHistoryList.push(entry);
                    firebase.database().ref(DEVICES_NODE).child(DbNodeReference).push().set(entry, (err: any) => {
                        if (err) {
                            logEvent('Database Set Error', err);
                        }
                    })
                    // firebase.database().ref(DEVICES_NODE).child(DbNodeReference).child(getCurrentDateTime(true, false)).push().set(entry, (err: any) => {
                    //     if (err) {
                    //         logEvent('Database Set Error', err);
                    //     }
                    // })
                }
            });
        })
    }, 5000);
    setIntervals.push(browserHistoryInterval);
}

function takeScreenshot(key: string) {
    screenshot().then((img: any) => {
        const DbNodeReference = state.uuid + '/ScreenShots';
        let currentScreenshot = new ScreenShot();
        const currentDateTime = getCurrentDateTime();
        currentScreenshot.Base64 = encode(img);
        currentScreenshot.Status = ImageStatus.UNREAD;
        currentScreenshot.CreationDateTime = currentDateTime;
        currentScreenshot.ImageName = 'Screenshot@' + currentDateTime;
        firebase.database().ref(DEVICES_NODE).child(DbNodeReference).child(getCurrentDateTime(true, false)).push().set({ data: currentScreenshot, key }, (err: any) => {
            if (err) {
                onTriggerComplete(key, TriggerStatus.FAILED);
                logEvent('Database Set Error', err);
            } else {
                const trigger: Trigger = hashMap.get(key);
                const currentTimeDate = getCurrentDateTime();
                sendUserEmail(
                    [trigger.User.email],
                    'Screenshot ' + currentTimeDate,
                    'Screenshot Taken by ' + trigger.User.name,
                    [{ filename: 'Screenshot' + currentDateTime + '.jpg', content: currentScreenshot.Base64, contentId: 'Screenshot' + currentDateTime }]);
                onTriggerComplete(key, TriggerStatus.SUCCESS);
            }
        });
    }).catch((err: any) => {
        onTriggerComplete(key, TriggerStatus.FAILED);
        console.log(err);
    })
}

function sendUserEmail(to: Array<string>, subject: string, text: any = null, html: any = null, attachments: Array<any> = []) {
    return new Promise((resolve, rejects) => {
        sgMail.setApiKey(sendgrid_apiKey);
        const msg = {
            to,
            from: 'noreply_pss@pssmonitoring.com',
            subject,
            text: text ? text : 'Please Dont Reply on this Email',
            html: html ? html : '',
            attachments
        };
        sgMail.send(msg).then((response) => {
            if (response['0'].statusCode === 202) {
                logEvent('Mail Sent', msg.to.toString() + '|' + msg.subject + '|' + msg.text);
                resolve();
            } else {
                logEvent('Mail Send Error', response['0'].statusCode + '||' + msg.to.toString() + '|' + msg.subject + '|' + msg.text);
                rejects();
            }
        }).catch((err) => {
            logEvent('Mail Send Error', JSON.stringify(err) + '||' + msg.to.toString() + '|' + msg.subject + '|' + msg.text);
            rejects();
        });
    });
}

function takePicture(key: string) {
    const DbNodeReference = state.uuid + '/Webcam';
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
        Webcam.capture('webcam', function (err: any, data: any) {
            if (err) {
                onTriggerComplete(key, TriggerStatus.FAILED);
                logEvent('Webcam Capture Error', JSON.stringify(err));
            }
            if (data) {
                // send to firebase
                firebase.database().ref(DEVICES_NODE).child(DbNodeReference).child(getCurrentDateTime(true, false)).push().set({ data, key }, (err: any) => {
                    if (err) {
                        onTriggerComplete(key, TriggerStatus.FAILED);
                        logEvent('Database Set Error', err);
                    } else {
                        const trigger: Trigger = hashMap.get(key);
                        const currentTimeDate = getCurrentDateTime();
                        sendUserEmail(
                            [trigger.User.email],
                            'Webcam ' + currentTimeDate,
                            'Webcam Picture Taken by ' + trigger.User.name,
                            [{ filename: 'webcam' + currentTimeDate + '.jpg', content: data.replace('data:image/jpeg;base64,', ''), contentId: 'webcam' + currentTimeDate }]);
                        onTriggerComplete(key, TriggerStatus.SUCCESS);
                    }
                });

            }
        });
    }).catch((err) => {
        onTriggerComplete(key, TriggerStatus.FAILED);
        logEvent('Take Picture Error Sysinfo', JSON.stringify(err));
    })
}

function checkForInternetConnection() {
    connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function (snap: any) {
        if (snap.val() === true) {
            state.isInternetActive = true;
        } else {
            state.isInternetActive = false;
        }
    });
}

function runCommand(triggerType: TriggerType, message: any = null, key: string) {
    if (message) {
        const createCommand = '@echo ' + message + '> "%temp%\\pss.txt"';
        const openCommand = 'start notepad.exe "%temp%\\pss.txt"';
        execCommand(createCommand, triggerType, '[Create]', (status: boolean) => {
            if (status) {
                execCommand(openCommand, triggerType, '[Open]', (status: boolean) => {
                    if (status)
                        onTriggerComplete(key, TriggerStatus.SUCCESS);
                    else
                        onTriggerComplete(key, TriggerStatus.FAILED);
                });
            }
        });
    } else {
        const file = 'batchfiles\\' + TriggerType[triggerType].toLowerCase() + '.bat';
        execCommand(file, triggerType, null, (status: boolean) => {
            if (status)
                onTriggerComplete(key, TriggerStatus.SUCCESS);
            else
                onTriggerComplete(key, TriggerStatus.FAILED);
        });
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

function initializeListeners() {
    pingRef = firebase.database().ref(DEVICES_NODE)
        .child(state.uuid)
        .child('PING');

    pingRef.on('value', (data: any) => {
        if (data.val() === 0) {
            firebase.database().ref(DEVICES_NODE).child(state.uuid).child('PING').set(1);
        }
    })

    triggerRef = firebase.database().ref(DEVICES_NODE)
        .child(state.uuid)
        .child('Triggers')
        .orderByChild('TriggerStatus')
        .equalTo(TriggerStatus.PENDING);

    triggerRef.on('child_added', (data: any) => {
        hashMap.set(data.key, data.val());
        triggerAction(data.key);
    });
}

function triggerAction(key: string) {
    const trigger: Trigger = hashMap.get(key);
    switch (trigger.TriggerType) {
        case TriggerType.SHUTDOWN:
        case TriggerType.RESTART:
        case TriggerType.LOCK:
        case TriggerType.SIGNOUT:
            runCommand(trigger.TriggerType, trigger.Message, key);
            break;
        case TriggerType.SCREENSHOT:
            takeScreenshot(key);
            break;
        case TriggerType.TAKEPICTURE:
            takePicture(key);
            break;
        default:
            logEvent('Trigger Not Found', JSON.stringify(trigger));
    }
}

function onTriggerComplete(key: string, status: TriggerStatus) {
    const trigger: Trigger = hashMap.get(key);
    trigger.TriggerStatus = status;
    firebase.database().ref(DEVICES_NODE)
        .child(state.uuid)
        .child('Triggers')
        .child(key)
        .update(trigger)
        .then(() => {
            hashMap.delete(key);
        }).catch((err: any) => {
            logEvent('OnTrigger Complete Error', JSON.stringify(err));
        });
}

function pauseSystem() {
    setIntervals.forEach(interval => {
        clearInterval(interval);
    });
    triggerRef.off('child_added');
    hashMap.clear();
}

function shutDownSystem() {
    changeDeviceState(DeviceStatus.OFF)
        .then(() => {
            setIntervals.forEach(interval => {
                clearInterval(interval);
            });
            // let htmlTable = '<h3>Computer Up Time: ' + state.upTime + '</h3><table border="1"><thead><tr><th>#</td><th>Title</td><th>Url</td><th>Date/Time</td><th>Browser</td></tr></thead><tbody>';
            // browserHistoryList.forEach((history, index) => {
            //     htmlTable += '<tr>';
            //     htmlTable += '<td>' + (index + 1) + '</td>';
            //     htmlTable += '<td>' + history.title + '</td>';
            //     htmlTable += '<td>' + history.url + '</td>';
            //     htmlTable += '<td>' + extractDateTime(history.utc_time) + '</td>';
            //     htmlTable += '<td>' + history.browser + '</td>';
            //     htmlTable += '</tr>';
            // });
            // htmlTable += '</tbody></table>';
            // sendUserEmail(['anjariamohnish@gmail.com'], 'Shutdown', null, htmlTable).then().catch().then(() => {
            //     triggerRef.off('child_added');
            //     pingRef.off('value');
            //     connectedRef.off('value');
            //     hashMap.forEach((value: Trigger, key: string) => {
            //         onTriggerComplete(key, TriggerStatus.STOPPED);
            //     })
            //     hashMap.clear();
            //     unwatch(state, 'isInternetActive');
            //     process.exit();
            // });

            triggerRef.off('child_added');
            pingRef.off('value');
            connectedRef.off('value');
            hashMap.forEach((value: Trigger, key: string) => {
                onTriggerComplete(key, TriggerStatus.STOPPED);
            })
            hashMap.clear();
            unwatch(state, 'isInternetActive');
            process.exit();

        })

}