import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import EmulatorPage from './pages/EmulatorPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/emulator/:console" element={<EmulatorPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;