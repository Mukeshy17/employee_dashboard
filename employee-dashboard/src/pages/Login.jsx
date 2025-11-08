import React from 'react';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const handleSuccess = (data) => {
    // optional: redirect or show success
    console.log(data);
    
    window.location.href = '/';
  };

  return <AuthForm mode="login" onSuccess={handleSuccess} />;
};

export default Login;