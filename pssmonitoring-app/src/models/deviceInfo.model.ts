import { Systeminformation } from 'systeminformation';

export class DeviceInfo {
    SystemInfo!: Systeminformation.SystemData;
    EthernetInfo!: Systeminformation.NetInterfacesData[];
    BatteryInfo!: Systeminformation.BatteryData;
    UserInfo!: Systeminformation.UserData[];
    OsInfo!: Systeminformation.OsData;
    CpuInfo!: Systeminformation.CpuData;
    GraphicsInfo!: Systeminformation.GraphicsData;
}