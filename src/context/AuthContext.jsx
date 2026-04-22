import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Chakra Auth] Event: ${event}`);

      if (session?.user) {
        const sessionUser = {
          id: session.user.id,
          email: session.user.email,
          role: session.user.email === 'chakraengineeringworks@gmail.com' ? 'admin' : 'customer',
          name: session.user.user_metadata?.name || 'Chakra Santhosh'
        };

        console.log("[Chakra Auth] Setting Instant Role:", sessionUser.role);
        
        setUser(sessionUser);
        setLoading(false); 

        fetchProfileBackground(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileBackground = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        console.log("[Chakra Auth] DB Sync Success. Role in DB is:", data.role);
        setUser(data);
      }
    } catch (err) {
      console.warn("[Chakra Auth] DB Sync failed. Staying with session role.");
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { name } }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- NEW SECURITY FUNCTIONS ---
  
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/settings`, 
    });
    if (error) throw error;
  };

  const updateEmail = async (newEmail) => {
    const { error: authError } = await supabase.auth.updateUser({ email: newEmail });
    if (authError) throw authError;

    // Optional: Only run this if you want your custom 'users' table to sync
    if (user?.id) {
      const { error: dbError } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', user.id);
      if (dbError) throw dbError;
    }
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  return (
    // Make sure to add the new functions to the value provider here!
    <AuthContext.Provider value={{ user, login, signup, logout, loading, resetPassword, updateEmail, updatePassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);