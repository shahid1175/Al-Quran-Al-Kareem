import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Music, Languages, Play, Volume2, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface TajweedRule {
  title: Record<string, string>;
  description: Record<string, string>;
  subrules: string[];
  letters?: string;
  exampleAudio?: string;
  mistakeAudio?: string;
}

export default function TajweedGuide() {
  const [lang, setLang] = useState(localStorage.getItem('tajweed_lang') || 'en');
  const [activeRule, setActiveRule] = useState<number | null>(null);

  const rules: TajweedRule[] = [
    {
      title: { en: "Noon Sakinah & Tanween", bn: "নূন সাকিন ও তানভীন" },
      description: { 
        en: "Rules governing the pronunciation of the 'N' sound when it's static.",
        bn: "স্থির 'ন' বা তানভীনের উচ্চারণের নিয়মাবলী।"
      },
      subrules: ["Izhaar", "Idghaam", "Iqlaab", "Ikhfaa"],
      letters: "ء ه ع ح غ খ",
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    },
    {
      title: { en: "Meem Sakinah", bn: "মীম সাকিন" },
      description: { 
        en: "Rules for the static 'M' sound.",
        bn: "স্থির 'ম' উচ্চারণের নিয়ম।"
      },
      subrules: ["Ikhfaa Shafawi", "Idghaam Shafawi", "Izhaar Shafawi"],
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3", 
    },
    {
      title: { en: "Madd (Prolongation)", bn: "মদ্দ (টানা)" },
      description: { 
        en: "Stretching the sound of long vowels.",
        bn: "দীর্ঘ স্বরবর্ণের উচ্চারণ দীর্ঘ করা।"
      },
      subrules: ["Madd Asli", "Madd Muttasil", "Madd Munfasil"],
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    },
    {
      title: { en: "Qalqalah (Echoing)", bn: "কলকলাহ (প্রতিধ্বনি)" },
      description: { 
        en: "The bouncing sound made on certain letters when static.",
        bn: "স্থির অবস্থায় নির্দিষ্ট কিছু অক্ষরে প্রতিধ্বনি সৃষ্টি করা।"
      },
      subrules: [],
      letters: "ق ط ب ج د",
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    }
  ];

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('tajweed_lang', newLang);
  };

  const playAudio = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(err => {
      console.warn("Audio playback failed. This is likely due to an invalid URL or browser restrictions:", err);
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 text-center text-[#5A5A40]">
        <div className="w-16 h-16 bg-[#7D8461] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-4xl font-serif font-bold">
          {lang === 'bn' ? 'তাজবীদ ও মাখরাজ' : 'Tajweed & Makharoj'}
        </h2>
        <p className="text-[#A49D8B] mt-2">
          {lang === 'bn' ? 'কুরআন তিলাওয়াতের নিয়মাবলী শিখুন' : 'Master the rules of Quranic recitation'}
        </p>

        <div className="mt-8 flex justify-center gap-2">
          <button 
            onClick={() => handleLangChange('en')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${lang === 'en' ? 'bg-[#7D8461] text-white border-[#7D8461]' : 'bg-white text-[#A49D8B] border-[#E6E2D8]'}`}
          >
            English
          </button>
          <button 
            onClick={() => handleLangChange('bn')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${lang === 'bn' ? 'bg-[#7D8461] text-white border-[#7D8461]' : 'bg-white text-[#A49D8B] border-[#E6E2D8]'}`}
          >
            বাংলা
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {rules.map((rule, idx) => (
          <motion.div
            key={idx}
            layout
            className={`bg-white rounded-[40px] border border-[#E6E2D8] overflow-hidden transition-all duration-300 ${activeRule === idx ? 'shadow-xl ring-2 ring-[#7D8461]/10' : 'hover:shadow-md'}`}
          >
            <div 
              className="p-8 cursor-pointer flex items-start space-x-8"
              onClick={() => setActiveRule(activeRule === idx ? null : idx)}
            >
              <div className="w-14 h-14 flex-shrink-0 bg-[#F4F1EA] text-[#7D8461] font-serif font-bold text-2xl flex items-center justify-center rounded-2xl border border-[#E6E2D8]">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-[#3E3D39] font-serif">{rule.title[lang]}</h4>
                  <div className="text-[#A49D8B]">
                    <Globe size={16} className="opacity-30" />
                  </div>
                </div>
                <p className="text-[#A49D8B] text-sm mt-1 leading-relaxed">{rule.description[lang]}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {rule.subrules.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F4F1EA] text-[#7D8461] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#E6E2D8]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {activeRule === idx && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#F9F7F2] border-t border-[#E6E2D8] p-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span>{lang === 'bn' ? 'সঠিক উচ্চারণ' : 'Correct Pronunciation'}</span>
                      </h5>
                      <button 
                        onClick={() => playAudio(rule.exampleAudio!)}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-green-100 hover:bg-green-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Play size={20} className="text-green-600 fill-current" />
                          <span className="text-sm font-medium text-green-800">{lang === 'bn' ? 'উদাহরণ শুনুন' : 'Listen to Example'}</span>
                        </div>
                        <Volume2 size={16} className="text-green-300 group-hover:text-green-500" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-400" />
                        <span>{lang === 'bn' ? 'সাধারণ ভুল' : 'Common Mistake'}</span>
                      </h5>
                      <button 
                        onClick={() => playAudio(rule.exampleAudio!)} // In a real app, separate audio url here
                        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-red-50 hover:bg-red-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Play size={20} className="text-red-400 fill-current" />
                          <span className="text-sm font-medium text-red-800">{lang === 'bn' ? 'ভুলটি শুনুন' : 'Listen to Mistake'}</span>
                        </div>
                        <Volume2 size={16} className="text-red-200 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {rule.letters && (
                    <div className="mt-8 pt-8 border-t border-[#E6E2D8]">
                      <h5 className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-4">
                        {lang === 'bn' ? 'অক্ষরসমূহ' : 'Target Letters'}
                      </h5>
                      <div className="p-6 bg-white rounded-[30px] border border-[#E6E2D8] flex items-center justify-center">
                        <span className="arabic-text text-5xl text-[#3E3D39] tracking-[1.5rem]">{rule.letters}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
