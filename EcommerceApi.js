import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ProgramsPage from '@/pages/ProgramsPage';
import ImpactStoriesPage from '@/pages/ImpactStoriesPage';
import NewsEventsPage from '@/pages/NewsEventsPage';
import GrantMakerPortal from '@/pages/GrantMakerPortal';
import TransparencyPage from '@/pages/TransparencyPage';
import ContactPage from '@/pages/ContactPage';
import VolunteerPage from '@/pages/VolunteerPage';
import DonationPage from '@/pages/DonationPage';
import DonationSuccessPage from '@/pages/DonationSuccessPage';
import DonationCancelPage from '@/pages/DonationCancelPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AdminDashboard from '@/pages/AdminDashboard';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/impact-stories" element={<ImpactStoriesPage />} />
            <Route path="/news-events" element={<NewsEventsPage />} />
            <Route path="/grant-maker-portal" element={<GrantMakerPortal />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/donate" element={<DonationPage />} />
            <Route path="/donation-success" element={<DonationSuccessPage />} />
            <Route path="/donation-cancel" element={<DonationCancelPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;