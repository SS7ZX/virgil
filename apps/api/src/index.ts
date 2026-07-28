import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organizations';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: String(err) });
  }
});

app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);

// WAJIB di baris paling akhir, setelah semua route
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Virgil API running on http://localhost:${PORT}`);
});