import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

const AttendanceDialog = ({ onSubmit, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [attendanceOptions, setAttendanceOptions] = useState([]);

  const fetchAttendanceData = async () => {
    const spreadsheetId = 'PQgXKlsXZ3miSHh_D7RVJLPsac8OZOMSs37c1lQ';
    const range = 'Tipo de Inasistencias!A2:A';  
    const apiKey = 'AIzaSyD1a1DAgxPnRcpcIkwKSJYa8H4f6a8uD-E';
    
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
      );
      const data = await response.json();
      if (data.values) {
        setAttendanceOptions(data.values.slice(1));
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleSubmit = (present) => {
    onSubmit({ date, type, details, exitTime, present });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registrar Asistencia</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Asistencia</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {attendanceOptions.map((option, index) => (
              <option key={index} value={option[1]}>{option[1]}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>

        <div className="flex space-x-2">
          <button onClick={() => handleSubmit(true)} className="bg-green-600 text-white py-2 px-4 rounded-md">
            Presente
          </button>
          <button onClick={() => handleSubmit(false)} className="bg-red-600 text-white py-2 px-4 rounded-md">
            Ausente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDialog;


