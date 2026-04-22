import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, Info, Calendar as CalendarIcon, Package, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminCalendar() {
  const [date, setDate] = useState(new Date());
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScheduledJobs();
  }, []);

  const fetchScheduledJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        // 1. Added 'status' to the select query
        .select('id, service, start_date, customer_name, status') 
        .not('start_date', 'is', null); 

      if (error) throw error;
      setScheduledJobs(data || []);
    } catch (error) {
      console.error('Error fetching calendar jobs:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getJobsForDate = (d) => {
    const dateStr = d.toLocaleDateString('en-CA'); 
    return scheduledJobs.filter(job => job.start_date === dateStr);
  };

  // Helper to map statuses to specific colors for both dots and badges
  const getStatusStyles = (status) => {
    switch(status) {
      case 'Pending': 
        return { dot: 'bg-orange-500 shadow-orange-500/50', badge: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'Approved': 
        return { dot: 'bg-blue-500 shadow-blue-500/50', badge: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'In Progress': 
        return { dot: 'bg-purple-500 shadow-purple-500/50', badge: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'Completed': 
        return { dot: 'bg-emerald-500 shadow-emerald-500/50', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      default: 
        return { dot: 'bg-gray-500 shadow-gray-500/50', badge: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  const jobsToday = getJobsForDate(date);

  // 2. Update the calendar tiles to show colored dots based on status
  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const jobs = getJobsForDate(date);
      if (jobs.length > 0) {
        return (
          <div className="flex justify-center mt-1 gap-1 flex-wrap px-1">
            {jobs.map((job, idx) => (
              <div 
                key={idx}
                title={`${job.service} (${job.status})`} 
                className={`w-2 h-2 rounded-full shadow-[0_0_5px_var(--tw-shadow-color)] ${getStatusStyles(job.status).dot}`}
              ></div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-blue-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Loading Timeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 md:px-0">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Timeline</h1>
        <p className="text-gray-500 font-medium">Monitoring fabrication schedules for {scheduledJobs.length} active orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* BIG CALENDAR SECTION */}
        <div className="lg:col-span-8 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-4 md:p-10 shadow-2xl shadow-blue-900/5">
          <div className="large-calendar-container">
            <Calendar 
              onChange={setDate} 
              value={date} 
              tileContent={renderTileContent}
              className="w-full border-none font-sans text-lg"
              next2Label={null}
              prev2Label={null}
            />
          </div>
        </div>

        {/* AGENDA SIDEBAR */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-800 flex items-center">
                <Package size={20} className="mr-2 text-blue-600" />
                Orders
              </h3>
              <div className="px-4 py-1.5 bg-blue-600 rounded-full shadow-lg">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              {jobsToday.length > 0 ? (
                jobsToday.map((job, idx) => (
                  <div key={idx} className="bg-white/80 p-6 rounded-3xl border border-blue-50 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                    {/* 3. Added Status Badge to the order cards */}
                    <div className="mb-3">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border inline-block ${getStatusStyles(job.status).badge}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-base leading-tight">{job.service}</p>
                    <div className="flex items-center mt-3 text-gray-400">
                      <Info size={12} className="mr-1" />
                      <span className="text-[10px] font-bold">{job.customer_name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50/50 rounded-full flex items-center justify-center mb-4 border border-white">
                    <CalendarIcon className="text-gray-200" size={32} />
                  </div>
                  <p className="text-gray-400 text-sm font-black uppercase tracking-widest">Clear Schedule</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 