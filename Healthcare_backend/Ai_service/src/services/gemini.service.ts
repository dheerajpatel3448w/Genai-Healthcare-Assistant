
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

export const Imagetotext = async (cloudinaryUrl: string): Promise<string|undefined> => {
    const ai = new GoogleGenAI({});

    // Fetch image from Cloudinary URL
    const response = await axios.get(cloudinaryUrl, {
        responseType: "arraybuffer",
    });

    // Convert buffer to base64
    const base64ImageFile = Buffer.from(response.data).toString("base64");

    // Determine MIME type from URL or response headers
    const mimeType = response.headers["content-type"] || "image/jpeg";

    const contents = [
        {
            inlineData: {
                mimeType: mimeType,
                data: base64ImageFile,
            },
        },
        {
            text: `
    You are a document text extraction system.

Your task is to read the medical report image and extract all visible text exactly as it appears.

Rules:

* Do NOT analyze the report.
* Do NOT summarize.
* Do NOT interpret medical values.
* Do NOT change wording or numbers.
* Preserve the original order of the text.
* Preserve line breaks as much as possible.

Return only the extracted text and analysis data.

Do not include explanations or extra comments.

    `,
        },
    ];

    const geminiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
    });
    console.log(geminiResponse.text);

    return geminiResponse.text;
};

// Analyze combined text and extract report details
export const analyzeExtractedText = async (combinedText: string): Promise<{
  reportName: string;
  reportType: "lab" | "imaging" | "clinical";
  analysis: any;
}> => {
  const ai = new GoogleGenAI({});

  const analysisPrompt = `
You are a medical report analyzer. Analyze the following combined extracted text from medical report images and provide:

1. reportName: A descriptive name for this medical report
2. reportType: Classify as one of these: "lab", "imaging", or "clinical"
3. analysis: A detailed analysis object with any findings, parameters, conditions detected, and summary

IMPORTANT: Return response as valid JSON only, no markdown or extra text.

Return this exact JSON structure:
{
  "reportName": "string - descriptive name",
  "reportType": "lab|imaging|clinical",
  "analysis": {
    "parameters": [     objects with name, value, unit (if applicable) ],
    "findings": ["finding 1", "finding 2"],
    "conditionDetected": "main condition or 'None detected'",
    "summary": "Overall summary of the report"
  }
}

Medical Report Text:
${combinedText}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: analysisPrompt,
        },
      ],
    });

    const responseText = response.text;
    console.log("Gemini Analysis Response:", responseText);

    if (!responseText) {
      throw new Error("Gemini returned empty response");
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Gemini response");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return {
      reportName: parsedData.reportName || "Medical Report",
      reportType: (["lab", "imaging", "clinical"].includes(parsedData.reportType) 
        ? parsedData.reportType 
        : "clinical") as "lab" | "imaging" | "clinical",
      analysis: parsedData.analysis || {},
    };
  } catch (error) {
    console.error("Error analyzing extracted text:", error);
    
    // Return default structure on error
    return {
      reportName: "Medical Report",
      reportType: "clinical",
      analysis: {
        summary: combinedText.substring(0, 500) + "...",
      },
    };
  }
};
        