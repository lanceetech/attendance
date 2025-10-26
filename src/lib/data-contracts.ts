import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  uid: string;
  name: string;
  role: 'admin' | 'lecturer' | 'student';
  email: string;
  avatar?: string;
}

export type Unit = {
  id: string;
  name: string;
  description: string;
  code: string;
}

export type Class = {
  id: string;
  unitId: string;
  lecturerId: string;
  lecturerName: string;
  roomId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  day: string;
  time: string;
  unitCode: string;
  unitName: string;
  room: string;
};

export type Classroom = {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'In Use' | 'Maintenance';
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: Timestamp;
  status: 'Present' | 'Absent' | 'Late';
};

export type Feedback = {
  id: string;
  userId: string;
  message: string;
  timestamp: Timestamp;
};
