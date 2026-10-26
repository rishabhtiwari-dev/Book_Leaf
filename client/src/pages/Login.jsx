import React from 'react';
import { useLoginFunction } from './login.function';
import { LoginDesign } from './login.design';

/**
 * Login Page Container.
 * Connects pure functional authentication logic (login.function.js) to pure visual presentation (login.design.jsx).
 */
export default function Login() {
  const stateAndHandlers = useLoginFunction();
  return <LoginDesign {...stateAndHandlers} />;
}
