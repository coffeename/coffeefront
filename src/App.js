import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Records from './pages/Records';

function App() {
  return (
    <Router>
      <NavigationBar />
      {/* Додаємо відступ, щоб контент не заходив під фіксований NavigationBar */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;