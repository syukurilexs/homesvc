import { DeviceEntity } from "./device.entity";

export class ContactEntity extends DeviceEntity {
    key: string;

    constructor(partial: Partial<ContactEntity>) {
        super();
        Object.assign(this,partial);
    }
}