import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import PanelLogin from './PanelLogin';
import Dashboard from './Dashboard';
import * as S from './screens';
import PagesList from './PagesList';
import PageEditor from './PageEditor';
import CrmApp from './crm/CrmApp';

const AdminApp: React.FC = () => (
  <Routes>
    <Route path="crm/*" element={<CrmApp />} />
    <Route path="login" element={<PanelLogin />} />
    <Route element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="pages" element={<PagesList />} />
      <Route path="pages/:id" element={<PageEditor />} />
      <Route path="projects" element={<S.ProjectsScreen />} />
      <Route path="services" element={<S.ServicesScreen />} />
      <Route path="careers" element={<S.CareersContentScreen />} />
      <Route path="careers/openings" element={<S.OpeningsScreen />} />
      <Route path="applications" element={<S.ApplicationsScreen />} />
      <Route path="media" element={<S.MediaScreen />} />
      <Route path="enquiries" element={<S.EnquiriesScreen />} />
      <Route path="navigation" element={<S.NavigationScreen />} />
      <Route path="settings" element={<S.SettingsScreen />} />
      <Route path="activity" element={<S.ActivityScreen />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Route>
  </Routes>
);
export default AdminApp;
