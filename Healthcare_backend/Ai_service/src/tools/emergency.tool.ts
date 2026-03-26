import { tool } from "@openai/agents";
import { z } from "zod";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { UserProfile } from "../models/userprofile.model.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const triggerEmergencyAlertsTool = tool({
  name: "trigger_emergency_alerts",
  description: "Trigger emergency alerts (WhatsApp and Email) to the user's emergency contact.",
  parameters: z.object({
    userId: z.string().describe("The user's MongoDB ObjectId.")
  }),
  execute: async ({ userId }) => {
    try {
      const userProfile = await UserProfile.findOne({ userId });
      const user = await User.findById(userId);

      if (!userProfile) {
        return "User profile not found. Cannot send emergency alerts.";
      }

      const patientName = user?.name || "Your contact";

      const { emergencyContact } = userProfile;

      if (!emergencyContact || (!emergencyContact.phone && !emergencyContact.email)) {
        return "No emergency contact information found in the user profile.";
      }

      const actionsTaken: string[] = [];

      // Send WhatsApp via Twilio
      if (emergencyContact.phone) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        
        if (accountSid && authToken) {
          const client = twilio(accountSid, authToken);
          let formattedPhone = emergencyContact.phone;
          if (!formattedPhone.startsWith('+')) {
              formattedPhone = `+916260976750`; 
          }

          try {
            const emergencyMessage = `CRITICAL ALERT: ${patientName} has triggered an emergency protocol via HealthBrain AI. Please reach out to them immediately.`;
            await client.messages.create({
               contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
               contentVariables: JSON.stringify({ "1": emergencyMessage }),
               from: "whatsapp:+14155238886", 
               to: `whatsapp:+916260976750`
            });
            actionsTaken.push(`WhatsApp emergency message sent to ${formattedPhone}.`);
          } catch (twilioError: any) {
            console.error("Twilio Error:", twilioError);
            actionsTaken.push(`Failed to send WhatsApp message: ${twilioError.message}`);
          }
        } else {
          actionsTaken.push("Twilio credentials not configured.");
        }
      }

      // Send Email via Nodemailer
      if (emergencyContact.email) {
        if (process.env.EMAIL && process.env.EMAIL_PASSWORD) {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
              }
            });

            const mailOptions = {
              from: process.env.EMAIL,
              to: emergencyContact.email,
              subject: `URGENT: Emergency Alert for ${patientName}`,
              text: `CRITICAL ALERT\n\n${patientName} has triggered an emergency protocol via the HealthBrain AI system. Please reach out to them immediately.\n\nThank you, HealthBrain Team.`
            };

            await transporter.sendMail(mailOptions);
            actionsTaken.push(`Emergency email sent to ${emergencyContact.email}.`);
          } catch (emailError: any) {
            console.error("Mail Error:", emailError);
            actionsTaken.push(`Failed to send Email: ${emailError.message}`);
          }
        } else {
           actionsTaken.push("Email credentials not configured.");
        }
      }

      return `Emergency alerts dispatch completed. Summary: ${actionsTaken.join(" ")}`;
    } catch (error: any) {
      console.error("Error in triggerEmergencyAlertsTool:", error);
      return `An error occurred while dispatching emergency alerts: ${error.message}`;
    }
  }
});
