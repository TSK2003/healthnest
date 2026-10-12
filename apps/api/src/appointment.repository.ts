import { Injectable, ConflictException } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from './database.service';
import { AppointmentDto } from './appointment.dto';
@Injectable()
export class AppointmentRepository {
  constructor(private readonly db: DatabaseService) {}
  async save(dto: AppointmentDto, fingerprint: string): Promise<string> {
    const reference = `HN-${randomUUID()}`;
    try {
      await this.db.pool.execute(
        `INSERT INTO appointments
   (request_id,reference,payload_hash,patient_name,phone,email,service,visit_date,visit_time,language,consent_version,created_at,next_attempt_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP())`,
        [
          dto.requestId,
          reference,
          fingerprint,
          dto.name,
          dto.phone,
          dto.email || null,
          dto.service,
          dto.date,
          dto.time,
          dto.language,
          '2026-10-12',
        ],
      );
      return reference;
    } catch (error) {
      if ((error as { code?: string }).code !== 'ER_DUP_ENTRY') throw error;
      const [rows] = await this.db.pool.execute<RowDataPacket[]>(
        'SELECT reference,payload_hash FROM appointments WHERE request_id=?',
        [dto.requestId],
      );
      if (!rows[0] || rows[0].payload_hash !== fingerprint)
        throw new ConflictException('Use a new request ID for changed details');
      return String(rows[0].reference);
    }
  }
}
