import { DeviceType } from "src/commons/enums/device-type.enum";

export class CreateContactDto {
    name: string = 'CONTACT01';
    type: DeviceType = DeviceType.Contact;
    topic: string = 'zigbee2mqtt/CONTACT01';
    key: string = 'occupancy';
    remark: string = 'This is remark';
}