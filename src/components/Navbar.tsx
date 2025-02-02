import { FC } from 'react';
import AccountIcon from '@/components/AccountIcon';

const Navbar: FC = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-green-500 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-white text-xl md:text-2xl font-bold">Calendar App</h1>
        <AccountIcon />
      </div>
    </nav>
  );
};

export default Navbar;