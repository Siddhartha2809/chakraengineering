import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle2, Loader2, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for handling counter-offers
  const [proposingJobId, setProposingJobId] = useState(null);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id) // Only fetch this customer's jobs
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Accept the Admin's proposed dates ---
  const acceptAdminDates = async (order) => {
    try {
      const { error } = await supabase.from('jobs').update({
        status: 'Approved',
        start_date: order.proposed_start_date,
        end_date: order.proposed_end_date,
        proposed_start_date: null,
        proposed_end_date: null
      }).eq('id', order.id);

      if (error) throw error;
      
      // Update local state instantly for snappy UI
      setMyOrders(myOrders.map(job => job.id === order.id ? { 
        ...job, 
        status: 'Approved', 
        start_date: order.proposed_start_date, 
        end_date: order.proposed_end_date,
        proposed_start_date: null,
        proposed_end_date: null
      } : job));

    } catch (err) {
      console.error("Error accepting dates:", err.message);
      alert("Failed to accept dates.");
    }
  };

  // --- NEW: Send a counter-offer back to the Admin ---
  const sendCounterOffer = async (order) => {
    if (!newStart || !newEnd) return alert("Please select both a start and end date.");
    
    try {
      const { error } = await supabase.from('jobs').update({
        status: 'Customer Proposed',
        proposed_start_date: newStart,
        proposed_end_date: newEnd
      }).eq('id', order.id);

      if (error) throw error;

      setMyOrders(myOrders.map(job => job.id === order.id ? { 
        ...job, 
        status: 'Customer Proposed', 
        proposed_start_date: newStart, 
        end_date: newEnd 
      } : job));
      
      setProposingJobId(null);
      setNewStart('');
      setNewEnd('');
    } catch (err) {
      console.error("Error proposing dates:", err.message);
      alert("Failed to send counter offer.");
    }
  };

  const getStatusStep = (status) => {
    if (status === 'Pending' || status === 'Admin Proposed' || status === 'Customer Proposed') return 1;
    if (status === 'Approved') return 2;
    if (status === 'In Progress') return 3;
    if (status === 'Completed') return 4;
    return 1;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">My Portal</h1>
            <p className="text-gray-500 font-medium mt-1">Track your engineering requests</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/60 backdrop-blur-md p-2 px-4 rounded-full border border-white shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Live Sync</span>
          </div>
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl">
              <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading your data...</p>
            </div>
          ) : myOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl text-center px-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <Package size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">No Active Projects</h2>
              <p className="text-gray-500 font-medium mb-8">You haven't submitted any fabrication requests yet.</p>
              <Link to="/booking" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center">
                Start a Request <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 p-8 relative overflow-hidden group transition-all hover:shadow-2xl">
                
                {/* Top Row: Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-800">{order.service}</h3>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        {order.job_number} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right bg-white/60 p-3 md:p-0 md:bg-transparent rounded-xl border border-white md:border-none">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Target End Date</p>
                    <p className={`text-lg md:text-2xl font-black ${order.status === 'Admin Proposed' || order.status === 'Customer Proposed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {order.end_date}
                    </p>
                  </div>
                </div>

                {/* --- NEW: NEGOTIATION BANNERS --- */}
                {order.status === 'Customer Proposed' && (
                  <div className="mb-8 p-4 bg-pink-50 border border-pink-100 rounded-2xl flex items-start space-x-3">
                    <Clock className="text-pink-500 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-pink-600 mb-1">Pending Admin Approval</p>
                      <p className="text-sm font-bold text-gray-700">You suggested starting on <span className="text-pink-600">{order.proposed_start_date}</span> and ending on <span className="text-pink-600">{order.proposed_end_date}</span>. Waiting for the shop floor to confirm.</p>
                    </div>
                  </div>
                )}

                {order.status === 'Admin Proposed' && (
                  <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
                    <div className="flex items-start space-x-3 mb-4">
                      <AlertCircle className="text-amber-500 mt-0.5" size={20} />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Action Required: Schedule Adjustment</p>
                        <p className="text-sm font-bold text-gray-700">The shop floor cannot accommodate your original timeline. They have proposed the following dates:</p>
                        <div className="mt-2 bg-white/60 p-3 rounded-xl border border-amber-100 flex gap-4">
                          <p className="text-sm font-bold text-gray-800"><span className="text-gray-400 text-xs mr-1">START:</span>{order.proposed_start_date}</p>
                          <p className="text-sm font-bold text-gray-800"><span className="text-gray-400 text-xs mr-1">END:</span>{order.proposed_end_date}</p>
                        </div>
                      </div>
                    </div>

                    {proposingJobId === order.id ? (
                      <div className="mt-4 pt-4 border-t border-amber-200/50 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3">Suggest Different Dates</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="date" onChange={e => setNewStart(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-200 text-sm font-bold text-gray-700 outline-none focus:border-amber-500 bg-white" />
                          </div>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="date" onChange={e => setNewEnd(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-200 text-sm font-bold text-gray-700 outline-none focus:border-amber-500 bg-white" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => sendCounterOffer(order)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-colors">Send Counter Offer</button>
                          <button onClick={() => setProposingJobId(null)} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-black transition-colors">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => acceptAdminDates(order)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center shadow-lg shadow-emerald-200"><CheckCircle2 size={16} className="mr-2"/> Accept New Dates</button>
                        <button onClick={() => setProposingJobId(order.id)} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black transition-all">Propose Alternative</button>
                      </div>
                    )}
                  </div>
                )}
                {/* ------------------------------------ */}

                {/* PROGRESS TRACKER */}
                <div className="relative pt-4 pb-8">
                  {/* Background Line */}
                  <div className="absolute top-8 left-0 w-full h-1 bg-gray-200/50 rounded-full"></div>
                  {/* Active Progress Line */}
                  <div 
                    className={`absolute top-8 left-0 h-1 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)] ${order.status.includes('Proposed') ? 'bg-amber-400' : 'bg-blue-600'}`}
                    style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                  ></div>

                  <div className="relative flex justify-between">
                    {[
                      { label: 'Requested', step: 1 },
                      { label: 'Approved', step: 2 },
                      { label: 'In Progress', step: 3 },
                      { label: 'Completed', step: 4 },
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-700 z-10 ${
                          getStatusStep(order.status) >= s.step 
                          ? (order.status.includes('Proposed') && s.step === 1 ? "bg-amber-500 border-amber-100 text-white shadow-lg shadow-amber-200" : "bg-blue-600 border-blue-100 text-white scale-110 shadow-lg shadow-blue-200")
                          : "bg-white border-gray-100 text-gray-300"
                        }`}>
                          {getStatusStep(order.status) > s.step ? <CheckCircle2 size={14} /> : (order.status.includes('Proposed') && s.step === 1 ? <AlertCircle size={14} /> : <span className="text-[10px] font-bold">{s.step}</span>)}
                        </div>
                        <span className={`mt-3 text-[9px] font-black uppercase tracking-tighter transition-colors duration-700 ${
                          getStatusStep(order.status) >= s.step 
                          ? (order.status.includes('Proposed') && s.step === 1 ? "text-amber-600" : "text-blue-600") 
                          : "text-gray-400"
                        }`}>
                          {order.status.includes('Proposed') && s.step === 1 ? 'Negotiating' : s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interaction Bar */}
                <div className="mt-4 pt-6 border-t border-black/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center text-gray-400 space-x-2">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Status: <span className={`font-black ${order.status.includes('Proposed') ? 'text-amber-600' : 'text-gray-700'}`}>{order.status}</span>
                    </span>
                  </div>
                  {order.image_url && (
                    <a 
                      href={order.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline transition-all bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100"
                    >
                      View Uploaded Blueprint ↗
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}