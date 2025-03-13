export interface Student {
  id: string;
  name: string;
  course: string;
  division: string;
  dni: string;
  attendanceRecords: AttendanceRecord[];
}

export interface AttendanceRecord {
  date: string;
  present: boolean;
  time?: string;
  type: AttendanceType;
  absence_value: number;
  details?: string;
  exit_time?: string;
}

export type AttendanceType = 
  | 'regular'
  | 'physical_education'
  | 'late_arrival'
  | 'early_exit'
  | 'sports_activity'
  | 'academic_activity'
  | 'medical'
  | 'justified'
  | 'unjustified';

export const attendanceTypes = [
  { id: 'regular', label: 'Regular', value: 1.0 },
  { id: 'physical_education', label: 'Educación Física', value: 0.5 },
  { id: 'late_arrival', label: 'Llegada Tarde', value: 0.25 },
  { id: 'early_exit', label: 'Salida Anticipada', value: 0 },
  { id: 'sports_activity', label: 'Actividad Deportiva', value: 0 },
  { id: 'academic_activity', label: 'Actividad Académica', value: 0 },
  { id: 'medical', label: 'Médica', value: 1.0 },
  { id: 'justified', label: 'Justificada', value: 1.0 },
  { id: 'unjustified', label: 'Injustificada', value: 1.0 }
];

export interface Course {
  year: string;
  division: string;
}

export const divisions = ["I", "II", "III"];
export const years = [1, 2, 3, 4, 5, 6];

export const getCourseKey = (year: string, division: string): string => {
  return `${year}-${division}`;
};