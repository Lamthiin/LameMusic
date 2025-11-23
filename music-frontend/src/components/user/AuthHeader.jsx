// music-frontend/src/components/AuthHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthHeader.css'; // File CSS riêng

const AuthHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="auth-header-container">
      <div className="auth-header-logo" onClick={() => navigate('/')}>
        <h1 className="lame-logo-text">Lame 🎵</h1>
      </div>
    </header>
  );
};

export default AuthHeader;