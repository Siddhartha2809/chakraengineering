import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, ChevronRight, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 

  const isActive = (path) => {
    return location.pathname === path 
      ? "text-blue-600 font-black" 
      : "text-gray-500 hover:text-blue-600 font-bold";
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50">
      
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
          C
        </div>
        <Link to="/" className="text-xl font-black text-gray-900 tracking-tighter">
          CHAKRA ENGINEERING <span className="text-blue-600 hidden sm:inline">WORKS</span>
        </Link>
      </div>

      {/* DESKTOP LINKS (Hidden on Mobile) */}
      <div className="hidden md:flex space-x-8 items-center text-[11px] uppercase tracking-[0.2em]">
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/services" className={isActive('/services')}>Services</Link>
        
        {/* Customer Specific Links */}
        {user && user.role !== 'admin' && (
          <>
            <Link to="/booking" className={isActive('/booking')}>Book Work</Link>
            <Link to="/my-orders" className={isActive('/my-orders')}>My Portal</Link>
            <Link to="/profile" className={isActive('/profile')}>Profile</Link>
          </>
        )}
        
        {/* Admin Specific Links */}
        {user?.role === 'admin' && (
          <Link to="/admin" className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black border border-blue-100 transition-all">
            <LayoutDashboard size={14} />
            <span>Admin</span>
          </Link>
        )}
      </div>
      
      {/* MOBILE ACTIONS & HAMBURGER */}
      <div className="flex items-center space-x-4">
        {!user && (
          <Link to="/login" className="md:hidden text-blue-600 font-black text-[10px] uppercase tracking-widest">
            Login
          </Link>
        )}

        {/* Hamburger Icon for Mobile */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-xl"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* User Profile (Desktop Only) */}
        {user && (
          <div className="hidden md:flex items-center space-x-4 border-l pl-8 border-gray-100">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-800 leading-none uppercase">{user.name}</span>
              <span className="text-[8px] text-blue-600 font-bold uppercase mt-1">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-2xl bg-white/50 text-gray-400 hover:text-red-600 transition-all shadow-sm">
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Login Button (Desktop Only) */}
        {!user && (
          <Link to="/login" className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-[1.2rem] font-bold text-sm shadow-xl shadow-blue-200">
            <span>Client Access</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* MOBILE OVERLAY MENU */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-gray-100 p-8 flex flex-col space-y-6 md:hidden animate-in slide-in-from-top-5 duration-300">
          <Link onClick={() => setIsMenuOpen(false)} to="/" className={`text-lg font-black ${isActive('/')}`}>Home</Link>
          <Link onClick={() => setIsMenuOpen(false)} to="/services" className={`text-lg font-black ${isActive('/services')}`}>Services</Link>
          
          {/* Customer Specific Mobile Links */}
          {user && user.role !== 'admin' && (
            <>
              <Link onClick={() => setIsMenuOpen(false)} to="/booking" className={`text-lg font-black ${isActive('/booking')}`}>Book Work</Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/my-orders" className={`text-lg font-black ${isActive('/my-orders')}`}>My Portal</Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/profile" className={`text-lg font-black ${isActive('/profile')}`}>Profile</Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link onClick={() => setIsMenuOpen(false)} to="/admin" className="text-lg font-black text-blue-600">Admin Dashboard</Link>
          )}

          {user && (
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}