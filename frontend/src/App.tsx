import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import RegistrationPage from './pages/RegistrationPage';
import InterestsPage from './pages/InterestsPage';
import GrantsPage from './pages/GrantsPage';
import GrantDetailPage from './pages/GrantDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectFormPage from './pages/ProjectFormPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationEditPage from './pages/ApplicationEditPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Карта всех страниц приложения (адреса из README).
export default function App() {
  return (
    <Routes>
      {/* Страницы без верхнего меню: вход и первичная настройка */}
      <Route element={<AuthLayout />}>
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/interests" element={<InterestsPage />} />
      </Route>

      {/* Основные страницы с верхним меню */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/grants" replace />} />
        <Route path="/grants" element={<GrantsPage />} />
        <Route path="/grants/:id" element={<GrantDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectFormPage key="new" />} />
        <Route path="/projects/:id" element={<ProjectFormPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationEditPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
