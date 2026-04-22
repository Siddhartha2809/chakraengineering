import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// --- COMPONENTS & PAGES ---
import Navbar from './components/NavBar';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminCalendar from './pages/AdminCalendar';
import AdminSettings from './pages/AdminSettings'; // <-- 1. IMPORT ADDED HERE
import AdminLayout from './components/AdminLayout';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProfile from './pages/CustomerProfile';

// Helper to wrap pages with the Navbar
const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
  </div>
);

export default function App() {
  const { user, loading } = useAuth();

  console.log("CHAKRA APP STATE:", { 
    isSyncing: loading, 
    role: user?.role, 
    email: user?.email 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Synchronizing with Chakra...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          !user ? (
            <PageWrapper><Home /></PageWrapper>
          ) : (
            <Navigate to={user.role === 'admin' ? "/admin" : "/my-orders"} replace />
          )
        } />

        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        
        <Route path="/login" element={
          !user ? <PageWrapper><Login /></PageWrapper> : <Navigate to="/" replace />
        } />

        <Route path="/booking" element={
          user ? <PageWrapper><Booking /></PageWrapper> : <Navigate to="/login" />
        } />

        <Route path="/my-orders" element={
          user ? <PageWrapper><CustomerDashboard /></PageWrapper> : <Navigate to="/login" />
        } />
        
        <Route path="/profile" element={
          user ? <PageWrapper><CustomerProfile /></PageWrapper> : <Navigate to="/login" />
        } />

        {/* =========================================
            ADMIN ROUTES (Secure)
            ========================================= */}
        <Route path="/admin" element={
          user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/" />
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="settings" element={<AdminSettings />} /> {/* <-- 2. ROUTE ADDED HERE */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}