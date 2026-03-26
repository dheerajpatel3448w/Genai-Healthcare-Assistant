import { tool } from "@openai/agents";
import { z } from "zod";
import { DoctorProfile } from "../models/Docter.model.js";

// ─── Shared field projection ───────────────────────────────────────────────
const DOCTOR_FIELDS =
  "_id specialization experience bio rating consultationFee consultationType languages availability clinicAddress hospitalName slotDuration isVerified totalPatients qualification";

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 1. searchDoctorBasicTool — Base DB Search
// FIX: Added try/catch + .select() to avoid leaking internal fields
// ─────────────────────────────────────────────────────────────────────────────
export const searchDoctorBasicTool = tool({
  name: "search_doctor_basic",
  description:
    "Base tool to search for doctors in the database based on specialization, language, and consultation type. Returns a clean list of matched doctors.",
  parameters: z.object({
    specialization: z.string().optional().nullable()  .describe("Doctor specialization, e.g. Cardiologist, Neurologist"),
    language: z.string().optional().nullable().describe("Language the doctor should speak"),
    consultationType: z.enum(["online", "clinic", "hospital"]).optional().nullable()
  }),
  execute: async ({ specialization, language, consultationType }) => {
    try {
      const query: any = { isVerified: true };
      if (specialization) query.specialization = { $regex: new RegExp(specialization, "i") };
      if (language) query.languages = { $in: [new RegExp(language, "i")] };
      // FIX: consultationType is stored as an array — must use $in
      if (consultationType) query.consultationType = { $in: [consultationType] };

      const doctors = await DoctorProfile.find(query).select(DOCTOR_FIELDS).limit(10).lean();

      if (!doctors || doctors.length === 0) {
        return { doctors: [], message: "No verified doctors found matching the given criteria." };
      }

      return { doctors, total: doctors.length };
    } catch (error: any) {
      console.error("searchDoctorBasicTool error:", error);
      return { doctors: [], message: "Failed to search doctors due to a database error." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 2. smartDoctorRankingTool — Intelligent Ranking
// FIX: userPreferences is now actually used to adjust weighting dynamically
// ─────────────────────────────────────────────────────────────────────────────
export const smartDoctorRankingTool = tool({
  name: "rank_doctors",
  description:
    "Rank an array of doctors based on quality, rating, experience, and user preferences. Respects keywords like 'cheap', 'affordable', 'experienced', 'highly rated'.",
  parameters: z.object({
    doctors: z.array(z.any()),
    userPreferences: z.string().optional().nullable().describe("Natural language preferences e.g. 'affordable', 'highly experienced'")
  }),
  execute: async ({ doctors, userPreferences }) => {
    try {
      if (!doctors || doctors.length === 0) {
        return { ranked: [], message: "No doctors to rank." };
      }

      const prefs = (userPreferences || "").toLowerCase();
      const prefersAffordable = prefs.includes("cheap") || prefs.includes("affordable") || prefs.includes("low fee");
      const prefersExperience = prefs.includes("experienced") || prefs.includes("senior") || prefs.includes("expert");
      const prefersRating = prefs.includes("rated") || prefs.includes("rating") || prefs.includes("best");

      const scored = doctors.map((doc: any) => {
        const rating = doc.rating || 0;
        const experience = doc.experience || 0;
        const fee = doc.consultationFee || 0;

        let score = rating * 2 + experience; // base score

        if (prefersAffordable) score -= fee / 500;          // penalize high fee
        if (prefersExperience) score += experience * 1.5;   // boost experience weight
        if (prefersRating)     score += rating * 2;         // boost rating weight

        return { ...doc, _score: parseFloat(score.toFixed(2)) };
      });

      const ranked = scored.sort((a: any, b: any) => b._score - a._score);
      return { ranked, total: ranked.length };
    } catch (error: any) {
      console.error("smartDoctorRankingTool error:", error);
      return { ranked: [], message: "Failed to rank doctors." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 3. locationBasedDoctorTool — Location-Based Search
// FIX: Removed dead lat/lng params that were never used. Added hospitalName filter.
// ─────────────────────────────────────────────────────────────────────────────
export const locationBasedDoctorTool = tool({
  name: "find_doctors_nearby",
  description:
    "Find doctors near a specific city, address, or hospital name. Useful when the user mentions a location.",
  parameters: z.object({
    specialization: z.string().describe("The required doctor specialization"),
    cityNameOrAddress: z.string().optional().nullable().describe("City or area name to search within"),
    hospitalName: z.string().optional().nullable().describe("Specific hospital or clinic name")
  }),
  execute: async ({ cityNameOrAddress, specialization, hospitalName }) => {
    try {
      const query: any = {
        isVerified: true,
        specialization: { $regex: new RegExp(specialization, "i") }
      };

      if (cityNameOrAddress) {
        query.$or = [
          { clinicAddress: { $regex: new RegExp(cityNameOrAddress, "i") } },
          { hospitalName: { $regex: new RegExp(cityNameOrAddress, "i") } }
        ];
      }

      if (hospitalName) {
        query.hospitalName = { $regex: new RegExp(hospitalName, "i") };
      }

      const doctors = await DoctorProfile.find(query).select(DOCTOR_FIELDS).limit(5).lean();

      if (!doctors || doctors.length === 0) {
        return { doctors: [], message: `No ${specialization} doctors found near "${cityNameOrAddress || hospitalName}".` };
      }

      return { doctors, total: doctors.length };
    } catch (error: any) {
      console.error("locationBasedDoctorTool error:", error);
      return { doctors: [], message: "Failed to fetch location-based doctors." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 4. availabilityCheckTool — Weekly Availability
// FIX: Guard against undefined start/end time in timings string
// ─────────────────────────────────────────────────────────────────────────────
export const availabilityCheckTool = tool({
  name: "check_doctor_availability",
  description: "Check if a specific doctor is available on a given day of the week, and what their working hours are.",
  parameters: z.object({
    doctorId: z.string().describe("The doctor's MongoDB ObjectId"),
    dayOfWeek: z.string().describe("Day of the week to check, e.g. 'Monday', 'Tuesday'")
  }),
  execute: async ({ doctorId, dayOfWeek }) => {
    try {
      const doctor = await DoctorProfile.findById(doctorId).select("availability").lean();
      if (!doctor) return { available: false, reason: "Doctor not found." };

      const days = doctor.availability?.days || [];
      const isAvailable = days.some((d) => d.toLowerCase() === dayOfWeek.toLowerCase());

      // FIX: Guard undefined timings
      const startTime = doctor.availability?.startTime;
      const endTime = doctor.availability?.endTime;
      const timings =
        startTime && endTime ? `${startTime} to ${endTime}` : "Timings not specified — contact clinic directly.";

      return {
        available: isAvailable,
        availableDays: days.length > 0 ? days : ["Not configured"],
        timings,
        message: isAvailable
          ? `Doctor is available on ${dayOfWeek}. Working hours: ${timings}.`
          : `Doctor is NOT available on ${dayOfWeek}. Available days: ${days.join(", ") || "None listed"}.`
      };
    } catch (error: any) {
      console.error("availabilityCheckTool error:", error);
      return { available: false, reason: "Failed to check availability." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 5. languageMatchTool — Language Filter
// FIX: Added try/catch + empty-array message
// ─────────────────────────────────────────────────────────────────────────────
export const languageMatchTool = tool({
  name: "filter_by_language",
  description: "Filter a list of doctors to only those who speak a specific language.",
  parameters: z.object({
    doctors: z.array(z.any()),
    language: z.string().describe("Language to filter by, e.g. 'Hindi', 'English'")
  }),
  execute: async ({ doctors, language }) => {
    try {
      if (!doctors || doctors.length === 0) {
        return { filtered: [], message: "No doctors provided to filter." };
      }

      const filtered = doctors.filter((doc: any) =>
        doc.languages?.some((l: string) => l.toLowerCase() === language.toLowerCase())
      );

      return {
        filtered,
        total: filtered.length,
        message:
          filtered.length === 0
            ? `No doctors found who speak ${language}. Consider broadening your search.`
            : `Found ${filtered.length} doctor(s) who speak ${language}.`
      };
    } catch (error: any) {
      console.error("languageMatchTool error:", error);
      return { filtered: [], message: "Failed to filter by language." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 6. consultationTypeFilterTool — Consultation Type Filter
// FIX: Added try/catch + empty-array message
// ─────────────────────────────────────────────────────────────────────────────
export const consultationTypeFilterTool = tool({
  name: "filter_by_consultation_type",
  description: "Filter a list of doctors to those offering a specific consultation type: online, clinic, or hospital.",
  parameters: z.object({
    doctors: z.array(z.any()),
    type: z.enum(["online", "clinic", "hospital"]).describe("The required consultation mode")
  }),
  execute: async ({ doctors, type }) => {
    try {
      if (!doctors || doctors.length === 0) {
        return { filtered: [], message: "No doctors provided to filter." };
      }

      const filtered = doctors.filter((doc: any) => doc.consultationType?.includes(type));

      return {
        filtered,
        total: filtered.length,
        message:
          filtered.length === 0
            ? `No doctors found offering ${type} consultations.`
            : `Found ${filtered.length} doctor(s) offering ${type} consultation.`
      };
    } catch (error: any) {
      console.error("consultationTypeFilterTool error:", error);
      return { filtered: [], message: "Failed to filter by consultation type." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 7. topRatedDoctorTool — Top Rated
// FIX: Added try/catch + .select()
// ─────────────────────────────────────────────────────────────────────────────
export const topRatedDoctorTool = tool({
  name: "get_top_rated_doctors",
  description: "Fetch the highest-rated verified doctors for a specific specialization from the database.",
  parameters: z.object({
    specialization: z.string(),
    minRating: z.number().default(4.0).describe("Minimum rating threshold, default 4.0")
  }),
  execute: async ({ specialization, minRating }) => {
    try {
      const doctors = await DoctorProfile.find({
        isVerified: true,
        specialization: { $regex: new RegExp(specialization, "i") },
        rating: { $gte: minRating }
      })
        .sort({ rating: -1 })
        .select(DOCTOR_FIELDS)
        .limit(5)
        .lean();

      if (!doctors || doctors.length === 0) {
        return {
          doctors: [],
          message: `No top-rated ${specialization} doctors found with rating ≥ ${minRating}. Try lowering the minimum rating.`
        };
      }

      return { doctors, total: doctors.length };
    } catch (error: any) {
      console.error("topRatedDoctorTool error:", error);
      return { doctors: [], message: "Failed to fetch top-rated doctors." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 8. emergencyDoctorTool — Emergency / Critical
// FIX: Added try/catch + .select()
// ─────────────────────────────────────────────────────────────────────────────
export const emergencyDoctorTool = tool({
  name: "get_emergency_doctors",
  description:
    "Find the most experienced and highest-rated doctors for a critical/emergency case. Always use for 'high' or 'critical' symptom severity.",
  parameters: z.object({
    specialization: z.string().describe("The required specialization for emergency")
  }),
  execute: async ({ specialization }) => {
    try {
      const doctors = await DoctorProfile.find({
        isVerified: true,
        specialization: { $regex: new RegExp(specialization, "i") }
      })
        .sort({ experience: -1, rating: -1 })
        .select(DOCTOR_FIELDS)
        .limit(3)
        .lean();

      if (!doctors || doctors.length === 0) {
        return {
          doctors: [],
          message: `⚠️ No emergency ${specialization} doctors found. Please call emergency services (112) immediately.`
        };
      }

      return {
        doctors,
        total: doctors.length,
        emergency_note: "⚠️ These are the top doctors for your critical case. Book immediately or visit their clinic."
      };
    } catch (error: any) {
      console.error("emergencyDoctorTool error:", error);
      return { doctors: [], message: "Failed to fetch emergency doctors." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 9. doctorExplanationTool — Why This Doctor
// FIX: Was using doctor.bio as the name. Now accepts doctorName as explicit param.
//      Returns a properly structured explanation with all relevant stats.
// ─────────────────────────────────────────────────────────────────────────────
export const doctorExplanationTool = tool({
  name: "explain_doctor_choice",
  description:
    "Generate a clear, persuasive explanation of WHY a specific doctor is recommended for a patient's symptoms. Always call this for each top doctor before presenting results.",
  parameters: z.object({
    doctorId: z.string().describe("The doctor's MongoDB ObjectId"),
    doctorName: z.string().describe("Display name of the doctor (e.g. 'Dr. A. Sharma')"),
    symptomsAnalysis: z.string().describe("The clinical findings / symptom analysis from the Symptom Agent")
  }),
  execute: async ({ doctorId, doctorName, symptomsAnalysis }) => {
    try {
      const doctor = await DoctorProfile.findById(doctorId)
        .select("specialization experience rating consultationFee consultationType languages availability")
        .lean();

      if (!doctor) {
        return { explanation: `${doctorName} could not be found in the database.` };
      }

      const availStr =
        doctor.availability?.days?.join(", ") || "Availability not specified";
      const timing =
        doctor.availability?.startTime && doctor.availability?.endTime
          ? `${doctor.availability.startTime} – ${doctor.availability.endTime}`
          : "Contact clinic for timings";

      const explanation = `
**${doctorName}** (${doctor.specialization})
- ⭐ Rating: ${doctor.rating ?? "N/A"} / 5
- 🕰️ Experience: ${doctor.experience ?? "N/A"} years
- 💰 Consultation Fee: ₹${doctor.consultationFee ?? "Not listed"}
- 💻 Modes: ${doctor.consultationType?.join(", ") || "Not specified"}
- 🌐 Languages: ${doctor.languages?.join(", ") || "Not specified"}
- 📅 Available: ${availStr} | ${timing}

**Why recommended:** ${doctorName}'s ${doctor.experience}-year expertise in ${doctor.specialization} directly addresses the clinical concern: "${symptomsAnalysis.slice(0, 200)}...". Their high rating of ${doctor.rating} reflects consistent positive patient outcomes.
      `.trim();

      return { explanation, doctorId };
    } catch (error: any) {
      console.error("doctorExplanationTool error:", error);
      return { explanation: "Could not generate explanation for this doctor." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 10. smartDoctorSearchTool — Hybrid Search & Rank
// FIX: consultationType now uses $in (was exact match on array field — always failed)
// FIX: Added .select() + try/catch
// ─────────────────────────────────────────────────────────────────────────────
export const smartDoctorSearchTool = tool({
  name: "smart_doctor_search",
  description:
    "End-to-end intelligent doctor search: combines specialization, language, fee, and consultation type filters then auto-ranks results. Prefer this over calling individual filter tools separately.",
  parameters: z.object({
    specialization: z.string().describe("Required doctor specialization"),
    language: z.string().optional().describe("Preferred language"),
    consultationType: z.enum(["online", "clinic", "hospital"]).optional().describe("Preferred consultation mode"),
    maxFee: z.number().optional().describe("Maximum acceptable consultation fee in INR")
  }),
  execute: async ({ specialization, language, consultationType, maxFee }) => {
    try {
      const query: any = {
        isVerified: true,
        specialization: { $regex: new RegExp(specialization, "i") }
      };

      if (language) query.languages = { $in: [new RegExp(language, "i")] };
      // FIX: Use $in since consultationType is stored as a string array in schema
      if (consultationType) query.consultationType = { $in: [consultationType] };
      if (maxFee) query.consultationFee = { $lte: maxFee };

      const doctors = await DoctorProfile.find(query).select(DOCTOR_FIELDS).lean();

      if (!doctors || doctors.length === 0) {
        return {
          doctors: [],
          message: `No doctors found for "${specialization}"${consultationType ? ` offering ${consultationType}` : ""}${maxFee ? ` under ₹${maxFee}` : ""}. Try broadening your filters.`
        };
      }

      const ranked = doctors
        .sort((a, b) => {
          const scoreA = (a.rating || 0) * 2 + (a.experience || 0);
          const scoreB = (b.rating || 0) * 2 + (b.experience || 0);
          return scoreB - scoreA;
        })
        .slice(0, 5);

      return { doctors: ranked, total: ranked.length };
    } catch (error: any) {
      console.error("smartDoctorSearchTool error:", error);
      return { doctors: [], message: "Smart doctor search failed. Please try again." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 11. feeFilterTool — Fee Filter
// FIX: Added try/catch + empty-array message
// ─────────────────────────────────────────────────────────────────────────────
export const feeFilterTool = tool({
  name: "filter_by_fee",
  description: "Filter a list of doctors by a maximum consultation fee in INR.",
  parameters: z.object({
    doctors: z.array(z.any()),
    maxFee: z.number().describe("Maximum allowed consultation fee in INR")
  }),
  execute: async ({ doctors, maxFee }) => {
    try {
      if (!doctors || doctors.length === 0) {
        return { filtered: [], message: "No doctors provided to filter." };
      }

      const filtered = doctors.filter((doc: any) => (doc.consultationFee || 0) <= maxFee);

      return {
        filtered,
        total: filtered.length,
        message:
          filtered.length === 0
            ? `No doctors found with consultation fee ≤ ₹${maxFee}.`
            : `Found ${filtered.length} doctor(s) within ₹${maxFee}.`
      };
    } catch (error: any) {
      console.error("feeFilterTool error:", error);
      return { filtered: [], message: "Failed to filter by fee." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 12. experienceFilterTool — Experience Filter
// FIX: Added try/catch + empty-array message
// ─────────────────────────────────────────────────────────────────────────────
export const experienceFilterTool = tool({
  name: "filter_by_experience",
  description: "Filter a list of doctors to only those with at least a minimum number of years of experience.",
  parameters: z.object({
    doctors: z.array(z.any()),
    minExperience: z.number().describe("Minimum required years of experience")
  }),
  execute: async ({ doctors, minExperience }) => {
    try {
      if (!doctors || doctors.length === 0) {
        return { filtered: [], message: "No doctors provided to filter." };
      }

      const filtered = doctors.filter((doc: any) => (doc.experience || 0) >= minExperience);

      return {
        filtered,
        total: filtered.length,
        message:
          filtered.length === 0
            ? `No doctors found with ≥ ${minExperience} years of experience.`
            : `Found ${filtered.length} doctor(s) with ${minExperience}+ years of experience.`
      };
    } catch (error: any) {
      console.error("experienceFilterTool error:", error);
      return { filtered: [], message: "Failed to filter by experience." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 13. nextAvailableSlotTool — Real Next Date
// FIX: Was returning just "Monday at 10:00 AM" which is meaningless.
//      Now computes the ACTUAL next upcoming calendar date for that working day.
// ─────────────────────────────────────────────────────────────────────────────
export const nextAvailableSlotTool = tool({
  name: "get_next_available_slot",
  description:
    "Get the next real available time slot for a specific doctor, including the exact upcoming calendar date (not just day name).",
  parameters: z.object({
    doctorId: z.string().describe("The doctor's MongoDB ObjectId")
  }),
  execute: async ({ doctorId }) => {
    try {
      const doctor = await DoctorProfile.findById(doctorId)
        .select("availability slotDuration bio")
        .lean();

      if (!doctor) return { error: "Doctor not found." };

      const days = doctor.availability?.days;
      const startTime = doctor.availability?.startTime;

      if (!days || days.length === 0 || !startTime) {
        return {
          nextAvailable: null,
          message: "This doctor has no availability configured. Please contact the clinic directly."
        };
      }

      // Map day names to JS weekday indices (0 = Sunday)
      const dayIndex: Record<string, number> = {
        sunday: 0,  monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6
      };

      const todayIndex = new Date().getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find the closest upcoming working day
      let closestDate: Date | null = null;
      let daysAhead = 8; // max search window

      for (let offset = 0; offset <= 7; offset++) {
        const candidate = new Date(today);
        candidate.setDate(today.getDate() + offset);
        const candidateDayName = candidate.toLocaleDateString("en-US", { weekday: "long" });

        if (days.some((d) => d.toLowerCase() === candidateDayName.toLowerCase())) {
          if (offset < daysAhead) {
            daysAhead = offset;
            closestDate = candidate;
          }
        }
      }

      if (!closestDate) {
        return {
          nextAvailable: null,
          message: "Could not find a working day in the next 7 days."
        };
      }

      const formattedDate = closestDate.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      return {
        nextAvailable: {
          date: closestDate.toISOString().split("T")[0],
          displayDate: formattedDate,
          startTime,
          endTime: doctor.availability?.endTime || "Not specified",
          slotDurationMinutes: doctor.slotDuration || 30
        },
        message: `Next available slot: ${formattedDate} starting at ${startTime}.`
      };
    } catch (error: any) {
      console.error("nextAvailableSlotTool error:", error);
      return { error: "Failed to compute next available slot." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 14. personalizedDoctorMatchTool — Severity-Based Match
// FIX: For low/moderate severity, now uses composite score (rating + fee-aware)
//      to recommend affordable + well-rated doctors, not just highest rating.
// ─────────────────────────────────────────────────────────────────────────────
export const personalizedDoctorMatchTool = tool({
  name: "personalized_doctor_match",
  description:
    "Match doctors based on symptom severity. For high/critical severity: prioritizes most experienced doctors. For low/moderate severity: prioritizes affordable + well-rated doctors.",
  parameters: z.object({
    specialization: z.string().describe("Required doctor specialization"),
    severity: z
      .enum(["low", "moderate", "high", "critical"])
      .describe("The symptom severity level returned by the Symptom Agent")
  }),
  execute: async ({ specialization, severity }) => {
    try {
      const doctors = await DoctorProfile.find({
        specialization: { $regex: new RegExp(specialization, "i") },
        isVerified: true
      })
        .select(DOCTOR_FIELDS)
        .lean();

      if (!doctors || doctors.length === 0) {
        return {
          doctors: [],
          message: `No verified ${specialization} doctors found for severity level: ${severity}.`
        };
      }

      let sorted: typeof doctors;

      if (severity === "high" || severity === "critical") {
        // Critical: prioritize highest experience + rating (patient safety first)
        sorted = doctors.sort(
          (a, b) => (b.experience || 0) * 1.5 + (b.rating || 0) - ((a.experience || 0) * 1.5 + (a.rating || 0))
        );
      } else {
        // Low/Moderate: FIX — prefer affordable + well-rated doctors
        // Score = rating * 2 - (fee / 1000) — penalize expensive options gently
        sorted = doctors.sort((a, b) => {
          const scoreA = (a.rating || 0) * 2 - (a.consultationFee || 0) / 1000;
          const scoreB = (b.rating || 0) * 2 - (b.consultationFee || 0) / 1000;
          return scoreB - scoreA;
        });
      }

      return {
        doctors: sorted.slice(0, 5),
        total: Math.min(sorted.length, 5),
        severity,
        rankingStrategy:
          severity === "high" || severity === "critical"
            ? "Ranked by experience + rating (critical safety priority)"
            : "Ranked by rating + affordability (routine consultation)"
      };
    } catch (error: any) {
      console.error("personalizedDoctorMatchTool error:", error);
      return { doctors: [], message: "Personalized doctor match failed." };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 15. getDoctorProfileTool — NEW: Full Profile Fetch
// Fetches a complete single doctor profile by doctorId.
// Useful when the user selects a specific doctor and wants to see full details.
// ─────────────────────────────────────────────────────────────────────────────
export const getDoctorProfileTool = tool({
  name: "get_doctor_profile",
  description:
    "Fetch the complete profile of a specific doctor by their ID. Use this when the user selects a doctor and wants detailed information before booking.",
  parameters: z.object({
    doctorId: z.string().describe("The doctor's MongoDB ObjectId")
  }),
  execute: async ({ doctorId }) => {
    try {
      const doctor = await DoctorProfile.findById(doctorId)
        .select(
          "_id specialization experience qualification bio rating consultationFee consultationType languages availability clinicAddress hospitalName slotDuration services education totalPatients isVerified"
        )
        .lean();

      if (!doctor) {
        return { success: false, message: "Doctor not found. The ID may be invalid." };
      }

      return {
        success: true,
        doctor: {
          id: doctor._id.toString(),
          specialization: doctor.specialization,
          experience: doctor.experience,
          qualification: doctor.qualification,
          bio: doctor.bio,
          rating: doctor.rating,
          consultationFee: doctor.consultationFee,
          consultationType: doctor.consultationType,
          languages: doctor.languages,
          availability: doctor.availability,
          clinicAddress: doctor.clinicAddress,
          hospitalName: doctor.hospitalName,
          slotDuration: doctor.slotDuration || 30,
          services: doctor.services,
          education: doctor.education,
          totalPatients: doctor.totalPatients
        }
      };
    } catch (error: any) {
      console.error("getDoctorProfileTool error:", error);
      return { success: false, message: "Failed to fetch doctor profile." };
    }
  }
});
