import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore.js';
import AppLayout from './components/layout/AppLayout.jsx';
import { Spinner } from './components/ui/Spinner.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Weight = lazy(() => import('./pages/Weight.jsx'));
const Workouts = lazy(() => import('./pages/Workouts.jsx'));
const Nutrition = lazy(() => import('./pages/Nutrition.jsx'));
const Sleep = lazy(() => import('./pages/Sleep.jsx'));
const Calories = lazy(() => import('./pages/Calories.jsx'));
const Caffeine = lazy(() => import('./pages/Caffeine.jsx'));
const Compare = lazy(() => import('./pages/Compare.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

const PageFallback = () => (
  <div className="flex items-center justify-center h-screen bg-abyss">
    <Spinner size="lg" />
  </div>
);

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading) return <PageFallback />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading) return <PageFallback />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// Kicks off session recovery on mount. isLoading stays true until it resolves,
// so ProtectedRoute / PublicRoute never make a routing decision on stale state.
function AppInitializer({ children }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="weight" element={<Weight />} />
              <Route path="workouts" element={<Workouts />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="sleep" element={<Sleep />} />
              <Route path="calories" element={<Calories />} />
              <Route path="caffeine" element={<Caffeine />} />
              <Route path="compare" element={<Compare />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppInitializer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1E2335',
          border: '0.5px solid #3A4160',
          color: '#F4F6FF',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 14,
          borderRadius: 10,
        }}
      />
    </BrowserRouter>
  );
}
