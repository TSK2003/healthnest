import { createConnection } from 'mysql2/promise';
import { config } from './config';
import { schema } from './schema';
async function run() {
  const db = await createConnection(config.db);
  try {
    await db.query(schema);
    console.log('Appointment schema ready.');
  } finally {
    await db.end();
  }
}
run().catch(() => {
  console.error('Migration failed. Verify MySQL credentials and CREATE privilege.');
  process.exitCode = 1;
});
