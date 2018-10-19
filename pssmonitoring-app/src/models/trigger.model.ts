import { TriggerType } from "../enums/triggerType.enum";
import { TriggerStatus } from "../enums/triggerStatus.enum";

export class Trigger {
    TriggerType!: TriggerType;
    Message!: string;
    Timestamp!: number;
    TriggerStatus!: TriggerStatus;
    User!: string;
}