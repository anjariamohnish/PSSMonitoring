import { DeviceStatus } from "../enums/devicestatus.enum";
import { DeviceInfo } from "./deviceInfo.model";

export class Device {
    DeviceName!: string;
    DeviceInfo!: DeviceInfo;
    DeviceStatus!: DeviceStatus;
}