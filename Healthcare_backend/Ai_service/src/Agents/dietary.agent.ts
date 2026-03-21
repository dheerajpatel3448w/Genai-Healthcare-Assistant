import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  getUserLifestyleProfileTool,
  getNutritionalInsightsTool,
  generateMealPlanTool
} from "../tools/dietary.tool.js";

// ─────────────────────────────────────────────────────────────────────────────
// Dietary / Lifestyle Coach Agent
// Provides fully personalized, medically-grounded nutrition and lifestyle advice
// based on the user's actual profile (BMI, chronic diseases, allergies) and
// lab data (real nutritional deficiencies).
// ─────────────────────────────────────────────────────────────────────────────
export const dietaryAgent = new Agent({
  name: "Lifestyle & Nutrition Coach",

  tools: [
    getUserLifestyleProfileTool,
    getNutritionalInsightsTool,
    generateMealPlanTool
  ],

  instructions: `
You are an expert Lifestyle & Nutrition Coach AI — a compassionate, evidence-based dietary advisor integrated into a healthcare platform.

Your job is to give PERSONALIZED nutrition advice. Not generic tips. Not the same advice for everyone.
Every recommendation must be grounded in the user's actual health data: BMI, chronic conditions, lab results, allergies, and diet type.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- userId          → Required for all tool calls
- userGoal        → "lose_weight" | "maintain" | "gain_weight" | "manage_condition"
- userQuery       → What the user actually asked (for context)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY TOOL CALL SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — ALWAYS call \`get_user_lifestyle_profile\` first.
  → This gives you BMI, diet type, chronic disease flags, allergies, medications, lifestyle habits.
  → WITHOUT this, ALL advice will be generic and useless.

STEP 2 — Call \`get_nutritional_insights_from_reports\`.
  → Scans real lab data for deficiencies (Vitamin D, B12, Iron, HbA1c, Cholesterol etc.)
  → Even if reports are unavailable (returns gracefully), check the result.
  → Lab-backed advice is far more trusted than general advice.

STEP 3 — Call \`generate_meal_plan_template\` using the outputs from Step 1 and Step 2.
  → Pass: dietType, bmiCategory, chronicDiseases, deficiencies (from lab), allergies, and goal.
  → This produces a complete 7-day meal plan, macro split, calorie target, foods to avoid, and hydration goal.

STEP 4 — Synthesize ALL results into the structured output.
  → Write a warm, motivating \`coaching_message\` that ties everything together.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REASONING RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **BMI-first framing:**
   - Underweight → prioritize calorie density, protein, and healthy fats
   - Normal → maintenance with micronutrient focus
   - Overweight/Obese → caloric deficit, high satiety foods, portion control

2. **Disease-specific adaptations:**
   - Diabetic → low GI foods, no refined carbs, portion control strictly
   - Cardiac → Mediterranean-style, low sodium, omega-3 focus, no trans fats
   - Renal → strict protein/potassium/phosphorus limits (always mention doctor supervision)
   - PCOS → low-carb, anti-inflammatory, high-fiber
   - Thyroid → iodine-rich foods, limit raw goitrogens (cauliflower, broccoli if hypothyroid)
   - Anemia → iron + Vitamin C pairing at every meal, avoid tea/coffee after iron foods

3. **Lab-backed deficiency rules:**
   - Vitamin D low → recommend sun exposure + fortified foods + discuss supplement with doctor
   - B12 low → especially flag this for vegetarians/vegans (recommend supplement)
   - Iron low → hemoglobin support foods, Vitamin C pairing
   - HbA1c elevated → urgent dietary modification for blood sugar control
   - LDL elevated → plant sterols, oats, nuts, omega-3 fish

4. **Allergy safety is NON-NEGOTIABLE:**
   - Never suggest any food that contains an allergen listed in the profile.
   - If allergies make the plan complicated, mention it and offer safe alternatives.

5. **Coaching message style:**
   - Warm, encouraging, non-shaming.
   - Acknowledge the user's current situation.
   - Give 2–3 practical "start today" tips from the plan.
   - End with a motivating line.

6. **No medical diagnoses. No medications. No prescriptions.**
   - You are a nutrition coach, not a doctor.
   - Always advise consulting a doctor for supplements or major dietary changes with medical conditions.
  `,

  outputType: z.object({
    bmi_summary: z
      .string()
      .describe("e.g. 'BMI: 27.4 (Overweight). Target: gradual weight loss of 0.5 kg/week.'"),

    diet_assessment: z
      .string()
      .describe("Short assessment of current diet type and gaps."),

    nutritional_deficiencies: z
      .array(z.string())
      .describe("List of lab-identified deficiencies e.g. ['Vitamin D (23 ng/mL — Low)', 'Iron borderline']"),

    calorie_target: z
      .number()
      .describe("Recommended daily calorie intake based on BMI and goal."),

    macro_split: z
      .object({
        carbs: z.string(),
        protein: z.string(),
        fat: z.string()
      })
      .describe("Macronutrient ratio e.g. { carbs: '40%', protein: '35%', fat: '25%' }"),

    meal_plan: z
      .array(
        z.object({
          day: z.string(),
          breakfast: z.string(),
          lunch: z.string(),
          dinner: z.string(),
          snacks: z.array(z.string())
        })
      )
      .describe("7-day personalized meal plan."),

    foods_to_prioritize: z
      .array(z.string())
      .describe("Top foods the user should eat more of."),

    foods_to_avoid: z
      .array(z.string())
      .describe("Foods to strictly limit or avoid based on conditions and allergies."),

    lifestyle_recommendations: z
      .array(z.string())
      .describe("Exercise, sleep, hydration, smoking/alcohol advice based on profile."),

    hydration_goal: z
      .string()
      .describe("Daily water intake recommendation."),

    supplement_notes: z
      .array(z.string())
      .describe("Supplement suggestions (always noted 'consult doctor before use')."),

    coaching_message: z
      .string()
      .describe("Warm, personalized motivational summary tying all advice together.")
  })
});

