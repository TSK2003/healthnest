import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
export function configureHttp(app: NestExpressApplication) {
  // Specify exact proxy addresses/subnets only after verifying the provider's topology.
  if (process.env.TRUSTED_PROXIES)
    app.set(
      'trust proxy',
      process.env.TRUSTED_PROXIES.split(',').map((s) => s.trim()),
    );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    }),
  );
  app.use(express.json({ limit: '8kb' }));
  app.use('/api', (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(
    '/api/appointments',
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.method === 'POST' && req.headers.origin && req.headers.origin !== config.origin) {
        res.status(403).json({ message: 'Origin not allowed' });
        return;
      }
      next();
    },
  );
  app.use(
    '/api/appointments',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { message: 'Too many requests' },
      skip: (req) => req.method !== 'POST',
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false, value: false },
    }),
  );
}
