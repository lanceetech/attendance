"use server";

import { z } from "zod";

const feedbackSchema = z.object({
  feedback: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
});

export type FeedbackState = {
  message: string;
  status: "success" | "error" | "idle";
};

export async function submitFeedback(
  prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  const validatedFields = feedbackSchema.safeParse({
    feedback: formData.get("feedback"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.feedback?.[0] || 'Invalid input.',
      status: "error",
    };
  }

  // In a real application, you would save this to a database.
  console.log("Feedback received:", validatedFields.data.feedback);

  return {
    message: "Thank you for your feedback!",
    status: "success",
  };
}
