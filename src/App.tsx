import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import MyInvoices from './pages/MyInvoices';
import InvoiceDetailPage from './pages/InvoiceDetail';
import { VnPayCallback } from './pages/VnPayCallback';
import MyJoinedAuctions from './pages/MyJoinedAuctions';
import MySessions from './pages/MySessions';
import MySales from './pages/MySales';
import ViewAll from './components/auction/ViewAll';
import Recommended from './components/auction/Recommended';
import { ThemeProvider } from './components/theme-provider';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { GoogleAuthCallback } from './pages/GoogleAuthCallback';
import { useAuthStore } from './stores/authStore';
import Detail from './components/auction/Detail';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Stories from './pages/Stories';
import { AdminRoute } from './components/admin/layout/AdminRoute';
import { AdminLayout } from './components/admin/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminCategories from './pages/admin/AdminCategories';
import AdminRoles from './pages/admin/AdminRoles';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-invoices" element={<MyInvoices />} />
            <Route path="my-invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="my-joined" element={<MyJoinedAuctions />} />
            <Route path="my-sessions" element={<MySessions />} />
            <Route path="my-sales" element={<MySales />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:id" element={<CategoryProducts />} />
            <Route path="view-all-featured" element={<ViewAll />} />
            <Route path="view-all-recommended" element={<Recommended />} />
            <Route path="auction/:id" element={<Detail />} />
            <Route path="payment-result" element={<VnPayCallback />} />
            <Route path="stories" element={<Stories />} />
          </Route>

          {/* Routes without MainLayout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authenticate" element={<GoogleAuthCallback />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="auctions" element={<AdminAuctions />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
