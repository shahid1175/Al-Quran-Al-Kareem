import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Volume2, Info, X, Loader2 } from 'lucide-react';

interface NameOfAllah {
  name: string;
  transliteration: string;
  en: { meaning: string };
}

export default function NamesOfAllah() {
  const [names, setNames] = useState<NameOfAllah[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      const response = await fetch('https://api.aladhan.com/v1/asmaAlHusna');
      const result = await response.json();
      if (result.code === 200) {
        setNames(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNames = names.filter(n => 
    n.transliteration.toLowerCase().includes(search.toLowerCase()) || 
    n.en.meaning.toLowerCase().includes(search.toLowerCase()) ||
    n.name.includes(search)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader2 className="animate-spin text-[#7D8461] mb-2" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#A49D8B]">Loading Divine Names...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative max-w-md mx-auto mb-10">
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by meaning or name..."
          className="w-full bg-[#F4F1EA] border border-[#E6E2D8] rounded-full py-4 pl-12 pr-6 text-[#3E3D39] focus:outline-none focus:ring-2 focus:ring-[#7D8461]/20 focus:border-[#7D8461] transition-all shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49D8B]" size={20} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredNames.map((name, idx) => (
          <motion.div
            key={name.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.01 }}
            onClick={() => setSelectedName(name)}
            className="group bg-white p-5 rounded-[30px] border border-[#E6E2D8] hover:border-[#7D8461] hover:shadow-xl hover:shadow-[#7D8461]/5 transition-all text-center cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Info size={14} className="text-[#7D8461]" />
            </div>
            <div className="text-2xl font-arabic text-[#3E3D39] mb-3 group-hover:text-[#7D8461] transition-colors">
              {name.name}
            </div>
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#A49D8B] mb-1">
              {name.transliteration}
            </h4>
            <p className="text-[11px] text-[#5D5C56] line-clamp-1 italic">
              {name.en.meaning}
            </p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedName(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[60px] p-10 shadow-2xl border border-[#E6E2D8] overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7D8461]/5 rounded-full blur-3xl" />
              
              <button 
                onClick={() => setSelectedName(null)}
                className="absolute top-6 right-6 p-2 text-[#A49D8B] hover:text-[#7D8461]"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-[#7D8461] text-white rounded-full flex items-center justify-center mx-auto text-4xl font-arabic font-bold shadow-lg">
                  {selectedName.name}
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-[#3E3D39]">{selectedName.transliteration}</h3>
                  <p className="text-[#C89B7B] font-bold uppercase tracking-[0.3em] text-sm mt-1">The Divine Attribute</p>
                </div>
                
                <div className="bg-[#F9F7F2] p-8 rounded-[40px] border border-[#E6E2D8]">
                   <h4 className="text-xs uppercase font-bold text-[#A49D8B] mb-2 tracking-widest text-center">English Meaning</h4>
                   <p className="text-2xl font-serif text-[#5A5A40] italic">"{selectedName.en.meaning}"</p>
                </div>

                <div className="flex justify-center gap-4">
                   <button className="flex items-center gap-2 px-6 py-3 bg-[#7D8461] text-white rounded-full font-bold shadow-lg hover:bg-[#5A5A40] transition-all">
                     <Volume2 size={18} />
                     Listen
                   </button>
                </div>
                
                <p className="text-xs text-[#A49D8B] leading-relaxed max-w-sm mx-auto">
                  "And to Allah belong the best names, so invoke Him by them." <br /> (Al-A'raf 7:180)
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
