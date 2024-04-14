import { DeviceEntity } from "./device.entity";

export class SuisEntity extends DeviceEntity {
    action: SuisActionEntity[];

    constructor(partial: Partial<SuisEntity>) {
        super()
        Object.assign(this,partial);
    }
}

export class SuisActionEntity {
    id: number;
    key: string;
    value: string;
}