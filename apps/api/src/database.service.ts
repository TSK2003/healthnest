import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import { config } from './config';
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool = createPool(config.db);
  async onModuleDestroy() {
    await this.pool.end();
  }
}
