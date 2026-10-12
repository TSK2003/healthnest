import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT || 3000),
  origin: process.env.APP_ORIGIN || 'http://localhost:3000',
  bookingEnabled: process.env.BOOKING_ENABLED === 'true',
  indexable: process.env.SITE_INDEXABLE === 'true',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 20,
    connectTimeout: 10000,
    timezone: 'Z',
    dateStrings: true,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    requireTLS: process.env.SMTP_SECURE !== 'true',
  },
  mailFrom: process.env.MAIL_FROM || '',
  recipient: process.env.BOOKING_TO || 'tskarthi2002@gmail.com',
  retentionDays: Number(process.env.RETENTION_DAYS || 90),
};
export function validateConfig() {
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535)
    throw new Error('Invalid PORT');
  if (config.bookingEnabled) {
    const required = [
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'MAIL_FROM',
      'BOOKING_TO',
    ];
    for (const key of required) {
      if (!process.env[key]) throw new Error(`Missing required configuration: ${key}`);
    }
  }
  if (process.env.NODE_ENV === 'production' && !config.origin.startsWith('https://'))
    throw new Error('APP_ORIGIN must use HTTPS in production');
  if (!Number.isInteger(config.retentionDays) || config.retentionDays < 1)
    throw new Error('RETENTION_DAYS must be a positive integer');
}
