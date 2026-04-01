import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import ToastContainer from './components/ToastContainer';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CropAdvisorPage from './pages/CropAdvisorPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import ChatbotPage from './pages/ChatbotPage';
import WeatherPage from './pages/WeatherPage';
import PestAlertsPage from './pages/PestAlertsPage';
import MarketPricePage from './pages/MarketPricePage';
import FertilizerPage from './pages/FertilizerPage';
import MentorshipPage from './pages/MentorshipPage';

function AppLayout({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      {children}
      <BottomNav />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
              <Route path="/crop-advisor" element={<ProtectedRoute><AppLayout><CropAdvisorPage /></AppLayout></ProtectedRoute>} />
              <Route path="/disease" element={<ProtectedRoute><AppLayout><DiseaseDetectionPage /></AppLayout></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><AppLayout><ChatbotPage /></AppLayout></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><AppLayout><WeatherPage /></AppLayout></ProtectedRoute>} />
              <Route path="/pest-alerts" element={<ProtectedRoute><AppLayout><PestAlertsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/market" element={<ProtectedRoute><AppLayout><MarketPricePage /></AppLayout></ProtectedRoute>} />
              <Route path="/fertilizer" element={<ProtectedRoute><AppLayout><FertilizerPage /></AppLayout></ProtectedRoute>} />
              <Route path="/mentorship" element={<ProtectedRoute><AppLayout><MentorshipPage /></AppLayout></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
