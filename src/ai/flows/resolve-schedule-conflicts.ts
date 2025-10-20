'use server';

/**
 * @fileOverview Resolves schedule conflicts using AI by detecting clashes and proposing alternative time slots.
 *
 * - resolveScheduleConflicts - A function that handles the schedule conflict resolution process.
 * - ResolveScheduleConflictsInput - The input type for the resolveScheduleConflicts function.
 * - ResolveScheduleConflictsOutput - The return type for the resolveScheduleConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResolveScheduleConflictsInputSchema = z.object({
  schedules: z.string().describe('The schedules data to analyze, including lecturer availability, student class times, and room usage.'),
  constraints: z.string().describe('Constraints such as preferred time slots or lecturers.'),
});
export type ResolveScheduleConflictsInput = z.infer<typeof ResolveScheduleConflictsInputSchema>;

const ResolveScheduleConflictsOutputSchema = z.object({
  conflicts: z.string().describe('The detected timetable clashes.'),
  proposedSolutions: z.string().describe('Proposed alternative time slots to resolve the clashes.'),
});
export type ResolveScheduleConflictsOutput = z.infer<typeof ResolveScheduleConflictsOutputSchema>;

export async function resolveScheduleConflicts(input: ResolveScheduleConflictsInput): Promise<ResolveScheduleConflictsOutput> {
  return resolveScheduleConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resolveScheduleConflictsPrompt',
  input: {schema: ResolveScheduleConflictsInputSchema},
  output: {schema: ResolveScheduleConflictsOutputSchema},
  prompt: `You are an AI assistant specialized in resolving timetable clashes in academic institutions. Analyze the provided schedules and constraints to detect conflicts and propose alternative time slots to resolve them.

Schedules: {{{schedules}}}
Constraints: {{{constraints}}}

Based on the schedules and constraints, identify any timetable clashes and suggest alternative time slots to resolve these conflicts. Clearly list the detected conflicts and provide detailed, actionable solutions for each.

Output the detected conflicts and proposed solutions.

Conflicts:
Proposed Solutions: `,
});

const resolveScheduleConflictsFlow = ai.defineFlow(
  {
    name: 'resolveScheduleConflictsFlow',
    inputSchema: ResolveScheduleConflictsInputSchema,
    outputSchema: ResolveScheduleConflictsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
