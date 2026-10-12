import { BadRequestException } from '@nestjs/common';
export function validateVisit(date: string, time: string, now = new Date()) {
  const day = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== date)
    throw new BadRequestException('Invalid date');
  const instant = new Date(`${date}T${time}:00+05:30`);
  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(3));
  const sunday = day.getUTCDay() === 0;
  if (
    !Number.isFinite(instant.getTime()) ||
    instant.getTime() <= now.getTime() ||
    instant.getTime() > now.getTime() + 91 * 86400000 ||
    hours < (sunday ? 10 : 9) ||
    hours >= (sunday ? 20 : 21) ||
    ![0, 30].includes(minutes)
  )
    throw new BadRequestException('Choose a future time during clinic hours');
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const max = new Date(`${today}T00:00:00Z`).getTime() + 90 * 86400000;
  if (day.getTime() > max) throw new BadRequestException('Choose a date within 90 days');
}
