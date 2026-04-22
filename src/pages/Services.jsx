import { Link } from 'react-router-dom';
import { 
  Settings, 
  Cpu, 
  Zap, 
  Anchor, 
  Box, 
  Layers, 
  Wrench,
  Construction
} from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: "Automotive & Gas Engines",
      desc: "Prominent manufacturer of engine spare parts, including motorcycle and gas engine components.",
      icon: <Settings className="text-blue-600" size={24} />,
      tags: ["Engine Parts", "Motorcycle Parts", "Gas Engines"]
    },
    {
      title: "Machine Parts & Components",
      desc: "Specialized production of high-precision machined components and industrial hardware.",
      icon: <Cpu className="text-blue-600" size={24} />,
      tags: ["Machined Components", "Custom Parts"]
    },
    {
      title: "Electrical & Heavy Wiring",
      desc: "Reliable manufacturing of heavy wire cables for industrial and electrical applications.",
      icon: <Zap className="text-blue-600" size={24} />,
      tags: ["Heavy Wire Cables"]
    },
    {
      title: "Marine Propeller Fabrication",
      desc: "Leading manufacturer of high-performance boat propellers in Visakhapatnam, India.",
      icon: <Anchor className="text-blue-600" size={24} />,
      tags: ["Boat Propellers", "Marine Hardware"]
    },
    {
      title: "Machining Job Work",
      desc: "Pioneering heavy machine manufacturing services with a focus on structural integrity.",
      icon: <Wrench className="text-blue-600" size={24} />,
      tags: ["Heavy Manufacturing", "Job Work"]
    },
    {
      title: "Precision Soldering Bits",
      desc: "Manufacturing high-quality Square Iron Bits with a focus on durability and heat retention.",
      icon: <Layers className="text-blue-600" size={24} />,
      tags: ["Square Iron Bits"]
    },
    {
      title: "Crane & Heavy Equipment",
      desc: "Expert manufacturing of crane engine parts and heavy machinery spares.",
      icon: <Construction className="text-blue-600" size={24} />,
      tags: ["Crane Parts", "Engine Spares"]
    },
    {
      title: "Structural Iron Frames",
      desc: "Custom iron frame manufacturing for industrial and residential infrastructure.",
      icon: <Box className="text-blue-600" size={24} />,
      tags: ["Iron Frames"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 text-center">
        <span className="text-blue-600 font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">Our Portfolio</span>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6">
          Products & <span className="text-blue-600">Services.</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
          Chakra Engineering Works delivers precision-engineered solutions across automotive, marine, and industrial sectors.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div 
            key={idx} 
            className="group bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              {service.icon}
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">{service.title}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 flex-grow">
              {service.desc}
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {service.tags.map((tag, tIdx) => (
                <span key={tIdx} className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider rounded-full border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <h2 className="text-white text-3xl md:text-4xl font-black mb-6 relative z-10">Need a custom component?</h2>
          <p className="text-gray-400 font-medium mb-10 relative z-10">Log in to your dashboard to request a quote or schedule a consultation with Chakra Santosh.</p>
          <Link to="/login" className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all relative z-10">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}