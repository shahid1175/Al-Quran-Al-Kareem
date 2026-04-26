import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuranService, Surah } from '../services/quranApi';
import { db } from '../services/db';
import { motion } from 'framer-motion';
import { Loader2, Search, WifiOff } from 'lucide-react';

export default function SurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [offlineSurahIds, setOfflineSurahIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    QuranService.getSurahs().then(data => {
      setSurahs(data);
      setLoading(false);
    });

    // Check offline status
    db.surahs.toArray().then(items => {
      setOfflineSurahIds(new Set(items.map(i => i.number)));
    });
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.number.toString() === searchTerm
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#7D8461]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-serif font-bold text-[#5A5A40] mb-6">The Holy Quran</h2>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49D8B]" size={20} />
          <input 
            type="text" 
            placeholder="Search Surah (e.g. Al-Fatihah, 1)" 
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#E6E2D8] rounded-[30px] focus:outline-none focus:ring-1 focus:ring-[#7D8461] shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurahs.map((surah) => (
          <motion.div
            key={surah.number}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              to={`/surah/${surah.number}`}
              className="group block bg-white p-7 rounded-[40px] border border-[#E6E2D8] hover:border-[#7D8461] hover:shadow-xl hover:shadow-[#7D8461]/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#F4F1EA] text-[#7D8461] font-bold rounded-2xl group-hover:bg-[#7D8461] group-hover:text-white transition-colors border border-[#E6E2D8]/50">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#3E3D39]">{surah.englishName}</h3>
                    <p className="text-xs text-[#A49D8B] italic">{surah.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="arabic-text text-2xl block text-[#5A5A40] group-hover:text-[#7D8461] transition-colors">{surah.name}</span>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] bg-[#F4F1EA] text-[#A49D8B] px-2 py-0.5 rounded tracking-widest uppercase font-bold">{surah.numberOfAyahs} Ayahs</span>
                    {offlineSurahIds.has(surah.number) && (
                      <WifiOff size={10} className="text-[#7D8461]" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
