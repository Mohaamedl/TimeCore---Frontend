import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, UserData } from '@/services/authService';

const Register: FC = () => {
  const [userData, setUserData] = useState<UserData>({
    fullname: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await register({
        ...userData,
        role: 'USER',
        twoFactorAuth: {
          isEnabled: false,
          sendTo: null
        }
      });

      if (response.jwt) {
        localStorage.setItem('token', response.jwt);
        navigate('/calendar');
      } else {
        throw new Error('Registration successful but no token received');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 flex flex-col items-center p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <br></br>
        <h2 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-4">Registo</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md w-full text-center mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}<br></br>
        <form onSubmit={handleSubmit} className='space-y-4 w-[80%] item-center justify-center'>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              id="fullname"
              value={userData.fullname}
              onChange={(e) => setUserData({ ...userData, fullname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 md:text-lg"
              placeholder='Nome e apelido'
              required
            />
            
            <input
              type="email"
              id="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 md:text-lg"
              placeholder='Email'
              required
            />
            
            <input
              type="password"
              id="password"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 md:text-lg"
              placeholder='Senha'
              required
            />
          </div><br></br>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Registering...' : 'Registo'}
          </button>
            {/* Link de registro */}
            <div className="text-center">
              <a href="http://localhost:5173/" className="text-sm text-green-600 hover:text-green-500">
              Já tem uma conta? Fazer login
              </a>
            </div>
            <br></br>
        </form>
      </div>
    </div>    
  );
};

export default Register;