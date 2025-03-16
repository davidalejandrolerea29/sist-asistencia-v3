import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import CourseSelector from '../components/CourseSelector';
import StudentList from '../components/StudentList';
import { UserPlus, Search, Loader } from 'lucide-react';
import { divisions, years } from '../types';

const StudentsPage: React.FC = () => {
  const { addStudent, getStudentsByCourse, deleteStudent, students, loading } = useAttendance();
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedDivision, setSelectedDivision] = useState<string>("I");
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newStudentDNI, setNewStudentDNI] = useState<string>("");
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter students based on search query and selected course/division
  const filteredStudents = students.filter(student => {
    const matchesCourse = student.course === selectedYear.toString() && student.division === selectedDivision;
    const matchesSearch = searchQuery.trim() === "" || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.dni.includes(searchQuery);
    return matchesCourse && matchesSearch;
  });
  

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && newStudentDNI.trim()) {
      setIsSubmitting(true);
      try {
        await addStudent(newStudentName.trim(), selectedYear.toString(), selectedDivision, newStudentDNI.trim());
        setNewStudentName("");
        setNewStudentDNI("");
        setIsAddingStudent(false);
      } catch (error) {
        console.error("Error adding student:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este estudiante? Esta acción no se puede deshacer.")) {
      try {
        await deleteStudent(id);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Loader size={40} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Estudiantes</h1>
        <button
          onClick={() => setIsAddingStudent(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Agregar Estudiante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <CourseSelector
            selectedYear={selectedYear}
            selectedDivision={selectedDivision}
            onYearChange={setSelectedYear}
            onDivisionChange={setSelectedDivision}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o DNI..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">
         Gestión de Estudiantes
          {searchQuery && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Filtrando por: {searchQuery})
            </span>
          )}
        </h2>
        <StudentList students={filteredStudents} onDelete={handleDeleteStudent} />
      </div>
    </div>
  );
};

export default StudentsPage;
