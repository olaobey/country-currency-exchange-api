import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('status')
@Controller()
export class StatusController {
  constructor(private readonly service: StatusService) {}
  @Get('status')
  async get() {
    return this.service.getStatus();
  }
}
