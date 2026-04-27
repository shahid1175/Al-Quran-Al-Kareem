import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Clock, 
  Heart, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Wind
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [verseOfTheDay, setVerseOfTheDay] = useState<any>(null);

  useEffect(() => {
    fetchPrayerTimes();
    fetchVerseOfTheDay();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      // Default to Mecca for dashboard if no GPS
      const res = await fetch('https://api.aladhan.com/v1/timings?latitude=21.4225&longitude=39.8262&method=2');
      const result = await res.json();
      if (result.code === 200) setData(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVerseOfTheDay = async () => {
    // Random verse from common meaningful ones
    const surahs = [1, 2, 3, 55, 67, 36, 18];
    const surah = surahs[Math.floor(Math.random() * surahs.length)];
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:1/en.asad`);
      const result = await res.json();
      if (result.code === 200) {
        // Get arabic for same ayah
        const resAr = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:1`);
        const resultAr = await resAr.json();
        setVerseOfTheDay({
          text: resultAr.data.text,
          translation: result.data.text,
          surah: result.data.surah.englishName,
          number: result.data.numberInSurah
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const quickLinks = [
    { name: "Quran Reader", path: "/", icon: <Book size={24} />, color: "bg-[#7D8461]", desc: "Continue your journey" },
    { name: "Prayer Times", path: "/prayer-times", icon: <Clock size={24} />, color: "bg-[#C89B7B]", desc: "Stay connected" },
    { name: "Tools", path: "/tools", icon: <Sparkles size={24} />, color: "bg-[#5A5A40]", desc: "Tasbih & Calendar" },
    { name: "Tajweed", path: "/tajweed", icon: <Wind size={24} />, color: "bg-[#A49D8B]", desc: "Perfect recitation" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Header */}
      <header className="relative py-16 px-10 rounded-[60px] overflow-hidden bg-[#7D8461] text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} />
              Assalamu Alaikum
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif font-bold leading-tight"
            >
              Elevate Your <br /> 
              <span className="text-white/70 italic">Spiritual Life.</span>
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-8 min-w-[300px]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest font-bold opacity-70">Current Time</span>
              <Heart size={16} className="text-white/50" />
            </div>
            <div className="text-4xl font-mono font-bold mb-2">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <div className="flex flex-col gap-1 opacity-80">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon size={14} />
                <span>{data?.date.readable || currentTime.toLocaleDateString()}</span>
              </div>
              {data && (
                <Link to="/calendar" className="flex items-center gap-2 text-sm hover:text-white transition-colors cursor-pointer group">
                  <Moon size={14} className="text-white/50 group-hover:text-white" />
                  <span>{data.date.hijri.day} {data.date.hijri.month.en} {data.date.hijri.year} AH</span>
                </Link>
              )}
            </div>
            {data && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-50">Next: {data.meta.method.name.split(' ')[0]}</p>
                  <p className="font-bold">{data.timings.Fajr}</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <ChevronRight size={20} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Quick Actions Column */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, idx) => (
              <Link to={link.path} key={link.name}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="group bg-white p-6 rounded-[40px] border border-[#E6E2D8] hover:border-[#7D8461] hover:shadow-xl hover:shadow-[#7D8461]/5 transition-all flex items-center gap-5 cursor-pointer h-full"
                >
                  <div className={`w-14 h-14 ${link.color} text-white rounded-full flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#3E3D39] group-hover:text-[#7D8461] transition-colors">{link.name}</h3>
                    <p className="text-sm text-[#A49D8B]">{link.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Verse of the Day Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#F4F1EA] p-10 rounded-[60px] border border-[#E6E2D8] relative overflow-hidden group"
          >
             <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Book size={140} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 text-[#C89B7B] mb-8">
                  <div className="w-1 h-8 bg-[#C89B7B] rounded-full" />
                  <h3 className="text-xl font-serif font-bold uppercase tracking-widest">Verse of the Day</h3>
                </div>
                
                {verseOfTheDay ? (
                  <div className="space-y-b">
                    <p className="text-3xl font-arabic text-[#3E3D39] leading-loose text-right mb-6" dir="rtl">
                      {verseOfTheDay.text}
                    </p>
                    <p className="text-xl text-[#5D5C56] font-serif italic mb-4 leading-relaxed">
                      "{verseOfTheDay.translation}"
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[#A49D8B] font-bold uppercase tracking-wider">
                      <div className="w-6 h-[1px] bg-[#A49D8B]/30" />
                      {verseOfTheDay.surah}, {verseOfTheDay.number}
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-10 bg-black/5 rounded-full w-3/4 self-end" />
                    <div className="h-6 bg-black/5 rounded-full w-full" />
                    <div className="h-6 bg-black/5 rounded-full w-1/2" />
                  </div>
                )}
             </div>
          </motion.div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-8">
           {/* Prayer Times Widget */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             className="bg-white p-8 rounded-[50px] border border-[#E6E2D8] shadow-sm"
           >
              <h3 className="text-lg font-serif font-bold text-[#5A5A40] mb-6 flex items-center justify-between">
                Today's Times
                <Link to="/prayer-times" className="text-[#C89B7B] text-xs font-bold uppercase">View All</Link>
              </h3>
              <div className="space-y-4">
                {data ? (
                  ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                    <div key={p} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#A49D8B] group-hover:bg-[#7D8461] group-hover:text-white transition-colors">
                          {p === 'Fajr' ? <Sun size={14} /> : 
                           p === 'Maghrib' ? <Moon size={14} /> : 
                           <Clock size={14} />}
                        </div>
                        <span className="text-sm font-bold text-[#3E3D39]">{p}</span>
                      </div>
                      <span className="text-sm font-mono text-[#5D5C56]">{data.timings[p]}</span>
                    </div>
                  ))
                ) : (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-8 bg-[#F4F1EA] rounded-full animate-pulse" />
                  ))
                )}
              </div>
           </motion.div>

           {/* Call to action */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="bg-[#5A5A40] p-8 rounded-[50px] text-white shadow-xl relative overflow-hidden"
           >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
              <h3 className="text-xl font-bold mb-3 relative z-10">Memorization Tracking</h3>
              <p className="text-sm opacity-80 mb-6 leading-relaxed relative z-10">
                Keep your hifz journey organized. Set goals, track progress, and use our AI tools to help you memorize with ease.
              </p>
              <Link 
                to="/memorize" 
                className="inline-flex items-center gap-2 bg-white text-[#5A5A40] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#F4F1EA] transition-colors shadow-lg"
              >
                Get Started
                <ChevronRight size={16} />
              </Link>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
