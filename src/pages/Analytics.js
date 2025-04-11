import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import '../styles/Analytics.css';

function Analytics() {
  const [viewMode, setViewMode] = useState('comparison'); // 'comparison' | 'charts'
  const [lineData, setLineData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ordersByBarista, setOrdersByBarista] = useState([]);

  // Лінійний графік
  useEffect(() => {
    if (viewMode !== 'comparison') return;
    fetch('http://127.0.0.1:5000/analytics/data', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ actual, forecast }) => {
        const map = {};
        actual.forEach(i => {
          map[i.date] = { date: i.date, actual: i.actual, forecast: null };
        });
        forecast.forEach(i => {
          if (!map[i.date]) {
            map[i.date] = { date: i.date, actual: null, forecast: i.forecast };
          } else {
            map[i.date].forecast = i.forecast;
          }
        });
        const combined = Object.values(map).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        const fi = combined.findIndex(d => d.forecast != null);
        if (fi !== -1) combined[fi].actual = combined[fi].forecast;
        setLineData(combined);
      })
      .catch(() => alert('Не вдалося завантажити дані аналітики.'));
  }, [viewMode]);

  // Діаграми: топ‑7 продуктів та замовлення по баристах
  useEffect(() => {
    if (viewMode !== 'charts') return;
    Promise.all([
      fetch('http://127.0.0.1:5000/analytics/top-products', { credentials: 'include' })
        .then(r => (r.ok ? r.json() : [])),
      fetch('http://127.0.0.1:5000/analytics/orders-by-barista', { credentials: 'include' })
        .then(r => (r.ok ? r.json() : []))
    ])
      .then(([products, byBarista]) => {
        setTopProducts(products);
        setOrdersByBarista(byBarista);
      })
      .catch(() => alert('Не вдалося завантажити дані для діаграм.'));
  }, [viewMode]);

  // палітра для PieChart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1', '#83a6ed'];

  return (
    <div className="analytics-container">
      <div className="analytics-content">
        <h2>Аналітика продажів</h2>

        {viewMode === 'comparison' ? (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  tickMargin={30}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 400]} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={10} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Реальні продажі"
                  stroke="#8884d8"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Прогноз"
                  stroke="#82ca9d"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="charts-wrapper">
            {/* Гістограма топ‑7 продуктів */}
            <div style={{ flex: 1 }}>
              <h3 style={{ textAlign: 'center' }}>Топ‑7 продуктів за весь час</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topProducts}
                  margin={{ top: 20, right: 20, left: 10, bottom: 120 }} // більше місця під підписи
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="productName"
                    interval={0}     // показуємо всі підписи
                    tick={({ x, y, payload }) => (
                      <text x={x} y={y + 19} textAnchor="middle">
                        {payload.value.split(' ').map((line, i) => (
                          <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    )}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Кількість" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Кругова діаграма по баристах */}
            <div style={{ flex: 1}}>
              <h3 style={{ textAlign: 'center' }}>Працівник року (к-сть замовлень)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={ordersByBarista}
                    dataKey="count"
                    nameKey="barista"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}  // 1.5× збільшення (замість 80)
                    label={({ barista, percent }) =>
                      `${barista}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {ordersByBarista.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <button
          className="action-button"
          onClick={() => setViewMode(viewMode === 'comparison' ? 'charts' : 'comparison')}
        >
          {viewMode === 'comparison'
            ? 'Переглянути діаграми'
            : 'Переглянути графік порівняння'}
        </button>
      </div>
    </div>
  );
}

export default Analytics;
