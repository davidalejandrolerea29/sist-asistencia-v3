import React, { useState } from 'react';
import { Student, attendanceTypes } from '../types';
import { CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';

interface AttendanceHistoryProps {
  student: Student;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ student }) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const filteredRecords = student.attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  // Sort records by date (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate statistics
  const totalRecords = sortedRecords.length;
  const totalPresent = sortedRecords.filter(r => r.present).length;
  const totalAbsences = sortedRecords.reduce((acc, r) => acc + (r.present ? 0 : r.absence_value), 0);
  const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Historial de Asistencias</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Total Asistencias</p>
          <p className="text-2xl font-bold text-blue-800">{totalPresent}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 mb-1">Total Faltas</p>
          <p className="text-2xl font-bold text-red-800">{totalAbsences.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Porcentaje Asistencia</p>
          <p className="text-2xl font-bold text-green-800">{attendanceRate.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePreviousMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          &lt;
        </button>
        <span className="font-medium">
          {months[currentMonth]} {currentYear}
        </span>
        <button 
          onClick={handleNextMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          &gt;
        </button>
      </div>
      
      {sortedRecords.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No hay registros de asistencia para este mes
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRecords.map((record, index) => {
                const date = new Date(record.date);
                const formattedDate = date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                
                const attendanceType = attendanceTypes.find(t => t.id === record.type);
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {formattedDate}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {record.present ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1" />
                          Presente
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle size={16} className="mr-1" />
                          Ausente
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        backgroundColor: record.present ? '#e0f2fe' : '#fee2e2',
                        color: record.present ? '#0369a1' : '#b91c1c'
                      }}>
                        {attendanceType?.label || 'Regular'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {record.present ? '-' : `${record.absence_value} falta${record.absence_value !== 1 ? 's' : ''}`}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-1" />
                        {record.time}
                        {record.exit_time && (
                          <span className="ml-2 text-red-500">
                            (Salida: {record.exit_time})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600">
                      {record.details || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;