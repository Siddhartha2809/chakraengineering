import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Login() {
  // 'login', 'register', or 'forgot'
  const [view, setView] = useState('login'); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  // Make sure resetPassword is exported from your AuthContext!
  const { login, signup, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 
    setSuccessMsg(''); 
    setIsSubmitting(true);
    
    try {
      if (view === 'login') {
        await login(email, password);
        navigate('/'); 
      } else if (view === 'register') {
        await signup(email, password, name);
        setSuccessMsg("Registration successful! Please verify your email to login.");
        setView('login'); 
        setPassword(''); 
      } else if (view === 'forgot') {
        await resetPassword(email);
        setSuccessMsg("Password reset link sent! Check your inbox.");
        setView('login');
      }
    } catch (error) {
      setErrorMsg(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleView = (newView) => {
    setView(newView);
    setErrorMsg('');
    setSuccessMsg(''); 
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* BACKGROUND GLOW ORBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#162E93]/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[450px] relative z-10">
        <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-[0_20px_60px_rgba(22,46,147,0.12)] border-white/60 relative group transition-all duration-500 hover:shadow-[0_30px_70px_rgba(22,46,147,0.2)]">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#162E93]/10 to-indigo-500/10 rounded-[3.1rem] blur opacity-50 -z-10 group-hover:opacity-100 transition duration-1000"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#162E93] rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-[#162E93]/40 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              {view === 'login' ? 'Access Portal' : view === 'register' ? 'Join Chakra' : 'Reset Password'}
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Engineering Excellence
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {successMsg && (
              <div className="p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl text-center shadow-sm animate-in fade-in slide-in-from-top-2 flex flex-col items-center">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700 leading-relaxed">
                  {successMsg}
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl text-center shadow-sm animate-in fade-in slide-in-from-top-2">
                <p className="text-xs font-black uppercase tracking-widest text-red-600">
                  {errorMsg}
                </p>
              </div>
            )}
            
            {view === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/80 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/80 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>

            {view !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/80 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            {view === 'login' && (
              <div className="flex justify-end mt-1">
                <button type="button" onClick={() => toggleView('forgot')} className="text-[10px] font-black uppercase tracking-widest text-[#162E93] hover:text-[#0F206C] transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center group/btn active:scale-95 ${
                isSubmitting ? 'bg-[#162E93]/60 shadow-none cursor-wait' : 'bg-[#162E93] hover:bg-[#0F206C] shadow-[#162E93]/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{view === 'login' ? 'Sign In' : view === 'register' ? 'Register' : 'Send Reset Link'}</span>
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggles */}
          <div className="mt-8 text-center flex flex-col space-y-3">
            {view === 'forgot' ? (
               <button onClick={() => toggleView('login')} className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center hover:text-[#162E93] transition-colors">
                 <ArrowLeft size={14} className="mr-1" /> Back to Login
               </button>
            ) : (
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {view === 'login' ? "New Customer? " : "Already Registered? "}
                <button 
                  type="button"
                  onClick={() => toggleView(view === 'login' ? 'register' : 'login')} 
                  className="text-[#162E93] font-black hover:underline"
                  disabled={isSubmitting}
                >
                  {view === 'login' ? 'Join' : 'Login'}
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center space-x-2 text-gray-400">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Gateway v3.0</span>
        </div>
      </div>
    </div>
  );
}