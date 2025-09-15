
import React from 'react';
import { UsersIcon, FileTextIcon, HelpCircleIcon } from '../../components/icons';

const AdminDashboard: React.FC = () => {
  const stats = [
    { name: 'Total Surveys', value: '1,204', icon: FileTextIcon, color: 'bg-blue-500' },
    { name: 'Agents Active', value: '12', icon: UsersIcon, color: 'bg-green-500' },
    { name: 'Total Questions', value: '45', icon: HelpCircleIcon, color: 'bg-yellow-500' },
    { name: 'Respondents', value: '876', icon: UsersIcon, color: 'bg-pink-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600">Recent activity feed will be displayed here.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
