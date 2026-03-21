import {Redis} from "ioredis";
import { ChatHistory } from "../models/chathistory.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// Redis Client Setup
// Supports fallback to localhost (the docker-compose port) if env is not set
// ─────────────────────────────────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redisClient = new Redis(redisUrl);

redisClient.on("error", (err: any) => {
    console.error("❌ Redis Connection Error:", err);
});
redisClient.on("connect", () => {
    console.log("✅ Redis connected successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// Short-Term Conversation Memory
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TURNS = 5; // Keep only last 5 interactions (10 messages total)
const SESSION_TTL = 60 * 60 * 24; // 24 hours in seconds

export const redisMemoryService = {
    /**
     * Appends a new user-assistant interaction to the user's conversation list in Redis.
     * Automatically trims the list to retain only the last 5 turns.
     * Automatically sets a 24-hour expiration TTL for session management.
     */
    saveInteraction: async (userId: string, userQuery: string, aiResponse: string) => {
        try {
            if (!userId) return;
            const redisKey = `chat_history:${userId}`;

            const interaction = JSON.stringify({
                user: userQuery,
                assistant: aiResponse,
                timestamp: new Date().toISOString()
            });

            // 1. Push to the Right end of the list
            await redisClient.rpush(redisKey, interaction);
            
            // 2. Trim so we only keep the last MAX_TURNS (e.g., last 5 entries)
            // LTRIM start and stop are 0-indexed. Negative indices go from the end.
            await redisClient.ltrim(redisKey, -MAX_TURNS, -1);
            
            // 3. Reset the 24-hour expiration countdown
            await redisClient.expire(redisKey, SESSION_TTL);
            
        } catch (error) {
            console.error("redisMemoryService.saveInteraction error:", error);
        }
    },

    /**
     * Retrieves the stored conversation history and formats it into a single readable string.
     */
    getRecentContext: async (userId: string): Promise<string> => {
        try {
            if (!userId) return "No prior short-term history exist.";
            const redisKey = `chat_history:${userId}`;
            
            // Get all items in the list
            const historyList = await redisClient.lrange(redisKey, 0, -1);
            
            if (!historyList || historyList.length === 0) {
                // 🔄 FALLBACK TO MONGODB (Seamless Context Hydration)
                // If Redis is empty (TTL expired or new session), get the last few interactions from Mongo.
                const lastChats = await ChatHistory.find({ userId })
                    .sort({ timestamp: -1 }) // Get newest first
                    .limit(MAX_TURNS)
                    .lean();

                if (!lastChats || lastChats.length === 0) {
                    return "No prior short-term history exist.";
                }

                // Reverse them so they are in chronological order (oldest first, newest last)
                lastChats.reverse();

                // Format into readable text block
                const fallbackBlocks = lastChats.map((chat: any, index: number) => {
                    return `Turn ${index + 1} (Historical):
User: ${chat.userQuery}
Assistant: ${chat.aiResponse}`;
                });

                // 🔥 Bonus: Hydrate Redis actively so the next message doesn't hit DB again
                Promise.resolve().then(async () => {
                    for (const chat of lastChats) {
                        const interaction = JSON.stringify({
                            user: chat.userQuery,
                            assistant: chat.aiResponse,
                            timestamp: chat.timestamp
                        });
                        await redisClient.rpush(redisKey, interaction);
                    }
                    await redisClient.expire(redisKey, SESSION_TTL);
                }).catch(err => console.error("Redis re-hydration failed:", err));
                const fallbackIntro = `[PAST SESSION HISTORY]
NOTE: The user is starting a NEW fresh session. The following is their LAST recorded session. 
ONLY use this past context if the user's new query explicitly references a previous topic. 
IGNORE this context completely if the user starts a new unrelated topic.\n\n`;
                
                return fallbackIntro + fallbackBlocks.join("\n\n");
            }

            // Format Redis data into readable text block
            const formattedBlocks = historyList.map((itemStr: string, index: number) => {
                const item = JSON.parse(itemStr);
                return `Turn ${index + 1}:
User: ${item.user}
Assistant: ${item.assistant}`;
            });

            return formattedBlocks.join("\n\n");
        } catch (error) {
            console.error("redisMemoryService.getRecentContext error:", error);
            return "No prior short-term history exist.";
        }
    }
};
