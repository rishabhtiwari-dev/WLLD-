'use client';

import React from 'react';
import { useLoginForm } from '../../hooks/useLoginForm';
import LoginFormView from '../../components/auth/LoginFormView';

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
    handleDemoLogin,
  } = useLoginForm();

  return (
    <LoginFormView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onDemoLogin={handleDemoLogin}
    />
  );
}
