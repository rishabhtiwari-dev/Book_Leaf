import React from 'react';
import { useLogin } from './useLogin';
import { LoginView } from './LoginView';

/**
 * Login Page Container.
 * Binds functional authentication logic from useLogin to presentation in LoginView.
 */
export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <LoginView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
}
