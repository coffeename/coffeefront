import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavigationBar.css';

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Отримуємо роль користувача з localStorage та переводимо її в нижній регістр
  const storedRole = localStorage.getItem('role');
  const isAuthenticated = storedRole !== null;
  const role = storedRole ? storedRole.toLowerCase() : null;

  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errData = await response.json();
        alert(`Помилка логауту: ${errData.error}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Щось пішло не так при логауті.');
    }
  };

  let leftLinks = null;
  let rightLinks = null;

  // Завжди показуємо "Home" з великим шрифтом
  leftLinks = <Link to="/" className="nav-link home-link">Home</Link>;

  if (!isAuthenticated) {
    // Якщо не авторизований, і ми не на сторінці Login – показуємо "Login" праворуч
    if (location.pathname !== '/login') {
      rightLinks = <Link to="/login" className="nav-link">Login</Link>;
    }
  } else {
    // Якщо авторизований, формуємо ліву частину меню залежно від поточного маршруту та ролі
    if (location.pathname === '/' || location.pathname === '/home') {
      if (role === 'admin' || role === 'manager') {
        leftLinks = (
          <>
            <Link to="/" className="nav-link home-link">Home</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            <Link to="/records" className="nav-link">Records</Link>
          </>
        );
      } else if (role === 'barista') {
        leftLinks = (
          <>
            <Link to="/" className="nav-link home-link">Home</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </>
        );
      }
    } else if (location.pathname === '/dashboard') {
      // На сторінці Dashboard не показуємо слово "Dashboard" у меню
      if (role === 'admin' || role === 'manager') {
        leftLinks = (
          <>
            <Link to="/" className="nav-link home-link">Home</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            <Link to="/records" className="nav-link">Records</Link>
          </>
        );
      } else {
        leftLinks = <Link to="/" className="nav-link home-link">Home</Link>;
      }
    } else if (location.pathname === '/analytics') {
      // На сторінці Analytics не показуємо "Analytics"
      leftLinks = (
        <>
          <Link to="/" className="nav-link home-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/records" className="nav-link">Records</Link>
        </>
      );
    } else if (location.pathname === '/records') {
      // На сторінці Records: показуємо "Home" та "Dashboard"
      leftLinks = (
        <>
          <Link to="/" className="nav-link home-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          {(role === 'admin' || role === 'manager') && (
            <Link to="/analytics" className="nav-link">Analytics</Link>
          )}
        </>
      );
    } else {
      // За замовчуванням для інших маршрутів
      if (role === 'admin' || role === 'manager') {
        leftLinks = (
          <>
            <Link to="/" className="nav-link home-link">Home</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            <Link to="/records" className="nav-link">Records</Link>
          </>
        );
      } else if (role === 'barista') {
        leftLinks = (
          <>
            <Link to="/" className="nav-link home-link">Home</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </>
        );
      }
    }
    // Праворуч завжди показуємо кнопку Logout для авторизованих користувачів
    rightLinks = (
      <button onClick={handleLogout} className="logout-button">Logout</button>
    );
  }

  return (
    <header className="nav-header">
      <div className="nav-container">
        <div className="nav-left">{leftLinks}</div>
        <div className="nav-right">{rightLinks}</div>
      </div>
    </header>
  );
}

export default NavigationBar;
