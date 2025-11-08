import React from 'react';
import AuthForm from '../components/AuthForm';

const Signup = () => {
  const handleSuccess = (data) => {
    // after signup, navigate to login or auto-login if token returned
    console.log(data);
    
    window.location.href = '/';
  };

  return <AuthForm mode="signup" onSuccess={handleSuccess} />;
};

export default Signup;