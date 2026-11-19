import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider } from './session';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import ResourcePage from './ResourcePage';
import Followups from './Followups';
import Users from './Users';
import Roles from './Roles';
import Activity from './Activity';
import Settings from './Settings';
import Media from './Media';
import LeadsPage from './LeadsPage';
import Employees from './Employees';
import Reports from './Reports';

const CrmApp: React.FC = () => (
  <SessionProvider>
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="properties" element={<ResourcePage rkey="properties" />} />
        <Route path="parcels" element={<ResourcePage rkey="parcels" />} />
        <Route path="landowners" element={<ResourcePage rkey="landowners" />} />
        <Route path="buyers" element={<ResourcePage rkey="buyers" />} />
        <Route path="enquiries" element={<ResourcePage rkey="enquiries" />} />
        <Route path="followups" element={<Followups />} />
        <Route path="site-visits" element={<ResourcePage rkey="siteVisits" />} />
        <Route path="customers" element={<ResourcePage rkey="customers" />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="proposals" element={<ResourcePage rkey="proposals" />} />
        <Route path="bookings" element={<ResourcePage rkey="bookings" />} />
        <Route path="tasks" element={<ResourcePage rkey="tasks" />} />
        <Route path="employees" element={<Employees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="media" element={<Media />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin/crm" replace />} />
      </Route>
    </Routes>
  </SessionProvider>
);
export default CrmApp;
