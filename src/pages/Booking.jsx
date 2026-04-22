import { useState } from 'react';
import { Calendar, Wrench, FileText, ArrowRight, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    service: '',
    startDate: '',
    endDate: '',
    details: '',
    image: null
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let imageUrl = null;

      // 1. Upload the image if one was provided
      if (formData.image) {
        // Create a unique file name to prevent overwriting
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; // Organize by user folder

        const { error: uploadError } = await supabase.storage
          .from('blueprints')
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        // Get the public URL to save in the database
        const { data: { publicUrl } } = supabase.storage
          .from('blueprints')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // 2. Generate a random Job ID (e.g., REQ-8492)
      const jobNumber = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Save the job to the database
      const { error: dbError } = await supabase.from('jobs').insert([
        {
          job_number: jobNumber,
          user_id: user.id,
          customer_name: user.name,
          service: formData.service,
          start_date: formData.startDate,
          end_date: formData.endDate,
          details: formData.details,
          image_url: imageUrl,
          status: 'Pending'
        }
      ]);

      if (dbError) throw dbError;

      alert(`Success! Job ${jobNumber} has been submitted.`);
      navigate('/my-orders'); // Send them to the portal to see their new order

    } catch (error) {
      console.error("Submission error:", error);
      setErrorMsg(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-blue-600 font-black uppercase text-[10px] tracking-[0.3em] mb-3 block">Custom Fabrication</span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Book Workshop Slot</h1>
          <p className="text-gray-500 font-medium mt-2">Specify your requirements and upload technical drawings.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(59,130,246,0.08)] space-y-6">
          
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Type of Work</label>
            <div className="relative group">
              <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <select 
                required
                className="w-full pl-12 pr-10 py-4 bg-white/50 border border-white rounded-2xl outline-none focus:bg-white transition-all font-bold text-gray-700 appearance-none shadow-sm"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                <option value="" disabled>Select Service</option>
                <option value="CNC Machining">CNC Machining</option>
                <option value="Argon Welding">Argon Welding</option>
                <option value="Marine Propeller">Marine Propeller</option>
                <option value="Iron Frame Fabrication">Iron Frame Fabrication</option>
              </select>
            </div>
          </div>

          {/* DATES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Start Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="date" required
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-2xl outline-none focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Target End</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="date" required
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-2xl outline-none focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Reference Image / Blueprint</label>
            <div className="relative group border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-[2rem] transition-all bg-white/30 p-8 flex flex-col items-center justify-center cursor-pointer">
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {formData.image ? <ImageIcon size={24} /> : <UploadCloud size={24} />}
              </div>
              <p className="text-sm font-bold text-gray-700 text-center px-4 truncate w-full">
                {formData.image ? formData.image.name : 'Click to upload project photo'}
              </p>
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-black">PNG, JPG or PDF</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Additional Specs</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <textarea 
                placeholder="Dimensions, materials, etc..." rows="3"
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-2xl outline-none focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
              ></textarea>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center group ${isSubmitting ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Submit Engineering Request</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}