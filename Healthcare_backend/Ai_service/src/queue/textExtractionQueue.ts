import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`;

export const textExtractionQueue = new Queue("text-extraction", {
  connection: {
    url: redisUrl,
  },
} as any);

// Job events for monitoring
textExtractionQueue.on("active", (job) => {
  console.log(`Job ${job.id} started...`);
});

textExtractionQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

textExtractionQueue.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error:`, err.message);
});

export default textExtractionQueue;
