import { Link } from 'react-router-dom';
import { MapPin, Navigation, Phone, Wrench } from 'lucide-react';

export default function Home() {
  // Encoded address for Google Maps Embed
  const fullAddress = "Plot No D15/1A Autonagar B block, Gajuwaka, Andhra Pradesh 530012";
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(fullAddress)}`;

  // Note: For development, you can use this direct search link if you don't have an API key yet:
  const fallbackMapUrl = "https://maps.google.com/maps?q=Plot%20No%20D15/1A%20Autonagar%20B%20block,%20Gajuwaka&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <div className="min-h-screen bg-[#f8fafc] animate-in fade-in duration-1000 pb-10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <span className="text-blue-600 font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">Precision Engineering</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
            Chakra <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Engineering.</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-lg mb-10 leading-relaxed">
            Leading industrial hub for CNC servicing, custom fabrication, and high-tolerance machining in Gajuwaka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/services" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all text-center">
              Our Services
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl border border-gray-200 hover:border-blue-600 transition-all text-center">
              Customer Login
            </Link>
          </div>
        </div>

        {/* --- LIVE INTERACTIVE MAP --- */}
        <div className="order-1 lg:order-2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white p-3 rounded-[2.5rem] border border-white shadow-2xl overflow-hidden">
            <div className="h-80 md:h-[500px] w-full rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner bg-slate-50">
              <iframe
                title="Workshop Location"
                src={fallbackMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </div>
            
            {/* Floating Location Badge */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg flex items-center justify-between pointer-events-none">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-800 tracking-tighter leading-none">Autonagar B-Block</span>
                  <span className="text-[9px] text-gray-500 font-bold">Gajuwaka, AP 530012</span>
                </div>
              </div>
              <Navigation size={14} className="text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* REFINED FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Call Us</p>
              <p className="text-gray-800 font-black text-base leading-none">9985552512</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
              <p className="text-gray-800 font-black text-sm leading-none">Plot No D15/1A, Autonagar</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Expertise</p>
              <p className="text-gray-800 font-black text-sm leading-none">CNC & Machine Jobs</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}