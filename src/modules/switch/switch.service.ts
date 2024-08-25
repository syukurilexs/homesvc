import { MqttService } from '../mqtt/mqtt.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { DeviceType } from 'src/commons/enums/device-type.enum';
import { Repository } from 'typeorm';
import { State } from 'src/commons/enums/state.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  EVENT_DEVICE_UPDATE_STATE,
  EVENT_SWITCH_RELOAD,
} from 'src/utils/constants';
import { SceneActionOrm } from 'src/typeorm/scene-action.entity';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';
import { ActionOrm } from 'src/typeorm/action.entity';
import { DeviceToggle } from 'src/commons/types/device-toggle.type';
// import { SceneOrm } from 'src/typeorm/scene.entity';

@Injectable()
export class SwitchService {
  constructor(
    @InjectRepository(DeviceOrm) private deviceRepo: Repository<DeviceOrm>,
    // @InjectRepository(SelectedActionOrm) private selectedActionRepo: Repository<SelectedActionOrm>,
    @InjectRepository(SceneActionOrm)
    // private // private sceneActionRepo: Repository<SceneActionOrm>,
    @InjectRepository(ActivityLogOrm)
    private activityLogRepo: Repository<ActivityLogOrm>,
    @InjectRepository(ActionOrm)
    private actionRepo: Repository<ActionOrm>,
    // @InjectRepository(SceneOrm)
    // private sceneRepo: Repository<SceneOrm>,
    private readonly mqttService: MqttService,
    private readonly event: EventEmitter2,
  ) {
    this.onLoad();
    this.onSwitch();
  }

  async onLoad() {
    const devices = await this.deviceRepo.find({
      where: { type: DeviceType.Switch },
      relations: { suis: true },
    });

    devices.forEach((device) => {
      this.mqttService.subscribe(device.suis.topic);
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

      this.activityLogRepo
        .save({
          level: 'log',
          message: `Receive mqtt topic "${data.topic}" with payload "${data.payload.toString()}"`,
        })
        .then((x) => {});

      if (
        topic !== undefined &&
        topic !== '' &&
        payload.action !== undefined &&
        payload.action !== ''
      ) {
        this.actionRepo
          .find({
            where: {
              suis: {
                topic,
              },
              key: 'action',
              value: payload.action,
            },
            relations: {
              lights: { device: true },
              fans: { device: true },
            },
          })
          .then((actions) => {
            actions.forEach((action) => {
              if (action.fans.length > 0) {
                action.fans.forEach((fan) => {
                  const state: DeviceToggle = {
                    deviceId: fan.device.id,
                    state: fan.state === State.Off ? State.On : State.Off,
                  };

                  // Emit toggled state to the device
                  this.event.emit(EVENT_DEVICE_UPDATE_STATE, state);
                });
              } else if (action.lights.length > 0) {
                action.lights.forEach((light) => {
                  const state: DeviceToggle = {
                    deviceId: light.device.id,
                    state: light.state === State.Off ? State.On : State.Off,
                  };

                  // Emit toggled state to the device
                  this.event.emit(EVENT_DEVICE_UPDATE_STATE, state);
                });
              }
            });
          });
      }
    });

    /*
    this.mqttService.onSwitch().subscribe((data) => {
      const topic = data.topic;
      const payload = JSON.parse(data.payload.toString());

      this.activityLogRepo
        .save({
          level: 'log',
          message: `Receive mqtt topic "${data.topic}" with payload "${data.payload.toString()}"`,
        })
        .then((x) => {});

      if (
        topic !== undefined &&
        topic !== '' &&
        payload.action !== undefined &&
        payload.action !== ''
      ) {
        // Find scene from sceneaction, then get all device from found scene
        // then trigger device base on state of device in the found scene
        this.sceneRepo
          .find({
            where: {
              action: {
                device: {
                  topic,
                },
                key: 'action',
                value: payload.action,
              },
            },
            relations: {
              action: {
                device: {
                  action: true,
                },
              },
              scene: {
                sceneDevice: true,
              },
            },
          })
          .then((sceneActions) => {
            // Listing all device within found scene
            // Trigger device base on state of device in the scene
            sceneActions.forEach((sceneAction) => {
              sceneAction.scene.sceneDevice.forEach((device) => {
                const state: DeviceState = {
                  deviceId: device.deviceId,
                  state: device.state,
                };

                // Emit toggled state to the device
                this.event.emit(EVENT_DEVICE_UPDATE_STATE, state);
              });
            });
          });
      }
    }); */
  }

  @OnEvent(EVENT_SWITCH_RELOAD)
  reload() {
    this.onLoad();
  }
}
