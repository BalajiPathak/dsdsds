import app from './app';
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();

const PORT = process.env.PORT || 5000;
exec('npx prisma db push', (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Failed to sync Prisma schema with DB:', err);
  } else {
    console.log('✅ Prisma schema synced with DB');
    console.log(stdout);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
});
