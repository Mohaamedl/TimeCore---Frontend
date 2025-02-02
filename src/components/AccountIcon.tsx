import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/authService';

const AccountIcon: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative">
      <button
        title="Toggle account menu"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
          <button
            onClick={() => navigate('/profile')}
            className="block w-full px-4 py-2 text-gray-800 hover:bg-gray-100 text-left"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-gray-800 hover:bg-gray-100 text-left"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountIcon;