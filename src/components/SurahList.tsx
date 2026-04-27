import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QuranService, Surah } from '../services/quranApi';
import { db } from '../services/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, WifiOff, Mic, X, MicOff } from 'lucide-react';

export default function SurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [offlineSurahIds, setOfflineSurahIds] = useState<Set<number>>(new Set());
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    QuranService.getSurahs().then(data => {
      setSurahs(data);
      setLoading(false);
    });

    // Check offline status
    db.surahs.toArray().then(items => {
      setOfflineSurahIds(new Set(items.map(i => i.number)));
    });

    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          alert('নেটওয়ার্ক ত্রুটি: ভয়েস সার্চ ব্যবহারের জন্য ইন্টারনেট সংযোগ নিশ্চিত করুন। (Network error: Please check your internet connection for voice search)');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('আপনার ব্রাউজার ভয়েস সার্চ সমর্থন করে না। (Voice Recognition not supported in this browser)');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition start error:', e);
        setIsListening(false);
      }
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.number.toString() === searchTerm ||
    s.name.includes(searchTerm)
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
        <h2 className="text-4xl font-serif font-bold text-[#5A5A40] mb-6">আল কুরআন</h2>
        <div className="relative max-w-lg mx-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49D8B] group-focus-within:text-[#7D8461] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="সুরা খুঁজুন (যেমন: Al-Fatihah, 1)" 
            className="w-full pl-12 pr-24 py-4 bg-white border border-[#E6E2D8] rounded-[30px] focus:outline-none focus:ring-2 focus:ring-[#7D8461]/20 focus:border-[#7D8461] shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm('')}
                  className="p-2 text-[#A49D8B] hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>
            <button 
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
              title="Voice Search"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>
        {isListening && (
          <p className="mt-3 text-xs font-bold text-[#7D8461] uppercase tracking-widest animate-pulse">
            শুনছি... (Listening...)
          </p>
        )}
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
                  <div className="w-12 h-12 flex items-center justify-center bg-[#F4F1EA] text-[#7D8461] font-bold rounded-2xl group-hover:bg-[#7D8461] group-hover:text-white transition-colors border border-[#E6E2D8]/50 shadow-sm">
                    {surah.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-lg text-[#3E3D39]">{surah.englishName}</h3>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${surah.revelationType === 'Meccan' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {surah.revelationType === 'Meccan' ? 'মক্কী' : 'মাদানী'}
                      </span>
                    </div>
                    <p className="text-xs text-[#A49D8B] italic">{surah.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="arabic-text text-2xl block text-[#5A5A40] group-hover:text-[#7D8461] transition-colors">{surah.name}</span>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] bg-[#F4F1EA] text-[#A49D8B] px-2 py-0.5 rounded tracking-widest uppercase font-bold">{surah.numberOfAyahs} আয়াত</span>
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
