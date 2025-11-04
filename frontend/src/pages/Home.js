import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  getDashboardSummary,
  getSalesChart,
  getOrdersInProgressChart,
  getOrdersInQueueChart
} from '../services/api';
import './Home.css';

const Home = () => {
  const [summary, setSummary] = useState({
    ordersInProgress: 0,
    ordersInQueue: 0,
    ordersCompleted: 0
  });
  const [salesData, setSalesData] = useState({ totalSale: 0, chartData: [] });
  const [inProgressData, setInProgressData] = useState({ chartData: [] });
  const [inQueueData, setInQueueData] = useState({ chartData: [] });
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await getDashboardSummary();
      setSummary(summaryRes.data);

      const salesRes = await getSalesChart(period);
      setSalesData(salesRes.data);

      const inProgressRes = await getOrdersInProgressChart(period);
      setInProgressData(inProgressRes.data);

      const inQueueRes = await getOrdersInQueueChart(period);
      setInQueueData(inQueueRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const reports = [
    { name: 'Sale Report', icon: '📝' },
    { name: 'All Transactions', icon: '💳' },
    { name: 'Daybook Report', icon: '📅' },
    { name: 'Party Statement', icon: '👤' }
  ];

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-left">
          <h1>
            Welcome to <span className="brand">Elints</span>
          </h1>
        </div>
        <div className="header-right">
          <span className="support-text">Customer Support:</span>
          <span className="phone">📞 +91-6364444752</span>
          <span className="phone">+91-9333911911</span>
          <button className="support-btn">🎧 Get Instant Online Support</button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="left-section">
          <div className="summary-cards">
            <div className="card in-progress-card">
              <div className="card-header">
                <h3>Orders In Progress</h3>
                <span className="card-icon">🔄</span>
              </div>
              <div className="card-amount">{summary.ordersInProgress}</div>
              <p className="card-subtitle">
                {summary.ordersInProgress === 0
                  ? 'No orders currently in progress.'
                  : `${summary.ordersInProgress} order${
                      summary.ordersInProgress > 1 ? 's' : ''
                    } being processed.`}
              </p>
            </div>

            <div className="card in-queue-card">
              <div className="card-header">
                <h3>Orders In Queue</h3>
                <span className="card-icon">⏳</span>
              </div>
              <div className="card-amount">{summary.ordersInQueue}</div>
              <p className="card-subtitle">
                {summary.ordersInQueue === 0
                  ? 'No orders waiting in queue.'
                  : `${summary.ordersInQueue} order${
                      summary.ordersInQueue > 1 ? 's' : ''
                    } waiting to be processed.`}
              </p>
            </div>
          </div>

          <div className="combined-chart-card">
            <div className="chart-header">
              <h3>Order Trends</h3>
              <select
                className="period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={(() => {
                    // Merge both datasets by date
                    const mergedData = {};
                    inProgressData.chartData.forEach((item) => {
                      mergedData[item.date] = {
                        date: item.date,
                        inProgress: item.count,
                        inQueue: 0
                      };
                    });
                    inQueueData.chartData.forEach((item) => {
                      if (mergedData[item.date]) {
                        mergedData[item.date].inQueue = item.count;
                      } else {
                        mergedData[item.date] = {
                          date: item.date,
                          inProgress: 0,
                          inQueue: item.count
                        };
                      }
                    });

                    const sortedData = Object.values(mergedData).sort((a, b) => {
                      const dateA = new Date(a.date);
                      const dateB = new Date(b.date);
                      return dateA - dateB;
                    });

                    // If no data, generate default dates based on period
                    if (sortedData.length === 0) {
                      const now = new Date();
                      const defaultData = [];

                      if (period === 'month') {
                        // Show dates for current month
                        const year = now.getFullYear();
                        const month = now.getMonth();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        for (
                          let day = 1;
                          day <= daysInMonth;
                          day += Math.ceil(daysInMonth / 10)
                        ) {
                          const date = new Date(year, month, day);
                          const dateStr = `${day} ${date.toLocaleDateString('en-US', {
                            month: 'short'
                          })}`;
                          defaultData.push({
                            date: dateStr,
                            inProgress: 0,
                            inQueue: 0
                          });
                        }
                      } else if (period === 'week') {
                        // ✅ FIXED: Show this week (Monday to Sunday)
                        const now = new Date();
                        const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ...
                        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                        const monday = new Date(now);
                        monday.setDate(now.getDate() + diffToMonday);

                        for (let i = 0; i < 7; i++) {
                          const date = new Date(monday);
                          date.setDate(monday.getDate() + i);
                          const dateStr = `${date.getDate()} ${date.toLocaleDateString(
                            'en-US',
                            { month: 'short' }
                          )}`;
                          defaultData.push({
                            date: dateStr,
                            inProgress: 0,
                            inQueue: 0
                          });
                        }
                      } else {
                        // Show months for current year
                        const months = [
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec'
                        ];
                        months.forEach((month) => {
                          defaultData.push({
                            date: month,
                            inProgress: 0,
                            inQueue: 0
                          });
                        });
                      }
                      return defaultData;
                    }

                    return sortedData;
                  })()}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#888" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke="#4A90E2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="In Progress"
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inQueue"
                    stroke="#FF9068"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="In Queue"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: '#4A90E2' }}
                ></span>
                <span className="legend-label">In Progress</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: '#FF9068' }}
                ></span>
                <span className="legend-label">In Queue</span>
              </div>
            </div>
          </div>
        </div>

        <div className="empty-widget">
          <div className="empty-icon">🏪</div>
          <h3>It Looks So Empty in Here!</h3>
          <p>
            Add one of our widgets to get started and view your business operations
          </p>
          <button className="add-widget-btn">+ Add Widget of Your Choice</button>
        </div>
      </div>

      <div className="reports-section">
        <div className="reports-header">
          <h3>Most Used Reports</h3>
          <a href="/reports" className="view-all">
            View All
          </a>
        </div>

        <div className="reports-grid">
          {reports.map((report, index) => (
            <div key={index} className="report-card">
              <span className="report-icon">{report.icon}</span>
              <span className="report-name">{report.name}</span>
              <span className="report-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
