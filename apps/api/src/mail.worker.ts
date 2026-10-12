import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from './database.service';
import { config } from './config';
export function clinicEmail(row: Record<string, unknown>) {
  return [
    'NEW APPOINTMENT REQUEST — HEAL NEST',
    `Reference: ${row.reference}`,
    `Name: ${row.patient_name}`,
    `Phone: ${row.phone}`,
    `Email: ${row.email || 'Not provided'}`,
    `Care: ${row.service}`,
    `Preferred date: ${row.visit_date}`,
    `Preferred time: ${String(row.visit_time).slice(0, 5)} (Asia/Kolkata)`,
    `Language: ${row.language}`,
    '',
    'This is a request, not a confirmed appointment. Contact the patient to confirm availability.',
  ].join('\n');
}
@Injectable()
export class MailWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailWorker.name);
  private readonly transport = createTransport(config.smtp);
  private timer?: NodeJS.Timeout;
  private active?: Promise<void>;
  constructor(private readonly db: DatabaseService) {}
  onModuleInit() {
    if (config.bookingEnabled) {
      this.tick();
      this.timer = setInterval(() => this.tick(), 15000);
    }
  }
  private tick() {
    if (this.active) return;
    this.active = this.deliver()
      .catch(() => this.logger.error('Email queue unavailable; will retry'))
      .finally(() => {
        this.active = undefined;
      });
  }
  async deliver() {
    const [rows] = await this.db.pool.query<RowDataPacket[]>(
      `SELECT * FROM appointments WHERE notification_state <> 'sent' AND next_attempt_at <= UTC_TIMESTAMP() AND (lease_until IS NULL OR lease_until < UTC_TIMESTAMP()) ORDER BY created_at LIMIT 10`,
    );
    for (const row of rows) {
      const token = randomUUID();
      const [claim] = await this.db.pool.execute<ResultSetHeader>(
        `UPDATE appointments SET lease_token=?,lease_until=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 2 MINUTE) WHERE id=? AND notification_state <> 'sent' AND (lease_until IS NULL OR lease_until < UTC_TIMESTAMP())`,
        [token, row.id],
      );
      if (!claim.affectedRows) continue;
      try {
        await this.transport.sendMail({
          from: config.mailFrom,
          to: config.recipient,
          subject: `Heal Nest appointment request · ${row.reference}`,
          text: clinicEmail(row),
          messageId: `<${row.reference}@${new URL(config.origin).hostname}>`,
        });
        await this.db.pool.execute(
          `UPDATE appointments SET notification_state='sent',sent_at=UTC_TIMESTAMP(),lease_until=NULL,lease_token=NULL WHERE id=? AND lease_token=?`,
          [row.id, token],
        );
      } catch {
        const delay = Math.min(3600, 30 * 2 ** Math.min(Number(row.attempts), 7));
        await this.db.pool.execute(
          `UPDATE appointments SET attempts=attempts+1,next_attempt_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? SECOND),lease_until=NULL,lease_token=NULL WHERE id=? AND lease_token=?`,
          [delay, row.id, token],
        );
        this.logger.warn(`Appointment email pending retry: ${row.reference}`);
      }
    }
  }
  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.active;
    this.transport.close();
  }
}
