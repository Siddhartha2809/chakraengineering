import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/calendar', label: 'Schedule', icon: Calendar },
    { path: 'logout', label: 'Exit', icon: LogOut }
  ];

  const activeIndex = menuItems.findIndex(item => item.path === location.pathname);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f1f5f9] overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      {/* DESKTOP SIDEBAR (Simplified for consistency) */}
      <aside className="hidden lg:flex w-64 flex-col m-4 mr-2 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white shadow-sm relative z-10">
        <div className="p-8 text-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">C</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chakra Admin</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.filter(i => i.path !== 'logout').map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-white/40'}`}>
              <item.icon size={18} />
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4"><button onClick={logout} className="w-full py-3 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Logout</button></div>
      </aside>

      {/* ELEGANT MOBILE NAV - Sliding White Capsule */}
      <nav className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-16 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex items-center z-50 px-1.5">
        
        {/* THE SLIDING WHITE CAPSULE */}
        <div 
          className="absolute h-[80%] w-[31%] bg-white rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"
          style={{ 
            left: activeIndex === -1 ? '-100%' : `${(activeIndex * 33) + 1}%`,
          }}
        />

        {menuItems.map((item, idx) => (
          item.path === 'logout' ? (
            <button key={idx} onClick={logout} className="relative z-10 flex-1 flex items-center justify-center h-full text-gray-400">
              <item.icon size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <Link 
              key={idx} 
              to={item.path} 
              className={`relative z-10 flex-1 flex items-center justify-center h-full transition-colors duration-500 ${
                location.pathname === item.path ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            </Link>
          )
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative z-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-6 lg:px-10">
          <div className="lg:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">C</div>
            <span className="font-black text-[10px] uppercase tracking-tighter">Admin</span>
          </div>

          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md border border-white p-1.5 rounded-full pr-4 shadow-sm ml-auto">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] border border-white">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-[10px] leading-tight">{user?.name}</span>
              <span className="text-[8px] text-blue-600 font-black uppercase">Owner</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-32 lg:pb-10">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}