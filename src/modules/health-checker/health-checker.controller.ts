import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthCheckerController {
  @MessagePattern('search-service-health')
  @HealthCheck()
  check() {
    return {
      status: 'up',
    };
  }
}
