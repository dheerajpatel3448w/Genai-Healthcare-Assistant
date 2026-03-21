import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`;

export const textExtractionQueue = new Queue("text-extraction", {
  connection: {
    url: redisUrl,
  },
} as any);

import { QueueEvents } from "bullmq";

const queueEvents = new QueueEvents("text-extraction", {
  connection: {
    url: redisUrl,
  },
} as any);

// Job events for monitoring
queueEvents.on("active", ({ jobId }) => {
  console.log(`Job ${jobId} started...`);
});

queueEvents.on("completed", ({ jobId }) => {
  console.log(`Job ${jobId} completed successfully`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`Job ${jobId} failed with error:`, failedReason);
});

export default textExtractionQueue;
