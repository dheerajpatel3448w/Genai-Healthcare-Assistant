import { Worker } from "bullmq";
import { Imagetotext, analyzeExtractedText } from "../services/gemini.service.js";
import { saveReport } from "../services/report.service.js";
import { sendMessageToUser } from "../socket.js";

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`;

// Create worker for text extraction jobs
export const textExtractionWorker = new Worker(
  "text-extraction",
  async (job) => {
    const { files, totalFiles, userId } = job.data;

    console.log(`Processing ${totalFiles} images in single job...`);

    try {
      // Process all images and call Gemini for each
      const extractedResults = await Promise.all(
        files.map(async (file: any, index: number) => {
          console.log(`Processing image ${index + 1}/${totalFiles}: ${file.fileId}`);
          
          const extractedText = await Imagetotext(file.cloudinaryUrl);
          
          return {
            fileId: file.fileId,
            originalname: file.originalname,
            cloudinaryUrl: file.cloudinaryUrl,
            extractedText: extractedText,
            imageIndex: index + 1,
          };
        })
      );

      // Combine all extracted text
      const combinedText = extractedResults
        .map((result: any) => `--- Image ${result.imageIndex}: ${result.originalname} ---\n${result.extractedText}`)
        .join("\n\n");

      // Analyze combined text and get report structure
      console.log("Analyzing combined text...");
      const reportData = await analyzeExtractedText(combinedText);

      // Save report to database if userId is provided
      let savedReportId = null;
      if (userId) {
        try {
          const savedReport = await saveReport(
            userId,
            reportData.reportName || "Untitled Report",
            reportData.reportType || "lab",
            extractedResults[0]?.cloudinaryUrl || "",
            combinedText,
            reportData.analysis || {}
          );
          savedReportId = savedReport._id;
          console.log(`Report successfully saved to database with ID: ${savedReportId}`);
        } catch (dbError: any) {
          console.error("Error saving report to database:", dbError.message);
          // Continue processing even if DB save fails
        }
      }

      return {
        success: true,
        totalFiles: totalFiles,
        processedFiles: extractedResults.length,
        combinedText: combinedText,
        reportName: reportData.reportName,
        reportType: reportData.reportType,
        analysis: reportData.analysis,
        savedReportId: savedReportId,
        results: extractedResults,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error processing images:`, error);
      throw error;
    }
  },
  {
    connection: {
      url: redisUrl,
    } as any,
    concurrency: 1, // Process one job at a time (it handles multiple images internally)
  }
);

// Worker event handlers
textExtractionWorker.on("completed", (job, returnvalue) => {
  console.log(`Worker: Job ${job.id} completed successfully`);
  
  if (job?.data?.userId) {
    sendMessageToUser(job.data.userId, {
      event: "task:completed",
      data: {
        success: true,
        jobId: job.id,
        message: "Your image extraction task has been completed.",
        result: returnvalue // Contains the extracted report id and data
      }
    });
  }
});

textExtractionWorker.on("failed", (job, err) => {
  console.log(`Worker: Job ${job?.id} failed with error:`, err.message);
  
  if (job?.data?.userId) {
    sendMessageToUser(job.data.userId, {
      event: "task:failed",
      data: {
        success: false,
        jobId: job?.id,
        message: "Your image extraction task failed.",
        error: err.message
      }
    });
  }
});

export default textExtractionWorker;
