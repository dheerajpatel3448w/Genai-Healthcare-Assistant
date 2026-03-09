import {run } from '@openai/agents';
import {  type IReport } from '../models/report.model.js';

import { Clinical_Report_Specialist } from '../Agents/clinicalreportspecialist.agent.js';
import { Imaging_Report_Specialist } from '../Agents/Imagingreportspecialist.agent.js';
import { Lab_Report_Specialist } from '../Agents/labreportspecialist.agent.js';
import { Final_Medical_Synthesizer } from '../Agents/MedicalSynthesizer.agent.js';

export const Agentservice = async(reports:IReport[]) => {
    const labReports = [];
const imagingReports = [];
const clinicalReports = [];

for (const report of reports) {
  if (report.reportType === "lab") {
    labReports.push(report);
  } 
  else if (report.reportType === "imaging") {
    imagingReports.push(report);
  } 
  else if (report.reportType === "clinical") {
    clinicalReports.push(report);
  }
}

const labPromises = labReports.map(async (report) => {
  const result = await run(Lab_Report_Specialist, `${report}`);
  report.analysis = result.finalOutput;
 await report.save();
  return {
    id: report._id,
    reportName: report.reportName,
    reportType: report.reportType,
    analysis: result.finalOutput
  };
});
const imagingPromises = imagingReports.map(async (report) => {
  const result = await run(Imaging_Report_Specialist, `${report}`);
    report.analysis = result.finalOutput;
 await report.save();
  return {
    id: report._id,
    reportName: report.reportName,
    reportType: report.reportType,
    analysis: result.finalOutput
  };
});
const clinicalPromises = clinicalReports.map(async (report) => {
  const result = await run(Clinical_Report_Specialist, `${report}`);
 report.analysis = result.finalOutput;
 await report.save();
  return {
    id: report._id,
    reportName: report.reportName,
    reportType: report.reportType,
    analysis: result.finalOutput
  };
});

const [labResults, imagingResults, clinicalResults] = await Promise.all([
  Promise.all(labPromises),
  Promise.all(imagingPromises),
  Promise.all(clinicalPromises)
]);

 

  // STEP 3: combine results
  const combinedResults = {
    lab_reports: labResults,
    imaging_reports: imagingResults,
    clinical_reports: clinicalResults
  };

  // STEP 4: run final synthesizer agent

  const finalResult = await run(
    Final_Medical_Synthesizer,
    JSON.stringify(combinedResults)
  );

  return {
    finalAnalysis: finalResult.finalOutput,
    combinedResults
  };

}
