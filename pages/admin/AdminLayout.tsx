
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboardIcon, UsersIcon, FileTextIcon, HelpCircleIcon } from '../../components/icons';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 font-medium text-gray-600 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary text-white' : 'hover:bg-primary/10 hover:text-primary'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 px-4">Admin Menu</h2>
      </div>
      <nav className="p-4 space-y-2">
        <NavLink to="/admin" end className={navLinkClasses}>
          <LayoutDashboardIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/admin/agents" className={navLinkClasses}>
          <UsersIcon className="w-5 h-5 mr-3" />
          Agents
        </NavLink>
        <NavLink to="/admin/respondents" className={navLinkClasses}>
          <UsersIcon className="w-5 h-5 mr-3" />
          Respondents
        </NavLink>
        <NavLink to="/admin/questions" className={navLinkClasses}>
          <HelpCircleIcon className="w-5 h-5 mr-3" />
          Questions
        </NavLink>
        <NavLink to="/admin/surveys" className={navLinkClasses}>
          <FileTextIcon className="w-5 h-5 mr-3" />
          Surveys
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminLayout;
