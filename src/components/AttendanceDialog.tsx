import React, { useState } from 'react';
import { AttendanceType, attendanceTypes } from '../types';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AttendanceDialogProps {
  onSubmit: (data: {
    present: boolean;
    type: AttendanceType;
    details?: string;
    exitTime?: string;
    date: string;

  }) => void;
  onClose: () => void;
  initialDate?: string;
}

const AttendanceDialog: React.FC<AttendanceDialogProps> = ({ onSubmit, onClose, initialDate = "" }) => {
  const [type, setType] = useState<AttendanceType>('regular');
  const [details, setDetails] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = (present: boolean) => {
    console.log("Fecha de asistencia:", date);  // Verifica que 'attendanceDate' tenga el valor esperado
    onSubmit({
      present,
      type,
      details: details.trim() || undefined,
      exitTime: exitTime.trim() || undefined,
      date,  // Este es el valor de la fecha que usas en el formulario
     
    });
  };
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registrar Asistencia</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
          type="date"
          id="attendanceDate"
          value={date}
          onChange={handleDateChange}
          className="w-full border rounded p-2"
        />

          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Registro
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AttendanceType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {attendanceTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {type === 'early_exit' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Salida
            </label>
            <div className="relative">
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detalles (opcional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Agregar detalles adicionales..."
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleSubmit(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            Presente
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            Ausente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDialog;
