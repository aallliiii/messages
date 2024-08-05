import { resend } from "@/lib/resend"; // Ensure correct import path

import VerificationEmail from "../../emails/emailVerification"; // Ensure the path and export are correct

import { ApiResponse } from "@/types/ApiResponse"; // Ensure this type is defined correctly

export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Sending the email using Resend API
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // Ensure this email is correctly configured and authorized
      to: [email], // Recipient's email
      subject: "Verification Code", // Email subject
      react: VerificationEmail({ username, otp: verifyCode }), // Render email content using React component or function
    });
    return {
      success: true,
      message: "Verification email sent successfully", // Corrected "send" to "sent"
    };
  } catch (error) {
    console.error("Error sending verification email", error); // Log error for debugging
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
