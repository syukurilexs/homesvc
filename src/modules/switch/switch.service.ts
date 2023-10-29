import { MqttService } from '../mqtt/mqtt.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { DeviceType } from 'src/utils/enums/device-type.enum';
import { Repository } from 'typeorm';
import { State } from 'src/utils/enums/state.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  EVENT_DEVICE_UPDATE_STATE,
  EVENT_SWITCH_RELOAD,
} from 'src/utils/constants';
import { DeviceToggle } from 'src/utils/types/device-toggle.type';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';

@Injectable()
export class SwitchService {
  constructor(
    @InjectRepository(DeviceOrm) private deviceRepo: Repository<DeviceOrm>,
    @InjectRepository(SelectedActionOrm)
    private selectedActionRepo: Repository<SelectedActionOrm>,
    private readonly mqttService: MqttService,
    private readonly event: EventEmitter2
  ) {
    this.onLoad();
    this.onSwitch();
  }

  async onLoad() {
    const devices = await this.deviceRepo.find({
      where: { type: DeviceType.Switch },
    });

    devices.forEach((device) => {
      this.mqttService.subscribe(device.topic);
    });
  }

  /**
   * Subscribe to mqtt message with SUIS in the topic
   */
  onSwitch() {
    this.mqttService.onSwitch().subscribe((data) => {
      const topic = data.topic;
      const payload = JSON.parse(data.payload.toString());

      this.selectedActionRepo
        .find({
          where: {
            action: {
              device: {
                topic,
              },
            },
          },
          relations: {
            action: {
              device: {
                action: true,
              },
            },
            device: true,
          },
        })
        .then((selectedAction) => {
          if (selectedAction.length > 0) {
            const suis = selectedAction[0].action.device;

            suis.action.forEach((action) => {
              if (payload[action.key] === action.value) {
                selectedAction.forEach((selectedAction) => {
                  if (
                    selectedAction.action.id === action.id
                  ) {
                    const state: DeviceToggle = {
                      deviceId: selectedAction.device.id,
                      state:
                        selectedAction.device.state === State.Off
                          ? State.On
                          : State.Off,
                    };

                    this.event.emit(EVENT_DEVICE_UPDATE_STATE, state);
                  }
                });
              }
            });
          }
        });
    });
  }

  @OnEvent(EVENT_SWITCH_RELOAD)
  reload() {
    this.onLoad();
  }
}
