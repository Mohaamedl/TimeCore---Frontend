import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, verifyTwoFactor } from '@/services/authService';

const Login: FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    session: string;
    otp: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(credentials.email, credentials.password);
      
      if (response.requiresTwoFactor) {
        setTwoFactorData({ 
          session: response.session ?? '', 
          otp: '' 
        });
      } else if (response.jwt) {
        localStorage.setItem('token', response.jwt);
        navigate('/calendar');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorData) return;

    setError(null);
    setIsLoading(true);

    try {
      await verifyTwoFactor(twoFactorData.otp, twoFactorData.session);
      navigate('/calendar');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 flex flex-col items-center p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <br></br>
        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-4">
          Login
        </h2>
        <br></br>
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md w-full text-center mb-4">
            {error}
          </div>
        )}

        {/* Formulario */}
        {!twoFactorData ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-[80%] item-center justify-center">
            <div className="flex flex-wrap gap-3">
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 md:text-lg"
                placeholder="Email address"
              />
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 md:text-lg"
                placeholder="Password"
              />
            </div>
            <br></br>
            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>

            {/* Link de registro */}
            <div className="text-center">
              <Link to="/register" className="text-sm text-green-600 hover:text-green-500">
              Não tem uma conta? Cadastre-se
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleTwoFactorSubmit} className="w-full space-y-4">
            <input
              type="text"
              required
              value={twoFactorData.otp}
              onChange={(e) => setTwoFactorData({ ...twoFactorData, otp: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 md:text-md"
              placeholder="Enter 2FA Code"
            />

            {/* Botón de verificación */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}<br></br>
      </div>
    </div>
  );
};

export default Login;