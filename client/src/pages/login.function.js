import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Pure Functional Controller: Login Authentication, Form State, and Redirection.
 */
export function useLoginFunction() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate(isAdmin ? '/admin/dashboard' : '/author/books', { replace: true });
  }

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/author/books', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    error,
    loading,
    onEmailChange: handleEmailChange,
    onPasswordChange: handlePasswordChange,
    onSubmit: handleSubmit,
    isAuthenticated,
  };
}

