import React, { useEffect, useState } from 'react';
import '../styles/Records.css';

function Records() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/alerts', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        return response.json();
      })
      .then(data => {
        setAlerts(data);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('Помилка завантаження записів.');
      });
  }, []);

  return (
    <div className="records-container">
      <div className="records-content">
        <h2>Звіт</h2>
        {/* Контейнер для таблиці з фіксованою висотою та вертикальним скролом */}
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Назва</th>
                <th>Опис</th>
                <th>Дата/Час</th>
                <th>Змінщик</th>
                <th>Поточна кількість</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id}>
                  <td>{alert.product_name}</td>
                  <td>{alert.alert_message}</td>
                  <td>{alert.alert_datetime}</td>
                  <td>{alert.changer ? alert.changer : alert.barista}</td>
                  <td>{alert.current_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Records;
