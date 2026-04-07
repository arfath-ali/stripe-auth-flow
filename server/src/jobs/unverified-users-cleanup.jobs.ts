import cron from 'node-cron';
import { pool } from '../database/pool.db.js';

export async function triggerUnverifiedUsersCleanup() {
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await pool.query(
        `DELETE FROM users WHERE is_verified=false AND created_at < NOW() - INTERVAL '24 hours'`,
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
