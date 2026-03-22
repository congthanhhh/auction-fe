import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import ViewAll from './pages/ViewAll';
import Recommended from './pages/Recommended';
import { ThemeProvider } from './components/theme-provider';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { GoogleAuthCallback } from './pages/GoogleAuthCallback';
import { useAuthStore } from './stores/authStore';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          {/* Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="view-all-featured" element={<ViewAll />} />
            <Route path="view-all-recommended" element={<Recommended />} />
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
