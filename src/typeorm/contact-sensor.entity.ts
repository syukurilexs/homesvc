import { AbstractEntity } from "src/commons/entities/abscract.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DeviceOrm } from "./device.entity";

@Entity()
export class ContactSensorOrm extends AbstractEntity {
    @Column({ default: 100 })
    battery: number;

    @Column({ default: false })
    battery_low: boolean;

    @Column({ default: false })
    contact: boolean;

    @Column({ default: 'contact' })
    key: string;

    @JoinColumn()
    @OneToOne(() => DeviceOrm, (device) => device.contactSensor, {
        cascade: true, onDelete: 'CASCADE'
    })
    device: DeviceOrm;
}