import { Test, TestingModule } from '@nestjs/testing';
import { ContactSensorService } from './contact-sensor.service';

describe('ContactSensorService', () => {
  let service: ContactSensorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactSensorService],
    }).compile();

    service = module.get<ContactSensorService>(ContactSensorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
