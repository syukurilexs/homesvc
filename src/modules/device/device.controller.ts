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
  ApiBody,
  ApiExtraModels,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { UpdateStateDto } from './dto/state.dto';
import { CreateSwitchDto } from './dto/create-switch.dto';
import { CreateContactDto as CreateContactSensorDto } from './dto/create-contact-sensor.dto';
import { CreateRpiDto } from './dto/create-rpi.dto';
import { UpdateRpiDto } from './dto/update-rpi.dto';
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

  @Post('rpi')
  createRpi(@Body() createRpiDto: CreateRpiDto) {
    return this.deviceService.createRpi(createRpiDto);
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

  @Patch('rpi/:id')
  updateRpi(@Param('id') id: string, @Body() updateRpiDto: UpdateRpiDto) {
    return this.deviceService.updateRpi(+id, updateRpiDto);
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
