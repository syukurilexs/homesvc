import { Injectable } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_CONTACT_RELOAD } from 'src/utils/constants';

@Injectable()
export class ContactSensorService {

    constructor(
        private mqttService: MqttService,
        @InjectRepository(DeviceOrm)
        private deviceRepository: Repository<DeviceOrm>
    ) {
        this.onContactSensor();
        this.onLoad();
    }

    onContactSensor() {
        /*
        this.mqttService.onContactSensor().subscribe(async ({topic, payload})=> {
            const data = JSON.parse(payload);

            // Retrieve contact sensor by topic and get the key to capture value
            const device = await this.deviceRepository.findOne({
                where: {
                    topic
                },
                relations: {
                    contactSensor: true
                }
            })
            
                // Check the key from payload if exist
                if (data[device.contactSensor.key] !== undefined) {
                    console.log(data[device.contactSensor.key]);
                    device.contactSensor.contact = data[device.contactSensor.key];

                    // Save value to generic column 
                    await this.deviceRepository.save(device)
                }
        });
        */
    }

    async onLoad() {
        /*
        const devices = await this.deviceRepository.find({
            where: {
                type: DeviceType.Contact
            }
        });

        devices.forEach((device) => {
            this.mqttService.subscribe(device.topic);
        })
            */
    }


  @OnEvent(EVENT_CONTACT_RELOAD)
  reload() {
    this.onLoad();
  }
}

