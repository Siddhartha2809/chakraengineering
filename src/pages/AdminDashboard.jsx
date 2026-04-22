import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, User, Image as ImageIcon, Loader2, Building, Phone, Mail, CheckCircle2, AlertCircle, Clock, MapPin, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase'; 

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Store only the ID, then derive the live object from the bookings array
  const [selectedJobId, setSelectedJobId] = useState(null);
  const selectedJob = bookings.find(b => b.id === selectedJobId) || null;
  
  const [isProposing, setIsProposing] = useState(false);
  const [proposedStart, setProposedStart] = useState('');
  const [proposedEnd, setProposedEnd] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Initial fetch
    fetchJobs();

    // LIVE SYNC
    const subscription = supabase
      .channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, payload => {
        console.log('Database changed! Syncing dashboard...', payload);
        fetchJobs(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, navigate]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:users!jobs_user_id_fkey (
            company_name,
            phone,
            email,
            address
          )
        `)
        .order('created_at', { ascending: false }); 

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus, extraData = {}) => {
    try {
      // Optimistic Update so it feels instant
      setBookings(currentBookings => 
        currentBookings.map(job => job.id === id ? { ...job, status: newStatus, ...extraData } : job)
      );

      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, ...extraData })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating status:", error.message);
      alert("Failed to update status.");
      fetchJobs(); // Revert optimistic update on failure
    }
  };

  const handleProposeDates = async () => {
    if (!proposedStart || !proposedEnd) return alert("Select both dates!");
    
    await updateStatus(selectedJob.id, 'Admin Proposed', {
      proposed_start_date: proposedStart,
      proposed_end_date: proposedEnd
    });
    
    setIsProposing(false);
  };

  const acceptCustomerDates = async () => {
    await updateStatus(selectedJob.id, 'Approved', {
      start_date: selectedJob.proposed_start_date,
      end_date: selectedJob.proposed_end_date,
      proposed_start_date: null,
      proposed_end_date: null
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Admin Proposed': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Customer Proposed': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 lg:pb-0 relative animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">Shop Floor Command</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base font-medium">Manage live fabrication requests and schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        {[
          { label: 'Total', value: bookings.length, color: 'text-gray-800' },
          { label: 'Action Needed', value: bookings.filter(b => b.status === 'Pending' || b.status === 'Customer Proposed').length, color: 'text-orange-600' },
          { label: 'Active', value: bookings.filter(b => b.status === 'Approved' || b.status === 'In Progress').length, color: 'text-blue-600' },
          { label: 'Done', value: bookings.filter(b => b.status === 'Completed').length, color: 'text-emerald-600' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-white shadow-sm flex flex-col justify-between items-start">
            <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl md:text-3xl font-black ${stat.color}`}>
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading && bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-blue-600">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="font-bold text-sm uppercase tracking-widest text-gray-500">Syncing with Server...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <p className="font-bold text-lg text-gray-400">No active jobs right now.</p>
            </div>
          ) : (
            <table className="min-w-[700px] w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-black/5 bg-gray-50/50">
                  <th className="px-6 py-4 md:px-8 md:py-5 font-bold">Customer</th>
                  <th className="px-6 py-4 md:px-8 md:py-5 font-bold">Service</th>
                  <th className="px-6 py-4 md:px-8 md:py-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} onClick={() => { setSelectedJobId(booking.id); setIsProposing(false); }} className="hover:bg-white/60 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 md:px-8 md:py-5">
                      <div className="text-sm font-bold text-gray-700">{booking.customer_name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{booking.job_number}</div>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-sm font-medium text-gray-600">
                      {booking.service}
                      {booking.image_url && <ImageIcon size={14} className="inline ml-2 text-blue-500" />}
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          {/* ADDED 'custom-scrollbar' right here! */}
          <div className="custom-scrollbar bg-white/90 backdrop-blur-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            <div className="bg-white/50 border-b border-black/5 p-6 md:p-8 flex justify-between items-start sticky top-0 z-10 backdrop-blur-xl">
              <div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border mb-3 inline-block ${getStatusColor(selectedJob.status)}`}>
                  {selectedJob.status}
                </span>
                <h2 className="text-2xl font-black text-gray-800">{selectedJob.service}</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">ID: {selectedJob.job_number}</p>
              </div>
              <button onClick={() => setSelectedJobId(null)} className="p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CLIENT PROFILE INFO */}
                <div className="flex items-start space-x-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="bg-blue-100 p-2 rounded-xl mt-0.5"><User className="text-blue-600" size={20} /></div>
                  <div className="w-full">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Client Profile</p>
                    <p className="font-black text-gray-900 text-lg leading-tight">{selectedJob.customer_name}</p>
                    <div className="mt-2.5 space-y-2">
                      {selectedJob.client?.company_name && (
                        <p className="text-xs font-bold text-gray-500 flex items-center"><Building size={12} className="mr-2 text-gray-400" />{selectedJob.client.company_name}</p>
                      )}
                      {selectedJob.client?.phone && (
                        <p className="text-xs font-bold text-gray-500 flex items-center"><Phone size={12} className="mr-2 text-gray-400" />{selectedJob.client.phone}</p>
                      )}
                      {selectedJob.client?.email && (
                        <p className="text-[11px] font-bold text-gray-500 flex items-center truncate max-w-[180px]"><Mail size={12} className="mr-2 flex-shrink-0 text-gray-400" />{selectedJob.client.email}</p>
                      )}
                      {selectedJob.client?.address && (
                        <p className="text-[11px] font-bold text-gray-500 flex items-start pt-1 border-t border-gray-200/60 mt-1"><MapPin size={12} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />{selectedJob.client.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="flex items-start space-x-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="bg-blue-100 p-2 rounded-xl mt-0.5"><Calendar className="text-blue-600" size={20} /></div>
                  <div className="w-full">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Requested Timeline</p>
                    <div className="mt-2 space-y-1.5">
                      <p className={`text-xs font-bold flex items-center ${selectedJob.status === 'Customer Proposed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>Start: {selectedJob.start_date}
                      </p>
                      <p className={`text-xs font-bold flex items-center ${selectedJob.status === 'Customer Proposed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>End: {selectedJob.end_date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROJECT SPECS & BLUEPRINT */}
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="text-blue-600" size={16} />
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Project Specifications</h3>
                </div>
                
                {selectedJob.details ? (
                  <p className="text-sm font-medium text-gray-700 bg-white p-4 rounded-xl border border-gray-200 leading-relaxed">
                    {selectedJob.details}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-gray-400 italic">No additional details provided by client.</p>
                )}

                {selectedJob.image_url && (
                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Attached Blueprint / Reference</p>
                    <a href={selectedJob.image_url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-gray-200">
                      <img src={selectedJob.image_url} alt="Reference" className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-black flex items-center shadow-xl"><ImageIcon size={14} className="mr-2"/> View Full Size Document</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* NEGOTIATION BANNERS */}
              {selectedJob.status === 'Customer Proposed' && (
                <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl flex items-start space-x-3">
                  <AlertCircle className="text-pink-500 mt-0.5" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mb-2">Customer Proposed New Dates:</p>
                    <p className="text-xs font-bold text-gray-800 flex items-center mb-1">
                      <span className="w-2 h-2 rounded-full bg-pink-400 mr-2"></span>New Start: {selectedJob.proposed_start_date}
                    </p>
                    <p className="text-xs font-bold text-gray-800 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-pink-400 mr-2"></span>New End: {selectedJob.proposed_end_date}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedJob.status === 'Admin Proposed' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                  <Clock className="text-amber-500 mt-0.5" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Awaiting Customer Approval For:</p>
                    <p className="text-xs font-bold text-gray-800">Start: {selectedJob.proposed_start_date} | End: {selectedJob.proposed_end_date}</p>
                  </div>
                </div>
              )}

              {/* DATE PROPOSER UI */}
              {isProposing && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3">Suggest New Dates to Client</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input 
                      type="date" 
                      onChange={e => setProposedStart(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm font-bold text-gray-700 outline-none focus:border-blue-500" 
                    />
                    <input 
                      type="date" 
                      onChange={e => setProposedEnd(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm font-bold text-gray-700 outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={handleProposeDates} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black transition-colors">Send Offer</button>
                    <button onClick={() => setIsProposing(false)} className="px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-black transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="bg-gray-50/50 border-t border-black/5 p-6 flex justify-end space-x-3 rounded-b-[2.5rem]">
              
              {selectedJob.status === 'Pending' && !isProposing && (
                <>
                  <button onClick={() => setIsProposing(true)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl text-sm font-black transition-all">Propose New Dates</button>
                  <button onClick={() => updateStatus(selectedJob.id, 'Approved')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all">Accept & Approve</button>
                </>
              )}

              {selectedJob.status === 'Customer Proposed' && !isProposing && (
                <>
                  <button onClick={() => setIsProposing(true)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl text-sm font-black transition-all">Counter Offer</button>
                  <button onClick={acceptCustomerDates} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center"><CheckCircle2 size={16} className="mr-2"/> Accept Dates</button>
                </>
              )}

              {selectedJob.status === 'Approved' && (
                <button onClick={() => updateStatus(selectedJob.id, 'In Progress')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all">Begin Fabrication</button>
              )}
              
              {selectedJob.status === 'In Progress' && (
                <button onClick={() => updateStatus(selectedJob.id, 'Completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all">Mark as Completed</button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}