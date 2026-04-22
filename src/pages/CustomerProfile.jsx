import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Building, Phone, MapPin, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function CustomerProfile() {
  const { user } = useAuth();
  
  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    company_name: '',
    phone: '',
    address: ''
  });
  
  // Password State
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load existing data when the page opens
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        company_name: user.company_name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          company_name: profile.company_name,
          phone: profile.phone,
          address: profile.address
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Updates the password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswords({ newPassword: '', confirmPassword: '' }); // Clear fields
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your company details and security preferences.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.type === 'success' && <CheckCircle2 size={18} className="mr-2" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleProfileUpdate} className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2rem] p-8">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
              <Building className="mr-2 text-blue-600" size={20} />
              Business Profile
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Company / Organization</label>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.company_name}
                    onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                    placeholder="e.g. L&T Shipyards"
                    className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="tel" 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email Address</label>
                  <div className="relative">
                    {/* Email is read-only because changing it requires email verification */}
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-400 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Billing Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                  Save Details
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Security */}
        <div className="md:col-span-1">
          <form onSubmit={handlePasswordChange} className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2rem] p-8 sticky top-24">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
              <Lock className="mr-2 text-red-500" size={20} />
              Security
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">New Password</label>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Confirm Password</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !passwords.newPassword}
                className="w-full bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-black text-sm transition-colors shadow-lg disabled:opacity-50 mt-4"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}