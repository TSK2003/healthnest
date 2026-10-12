import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import express from 'express';
import { AppModule } from './app.module';
import { config, validateConfig } from './config';
import { configureHttp } from './http';
async function bootstrap() {
  validateConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  configureHttp(app);
  if (!config.indexable)
    app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      next();
    });
  // /api routes fall through this middleware to Nest. The public site uses anchor navigation.
  const publicDir = join(__dirname, '../../web/dist');
  app.use(
    express.static(publicDir, {
      index: 'index.html',
      maxAge: '1h',
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        if (path.includes('/assets/'))
          res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
      },
    }),
  );
  app.enableShutdownHooks();
  await app.listen(config.port, '0.0.0.0');
}
bootstrap().catch(() => {
  console.error('Startup failed. Verify environment configuration and deployment logs.');
  process.exitCode = 1;
});
