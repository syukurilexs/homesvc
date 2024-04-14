import { DeviceEntity } from "./device.entity";

export class LightEntity extends DeviceEntity {

    selectedAction: SelectedActionEntity[];

    constructor(partial: Partial<LightEntity>) {
        super();
        Object.assign(this,partial)
    }
}

export class SelectedActionEntity {
    id?: number;
    key: string;
    value: string;
    name: string;

    constructor(partial: Partial<SelectedActionEntity>) {
        Object.assign(this,partial);
    }
}