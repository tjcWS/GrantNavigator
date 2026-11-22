import { Navigate, Route, Routes } from 'react-router-dom';
import {
  ApplicationPage, ApplicationsPage, GrantDetailsPage, GrantsPage, InterestsPage, NotFoundPage,
  ProfilePage, ProjectPage, ProjectsPage, RegistrationPage,
} from '@/pages';
import { AppLayout } from '@/widgets/app-layout';
import { RequireAuth } from './RequireAuth';

/** Все маршруты приложения (те же адреса, что были в лабораторной 1). */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/grants" replace />} />
      <Route path="/registration" element={<RegistrationPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/interests" element={<InterestsPage />} />

        <Route element={<AppLayout />}>
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/grants/:id" element={<GrantDetailsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectPage />} />
          <Route path="/projects/:id" element={<ProjectPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/:id" element={<ApplicationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
