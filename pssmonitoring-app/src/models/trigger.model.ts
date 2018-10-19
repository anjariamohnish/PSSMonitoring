import { TriggerType } from "../enums/triggerType.enum";

export class Trigger {
    triggerType!: TriggerType;
    datetime!: string;
    isCompleted!: boolean;

    constructor() {
        this.triggerType = 1;
        this.datetime = '23';
        this.isCompleted = false;
    }
}