import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';

const AuthModal = ({ theme, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login with username
        if (!formData.username || !formData.password) {
          setError('Please enter username and password');
          setLoading(false);
          return;
        }

        const response = await authService.login(formData.username, formData.password);
        
        if (response.error) {
          setError(response.error);
        } else {
          onSuccess({ username: formData.username, email: response.email });
        }
      } else {
        // Register
        if (!formData.username || !formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const response = await authService.register(
          formData.email,
          formData.password,
          formData.username
        );
        
        if (response.error) {
          setError(response.error);
        } else {
          // Auto login after registration
          const loginResponse = await authService.login(formData.username, formData.password);
          if (loginResponse.error) {
            setError('Registration successful! Please login.');
            setIsLogin(true);
          } else {
            onSuccess({ username: formData.username, email: formData.email });
          }
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} rounded-2xl border ${borderColor} max-w-md w-full p-8 relative`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {isLogin ? <LogIn size={32} className="text-white" /> : <UserPlus size={32} className="text-white" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className={textSecondary}>
            {isLogin ? 'Login to access your data' : 'Sign up to sync your data'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block mb-2 font-medium">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block mb-2 font-medium">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? 'Login' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
              });
            }}
            className={`${textSecondary} hover:text-blue-500 transition-colors`}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;