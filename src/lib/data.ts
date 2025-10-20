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
  lecturer: { name: 'Dr. Jackson', role: 'Lecturer', avatar: 'lecturer_avatar' },
  student: { name: 'Alex Johnson', role: 'Student', avatar: 'student_avatar' },
};

export const lecturerTimetable: TimetableEntry[] = [
  { id: 'lt1', day: 'Monday', time: '08:00 - 11:00', unitCode: 'BUS-2121', unitName: 'Introduction to Business', lecturer: 'Dr. Jackson', room: 'VCDL 5' },
  { id: 'lt2', day: 'Wednesday', time: '08:00 - 11:00', unitCode: 'ECO-2125', unitName: 'Introduction to Economics', lecturer: 'Dr. Jackson', room: 'VCDL 7' },
];

export const studentTimetable: TimetableEntry[] = [
    { id: 'st1', day: 'Monday', time: '08:00 - 11:00', unitCode: 'BUS-2121', unitName: 'Introduction to Business', lecturer: 'Dr. Jackson', room: 'VCDL 5' },
    { id: 'st2', day: 'Monday', time: '11:00 - 14:00', unitCode: 'CMN-2112', unitName: 'Life Skills', lecturer: 'Ms Maguta', room: 'VCDL 7' },
    { id: 'st3', day: 'Tuesday', time: '08:00 - 11:00', unitCode: 'CSC-2111', unitName: 'Introduction to Computing', lecturer: 'Mariam Heroe', room: 'Lab 1' },
    { id: 'st4', day: 'Wednesday', time: '08:00 - 11:00', unitCode: 'ECO-2125', unitName: 'Introduction to Economics', lecturer: 'Dr. Jackson', room: 'VCDL 7' },
    { id: 'st5', day: 'Thursday', time: '14:00 - 17:00', unitCode: 'MTH-2115', unitName: 'Business Statistics', lecturer: 'Dr. Joseph Munyao', room: 'LH 125' },
    { id: 'st6', day: 'Friday', time: '10:00 - 12:00', unitCode: 'CS-405', unitName: 'AI & Machine Learning', lecturer: 'Dr. Evelyn Reed', room: 'CR-05' },
];

export const classrooms: Classroom[] = [
  { id: 'cr1', name: 'VCDL 5', capacity: 150, status: 'In Use' },
  { id: 'cr2', name: 'VCDL 7', capacity: 40, status: 'In Use' },
  { id: 'cr3', name: 'LH 118', capacity: 40, status: 'Available' },
  { id: 'cr4', name: 'Lab 1', capacity: 120, status: 'Available' },
  { id: 'cr5', name: 'VCDL 1', capacity: 30, status: 'Maintenance' },
  { id: 'cr6', name: 'LH 125', capacity: 30, status: 'Available' },
];

export const courseUnits: CourseUnit[] = [
    { id: 'cu1', code: 'BUS-2121', name: 'Introduction to Business', lecturer: 'Dr. Jackson', year: 2, semester: 1 },
    { id: 'cu2', code: 'CMN-2112', name: 'Life Skills', lecturer: 'Ms Maguta', year: 2, semester: 1 },
    { id: 'cu3', code: 'CSC-2111', name: 'Introduction to Computing', lecturer: 'Mariam Heroe', year: 2, semester: 1 },
    { id: 'cu4', code: 'ECO-2125', name: 'Introduction to Economics', lecturer: 'Dr. Jackson', year: 2, semester: 1 },
    { id: 'cu5', code: 'MTH-2115', name: 'Business Statistics', lecturer: 'Dr. Joseph Munyao', year: 2, semester: 1 },
];
