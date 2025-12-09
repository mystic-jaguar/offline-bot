import React from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const AnalyticsCharts = () => {
  const {
    getDailyChartData,
    getCategoryChartData,
    getTopQuestions,
    totalQuestions
  } = useAnalytics();

  const dailyData = getDailyChartData();
  const categoryData = getCategoryChartData();
  const topQuestions = getTopQuestions(5);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Activity (Last 7 Days)
        </h3>
        <div className="h-64 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          {dailyData.length > 0 ? (
            <div className="min-w-0 min-h-0 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                  <Legend />
                  <Line type="monotone" dataKey="questions" name="Questions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Categories
          </h3>
          <div className="h-72 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            {categoryData.length > 0 ? (
              <div className="min-w-0 min-h-0 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No category data yet
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Top Questions
          </h3>
          <div className="h-72 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            {topQuestions.length > 0 ? (
              <div className="min-w-0 min-h-0 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topQuestions} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="question" angle={-20} textAnchor="end" interval={0} height={60} stroke="#6b7280" />
                    <YAxis allowDecimals={false} stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="count" name="Count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No repeated questions yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Total questions analyzed: <span className="font-medium text-gray-900 dark:text-gray-100">{totalQuestions}</span>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
