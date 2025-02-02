import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/authService';

const AccountIcon: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative">
     
    </div>
  );
};

export default AccountIcon;