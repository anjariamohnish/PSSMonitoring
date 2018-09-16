import { Systeminformation } from 'systeminformation';
import { Ram } from './ram.model';

export class LiveStatus {
    BatteryInfo!: Systeminformation.BatteryData;
    UpTime!: string;
    StartTime!: string;
    RamInfo!: Ram;
}