import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import MobileMenu from './components/Layout/MobileMenu';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Toast from './components/UI/Toast';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));

function App() {
  const { theme } = useTheme();

  return (
    <div className={`app theme-${theme}`}>
      <ErrorBoundary>
        <Navbar />
        <Sidebar />
        <MobileMenu />
        <main className="app__content" role="main">
          <Suspense fallback={<LoadingSpinner fullscreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/events/*"
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/*"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificates"
                element={
                  <ProtectedRoute>
                    <CertificatesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/dashboard" element={<Navigate to="/events" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toast />
      </ErrorBoundary>
    </div>
  );
}

export default App;
