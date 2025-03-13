import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ClipboardCheck, Home, List } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-green-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://fotoporfolio.s3.us-east-1.amazonaws.com/IPGSMPNG.png" 
                alt="IPGSM Logo" 
                className="h-8 w-8 rounded"
              />
              <span className="font-bold text-xl">Sistema de Asistencias IPGSM</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <div className="flex items-center space-x-1">
                <Home size={18} />
                <span>Inicio</span>
              </div>
            </Link>
            
            <Link
              to="/students"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/students') 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <div className="flex items-center space-x-1">
                <Users size={18} />
                <span>Estudiantes</span>
              </div>
            </Link>
            
            <Link
              to="/attendance"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/attendance') 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <div className="flex items-center space-x-1">
                <List size={18} />
                <span>Asistencias</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 ${
              isActive('/') ? 'text-blue-900' : 'text-gray-500'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Inicio</span>
          </Link>
          
          <Link
            to="/students"
            className={`flex flex-col items-center py-2 ${
              isActive('/students') ? 'text-blue-900' : 'text-gray-500'
            }`}
          >
            <Users size={20} />
            <span className="text-xs mt-1">Estudiantes</span>
          </Link>
          
          <Link
            to="/attendance"
            className={`flex flex-col items-center py-2 ${
              isActive('/attendance') ? 'text-blue-900' : 'text-gray-500'
            }`}
          >
            <List size={20} />
            <span className="text-xs mt-1">Asistencias</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;