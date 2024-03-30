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
import { DeviceToggle as DeviceState } from 'src/utils/types/device-toggle.type';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';
import { SceneActionOrm } from 'src/typeorm/scene-action.entity';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';

@Injectable()
export class SwitchService {
  constructor(
    @InjectRepository(DeviceOrm) private deviceRepo: Repository<DeviceOrm>,
    @InjectRepository(SelectedActionOrm) private selectedActionRepo: Repository<SelectedActionOrm>,
    @InjectRepository(SceneActionOrm) private sceneActionRepo: Repository<SceneActionOrm>,
    @InjectRepository(ActivityLogOrm) private activityLogRepo: Repository<ActivityLogOrm>,
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
   * Trigger all device attached to the switch
   * Trigger all device in the scene list
   * @date 3/28/2024 - 8:18:49 AM
   */
  onSwitch() {
    this.mqttService.onSwitch().subscribe((data) => {
      const topic = data.topic;
      const payload = JSON.parse(data.payload.toString());

      this.activityLogRepo.save({
        level: 'log',
        message: `Receive mqtt topic "${data.topic}" with payload "${data.payload.toString()}"`
      }).then(x => { })

      // Get all devices attached to the switch from selectedaction table
      // Find switch base on topic from mqtt by joining table selectedaction & action & device (switch)
      // Eg: zigbee2mqtt/SUIS01
      this.selectedActionRepo
        .find({
          where: {
            action: {
              device: {
                topic,
              },
              key: 'action',
              value: payload.action
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
        .then((selectedActions) => {
          selectedActions.forEach(selectedAction => {
            // Toggle the state
            const state: DeviceState = {
              deviceId: selectedAction.device.id,
              state:
                selectedAction.device.state === State.Off
                  ? State.On
                  : State.Off,
            };

            // Emit toggled state to the device
            this.event.emit(EVENT_DEVICE_UPDATE_STATE, state);
          })
        });

      // Find scene from sceneaction, then get all device from found scene
      // then trigger device base on state of device in the found scene
      this.sceneActionRepo.find({
        where: {
          action: {
            device: {
              topic
            },
            key: 'action',
            value: payload.action
          }
        },
        relations: {
          action: {
            device: {
              action: true,
            },
          },
          scene: {
            sceneDevice: true
          }
        },
      }).then(sceneActions => {
        // Listing all device within found scene
        // Trigger device base on state of device in the scene
        sceneActions.forEach(sceneAction => {
          sceneAction.scene.sceneDevice.forEach(device => {
            const state: DeviceState = {
              deviceId: device.deviceId,
              state: device.state
            };

            // Emit toggled state to the device
            this.event.emit(EVENT_DEVICE_UPDATE_STATE, state);
          })
        })
      })
    });
  }

  @OnEvent(EVENT_SWITCH_RELOAD)
  reload() {
    this.onLoad();
  }
}
