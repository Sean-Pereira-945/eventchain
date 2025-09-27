import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -24 }
  };

  const pageTransition = { duration: 0.35, ease: 'easeOut' };

  return (
    <div className={`app theme-${theme}`}>
      <ErrorBoundary>
        <Navbar />
        <MobileMenu />
        <main className="app__content" role="main">
          <Sidebar />
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingSpinner fullscreen message="Loading experience…" />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition variants={pageVariants} transition={pageTransition}><HomePage /></PageTransition>} />
                <Route path="/about" element={<PageTransition variants={pageVariants} transition={pageTransition}><AboutPage /></PageTransition>} />
                <Route path="/contact" element={<PageTransition variants={pageVariants} transition={pageTransition}><ContactPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition variants={pageVariants} transition={pageTransition}><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition variants={pageVariants} transition={pageTransition}><Register /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition variants={pageVariants} transition={pageTransition}><ForgotPassword /></PageTransition>} />
                <Route
                  path="/events/*"
                  element={
                    <ProtectedRoute>
                      <PageTransition variants={pageVariants} transition={pageTransition}>
                        <EventsPage />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/*"
                  element={
                    <ProtectedRoute>
                      <PageTransition variants={pageVariants} transition={pageTransition}>
                        <ProfilePage />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificates"
                  element={
                    <ProtectedRoute>
                      <PageTransition variants={pageVariants} transition={pageTransition}>
                        <CertificatesPage />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route path="/verify" element={<PageTransition variants={pageVariants} transition={pageTransition}><VerificationPage /></PageTransition>} />
                <Route path="/dashboard" element={<Navigate to="/events" replace />} />
                <Route path="*" element={<PageTransition variants={pageVariants} transition={pageTransition}><NotFoundPage /></PageTransition>} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
        <Toast />
      </ErrorBoundary>
    </div>
  );
}

export default App;

const PageTransition = ({ children, variants, transition }) => (
  <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={transition} className="page-transition">
    {children}
  </motion.div>
);
