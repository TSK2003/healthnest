import { Injectable, ServiceUnavailableException, Logger, ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { config } from './config';
import { AppointmentDto } from './appointment.dto';
import { validateVisit } from './appointment.rules';
import { AppointmentRepository } from './appointment.repository';
@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  constructor(private readonly repository: AppointmentRepository) {}
  async create(dto: AppointmentDto) {
    if (!config.bookingEnabled)
      throw new ServiceUnavailableException('Online booking is not configured');
    validateVisit(dto.date, dto.time);
    const normalized = { ...dto, phone: dto.phone.replace(/^\+91/, '') };
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify([
          normalized.name,
          normalized.phone,
          normalized.email || '',
          normalized.service,
          normalized.date,
          normalized.time,
          normalized.language,
        ]),
      )
      .digest('hex');
    try {
      const reference = await this.repository.save(normalized, fingerprint);
      return { reference, status: 'requested' };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Appointment storage failed');
      throw new ServiceUnavailableException('Unable to accept requests at this time');
    }
  }
}
