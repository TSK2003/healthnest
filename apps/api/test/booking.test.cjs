require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const request = require('supertest');
const { AppointmentDto } = require('../dist/appointment.dto');
const { validateVisit } = require('../dist/appointment.rules');
const { AppointmentService } = require('../dist/appointment.service');
const { AppointmentRepository } = require('../dist/appointment.repository');
const { MailWorker, clinicEmail } = require('../dist/mail.worker');
const { ApiController } = require('../dist/app.module');
const { configureHttp } = require('../dist/http');
const { config } = require('../dist/config');
const valid = () => ({
  name: 'Test Visitor',
  phone: '9994333853',
  email: 'test@example.com',
  service: 'siddha',
  date: '2026-10-13',
  time: '10:30',
  consent: true,
  website: '',
  language: 'en',
  requestId: randomUUID(),
});
const now = new Date('2026-10-12T06:00:00Z');
test('weekday and Sunday clinic boundaries', () => {
  assert.doesNotThrow(() => validateVisit('2026-10-13', '09:00', now));
  assert.doesNotThrow(() => validateVisit('2026-10-13', '20:30', now));
  assert.throws(() => validateVisit('2026-10-13', '21:00', now));
  assert.throws(() => validateVisit('2026-10-18', '09:30', now));
  assert.doesNotThrow(() => validateVisit('2026-10-18', '10:00', now));
  assert.doesNotThrow(() => validateVisit('2026-10-18', '19:30', now));
  assert.throws(() => validateVisit('2026-10-18', '20:00', now));
});
test('reject invalid dates, past times and dates beyond 90 days', () => {
  assert.throws(() => validateVisit('2026-02-30', '10:00', now));
  assert.throws(() => validateVisit('2026-10-12', '11:00', now));
  assert.throws(() => validateVisit('2027-02-01', '10:00', now));
  assert.throws(() => validateVisit('2026-10-13', '10:17', now));
});
test('DTO accepts Tamil names and optional email', async () => {
  const dto = plainToInstance(AppointmentDto, { ...valid(), name: 'கார்த்திக்', email: undefined });
  assert.equal((await validate(dto)).length, 0);
});
test('DTO rejects malformed phone, missing consent, honeypot and injected names', async () => {
  for (const change of [
    { phone: '123' },
    { consent: false },
    { website: 'spam' },
    { name: '<script>' },
    { name: 'Name\nBcc: x' },
    { requestId: 'bad' },
    { service: 'unknown' },
    { email: 'bad' },
  ])
    assert.ok(
      (await validate(plainToInstance(AppointmentDto, { ...valid(), ...change }))).length > 0,
    );
});
test('repository idempotency avoids duplicate record and detects changed payload', async () => {
  const rows = new Map();
  const db = {
    pool: {
      execute: async (sql, params) => {
        if (sql.startsWith('INSERT')) {
          if (rows.has(params[0])) throw Object.assign(new Error(), { code: 'ER_DUP_ENTRY' });
          rows.set(params[0], { reference: params[1], payload_hash: params[2] });
          return [{ affectedRows: 1 }];
        }
        return [[rows.get(params[0])].filter(Boolean)];
      },
    },
  };
  const repository = new AppointmentRepository(db);
  const dto = valid();
  const first = await repository.save(dto, 'same');
  assert.equal(await repository.save(dto, 'same'), first);
  assert.equal(rows.size, 1);
  await assert.rejects(repository.save(dto, 'changed'), { status: 409 });
});
test('clinic email includes reference and request wording, not a booking confirmation', () => {
  const body = clinicEmail({
    reference: 'HN-test',
    patient_name: 'Test',
    phone: '9994333853',
    visit_date: '2026-10-13',
    visit_time: '10:30:00',
    service: 'siddha',
    language: 'ta',
  });
  assert.match(body, /not a confirmed appointment/);
  assert.match(body, /10:30 \(Asia\/Kolkata\)/);
});
test('failed SMTP leaves a durable retry; a successful retry marks sent', async () => {
  const calls = [];
  const row = { id: 1, reference: 'HN-test', attempts: 0 };
  const db = {
    pool: {
      query: async () => [[row]],
      execute: async (sql, params) => {
        calls.push({ sql, params });
        return [{ affectedRows: 1 }];
      },
    },
  };
  const worker = new MailWorker(db);
  worker.transport = {
    sendMail: async () => {
      throw new Error('SMTP down');
    },
    close() {},
  };
  await worker.deliver();
  assert.ok(calls.some((c) => c.sql.includes('attempts=attempts+1')));
  assert.ok(!calls.some((c) => c.sql.includes("notification_state='sent'")));
  calls.length = 0;
  worker.transport.sendMail = async () => ({});
  await worker.deliver();
  assert.ok(calls.some((c) => c.sql.includes("notification_state='sent'")));
  await worker.onModuleDestroy();
});
test('a record claimed by another worker is not mailed', async () => {
  let mails = 0;
  const worker = new MailWorker({
    pool: { query: async () => [[{ id: 1 }]], execute: async () => [{ affectedRows: 0 }] },
  });
  worker.transport = {
    sendMail: async () => {
      mails++;
    },
    close() {},
  };
  await worker.deliver();
  assert.equal(mails, 0);
  await worker.onModuleDestroy();
});
test('HTTP request validation, origin policy, disabled booking, storage failure and throttling', async () => {
  const original = config.bookingEnabled;
  config.bookingEnabled = true;
  const saved = [];
  let fail = false;
  class TestModule {}
  Module({
    controllers: [ApiController],
    providers: [
      AppointmentService,
      {
        provide: AppointmentRepository,
        useValue: {
          save: async (dto) => {
            if (fail) throw new Error('database unavailable');
            saved.push(dto);
            return 'HN-test';
          },
        },
      },
    ],
  })(TestModule);
  const app = await NestFactory.create(TestModule, { logger: false, bodyParser: false });
  configureHttp(app);
  await app.init();
  try {
    const future = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
    const payload = { ...valid(), date: future, time: '12:00' };
    const http = request(app.getHttpServer());
    await http
      .post('/api/appointments')
      .set('Origin', 'https://other.example')
      .send(payload)
      .expect(403);
    await http
      .post('/api/appointments')
      .send({ ...payload, consent: false })
      .expect(400);
    const good = await http.post('/api/appointments').send(payload).expect(201);
    assert.equal(good.body.status, 'requested');
    assert.equal(saved.length, 1);
    assert.ok(!good.body.phone);
    config.bookingEnabled = false;
    await http.post('/api/appointments').send(payload).expect(503);
    config.bookingEnabled = true;
    fail = true;
    await http.post('/api/appointments').send(payload).expect(503);
    fail = false;
    await http
      .post('/api/appointments')
      .send({ ...payload, extra: 'not allowed' })
      .expect(400);
    await http.post('/api/appointments').send(payload).expect(429);
    await http.get('/api/health').expect(200);
  } finally {
    config.bookingEnabled = original;
    await app.close();
  }
});
