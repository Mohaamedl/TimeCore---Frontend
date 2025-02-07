import { FC, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar: FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const imageUrl = "http://localhost:5173/src/assets/logo.png";

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#7583f6] p-4 text-[#ffffff]">
      {/* Logo alineado a la izquierda con espaciado */}
      <a href="http://localhost:5173/calendar">
        <img src={imageUrl} alt="User Avatar" className="w-14 h-14 rounded-full object-cover shadow-lg" />
      </a>

      {/* Título centrado */}
      <a href="http://localhost:5173/calendar">
        <p className="text-[#ffffff] text-lg font-bold">Calendario - TimeCore</p>
      </a>

      {/* Botón de perfil alineado a la derecha */}
      <div className="relative">
      {/* Profile Button */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center space-x-2 bg-[#240960] text-[#ffffff] px-4 py-2 rounded-md hover:bg-[#3a0e91] transition">
          <svg className="h-6 w-6 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      
        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#ffffff] p-3"><br></br>
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-[#ffffff] text-center"
              onClick={() => setIsProfileOpen(false)}
            >
              Configurações
            </Link><br></br>
            <button
              onClick={() => {
                handleLogout();
                setIsProfileOpen(false);
              }}
              className="block w-full text-center px-4 py-2 text-sm font-semibold text-[#240960] bg-[#7583f6] rounded-md hover:bg-[#5e6be6] transition"
            >
              Sair
            </button>
          </div>
        )}
      </div>    
    </nav>
  );
};

export default Navbar;