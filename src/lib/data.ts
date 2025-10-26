
// This file is now deprecated and will be removed in a future update.
// All data is now fetched from Firestore.

import { Timestamp } from "firebase/firestore";


export type User = {
  uid: string;
  name: string;
  role: 'Admin' | 'Lecturer' | 'Student';
  avatar?: string;
};

export type TimetableEntry = {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  room: string;
};

export type Classroom = {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'In Use' | 'Maintenance';
};

export type CourseUnit = {
  id: string;
  code: string;
  name:string;
  lecturer: string;
  year: number;
  semester: number;
};

export type AttendanceRecord = {
    id: string;
    studentId: string;
    studentName: string;
    timestamp: Timestamp;
    status: 'Present' | 'Absent' | 'Late';
};
