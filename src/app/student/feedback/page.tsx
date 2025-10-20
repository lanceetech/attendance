"use client";

import { useEffect, useActionState } from "react";
import { useForm } from "react-hook-form";
import { DashboardHeader } from "@/components/dashboard-header";
import { users } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback, FeedbackState } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const initialState: FeedbackState = {
  message: "",
  status: "idle",
};

export default function FeedbackPage() {
  const currentUser = users.student;
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitFeedback, initialState);
  const { reset } = useForm();

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: "Feedback Submitted",
        description: state.message,
      });
      reset();
    } else if (state.status === 'error') {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, reset]);

  return (
    <>
      <DashboardHeader title="Report an Issue" user={currentUser} />
      <main className="p-4 sm:p-6 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Submit Feedback</CardTitle>
            <CardDescription>
              Found an error in your timetable? Let the administration know.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <Textarea
                name="feedback"
                placeholder="Please describe the issue in detail..."
                className="min-h-[150px]"
                required
              />
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
