import { DeviceType } from "src/commons/enums/device-type.enum";

export class DeviceEntity {
    id: number;
    name: string;
    topic: string;
    remark: string;
    type: DeviceType
}