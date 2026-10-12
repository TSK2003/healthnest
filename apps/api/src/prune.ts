import { createConnection, ResultSetHeader } from 'mysql2/promise';
import { config, validateConfig } from './config';
async function run() {
  validateConfig();
  const db = await createConnection(config.db);
  try {
    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM appointments WHERE created_at < DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? DAY) AND notification_state='sent'`,
      [config.retentionDays],
    );
    console.log(`Removed ${result.affectedRows} old delivered requests.`);
  } finally {
    await db.end();
  }
}
run().catch(() => {
  console.error('Retention cleanup failed.');
  process.exitCode = 1;
});
