import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import MyInvoices from './pages/MyInvoices';
import InvoiceDetailPage from './pages/InvoiceDetail';
import { VnPayCallback } from './pages/VnPayCallback';
import MyJoinedAuctions from './pages/MyJoinedAuctions';
import ViewAll from './components/auction/ViewAll';
import Recommended from './components/auction/Recommended';
import { ThemeProvider } from './components/theme-provider';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { GoogleAuthCallback } from './pages/GoogleAuthCallback';
import { useAuthStore } from './stores/authStore';
import Detail from './components/auction/Detail';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          {/* Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-invoices" element={<MyInvoices />} />
            <Route path="my-invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="my-joined" element={<MyJoinedAuctions />} />
            <Route path="view-all-featured" element={<ViewAll />} />
            <Route path="view-all-recommended" element={<Recommended />} />
            <Route path="auction/:id" element={<Detail />} />
            <Route path="payment-result" element={<VnPayCallback />} />
          </Route>

          {/* Routes without MainLayout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authenticate" element={<GoogleAuthCallback />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
