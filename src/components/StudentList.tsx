import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Student {
  orden: string;
  alumno: string;
  curso: string;
  sexo: string;
  attendanceRecords: Array<{ date: string; present: boolean; status: string }>;
}

const fetchDataFromSheet = async () => {
  const spreadsheetId = '1cWe-PQgXKlsXZ3miSHh_D7RVJLPsac8OZOMSs37c1lQ';
  const range = 'Registro!A7:AZ636';
  const apiKey = 'AIzaSyD1a1DAgxPnRcpcIkwKSJYa8H4f6a8uD-E';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Error al obtener los datos de Google Sheets');
    }

    const data = await response.json();
    return data.values;
  } catch (error) {
    console.error(error);
  }
};

const fetchAttendanceTypes = async () => {
  const spreadsheetId = '1cWe-PQgXKlsXZ3miSHh_D7RVJLPsac8OZOMSs37c1lQ';
  const range = 'Tipo de Inasistencias!A2:A';  // Cambié el rango para empezar desde A2
  const apiKey = 'AIzaSyD1a1DAgxPnRcpcIkwKSJYa8H4f6a8uD-E';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Error al obtener los tipos de asistencia de Google Sheets');
    }

    const data = await response.json();
    return data.values.map((item: any) => item[0]);
  } catch (error) {
    console.error(error);
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('es-ES', options);
};

const sendAttendanceToSheet = async (attendanceData: any) => {
  const spreadsheetId = '1cWe-PQgXKlsXZ3miSHh_D7RVJLPsac8OZOMSs37c1lQ';
  const range = 'Registro!A7:AZ636';

  const body = {
    values: attendanceData,
  };

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=AIzaSyD1a1DAgxPnRcpcIkwKSJYa8H4f6a8uD-E`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error('Error al actualizar los datos en Google Sheets');
    }

    alert('Asistencia actualizada con éxito');
  } catch (error) {
    console.error(error);
    alert('Error al actualizar los datos');
  }
};

const StudentList: React.FC = () => {
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [datesWithAttendance, setDatesWithAttendance] = useState<string[]>([]);
  const [attendanceTypes, setAttendanceTypes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchDataFromSheet().then((data) => {
      if (data) {
        const formattedData = data.map((row: any[]) => {
          const attendanceRecords: Array<{ date: string; present: boolean; status: string }> = [];

          const marchDates: string[] = [];
          for (let i = 35; i < row.length; i++) {
            const dateValue = row[i];
            if (dateValue && new Date(dateValue).getMonth() === 2) {
              const formattedDate = formatDate(dateValue);
              marchDates.push(formattedDate);
              const status = row[i + 1] || '';
              if (status) {
                attendanceRecords.push({
                  date: formattedDate,
                  present: status === 'Presente',
                  status,
                });
              }
            }
          }

          setDatesWithAttendance(marchDates);

          return {
            orden: row[0] || '',
            alumno: row[1] || '',
            curso: row[2] || 'Sin Curso',
            sexo: row[3] || '',
            attendanceRecords,
          };
        });

        setStudentsData(formattedData);
      }
    });

    fetchAttendanceTypes().then((data) => {
      if (data) {
        setAttendanceTypes(data);
      }
    });
  }, []);

  const courses = Array.from(new Set(studentsData.map((student) => student.curso)));

  const filteredStudents = selectedCourse
    ? studentsData.filter((student) => student.curso === selectedCourse)
    : studentsData;

  const handleAttendanceChange = (studentId: string, date: string, status: string) => {
    const updatedStudents = studentsData.map((student) => {
      if (student.orden === studentId) {
        const updatedAttendance = student.attendanceRecords.map((record) =>
          record.date === date ? { ...record, status } : record
        );
        return { ...student, attendanceRecords: updatedAttendance };
      }
      return student;
    });
    setStudentsData(updatedStudents);
  };

  const handleSubmit = () => {
    const attendanceData = studentsData.map((student) => {
      const studentRow = [student.orden, student.alumno];
      datesWithAttendance.forEach((date) => {
        const record = student.attendanceRecords.find((r) => r.date === date);
        studentRow.push(record ? record.status : 'Ausente');
      });
      return studentRow;
    });
    sendAttendanceToSheet(attendanceData);
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mr-2">Seleccionar Curso:</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="">Todos</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nombre</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Sexo</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Curso</th>
            {datesWithAttendance.map((date, index) => (
              <th key={index} className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                {date}
              </th>
            ))}
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={5 + datesWithAttendance.length} className="py-4 px-4 text-center text-gray-500">
                No hay estudiantes en este curso
              </td>
            </tr>
          ) : (
            filteredStudents.map((student) => (
              <tr key={student.orden} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">{student.alumno || 'Sin Nombre'}</td>
                <td className="py-3 px-4 text-sm">{student.sexo || 'N/A'}</td>
                <td className="py-3 px-4 text-sm">{student.curso}</td>
                {datesWithAttendance.map((date, index) => {
                  const record = student.attendanceRecords.find((r) => r.date === date);
                  return (
                    <td key={index} className="py-3 px-4 text-sm">
                      {record ? record.status : '-'}
                    </td>
                  );
                })}
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(student)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Actualizar Asistencia"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => console.log(`Eliminar ${student.orden}`)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl mb-4">Actualizar Asistencia: {selectedStudent.alumno}</h2>
            {datesWithAttendance.map((date) => {
              const record = selectedStudent.attendanceRecords.find((r) => r.date === date);
              return (
                <div key={date} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">{date}</label>
                  <select
                    value={record?.status || ''}
                    onChange={(e) =>
                      handleAttendanceChange(selectedStudent.orden, date, e.target.value)
                    }
                    className="mt-2 w-full border border-gray-300 rounded px-3 py-1"
                  >
                    <option value="">Seleccione una opción</option>
                    {attendanceTypes.length > 0 ? (
                      attendanceTypes.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))
                    ) : (
                      <option disabled>Cargando opciones...</option>
                    )}
                  </select>
                </div>
              );
            })}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Cerrar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;