// ─────────────────────────────────────────────────────────────────────────────
// Export as Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
export const dietaryCoachTool = dietaryAgent.asTool({
  toolName: "get_lifestyle_advice",

  toolDescription: `
Provide fully personalized lifestyle and nutrition coaching for the user.

Call this tool when:
- Intent is "lifestyle_advice", "diet_plan", "nutrition_query", or "wellness"
- User asks: "what should I eat?", "give me a diet plan", "am I eating right?"
- User mentions a condition/goal: "I have diabetes what should I eat?", "I want to lose weight"
- User asks about deficiencies: "my Vitamin D is low what to eat?"
- User wants an exercise or sleep recommendation

This tool builds a full 7-day meal plan based on the user's actual BMI, chronic conditions, lab deficiencies, and allergies. All advice is medically grounded.
  `,

  parameters: z.object({
    userId: z
      .string()
      .describe("The user's MongoDB ObjectId. Required."),
    userGoal: z
      .enum(["lose_weight", "maintain", "gain_weight", "manage_condition"])
      .optional()
      .default("maintain")
      .describe("User's primary dietary goal. Infer from the query if not explicit."),
    userQuery: z
      .string()
      .optional()
      .describe("The original query from the user for context.")
  }),

  inputBuilder: (args: any) =>
    JSON.stringify({
      userId: args.userId,
      userGoal: args.userGoal || "maintain",
      userQuery: args.userQuery || "Provide comprehensive lifestyle and diet advice."
    }),

  customOutputExtractor: (result: any) => {
    try {
      if (typeof result.finalOutput === "object" && result.finalOutput !== null) {
        return JSON.stringify(result.finalOutput);
      }
      if (typeof result.finalOutput === "string") return result.finalOutput;
      return JSON.stringify({ error: "Dietary coach returned no output." });
    } catch {
      return JSON.stringify({ error: "Failed to parse dietary coach output." });
    }
  }
});
