import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { QrCode, CheckCircle, XCircle, User, Camera, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AttendanceDialog from '../components/AttendanceDialog';

const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { getStudentByDNI, markAttendance, students } = useAttendance();
  
  const [studentDNI, setStudentDNI] = useState<string>("");
  const [scannedStudent, setScannedStudent] = useState<any>(null);
  const [attendanceMarked, setAttendanceMarked] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  
  useEffect(() => {
    // Search for students when query changes
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = students.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.dni.includes(query)
      ).slice(0, 5); // Limit to 5 results
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, students]);
  
  useEffect(() => {
    // Cleanup function to stop scanner when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);
  
  const startScanner = () => {
    setShowScanner(true);
    setError(null);
    
    const qrCodeSuccessCallback = (decodedText: string) => {
      const scannedDNI = decodedText;
      setStudentDNI(scannedDNI);
      
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      
      setShowScanner(false);
      
      const student = getStudentByDNI(scannedDNI);
      if (student) {
        setScannedStudent(student);
        setError(null);
      } else {
        setScannedStudent(null);
        setError("Estudiante no encontrado. Verifica el QR e intenta nuevamente.");
      }
    };
    
    const qrCodeErrorCallback = (error: any) => {
      console.log("QR scanning ongoing...");
    };
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };
    
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      /* verbose= */ false
    );
    
    scannerRef.current.render(qrCodeSuccessCallback, qrCodeErrorCallback);
  };
  
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setShowScanner(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentDNI.trim()) {
      setError("Por favor ingresa el DNI del estudiante");
      return;
    }
    
    const student = getStudentByDNI(studentDNI.trim());
    
    if (student) {
      setScannedStudent(student);
      setError(null);
      setSearchResults([]);
      setSearchQuery("");
    } else {
      setScannedStudent(null);
      setError("Estudiante no encontrado. Verifica el DNI e intenta nuevamente.");
    }
  };
  
  const handleSelectStudent = (student: any) => {
    setScannedStudent(student);
    setStudentDNI(student.dni);
    setSearchResults([]);
    setSearchQuery("");
    setError(null);
  };
  
  const handleMarkAttendance = async (data: {
    present: boolean;
    type: string;
    details?: string;
    exitTime?: string;
  }) => {
    if (scannedStudent) {
      await markAttendance(
        scannedStudent.id,
        data.present,
        data.type,
        data.details,
        data.exitTime,
        
      );
      setAttendanceMarked(data.present);
      setShowAttendanceDialog(false);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setScannedStudent(null);
        setAttendanceMarked(null);
        setStudentDNI("");
      }, 3000);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-full mb-4">
          <QrCode size={40} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Escaneo de Asistencia</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Escanea el código QR del estudiante o búscalo por nombre o DNI para registrar su asistencia.
        </p>
      </div>
      
      {showScanner ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <div id="qr-reader" className="w-full"></div>
            <button
              onClick={stopScanner}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Cancelar Escaneo
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
         
          
          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
          
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Estudiante
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Buscar por nombre o DNI..."
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  {searchResults.map((student) => (
                    <li
                      key={student.id}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium block truncate">{student.name}</span>
                        <span className="text-gray-500 ml-2">DNI: {student.dni}</span>
                      </div>
                      <span className="text-gray-500 ml-2">
                        {student.course}° "{student.division}"
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label htmlFor="studentDNI" className="block text-sm font-medium text-gray-700 mb-1">
                DNI del Estudiante
              </label>
              <input
                type="text"
                id="studentDNI"
                value={studentDNI}
                onChange={(e) => setStudentDNI(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ingresa el DNI del estudiante"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Buscar Estudiante
            </button>
            
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error}</p>
            )}
          </form>
        </div>
      )}
      
      {scannedStudent && !attendanceMarked && !showAttendanceDialog && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <User size={24} className="text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">{scannedStudent.name}</h2>
              <p className="text-sm text-gray-600">
                {scannedStudent.course}° "{scannedStudent.division}"
              </p>
              <p className="text-sm text-gray-600">
                DNI: {scannedStudent.dni}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">¿Deseas marcar la asistencia de este estudiante?</p>
          
          <button
            onClick={() => setShowAttendanceDialog(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
          >
            Registrar Asistencia
          </button>
        </div>
      )}
      
      {showAttendanceDialog && scannedStudent && (
        <AttendanceDialog
          onSubmit={handleMarkAttendance}
          onClose={() => setShowAttendanceDialog(false)}
        />
      )}
      
      {attendanceMarked !== null && (
        <div className={`max-w-md mx-auto rounded-lg shadow-md p-6 text-center ${
          attendanceMarked ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
        }`}>
          <div className="inline-flex items-center justify-center p-3 rounded-full mb-2 bg-white">
            {attendanceMarked ? (
              <CheckCircle size={30} className="text-green-600" />
            ) : (
              <XCircle size={30} className="text-red-600" />
            )}
          </div>
          <h2 className="text-lg font-semibold mb-1">
            {attendanceMarked ? 'Asistencia Registrada' : 'Ausencia Registrada'}
          </h2>
          <p className={`${attendanceMarked ? 'text-green-800' : 'text-red-800'}`}>
            {scannedStudent?.name} ha sido marcado como {attendanceMarked ? 'presente' : 'ausente'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScanPage;