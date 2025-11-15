
'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Class as TimetableEntry } from '@/lib/data-contracts';
import { differenceInMinutes } from 'date-fns';
import { BellRing } from 'lucide-react';

interface UpcomingClassNotificationProps {
  schedule: TimetableEntry[];
}

const NOTIFICATION_WINDOW_MINUTES = 60; // Notify if class is within 60 minutes
const SESSION_STORAGE_KEY = 'classSyncUpcomingNotificationShown';

export default function UpcomingClassNotification({ schedule }: UpcomingClassNotificationProps) {
  const { toast } = useToast();
  const notifiedRef = useRef(false);

  useEffect(() => {
    // Check if a notification has already been shown in this session
    const hasBeenNotifiedInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!schedule || schedule.length === 0 || notifiedRef.current || hasBeenNotifiedInSession) {
      return;
    }

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });

    const upcomingClass = schedule
      .filter(c => c.day === today)
      .find(c => {
        const classStartTime = c.startTime.toDate();
        const diff = differenceInMinutes(classStartTime, now);
        // Check if class is in the future but within the notification window
        return diff > 0 && diff <= NOTIFICATION_WINDOW_MINUTES;
      });

    if (upcomingClass) {
      notifiedRef.current = true; // Mark as notified for this component instance lifecycle
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true'); // Mark as notified for the browser session

      toast({
        title: (
            <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                <span className="font-headline">Upcoming Class Reminder</span>
            </div>
        ),
        description: `Your class, ${upcomingClass.unitCode} (${upcomingClass.unitName}), is starting soon in ${upcomingClass.room}.`,
        duration: 10000, // Keep the toast visible for 10 seconds
      });
    }
  }, [schedule, toast]);

  // This component does not render anything to the DOM
  return null;
}
