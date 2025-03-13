import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Student, AttendanceRecord, AttendanceType, attendanceTypes } from '../types';
import { supabase } from '../lib/supabase';

interface AttendanceContextType {
  students: Student[];
  loading: boolean;
  addStudent: (name: string, course: string, division: string, dni: string) => Promise<Student>;
  getStudent: (id: string) => Student | undefined;
  getStudentByDNI: (dni: string) => Student | undefined;
  markAttendance: (
    studentId: string,
    present: boolean,
    type?: AttendanceType,
    details?: string,
    exitTime?: string,
    date?: string
  ) => Promise<void>;
  getStudentsByCourse: (course: string, division: string) => Student[];
  deleteStudent: (id: string) => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) {
          throw studentsError;
        }
        
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*');
        
        if (attendanceError) {
          throw attendanceError;
        }
        
        const studentsWithAttendance = studentsData.map(student => {
          const studentAttendance = attendanceData
            .filter(record => record.student_id === student.id)
            .map(record => ({
              date: record.date,
              present: record.present,
              time: record.time,
              type: record.type || 'regular',
              absence_value: record.absence_value || 1.0,
              details: record.details,
              exit_time: record.exit_time
            }));
          
          return {
            id: student.id,
            name: student.name,
            course: student.course,
            division: student.division,
            dni: student.dni,
            attendanceRecords: studentAttendance
          };
        });
        
        setStudents(studentsWithAttendance);
      } catch (error) {
        console.error('Error fetching data:', error);
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  const addStudent = async (name: string, course: string, division: string, dni: string): Promise<Student> => {
    try {
      const newStudentId = uuidv4();
      
      const { error } = await supabase
        .from('students')
        .insert({
          id: newStudentId,
          name,
          course,
          division,
          dni,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      const newStudent: Student = {
        id: newStudentId,
        name,
        course,
        division,
        dni,
        attendanceRecords: []
      };
      
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      
      const newStudent: Student = {
        id: uuidv4(),
        name,
        course,
        division,
        dni,
        attendanceRecords: []
      };
      
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    }
  };

  const getStudent = (id: string): Student | undefined => {
    return students.find(student => student.id === id);
  };

  const getStudentByDNI = (dni: string): Student | undefined => {
    return students.find(student => student.dni === dni);
  };

  const markAttendance = async (
    studentId: string,
    present: boolean,
    type: AttendanceType = 'regular',
    details?: string,
    exitTime?: string,
    date: string = new Date().toISOString().split('T')[0] // Esto debe ser un string con formato 'YYYY-MM-DD'
  ) => {
    try {
      const time = new Date().toLocaleTimeString();
      
      const absenceType = attendanceTypes.find(t => t.id === type);
      const absenceValue = absenceType?.value || 1.0;
      
      // Verificamos si ya existe un registro de asistencia para este estudiante y fecha
      const { data: existingRecords, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', date);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Si el registro ya existe, lo actualizamos
      if (existingRecords && existingRecords.length > 0) {
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({
            present,
            time,
            type,
            absence_value: absenceValue,
            details,
            exit_time: exitTime
          })
          .eq('id', existingRecords[0].id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          id: uuidv4(),
          student_id: studentId,
          date: date,  // Asegúrate de que 'attendanceDate' sea la fecha que se pasa desde el frontend
          present,
          time,
          type,
          absence_value: absenceValue,
          details,
          exit_time: exitTime,
          created_at: new Date().toISOString()  // Fecha y hora de creación
        });
      
      if (insertError) {
        throw insertError;
      }
    }
      
      // Actualiza el estado local (si es necesario)
      setStudents(prev => 
        prev.map(student => {
          if (student.id === studentId) {
            const existingRecordIndex = student.attendanceRecords.findIndex(
              record => record.date === date
            );
            
            const newRecord = {
              date,
              present,
              time,
              type,
              absence_value: absenceValue,
              details,
              exit_time: exitTime
            };
            
            let updatedRecords: AttendanceRecord[] = [];
            
            if (existingRecordIndex >= 0) {
              updatedRecords = [...student.attendanceRecords];
              updatedRecords[existingRecordIndex] = newRecord;
            } else {
              updatedRecords = [...student.attendanceRecords, newRecord];
            }
            
            return {
              ...student,
              attendanceRecords: updatedRecords
            };
          }
          return student;
        })
      );
   
  
      
      setStudents(prev => 
        prev.map(student => {
          if (student.id === studentId) {
            const existingRecordIndex = student.attendanceRecords.findIndex(
              record => record.date === date
            );
            
            const newRecord = {
              date,
              present,
              time,
              type,
              absence_value: absenceValue,
              details,
              exit_time: exitTime
            };
            
            let updatedRecords: AttendanceRecord[];
            
            if (existingRecordIndex >= 0) {
              updatedRecords = [...student.attendanceRecords];
              updatedRecords[existingRecordIndex] = newRecord;
            } else {
              updatedRecords = [...student.attendanceRecords, newRecord];
            }
            
            return {
              ...student,
              attendanceRecords: updatedRecords
            };
          }
          return student;
        })
      );
    } catch (error) {
      console.error('Error marking attendance:', error);
      
      const time = new Date().toLocaleTimeString();
      const absenceType = attendanceTypes.find(t => t.id === type);
      const absenceValue = absenceType?.value || 1.0;
      
      setStudents(prev => 
        prev.map(student => {
          if (student.id === studentId) {
            const existingRecordIndex = student.attendanceRecords.findIndex(
              record => record.date === date
            );
            
            const newRecord = {
              date,
              present,
              time,
              type,
              absence_value: absenceValue,
              details,
              exit_time: exitTime
            };
            
            let updatedRecords: AttendanceRecord[];
            
            if (existingRecordIndex >= 0) {
              updatedRecords = [...student.attendanceRecords];
              updatedRecords[existingRecordIndex] = newRecord;
            } else {
              updatedRecords = [...student.attendanceRecords, newRecord];
            }
            
            return {
              ...student,
              attendanceRecords: updatedRecords
            };
          }
          return student;
        })
      );
    }
  };

  const getStudentsByCourse = (course: string, division: string): Student[] => {
    return students.filter(
      student => student.course === course && student.division === division
    );
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('student_id', id);
      
      if (attendanceError) {
        throw attendanceError;
      }
      
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (studentError) {
        throw studentError;
      }
      
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        students,
        loading,
        addStudent,
        getStudent,
        getStudentByDNI,
        markAttendance,
        getStudentsByCourse,
        deleteStudent
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceProvider;