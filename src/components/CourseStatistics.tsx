import React from 'react';
import { Student, AttendanceType, attendanceTypes } from '../types';
import { PieChart, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CourseStatisticsProps {
  students: Student[];
  startDate?: string;
  endDate?: string;
}

const CourseStatistics: React.FC<CourseStatisticsProps> = ({ 
  students,
  startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
  endDate = new Date().toISOString().split('T')[0]
}) => {
  // Calculate attendance statistics
  const calculateStats = () => {
    let totalDays = 0;
    let totalPresent = 0;
    let totalAbsences = 0;
    let typeStats: Record<AttendanceType, number> = {
      regular: 0,
      physical_education: 0,
      late_arrival: 0,
      early_exit: 0,
      sports_activity: 0,
      academic_activity: 0,
      medical: 0,
      justified: 0,
      unjustified: 0
    };
    
    let studentMovements = {
      entries: 0,
      exits: 0
    };

    students.forEach(student => {
      student.attendanceRecords
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
        })
        .forEach(record => {
          totalDays++;
          if (record.present) {
            totalPresent++;
          } else {
            totalAbsences += record.absence_value;
            typeStats[record.type]++;
          }
          
          if (record.type === 'early_exit') {
            studentMovements.exits++;
          }
        });
    });

    const attendanceRate = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;
    const averageAbsences = students.length > 0 ? totalAbsences / students.length : 0;

    return {
      totalStudents: students.length,
      totalDays,
      attendanceRate,
      averageAbsences,
      typeStats,
      studentMovements
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">Total Estudiantes</h3>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <PieChart size={24} className="text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">Asistencia</h3>
            <p className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Media del curso</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <ArrowUpRight size={24} className="text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">Ingresos</h3>
            <p className="text-2xl font-bold">{stats.studentMovements.entries}</p>
            <p className="text-sm text-gray-500">En el período</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
        <div className="flex items-center">
          <div className="bg-orange-100 p-3 rounded-full">
            <ArrowDownRight size={24} className="text-orange-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">Egresos</h3>
            <p className="text-2xl font-bold">{stats.studentMovements.exits}</p>
            <p className="text-sm text-gray-500">En el período</p>
          </div>
        </div>
      </div>

      <div className="col-span-full bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Detalle de Inasistencias</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {attendanceTypes.map(type => {
            const count = stats.typeStats[type.id];
            if (count === 0) return null;
            
            return (
              <div key={type.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{type.label}</span>
                <div className="flex items-center">
                  <span className="text-lg font-bold">{count}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({type.value} falta{type.value !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseStatistics;