import 'dotenv/config';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'domain-scans',
  async (job) => {
    console.log(`Processing scan job ${job.id} for domain:`, job.data);
    await job.updateProgress(10);

    // TODO Fase 3: panggil subfinder di sini via execFile (lihat blueprint §3.3)

    await job.updateProgress(100);
    return { status: 'completed', findings: [] };
  },
  { connection, concurrency: 3 }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log('Virgil worker started, listening for scan jobs...');