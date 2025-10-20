"use client";

import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { resolveScheduleConflicts, ResolveScheduleConflictsOutput } from "@/ai/flows/resolve-schedule-conflicts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle, Wand2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  schedules: z.string().min(1, "Schedules data is required."),
  constraints: z.string().min(1, "Constraints data is required."),
});

const exampleSchedules = `
- Dr. Reed (CS-301, CS-405): Available Mon 9-1, Wed 11-3, Fri 10-12.
- Prof. Miles (IS-212): Available Mon 11-1, Tue 2-4. Room LT-01 booked Mon 9-11 for CS-301.
- Student Group A: Takes CS-301, IS-212.
- Class CS-301 (Dr. Reed): Scheduled Mon 9-11 in LT-01.
- Class IS-212 (Prof. Miles): Scheduled Mon 9-11 in CR-02.
`.trim();

const exampleConstraints = `
- Student Group A cannot have back-to-back classes.
- Dr. Reed prefers morning slots.
- IS-212 must be in a room with at least 30 seats.
`.trim();


export default function ResolveConflictsClient() {
  const [result, setResult] = useState<ResolveScheduleConflictsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schedules: "",
      constraints: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setResult(null);

    try {
      const response = await resolveScheduleConflicts(values);
      setResult(response);
    } catch (e) {
      setError("An error occurred while resolving conflicts. Please try again.");
      console.error(e);
    }
  };
  
  const handlePrefill = () => {
    form.setValue("schedules", exampleSchedules);
    form.setValue("constraints", exampleConstraints);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 className="text-primary"/>
            AI Conflict Resolution Tool
          </CardTitle>
          <CardDescription>
            Enter schedule data and constraints, then let our AI assistant detect clashes and propose solutions.
            <Button variant="link" onClick={handlePrefill} className="px-1 h-auto">
              Use example data.
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="schedules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedules Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste or type schedules here. Include lecturer availability, student classes, and room bookings."
                        className="min-h-[150px] font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="constraints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constraints</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Specify any constraints, e.g., 'Dr. Smith cannot teach on Fridays', 'No classes after 5 PM'."
                        className="min-h-[100px] font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Resolve Conflicts"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isSubmitting && (
        <div className="flex items-center justify-center rounded-lg border p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">AI is thinking...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Detected Conflicts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm text-foreground font-sans">{result.conflicts}</pre>
            </CardContent>
          </Card>
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                Proposed Solutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm text-foreground font-sans">{result.proposedSolutions}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
