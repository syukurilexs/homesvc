import { UpdateSwitchDto } from './dto/update-switch.dto';
import { DeviceType } from 'src/commons/enums/device-type.enum';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { UpdateStateDto } from './dto/state.dto';
import { CreateSwitchDto } from './dto/create-switch.dto';
import { CreateContactDto as CreateContactSensorDto } from './dto/create-contact-sensor.dto';
import { CreateActuatorDto } from './dto/create-actuator.dto';
import { UpdateActuatorDto } from './dto/update-actuator.dto';
import { CreateFanDto } from './dto/create-fan.dto';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateFanDto } from './dto/update-fan.dto';
import { UpdateLightDto } from './dto/update-light.dto';

@ApiTags('Device')
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('light')
  create(@Body() createDeviceDto: CreateLightDto) {
    return this.deviceService.createLight(createDeviceDto);
  }

  @Post('fan')
  createFan(@Body() createFanDto: CreateFanDto) {
    return this.deviceService.createFan(createFanDto);
  }

  @Post('switch')
  createSwitch(@Body() createSwitchDto: CreateSwitchDto) {
    return this.deviceService.createSwitch(createSwitchDto);
  }

  @Post('contactsensor')
  createContactSensor(@Body() createContactSensorDto: CreateContactSensorDto) {
    return this.deviceService.createContactSensor(createContactSensorDto);
  }

  @Post('actuator')
  createRpi(@Body() createActuatorDto: CreateActuatorDto) {
    return this.deviceService.createActuator(createActuatorDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiQuery({
    name: 'type',
    enum: DeviceType,
    required: false,
  })
  @Get()
  findAll(@Query('type') type: string) {
    let deviceType: DeviceType;

    return this.deviceService.findAll(type as DeviceType);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('action')
  findAllAction() {
    return this.deviceService.findAllAction();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(+id);
  }

  @Patch('fan/:id')
  updateFan(@Param('id') id: string, @Body() updateFanDto: UpdateFanDto) {
    return this.deviceService.updateFan(+id, updateFanDto);
  }

  @Patch('light/:id')
  updateLight(@Param('id') id: string, @Body() updateLightDto: UpdateLightDto) {
    return this.deviceService.updateLight(+id, updateLightDto);
  }

  @Patch('switch/:id')
  updateSwitch(
    @Param('id') id: string,
    @Body() updateSwitchDto: UpdateSwitchDto,
  ) {
    return this.deviceService.updateSwitch(+id, updateSwitchDto);
  }

  @Patch('actuator/:id')
  updateActuator(@Param('id') id: string, @Body() updateActuatorDto: UpdateActuatorDto) {
    return this.deviceService.updateActuator(+id, updateActuatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceService.remove(+id);
  }

  @Patch(':id/state')
  updateState(@Param('id') id: string, @Body() updateSatteDto: UpdateStateDto) {
    return this.deviceService.updateState(+id, updateSatteDto);
  }
}
