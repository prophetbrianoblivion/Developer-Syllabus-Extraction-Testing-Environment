import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  AlertCircle, 
  FileText, 
  Zap, 
  BarChart,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [isApiConnected, setIsApiConnected] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(42);
  const [totalSessions, setTotalSessions] = useState(7);
  const [totalTokens, setTotalTokens] = useState(1245678);
  const [avgAccuracy, setAvgAccuracy] = useState(87.3);
  
  // Example chart data
  const chartData = {
    labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7'],
    datasets: [
      {
        label: 'Tokens Used',
        data: [65000, 120000, 95000, 180000, 240000, 210000, 335678],
        borderColor: 'rgb(56, 189, 248)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Extraction Accuracy',
        data: [78, 82, 80, 85, 83, 86, 87.3],
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        tension: 0.3,
        yAxisID: 'y1',
      }
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        title: {
          display: true,
          text: 'Tokens',
          color: 'rgb(156, 163, 175)',
        }
      },
      y1: {
        beginAtZero: false,
        position: 'right' as const,
        min: 75,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        title: {
          display: true,
          text: 'Accuracy (%)',
          color: 'rgb(156, 163, 175)',
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  };
  
  const recentSessions = [
    { id: '1', name: 'Spring 2023 Syllabi Batch', date: '2023-05-15', documents: 12, accuracy: 86 },
    { id: '2', name: 'Fall 2023 Engineering Dept', date: '2023-05-12', documents: 8, accuracy: 91 },
    { id: '3', name: 'Prompt Testing - Version 2.4', date: '2023-05-10', documents: 5, accuracy: 84 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Developer Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">
            {isApiConnected ? 'Deepseek API Connected' : 'API Connection Error'}
          </span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Documents</p>
              <p className="text-2xl font-semibold text-white">{totalDocuments}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            +8 in the last 7 days
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Test Sessions</p>
              <p className="text-2xl font-semibold text-white">{totalSessions}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BarChart className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            +2 in the last 7 days
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tokens Used</p>
              <p className="text-2xl font-semibold text-white">{totalTokens.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Zap className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Est. cost: ${(totalTokens * 0.00002).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Accuracy</p>
              <p className="text-2xl font-semibold text-white">{avgAccuracy}%</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <BarChart2 className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            +2.1% from last session
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Performance Metrics</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      {/* Recent Sessions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
          <Link 
            to="/sessions" 
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-left text-sm">
                <th className="pb-3 font-medium">Session Name</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Documents</th>
                <th className="pb-3 font-medium">Accuracy</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id} className="border-t border-gray-700">
                  <td className="py-3 text-white">{session.name}</td>
                  <td className="py-3 text-gray-400">{session.date}</td>
                  <td className="py-3 text-gray-400">{session.documents}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            session.accuracy >= 90 ? 'bg-green-500' : 
                            session.accuracy >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${session.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-400">{session.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link 
                      to={`/sessions/${session.id}`}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Alerts */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">System Alerts</h2>
        
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-yellow-500/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Token usage approaching limit</p>
              <p className="text-sm text-gray-400 mt-1">
                You've used 83% of your monthly token allocation. Consider optimizing prompts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-3 bg-gray-700/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Prompt version 2.4 is performing well</p>
              <p className="text-sm text-gray-400 mt-1">
                The latest prompt version shows a 3.2% accuracy improvement over version 2.3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;