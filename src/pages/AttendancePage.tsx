import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import CourseSelector from '../components/CourseSelector';
import CourseStatistics from '../components/CourseStatistics';
import { Calendar, CheckCircle, XCircle, Loader } from 'lucide-react';
import { divisions, years, attendanceTypes } from '../types';

const AttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { getStudentsByCourse, loading } = useAttendance();
  
  const initialYear = searchParams.get('year') 
    ? parseInt(searchParams.get('year') as string) 
    : 1;
  
  const initialDivision = searchParams.get('division') || "I";
  
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedDivision, setSelectedDivision] = useState<string>(initialDivision);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const students = getStudentsByCourse(selectedYear.toString(), selectedDivision);
  
  
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Loader size={40} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando datos de asistencia...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registro de Asistencias</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <CourseSelector
            selectedYear={selectedYear}
            selectedDivision={selectedDivision}
            onYearChange={setSelectedYear}
            onDivisionChange={setSelectedDivision}
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
      
      <CourseStatistics students={students} />
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">
          Asistencia del {new Date(selectedDate).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </h2>
        
        {students.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No hay estudiantes registrados en este curso
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nombre</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">DNI</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tipo</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Detalles</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => {
                  const attendanceRecord = student.attendanceRecords.find(
                    record => record.date === selectedDate
                  );
                  
                  const attendanceType = attendanceTypes.find(
                    type => type.id === attendanceRecord?.type
                  );
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.dni}</td>
                      <td className="py-3 px-4">
                        {attendanceRecord ? (
                          attendanceRecord.present ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle size={16} className="mr-1" />
                              Presente
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <XCircle size={16} className="mr-1" />
                              Ausente
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">Sin registrar</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {attendanceType?.label || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {attendanceRecord?.details || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {attendanceRecord?.time || '-'}
                        {attendanceRecord?.exit_time && (
                          <span className="text-red-500 ml-2">
                            (Salida: {attendanceRecord.exit_time})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;