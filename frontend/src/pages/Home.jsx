import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Sidebar from '../components/Sidebar.jsx';

const Home = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    ordersInProgress: 0,
    ordersInQueue: 0,
    ordersCompleted: 0
  });
  const [salesData, setSalesData] = useState({ totalSale: 0, chartData: [] });
  const [inProgressData, setInProgressData] = useState({ chartData: [] });
  const [inQueueData, setInQueueData] = useState({ chartData: [] });
  const [period, setPeriod] = useState('month');

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Trigger auth change event to update App component
      window.dispatchEvent(new Event('authChange'));
      
      navigate('/login');
    }
  };

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

  const reportCards = reports.map((report, index) => (
    <div key={index} className="flex items-center border border-slate-200 rounded-md p-4 cursor-pointer transition-shadow hover:shadow">
      <span className="text-2xl mr-3">{report.icon}</span>
      <span className="flex-1 text-sm text-slate-800">{report.name}</span>
      <span className="text-slate-400 text-lg">&gt;</span>
    </div>
  ));

  const inProgressText =
    summary.ordersInProgress === 0
      ? 'No orders currently in progress.'
      : summary.ordersInProgress + ' order' + (summary.ordersInProgress > 1 ? 's' : '') + ' being processed.';

  const inQueueText =
    summary.ordersInQueue === 0
      ? 'No orders waiting in queue.'
      : summary.ordersInQueue + ' order' + (summary.ordersInQueue > 1 ? 's' : '') + ' waiting to be processed.';

  const getCombinedChartData = () => {
    // Merge both datasets by date
    const mergedData = {};
    inProgressData.chartData.forEach((item) => {
      mergedData[item.date] = {
        date: item.date,
        inProgress: item.count,
        inQueue: 0,
      };
    });
    inQueueData.chartData.forEach((item) => {
      if (mergedData[item.date]) {
        mergedData[item.date].inQueue = item.count;
      } else {
        mergedData[item.date] = {
          date: item.date,
          inProgress: 0,
          inQueue: item.count,
        };
      }
    });

    const sortedData = Object.values(mergedData).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    if (sortedData.length === 0) {
      const now = new Date();
      const defaultData = [];

      if (period === 'month') {
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day += Math.ceil(daysInMonth / 10)) {
          const date = new Date(year, month, day);
          const dateStr = `${day} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
          defaultData.push({ date: dateStr, inProgress: 0, inQueue: 0 });
        }
      } else if (period === 'week') {
        const now2 = new Date();
        const dayOfWeek = now2.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now2);
        monday.setDate(now2.getDate() + diffToMonday);
        for (let i = 0; i < 7; i++) {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          const dateStr = `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
          defaultData.push({ date: dateStr, inProgress: 0, inQueue: 0 });
        }
      } else {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        months.forEach((m) => defaultData.push({ date: m, inProgress: 0, inQueue: 0 }));
      }

      return defaultData;
    }

    return sortedData;
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64 p-5 bg-slate-100 min-h-screen">
        <header className="bg-white rounded-lg shadow flex items-center justify-between p-4 md:p-6 mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Welcome to <span className="text-orange-500">Elints</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">Customer Support:</span>
            <span className="font-medium text-slate-800">📞 +91-6364444752</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md">🎧 Get Instant Online Support</button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
               Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <div className="flex flex-col gap-5 xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-600 font-medium">Orders In Progress</h3>
                  <span className="text-blue-500 text-2xl">🔄</span>
                </div>
                <div className="text-3xl font-bold text-slate-800">{summary.ordersInProgress}</div>
                <p className="text-slate-400 text-sm">{inProgressText}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-600 font-medium">Orders In Queue</h3>
                  <span className="text-orange-500 text-2xl">⏳</span>
                </div>
                <div className="text-3xl font-bold text-slate-800">{summary.ordersInQueue}</div>
                <p className="text-slate-400 text-sm">{inQueueText}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-600 font-medium">Order Trends</h3>
                <select
                  className="border border-slate-200 rounded px-3 py-1 text-sm"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div className="h-[300px] mt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getCombinedChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#888" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                    <Line type="monotone" dataKey="inProgress" stroke="#4A90E2" strokeWidth={2} dot={{ r: 4 }} name="In Progress" activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="inQueue" stroke="#FF9068" strokeWidth={2} dot={{ r: 4 }} name="In Queue" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-1 rounded-sm" style={{ backgroundColor: '#4A90E2' }}></span>
                <span className="text-slate-600 text-sm font-medium">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-1 rounded-sm" style={{ backgroundColor: '#FF9068' }}></span>
                <span className="text-slate-600 text-sm font-medium">In Queue</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
            <div className="text-6xl opacity-30 mb-3">🏪</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">It Looks So Empty in Here!</h3>
            <p className="text-slate-600 text-sm mb-4 text-center">Add one of our widgets to get started and view your business operations</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">+ Add Widget of Your Choice</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Most Used Reports</h3>
            <a href="/reports" className="text-blue-500 text-sm font-medium hover:underline">View All</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCards}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
