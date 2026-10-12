import { Module, Controller, Get, Post, Body } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './appointment.dto';
import { AppointmentRepository } from './appointment.repository';
import { DatabaseService } from './database.service';
import { MailWorker } from './mail.worker';
@Controller('api')
export class ApiController {
  constructor(private readonly appointments: AppointmentService) {}
  @Get('health') health() {
    return { status: 'ok' };
  }
  @Post('appointments') create(@Body() dto: AppointmentDto) {
    return this.appointments.create(dto);
  }
}
@Module({
  controllers: [ApiController],
  providers: [AppointmentService, AppointmentRepository, DatabaseService, MailWorker],
})
export class AppModule {}
