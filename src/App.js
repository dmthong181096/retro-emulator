import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import EmulatorPage from './pages/EmulatorPage';
import ToastContainer from './components/ToastContainer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/emulator/:console" element={<EmulatorPage />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;