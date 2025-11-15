
"use client";

import { useForm } from "react-hook-form";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useUserProfile } from "@/hooks/use-user-profile";


const feedbackSchema = z.object({
  feedback: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
});

export default function FeedbackPage() {
  const { user, profile } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
    },
  });

  const onSubmit = (values: z.infer<typeof feedbackSchema>) => {
    if (!user || !firestore || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    const feedbackRef = collection(firestore, "feedback");
    addDocumentNonBlocking(feedbackRef, {
      userId: user.uid,
      userName: profile.name,
      userRole: profile.role,
      userEmail: profile.email,
      message: values.feedback,
      timestamp: serverTimestamp(),
    }).then(() => {
        toast({
            title: "Feedback Submitted",
            description: "Thank you for your feedback!",
        });
        form.reset();
    });
  };


  return (
    <>
      <DashboardHeader title="Report an Issue" />
      <main className="p-4 sm:p-6 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Submit Feedback</CardTitle>
            <CardDescription>
              Report any timetable errors or inconsistencies directly to the administration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the issue in detail..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
