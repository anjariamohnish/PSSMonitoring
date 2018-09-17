import firebase from 'firebase';
import sysInfo, { Systeminformation } from 'systeminformation';
import Promise from 'promise';
import BrowserHistory from 'node-browser-history';
import { DEVICES_NODE } from './constants/constant';
import { initializeFirebase, checkIfExist } from './helper/firebase.helper';
import { logEvent, getCurrentDateTime } from './helper/app.helper';
import { Device, DeviceInfo, LiveStatus } from './models';
import { DeviceStatus } from './enums/devicestatus.enum';
import { BrowserHistoryInfo } from './models/browserhistory.model';


function startUp() {

    initializeFirebase();
    sysInfo.system().then(sysinfo => {
        let uuidarray = sysinfo.uuid.split('-');
        let email = uuidarray[0].toLowerCase() + '@pss.com';
        let password = uuidarray[uuidarray.length - 1].toLowerCase();
        loginMachine({ email: email, password: password })
            .then(() => {
                // start liveupdates
                liveMachineStats();
                console.log('already regis starting live');
            })
            .catch((err) => {
                const NO_USER_FOUND = 'auth/user-not-found';
                if (err.code === NO_USER_FOUND) {
                    registerMachine()
                        .then(() => {
                            // registration success start liveupdates
                            liveMachineStats();
                            logEvent('Registration Success', 'Successfully Registered @' + getCurrentDateTime());
                            console.log('liveupdt');
                        }).catch((err) => {
                            logEvent('Promise Error', err);
                        });
                } else {
                    logEvent('Promise Error', err);
                }
            })
    });

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

// startUp();


function hist() {
    initializeFirebase();
    let browserHistoryList = new Array<BrowserHistoryInfo>();
    setInterval(() => {
        BrowserHistory.getAllHistory().then((historyList: any) => {

            historyList.forEach((entry: any) => {

                console.log(browserHistoryList.indexOf(entry));
                console.log(entry);
                console.log(browserHistoryList);
                if (browserHistoryList.indexOf(entry) === -1) {
                    //  console.log(browserHistoryList.indexOf(entry))
                    browserHistoryList.push(entry);
                    console.log('pushed')
                } else {
                    console.log('exist');
                }
            });
        })
    }, 5000)


}


function checkIfExist(arr: Array<BrowserHistoryInfo>, entry: BrowserHistoryInfo): boolean {
    arr.filter(data => data.title === entry.title && data.url === entry.url && data.utc_time === entry.utc_time).;
}
hist();