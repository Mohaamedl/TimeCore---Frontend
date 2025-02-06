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
    <nav className="flex items-center justify-between px-6 py-4 bg-[#7583f6] p-4 text-white">
      {/* Logo alineado a la izquierda con espaciado */}
      <a href="http://localhost:5173/calendar">
        <img src={imageUrl} alt="User Avatar" className="w-14 h-14 rounded-full object-cover shadow-lg" />
      </a>

      {/* Título centrado */}
      <Link to="/calendar" className="text-gray-900 dark:text-white text-xl font-semibold">
        Calendario - TimeCore
      </Link>

      {/* Botón de perfil alineado a la derecha */}
      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-green-600 dark:hover:bg-green-700 px-3 py-2 rounded-md"
        >
          <span className="hidden md:block">My Account</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsProfileOpen(false)}
            >
              Profile Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsProfileOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;