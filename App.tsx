
import React from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import SurveyFormPage from './pages/survey-form/SurveyFormPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAgents from './pages/admin/ManageAgents';
import ManageRespondents from './pages/admin/ManageRespondents';
import ManageQuestions from './pages/admin/ManageQuestions';
import ViewSurveys from './pages/admin/ViewSurveys';
import SurveyDetailsPage from './pages/admin/SurveyDetailsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/survey-form" element={<SurveyFormPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="agents" element={<ManageAgents />} />
              <Route path="respondents" element={<ManageRespondents />} />
              <Route path="questions" element={<ManageQuestions />} />
              <Route path="surveys" element={<ViewSurveys />} />
              <Route path="surveys/:id" element={<SurveyDetailsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/survey-form" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const Header: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-primary">MarketSurvey Pro</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink
                to="/survey-form"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive && !isAdmin ? 'bg-primary text-white' : 'text-gray-500 hover:bg-primary hover:text-white'
                  }`
                }
              >
                Survey Form
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive || isAdmin ? 'bg-primary text-white' : 'text-gray-500 hover:bg-primary hover:text-white'
                  }`
                }
              >
                Admin Panel
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default App;
