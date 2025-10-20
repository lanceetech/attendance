export type User = {
  name: string;
  role: 'Admin' | 'Lecturer' | 'Student';
  avatar: string;
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
  name: string;
  lecturer: string;
  year: number;
  semester: number;
};

export const users = {
  admin: { name: 'Admin User', role: 'Admin', avatar: 'admin_avatar' },
  lecturer: { name: 'Dr. Evelyn Reed', role: 'Lecturer', avatar: 'lecturer_avatar' },
  student: { name: 'Alex Johnson', role: 'Student', avatar: 'student_avatar' },
};

export const lecturerTimetable: TimetableEntry[] = [
  { id: 'lt1', day: 'Monday', time: '09:00 - 11:00', unitCode: 'CS-301', unitName: 'Advanced Algorithms', lecturer: 'Dr. Evelyn Reed', room: 'LT-01' },
  { id: 'lt2', day: 'Tuesday', time: '14:00 - 16:00', unitCode: 'CS-405', unitName: 'AI & Machine Learning', lecturer: 'Dr. Evelyn Reed', room: 'CR-05' },
  { id: 'lt3', day: 'Wednesday', time: '11:00 - 13:00', unitCode: 'CS-301', unitName: 'Advanced Algorithms', lecturer: 'Dr. Evelyn Reed', room: 'LT-01' },
  { id: 'lt4', day: 'Friday', time: '10:00 - 12:00', unitCode: 'CS-405', unitName: 'AI & Machine Learning', lecturer: 'Dr. Evelyn Reed', room: 'CR-05' },
];

export const studentTimetable: TimetableEntry[] = [
    { id: 'st1', day: 'Monday', time: '09:00 - 11:00', unitCode: 'CS-301', unitName: 'Advanced Algorithms', lecturer: 'Dr. Evelyn Reed', room: 'LT-01' },
    { id: 'st2', day: 'Monday', time: '11:00 - 13:00', unitCode: 'IS-212', unitName: 'Database Systems', lecturer: 'Prof. Ken Miles', room: 'CR-02' },
    { id: 'st3', day: 'Tuesday', time: '14:00 - 16:00', unitCode: 'CS-405', unitName: 'AI & Machine Learning', lecturer: 'Dr. Evelyn Reed', room: 'CR-05' },
    { id: 'st4', day: 'Wednesday', time: '09:00 - 11:00', unitCode: 'SE-300', unitName: 'Software Engineering', lecturer: 'Dr. Ian Bell', room: 'LT-04' },
    { id: 'st5', day: 'Thursday', time: '13:00 - 15:00', unitCode: 'IS-212', unitName: 'Database Systems', lecturer: 'Prof. Ken Miles', room: 'CR-02' },
    { id: 'st6', day: 'Friday', time: '10:00 - 12:00', unitCode: 'CS-405', unitName: 'AI & Machine Learning', lecturer: 'Dr. Evelyn Reed', room: 'CR-05' },
];

export const classrooms: Classroom[] = [
  { id: 'cr1', name: 'LT-01', capacity: 150, status: 'In Use' },
  { id: 'cr2', name: 'CR-05', capacity: 40, status: 'In Use' },
  { id: 'cr3', name: 'CR-02', capacity: 40, status: 'Available' },
  { id: 'cr4', name: 'LT-04', capacity: 120, status: 'Available' },
  { id: 'cr5', name: 'Lab-01', capacity: 30, status: 'Maintenance' },
  { id: 'cr6', name: 'Lab-02', capacity: 30, status: 'Available' },
];

export const courseUnits: CourseUnit[] = [
    { id: 'cu1', code: 'CS-301', name: 'Advanced Algorithms', lecturer: 'Dr. Evelyn Reed', year: 3, semester: 1 },
    { id: 'cu2', code: 'CS-405', name: 'AI & Machine Learning', lecturer: 'Dr. Evelyn Reed', year: 4, semester: 1 },
    { id: 'cu3', code: 'IS-212', name: 'Database Systems', lecturer: 'Prof. Ken Miles', year: 2, semester: 2 },
    { id: 'cu4', code: 'SE-300', name: 'Software Engineering', lecturer: 'Dr. Ian Bell', year: 3, semester: 1 },
    { id: 'cu5', code: 'CS-101', name: 'Intro to Programming', lecturer: 'Dr. Ada Lovelace', year: 1, semester: 1 },
];
