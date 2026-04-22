import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, CheckCircle2, Loader2, Save } from 'lucide-react';

export default function AdminSettings() {
  const { user, updateEmail, updatePassword } = useAuth();
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    
    if (!newEmail && !newPassword) {
      setStatus({ type: 'error', msg: 'Please fill out at least one field to update.' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (newEmail) {
        await updateEmail(newEmail);
      }
      if (newPassword) {
        await updatePassword(newPassword);
      }
      
      setStatus({ type: 'success', msg: 'Credentials updated successfully! If you changed your email, check your inbox for a confirmation link.' });
      setNewEmail('');
      setNewPassword('');
    } catch (error) {
      setStatus({ type: 'error', msg: error.message || 'Failed to update settings.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 lg:pb-0 relative animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">Security Settings</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base font-medium">Manage your admin access credentials.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl overflow-hidden p-6 md:p-10">
        
        <div className="flex items-center space-x-4 mb-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Current Admin Account</p>
            <p className="font-bold text-gray-800">{user?.email}</p>
          </div>
        </div>

        {status.msg && (
          <div className={`p-4 rounded-2xl mb-8 border flex items-center space-x-3 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {status.type === 'success' && <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />}
            <p className="text-xs font-black uppercase tracking-wider leading-relaxed">
              {status.msg}
            </p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6 max-w-lg">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Update Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email (leave blank to keep current)"
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-2xl outline-none focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Update Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (leave blank to keep current)"
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-2xl outline-none focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`mt-4 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center transition-all ${
              isSubmitting ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Updating Security...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}