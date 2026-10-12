'use client';

import React from 'react';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import RegisterFormView from '../../components/auth/RegisterFormView';

export default function RegisterPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    error,
    isLoading,
    handleSubmit,
  } = useRegisterForm();

  return (
    <RegisterFormView
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      role={role}
      setRole={setRole}
      error={error}
      isLoading={isLoading}
      onSubmit={handleSubmit}
    />
  );
}
