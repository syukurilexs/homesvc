import { UpdateSwitchDto } from './dto/update-switch.dto';
import { DeviceType } from 'src/utils/enums/device-type.enum';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { UpdateStateDto } from './dto/state.dto';
import { CreateSwitchDto } from './dto/create-switch.dto';

@ApiTags('Device')
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Post('switch')
  createSwitch(@Body() createSwitchDto: CreateSwitchDto) {
    return this.deviceService.createSwitch(createSwitchDto);
  }

  @ApiQuery({
    name: 'type',
    enum: DeviceType,
    required: false,
  })
  @Get()
  findAll(@Query('type') type: string) {
    let deviceType: DeviceType;

    switch (type) {
      case 'Light':
        deviceType = DeviceType.Light;
        break;
      case 'Fan':
        deviceType = DeviceType.Fan;
        break;
      case 'Switch':
        deviceType = DeviceType.Switch;
        break;
      default:
        deviceType = undefined;
        break;
    }

    return this.deviceService.findAll(deviceType);
  }

  @Get('action')
  findAllAction() {
    return this.deviceService.findAllAction();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(+id, updateDeviceDto);
  }

  @Patch('switch/:id')
  updateSwitch(@Param('id') id: string, @Body() updateSwitchDto: UpdateSwitchDto) {
    return this.deviceService.updateSwitch(+id, updateSwitchDto);
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
