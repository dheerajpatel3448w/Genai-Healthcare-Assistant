import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { queryImproviserService } from "./services/queryimprowiser.service.js";
import { UserProfile } from "./models/userprofile.model.js";
import { memory } from "./services/mem0.service.js";
import { redisMemoryService } from "./services/redisMemory.service.js";
import { HealthBrainStreamingService } from "./services/HealthBrain.service.js";
import { DoctorBrainStreamingService } from "./services/DoctorBrain.service.js";
import { DoctorProfile } from "./models/Docter.model.js";

let io: Server;

export const intializeSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 🔐 Auth middleware — supports explicit token OR cookie-based auth
  io.use((socket: any, next) => {
    try {
      // Prefer explicit token from handshake.auth (for clients that pass it)
      let token = socket.handshake.auth?.token;

      // Fallback: extract JWT from the cookie header (cookie-based auth)
      if (!token) {
        const cookieHeader = socket.handshake.headers?.cookie || "";
        const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token) throw new Error("No token");

      const user: any = jwt.verify(token, process.env.JWT_SECRET!);

      socket.userId = user.id; // 🔥 attach userId
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: any) => {
    console.log("✅ Connected:", socket.userId);

    // 🔥 Join room so sendMessageToUser() still works
    socket.join(socket.userId);

    // ─────────────────────────────────────────────────────
    // 🤖 AI Streaming Query Handler
    // Client emits: socket.emit("ai:query", { query: "..." })
    // ─────────────────────────────────────────────────────
    socket.on("ai:query", async ({ query }: { query: string }) => {
      const userId: string = socket.userId;

      // Per-socket emit helper — scopes all events to this connection only
      const emitFn = (event: string, data: any) => socket.emit(event, data);

      try {
        // Step 1: Notify frontend that query improvement is starting
        emitFn("ai:status", { step: "improving_query" });

        const improvedQuery = await queryImproviserService(query, userId);

        if (!improvedQuery) {
          emitFn("ai:error", { message: "Could not analyze the given query." });
          return;
        }

        // Step 2: Fetch user profile
        const userprofile = await UserProfile.findOne({ userId });

        // Step 3: Fetch Mem0 past memories
        let pastMemories: string | null = null;
        try {
          const memResults = await memory.search(improvedQuery.clean_query, { userId });
          if (memResults?.results?.length > 0) {
            pastMemories = memResults.results.map((m: any) => m.memory).join(" | ");
          }
        } catch (e) {
          console.error("Mem0 search failed:", e);
        }

        // Step 4: Fetch recent Redis conversation context
        const recentHistory = await redisMemoryService.getRecentContext(userId);

        const improvedQueryWithProfile = {improvedQuery, userprofile, pastMemories, recentHistory };

        // Step 5: Signal frontend that AI generation is starting
        emitFn("ai:status", { step: "generating" });

        // Step 6: Run the streaming agent — tokens flow via emitFn
        const finalOutput = await HealthBrainStreamingService(
          improvedQueryWithProfile,
          userId,
          improvedQuery,
          emitFn
        );

        // Step 7: Signal stream is complete with full response
        emitFn("ai:done", {
          intent: improvedQuery.intent,
          finalResponse: finalOutput,
        });

      } catch (err) {
        console.error("Socket ai:query error:", err);
        emitFn("ai:error", { message: "AI processing failed. Please try again." });
      }
    });

    // ─────────────────────────────────────────────────────
    // 🩺 Doctor AI Streaming Query Handler
    // Client emits: socket.emit("doctor:query", { query: "..." })
    // ─────────────────────────────────────────────────────
    socket.on("doctor:query", async ({ query }: { query: string }) => {
      const doctorUserId: string = socket.userId; // userId from JWT
      const emitFn = (event: string, data: any) => socket.emit(event, data);

      try {
        emitFn("doctor:status", { step: "verifying_doctor" });

        // Validate: user must be a registered doctor
        const doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId }).lean();
        if (!doctorProfile) {
          emitFn("doctor:error", { message: "Access denied. No doctor profile found for your account." });
          return;
        }

        const doctorId = (doctorProfile._id as any).toString();

        emitFn("doctor:status", { step: "generating" });

        // Stream the DoctorBrain response token-by-token
        const finalOutput = await DoctorBrainStreamingService(
          doctorId,
          doctorUserId,
          query,
          doctorProfile,
          emitFn
        );

        emitFn("doctor:done", { finalResponse: finalOutput });

      } catch (err) {
        console.error("Socket doctor:query error:", err);
        emitFn("doctor:error", { message: "Doctor AI processing failed. Please try again." });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.userId);
    });
  });
};


// ─────────────────────────────────────────────────────
// Legacy helper — still works for server-side push events
// e.g. job progress notifications etc.
// ─────────────────────────────────────────────────────
export const sendMessageToUser = (
  userId: string,
  message: { event: string; data: any }
) => {
  if (io) {
    io.to(userId).emit(message.event, message.data);
  } else {
    console.log("io is not defined");
  }
};



