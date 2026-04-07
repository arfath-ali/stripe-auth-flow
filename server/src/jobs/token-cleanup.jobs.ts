import cron from 'node-cron';
import { pool } from '../database/pool.db.js';

export async function triggerTokenCleanup() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const result = await pool.query(
        `DELETE FROM reset_tokens WHERE expires_at < NOW()`,
      );

      const deletedCount = result?.rowCount ?? 0;

      if (deletedCount) {
        console.log(`[JOB] Purged ${result.rows.length} unverified accounts.`);
      }
    } catch (err) {
      console.error('[CRON] Error cleaning tokens:', err);
    }
  });
}
