import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Calendar, DollarSign, Zap, Clock, ArrowUpDown, Download } from 'lucide-react';
import { getUsageMetrics } from '../api/tokenTracking';
import type { UsageMetrics } from '../types/supabase';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage: React.FC = () => {
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [metrics, setMetrics] = useState<UsageMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadMetrics();
  }, [periodType, dateRange]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await getUsageMetrics(periodType, dateRange.start, dateRange.end);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tokenUsageData = {
    labels: metrics.map(m => new Date(m.period_start).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Tokens',
        data: metrics.map(m => m.total_tokens),
        borderColor: 'rgb(56, 189, 248)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Cached Tokens',
        data: metrics.map(m => m.cached_tokens),
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const costData = {
    labels: metrics.map(m => new Date(m.period_start).toLocaleDateString()),
    datasets: [
      {
        label: 'Cost (USD)',
        data: metrics.map(m => m.total_cost),
        backgroundColor: 'rgba(56, 189, 248, 0.8)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  const totalMetrics = metrics.reduce(
    (acc, curr) => ({
      total_tokens: acc.total_tokens + curr.total_tokens,
      total_cost: acc.total_cost + curr.total_cost,
      total_requests: acc.total_requests + curr.total_requests,
      avg_response_time: acc.avg_response_time + curr.avg_response_time
    }),
    { total_tokens: 0, total_cost: 0, total_requests: 0, avg_response_time: 0 }
  );

  const avgResponseTime = metrics.length 
    ? totalMetrics.avg_response_time / metrics.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 ${
                periodType === 'daily'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setPeriodType('daily')}
            >
              Daily
            </button>
            <button
              className={`px-4 py-2 ${
                periodType === 'weekly'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setPeriodType('weekly')}
            >
              Weekly
            </button>
            <button
              className={`px-4 py-2 ${
                periodType === 'monthly'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setPeriodType('monthly')}
            >
              Monthly
            </button>
          </div>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
            onClick={() => {
              // Export data logic here
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Tokens</p>
              <p className="text-2xl font-semibold text-white">
                {totalMetrics.total_tokens.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Cost</p>
              <p className="text-2xl font-semibold text-white">
                ${totalMetrics.total_cost.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-2xl font-semibold text-white">
                {totalMetrics.total_requests.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <ArrowUpDown className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-semibold text-white">
                {(avgResponseTime / 1000).toFixed(2)}s
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Token Usage</h2>
          <div className="h-80">
            <Line data={tokenUsageData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cost Analysis</h2>
          <div className="h-80">
            <Bar data={costData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-left text-sm">
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Total Tokens</th>
                <th className="pb-3 font-medium">Cached Tokens</th>
                <th className="pb-3 font-medium">Cost</th>
                <th className="pb-3 font-medium">Requests</th>
                <th className="pb-3 font-medium">Avg Response Time</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.id} className="border-t border-gray-700">
                  <td className="py-3 text-white">
                    {new Date(metric.period_start).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-gray-300">
                    {metric.total_tokens.toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-300">
                    {metric.cached_tokens.toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-300">
                    ${metric.total_cost.toFixed(2)}
                  </td>
                  <td className="py-3 text-gray-300">
                    {metric.total_requests.toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-300">
                    {(metric.avg_response_time / 1000).toFixed(2)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;