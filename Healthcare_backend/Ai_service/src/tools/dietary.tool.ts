import { tool } from "@openai/agents";
import { z } from "zod";
import mongoose from "mongoose";
import { UserProfile } from "../models/userprofile.model.js";
import { Report } from "../models/report.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function computeBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const rounded = parseFloat(bmi.toFixed(1));
  let category: string;
  if (rounded < 18.5)       category = "Underweight";
  else if (rounded < 25)    category = "Normal";
  else if (rounded < 30)    category = "Overweight";
  else                      category = "Obese";
  return { bmi: rounded, category };
}

function extractNutrientValue(analysis: any, nutrient: string): number | null {
  if (!analysis || typeof analysis !== "object") return null;
  const lower = nutrient.toLowerCase();
  const walk = (obj: any): number | null => {
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
        const val = obj[key];
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const parsed = parseFloat(val.replace(/[^\d.]/g, ""));
          if (!isNaN(parsed)) return parsed;
        }
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        const nested = walk(obj[key]);
        if (nested !== null) return nested;
      }
    }
    return null;
  };
  return walk(analysis);
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ TOOL 1: get_user_lifestyle_profile
// Fetches the user's health profile from DB and computes key lifestyle metrics
// including BMI, BMI category, chronic disease flags, and lifestyle habits.
// ─────────────────────────────────────────────────────────────────────────────
export const getUserLifestyleProfileTool = tool({
  name: "get_user_lifestyle_profile",
  description:
    "Fetch the user's full lifestyle and health profile from the database: BMI, diet type, exercise frequency, sleep, smoking/alcohol habits, chronic diseases, allergies, medications, and family history. ALWAYS call this first before generating any diet or lifestyle advice.",
  parameters: z.object({
    userId: z.string().describe("The user's MongoDB ObjectId.")
  }),
  execute: async ({ userId }) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: "Invalid or missing userId. Cannot fetch lifestyle profile."
        };
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const profile = await UserProfile.findOne({ userId: userObjectId }).lean();

      if (!profile) {
        return {
          success: false,
          message: "No user profile found. Cannot generate personalized recommendations without profile data."
        };
      }

      // BMI
      let bmiData: { bmi: number; category: string } | null = null;
      if (profile.height && profile.weight) {
        bmiData = computeBMI(profile.weight, profile.height);
      }

      // Lifestyle flags
      const lifestyle = profile.lifestyle || {};

      // Chronic disease quick flags for meal planning
      const diseases = (profile.chronicDiseases || []).map((d: string) => d.toLowerCase());
      const healthFlags = {
        isDiabetic:      diseases.some(d => d.includes("diabet") || d.includes("sugar")),
        isHypertensive:  diseases.some(d => d.includes("hypertension") || d.includes("blood pressure")),
        isCardiac:       diseases.some(d => d.includes("heart") || d.includes("cardiac") || d.includes("cholesterol")),
        isRenal:         diseases.some(d => d.includes("kidney") || d.includes("renal")),
        isThyroid:       diseases.some(d => d.includes("thyroid") || d.includes("hypothyroid") || d.includes("hyperthyroid")),
        isPCOS:          diseases.some(d => d.includes("pcos") || d.includes("polycystic")),
        isAnemic:        diseases.some(d => d.includes("anemia") || d.includes("anaemia")),
        hasGerd:         diseases.some(d => d.includes("acid") || d.includes("gerd") || d.includes("reflux"))
      };

      return {
        success: true,
        age:              profile.age ?? null,
        gender:           profile.gender ?? null,
        height_cm:        profile.height ?? null,
        weight_kg:        profile.weight ?? null,
        bmi:              bmiData?.bmi ?? null,
        bmi_category:     bmiData?.category ?? "Unknown",
        diet_type:        lifestyle.dietType ?? "mixed",
        exercise_frequency: lifestyle.exerciseFrequency ?? "unknown",
        sleep_hours:      lifestyle.sleepHours ?? null,
        smoking:          lifestyle.smoking ?? false,
        alcohol:          lifestyle.alcohol ?? false,
        chronic_diseases: profile.chronicDiseases ?? [],
        allergies:        profile.allergies ?? [],
        current_medications: profile.currentMedications ?? [],
        family_history:   profile.familyHistory ?? [],
        health_flags:     healthFlags
      };
    } catch (error: any) {
      console.error("getUserLifestyleProfileTool error:", error);
      return {
        success: false,
        message: "Failed to fetch user lifestyle profile."
      };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ TOOL 2: get_nutritional_insights_from_reports
// Scans the last 5 lab reports for nutritional and metabolic markers.
// Returns which nutrients are deficient, elevated, or normal to ground
// the diet recommendations in actual lab evidence.
// ─────────────────────────────────────────────────────────────────────────────
export const getNutritionalInsightsTool = tool({
  name: "get_nutritional_insights_from_reports",
  description:
    "Scan the user's recent lab reports to identify nutritional deficiencies (Vitamin D, B12, Iron, Folate) and metabolic markers (Cholesterol, HbA1c, Blood Glucose, Uric Acid). Call this to make diet recommendations evidence-backed with actual lab values.",
  parameters: z.object({
    userId: z.string().describe("The user's MongoDB ObjectId.")
  }),
  execute: async ({ userId }) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          deficiencies: [],
          elevated: [],
          normal: [],
          message: "Invalid or missing userId. Cannot fetch nutritional insights."
        };
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const labReports = await Report.find({
        patientId: userObjectId,
        reportType: "lab"
      })
        .select("uploadedAt analysis reportName")
        .sort({ uploadedAt: -1 })
        .limit(5)
        .lean();

      if (!labReports || labReports.length === 0) {
        return {
          success: false,
          message: "No lab reports found. Recommendations will be based on profile data only.",
          deficiencies: [],
          elevated: [],
          normal: []
        };
      }

      // Key nutritional markers to scan with reference ranges
      const NUTRITIONAL_MARKERS = [
        { name: "Vitamin D",     low: 20,   high: 100,  unit: "ng/mL" },
        { name: "Vitamin B12",   low: 200,  high: 900,  unit: "pg/mL" },
        { name: "Iron",          low: 60,   high: 170,  unit: "mcg/dL" },
        { name: "Ferritin",      low: 12,   high: 300,  unit: "ng/mL" },
        { name: "Folate",        low: 4,    high: 20,   unit: "ng/mL" },
        { name: "Hemoglobin",    low: 12,   high: 17,   unit: "g/dL" },
        { name: "HbA1c",         low: 0,    high: 5.7,  unit: "%" },
        { name: "Fasting Glucose", low: 70, high: 100,  unit: "mg/dL" },
        { name: "Cholesterol",   low: 0,    high: 200,  unit: "mg/dL" },
        { name: "LDL",           low: 0,    high: 100,  unit: "mg/dL" },
        { name: "HDL",           low: 40,   high: 60,   unit: "mg/dL" },
        { name: "Triglycerides", low: 0,    high: 150,  unit: "mg/dL" },
        { name: "Uric Acid",     low: 3.5,  high: 7,    unit: "mg/dL" },
        { name: "Calcium",       low: 8.5,  high: 10.5, unit: "mg/dL" },
        { name: "Creatinine",    low: 0.5,  high: 1.2,  unit: "mg/dL" }
      ];

      const deficiencies: { nutrient: string; value: number; unit: string; note: string }[] = [];
      const elevated:     { nutrient: string; value: number; unit: string; note: string }[] = [];
      const normal:       { nutrient: string; value: number; unit: string }[] = [];
      const checked:      Set<string> = new Set();

      // Scan reports newest first — take first found value per marker
      for (const report of labReports) {
        if (!report.analysis) continue;
        for (const marker of NUTRITIONAL_MARKERS) {
          if (checked.has(marker.name)) continue;
          const val = extractNutrientValue(report.analysis, marker.name);
          if (val === null) continue;
          checked.add(marker.name);

          if (val < marker.low) {
            deficiencies.push({
              nutrient: marker.name,
              value: val,
              unit: marker.unit,
              note: `Low (Reference: ${marker.low}–${marker.high} ${marker.unit})`
            });
          } else if (val > marker.high) {
            elevated.push({
              nutrient: marker.name,
              value: val,
              unit: marker.unit,
              note: `High (Reference: ${marker.low}–${marker.high} ${marker.unit})`
            });
          } else {
            normal.push({ nutrient: marker.name, value: val, unit: marker.unit });
          }
        }
      }

      const nutritionalSummary =
        deficiencies.length === 0 && elevated.length === 0
          ? "No significant nutritional deficiencies or elevations found in recent lab reports."
          : `Found ${deficiencies.length} deficiency/deficiencies (${deficiencies.map(d => d.nutrient).join(", ")}) ` +
            `and ${elevated.length} elevated marker(s) (${elevated.map(e => e.nutrient).join(", ")}).`;

      return {
        success: true,
        reportsScanned: labReports.length,
        deficiencies,
        elevated,
        normal,
        nutritionalSummary
      };
    } catch (error: any) {
      console.error("getNutritionalInsightsTool error:", error);
      return {
        success: false,
        deficiencies: [],
        elevated: [],
        normal: [],
        message: "Failed to extract nutritional insights from reports."
      };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ TOOL 3: generate_meal_plan_template
// Rule-based personalized 7-day meal plan generator.
// Constructs breakfast, lunch, dinner, snacks adjusted for:
//   - vegtype (veg / non-veg / vegan / mixed)
//   - chronic diseases (diabetic-friendly, cardiac, renal, thyroid, PCOS)
//   - deficiencies (iron-rich, calcium-rich, B12 etc.)
//   - allergies (excluded from plan)
//   - BMI goal (reduce / maintain / gain)
// ─────────────────────────────────────────────────────────────────────────────
export const generateMealPlanTool = tool({
  name: "generate_meal_plan_template",
  description:
    "Generate a personalized 7-day meal plan template based on the user's diet type, BMI category, chronic diseases, nutritional deficiencies, allergies and health goals. The plan is structured (breakfast, lunch, dinner, snacks) and clinically informed.",
  parameters: z.object({
    dietType: z
      .enum(["veg", "non-veg", "vegan", "mixed"])
      .describe("User's diet preference"),
    bmiCategory: z
      .enum(["Underweight", "Normal", "Overweight", "Obese", "Unknown"])
      .describe("BMI category from lifestyle profile"),
    chronicDiseases: z
      .array(z.string())
      .describe("List of chronic conditions to tailor the plan"),
    deficiencies: z
      .array(z.string())
      .describe("Nutritional deficiencies from lab reports e.g. ['Vitamin D', 'Iron']"),
    allergies: z
      .array(z.string())
      .describe("Food allergies to exclude from the plan"),
    goal: z
      .enum(["lose_weight", "maintain", "gain_weight", "manage_condition"])
      .optional()
      .default("maintain")
      .describe("Primary dietary goal")
  }),
  execute: async ({ dietType, bmiCategory, chronicDiseases, deficiencies, allergies, goal }) => {
    const isVeg    = dietType === "veg" || dietType === "vegan";
    const isVegan  = dietType === "vegan";
    const diseases = chronicDiseases.map(d => d.toLowerCase());

    const isDiabetic     = diseases.some(d => d.includes("diabet") || d.includes("sugar"));
    const isCardiac      = diseases.some(d => d.includes("heart") || d.includes("cardiac") || d.includes("cholesterol"));
    const isRenal        = diseases.some(d => d.includes("kidney") || d.includes("renal"));
    const isThyroid      = diseases.some(d => d.includes("thyroid"));
    const isPCOS         = diseases.some(d => d.includes("pcos") || d.includes("polycystic"));
    const isAnemic       = diseases.some(d => d.includes("anemia")) || deficiencies.some(d => d.toLowerCase().includes("iron") || d.toLowerCase().includes("hemoglobin"));
    const hasVitD        = deficiencies.some(d => d.toLowerCase().includes("vitamin d"));
    const hasB12         = deficiencies.some(d => d.toLowerCase().includes("b12"));
    const hasLowCalcium  = deficiencies.some(d => d.toLowerCase().includes("calcium"));

    // ── Calorie targets by BMI + goal ────────────────────────────────────────
    const calorieTargets: Record<string, Record<string, number>> = {
      Underweight: { lose_weight: 1800, maintain: 2200, gain_weight: 2600, manage_condition: 2200 },
      Normal:      { lose_weight: 1600, maintain: 2000, gain_weight: 2400, manage_condition: 1900 },
      Overweight:  { lose_weight: 1400, maintain: 1800, gain_weight: 2000, manage_condition: 1700 },
      Obese:       { lose_weight: 1200, maintain: 1600, gain_weight: 1800, manage_condition: 1500 },
      Unknown:     { lose_weight: 1500, maintain: 1800, gain_weight: 2200, manage_condition: 1800 }
    };
    const dailyCaloriesTarget = (calorieTargets[bmiCategory] ?? calorieTargets["Unknown"]!)![goal ?? "maintain"];

    // ── Macro split by condition ────────────────────────────────────────────
    let macroSplit = { carbs: "50%", protein: "25%", fat: "25%" };
    if (isDiabetic)        macroSplit = { carbs: "35%", protein: "30%", fat: "35%" };
    else if (isCardiac)    macroSplit = { carbs: "50%", protein: "25%", fat: "25%" };
    else if (isPCOS)       macroSplit = { carbs: "40%", protein: "30%", fat: "30%" };
    else if (isRenal)      macroSplit = { carbs: "55%", protein: "15%", fat: "30%" };
    else if (goal === "lose_weight") macroSplit = { carbs: "40%", protein: "35%", fat: "25%" };
    else if (goal === "gain_weight") macroSplit = { carbs: "55%", protein: "30%", fat: "15%" };

    // ── Food pools by diet type ──────────────────────────────────────────────
    const proteinSources = isVegan
      ? ["tofu", "tempeh", "chickpeas", "black beans", "lentils", "edamame", "hemp seeds"]
      : isVeg
      ? ["paneer", "Greek yogurt", "eggs", "lentils", "chickpeas", "kidney beans", "tofu", "cottage cheese"]
      : ["grilled chicken breast", "fish (salmon/tuna)", "eggs", "lean turkey", "lentils", "paneer", "tofu"];

    const grainSources = isDiabetic
      ? ["oats", "quinoa", "barley", "ragi", "brown rice (small portion)"]
      : isRenal
      ? ["white rice", "white bread", "semolina (small portion)"] // low-potassium
      : ["brown rice", "whole wheat roti", "oats", "quinoa", "millets"];

    const vegetableSources = isRenal
      ? ["cauliflower", "cabbage", "green beans", "cucumber", "carrot"] // low-potassium
      : ["spinach", "broccoli", "kale", "carrots", "bell peppers", "zucchini", "tomatoes", "cucumber", "green peas"];

    const fruitSources = isDiabetic
      ? ["guava", "berries", "papaya", "kiwi", "apple (small)"] // low glycemic
      : ["banana", "mango", "apple", "orange", "watermelon", "papaya", "berries"];

    const fatSources = isCardiac
      ? ["avocado", "olive oil", "walnuts", "flaxseeds", "chia seeds"]
      : ["ghee (small amount)", "almonds", "walnuts", "coconut oil", "olive oil"];

    // ── Iron-rich additions ──────────────────────────────────────────────────
    const ironBoosts = isAnemic
      ? (isVeg ? ["spinach", "beetroot", "sesame seeds", "pumpkin seeds", "raisins"] : ["liver (small portion)", "red meat (twice/week)", "spinach", "beetroot"])
      : [];

    // ── Allergy exclusions ───────────────────────────────────────────────────
    const lowerAllergies = allergies.map(a => a.toLowerCase());
    const filterAllergies = (foods: string[]) =>
      foods.filter(f => !lowerAllergies.some(a => f.toLowerCase().includes(a)));

    const safeProteins = filterAllergies(proteinSources);
    const safeGrains   = filterAllergies(grainSources);
    const safeVegs     = filterAllergies(vegetableSources);
    const safeFruits   = filterAllergies(fruitSources);
    const safeFats     = filterAllergies(fatSources);

    // ── 7-Day Meal Plan ──────────────────────────────────────────────────────
    const pick = (arr: string[], n: number) => arr.slice(0, n).join(" + ");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const mealPlan = days.map((day, i) => ({
      day,
      breakfast: isDiabetic
        ? `${safeGrains[i % safeGrains.length]} with ${pick(safeProteins, 1)} and ${safeFruits[i % safeFruits.length]}`
        : `${safeGrains[i % safeGrains.length]} with ${pick(safeProteins, 1)} and any seasonal fruit`,
      lunch: `${safeGrains[(i + 1) % safeGrains.length]} + ${safeProteins[(i + 1) % safeProteins.length]} + ${safeVegs[(i % safeVegs.length)]} sabzi${isCardiac ? " (steamed/grilled, low oil)" : ""}`,
      dinner: isRenal
        ? `${safeGrains[(i + 2) % safeGrains.length]} + ${safeProteins[(i + 2) % safeProteins.length]} (small portion) + ${safeVegs[(i + 1) % safeVegs.length]}`
        : `${safeGrains[(i + 2) % safeGrains.length]} + ${safeProteins[(i + 2) % safeProteins.length]} + green salad`,
      snacks: [
        `${safeFruits[i % safeFruits.length]} + a handful of ${safeFats[i % safeFats.length]}`,
        ...(ironBoosts.length > 0 ? [`Iron fix: ${ironBoosts[i % ironBoosts.length]} + Vitamin C fruit`] : []),
        ...(hasVitD ? ["Fortified milk / mushrooms (sun-exposed) as evening snack"] : []),
        ...(hasB12 && !isVegan ? ["B12 source: yogurt / eggs / fish in evening"] : [])
      ]
    }));

    // ── Foods to prioritize & avoid ────────────────────────────────────────
    const foodsToPrioritize: string[] = [
      ...safeProteins.slice(0, 3),
      ...safeVegs.slice(0, 4),
      ...safeFats.slice(0, 2)
    ];
    const foodsToAvoid: string[] = [];
    if (isDiabetic)   foodsToAvoid.push("White rice (large portions)", "Maida/refined flour", "Sugary drinks", "Fruit juices", "Potatoes (excess)");
    if (isCardiac)    foodsToAvoid.push("Trans fats / vanaspati", "Fried foods", "Full-fat dairy", "Processed meats", "Excess salt");
    if (isRenal)      foodsToAvoid.push("Bananas", "Potatoes", "Tomatoes (excess)", "Oranges", "Excess protein", "Salt/sodium");
    if (isPCOS)       foodsToAvoid.push("Refined carbs", "Dairy (excess)", "Processed sugar");
    if (isThyroid)    foodsToAvoid.push("Raw cruciferous (excess)", "Soy (excess)", "Processed foods");
    foodsToAvoid.push(...allergies.map(a => `${a} (allergy)`));

    // ── Hydration & supplement notes ──────────────────────────────────────
    const hydrationGoal = bmiCategory === "Obese"
      ? "3–3.5 litres of water per day (body weight based)"
      : bmiCategory === "Overweight"
      ? "2.5–3 litres per day"
      : "2–2.5 litres per day";

    const supplementNotes: string[] = [];
    if (hasVitD)       supplementNotes.push("Vitamin D supplement may be needed — consult your doctor");
    if (hasB12)        supplementNotes.push("Vitamin B12 supplement recommended — especially if vegetarian/vegan");
    if (isAnemic)      supplementNotes.push("Iron supplement + Vitamin C pairing recommended (avoid tea/coffee after iron-rich meals)");
    if (hasLowCalcium) supplementNotes.push("Calcium-rich foods: milk, fortified plant milk, sesame seeds, ragi");

    return {
      success: true,
      dailyCaloriesTarget,
      macroSplit,
      mealPlan,
      foodsToPrioritize,
      foodsToAvoid,
      hydrationGoal,
      supplementNotes,
      planNotes: [
        isDiabetic  ? "🩸 Diabetic plan: low glycemic index foods prioritized, portion control key" : null,
        isCardiac   ? "❤️ Cardiac plan: low sodium, high omega-3, no trans fats" : null,
        isRenal     ? "🫘 Renal plan: low potassium and phosphorus, protein restricted" : null,
        isPCOS      ? "🌸 PCOS plan: low-carb, high-protein, anti-inflammatory focus" : null,
        isThyroid   ? "🦋 Thyroid plan: iodine-rich foods, limit raw goitrogens" : null,
        isAnemic    ? "🩸 Anemia plan: iron + Vitamin C pairing at every meal" : null
      ].filter(Boolean)
    };
  }
});
