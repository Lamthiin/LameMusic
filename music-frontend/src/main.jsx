// music-frontend/src/main.jsx (CẬP NHẬT)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- IMPORT
import { BrowserRouter } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- BỌC Ở ĐÂY */}
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);