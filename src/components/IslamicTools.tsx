import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar as CalendarIcon, RotateCcw, Plus, Calculator, Heart, Wind, Eraser } from 'lucide-react';
import IslamicCalendar from './IslamicCalendar';
import NamesOfAllah from './NamesOfAllah';
import Duas from './Duas';
import FeaturesModule from './FeaturesModule';
import RecitationHistory from './RecitationHistory';

export default function IslamicTools() {
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [tasbihPhrase, setTasbihPhrase] = useState("SubhanAllah");
  const [activeTab, setActiveTab] = useState<'tasbih' | 'calendar' | 'names' | 'duas' | 'cleaner' | 'features' | 'history'>('tasbih');

  const phrases = [
    { text: "SubhanAllah", translation: "Glory be to Allah" },
    { text: "Alhamdulillah", translation: "Praise be to Allah" },
    { text: "Allahu Akbar", translation: "Allah is the Greatest" },
    { text: "Astaghfirullah", translation: "I ask Allah for forgiveness" },
    { text: "La ilaha illallah", translation: "There is no god but Allah" }
  ];

  const handleTasbihIncrement = () => {
    if (tasbihCount < tasbihTarget) {
      setTasbihCount(prev => prev + 1);
      // Haptic feedback could go here if supported
    } else {
      // Loop or stop
      setTasbihCount(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 text-center text-[#5A5A40]">
        <div className="w-16 h-16 bg-[#7D8461] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <Sparkles size={32} />
        </div>
        <h2 className="text-4xl font-serif font-bold">Islamic Tools</h2>
        <p className="text-[#A49D8B] mt-2">Spiritual utilities for your daily journey</p>
      </header>

      <div className="flex justify-center mb-10 p-1.5 bg-[#F4F1EA] rounded-[30px] border border-[#E6E2D8] w-fit mx-auto overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('tasbih')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tasbih' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          Tasbih
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'calendar' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          Calendar
        </button>
        <button 
          onClick={() => setActiveTab('names')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'names' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          99 Names
        </button>
        <button 
          onClick={() => setActiveTab('duas')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'duas' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          Daily Duas
        </button>
        <button 
          onClick={() => setActiveTab('cleaner')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'cleaner' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          Heart Cleaner
        </button>
        <button 
          onClick={() => setActiveTab('features')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'features' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          Features
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B] hover:text-[#7D8461]'}`}
        >
          Practice History
        </button>
      </div>

      <div className="bg-white rounded-[60px] border border-[#E6E2D8] p-8 md:p-12 shadow-sm min-h-[500px] flex flex-col items-center w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'tasbih' && (
            <motion.div 
              key="tasbih"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md flex flex-col items-center"
            >
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-serif font-bold text-[#3E3D39] mb-2">{tasbihPhrase}</h3>
                <p className="text-[#A49D8B] italic">{phrases.find(p => p.text === tasbihPhrase)?.translation}</p>
              </div>

              <div className="relative w-64 h-64 mb-10">
                {/* Visual Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="#F4F1EA"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="#7D8461"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 120}
                    initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - tasbihCount / tasbihTarget) }}
                    transition={{ type: 'spring', stiffness: 50 }}
                  />
                </svg>
                
                <button 
                  onClick={handleTasbihIncrement}
                  className="absolute inset-4 bg-[#7D8461] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <div className="text-center">
                    <span className="block text-6xl font-bold mb-2">{tasbihCount}</span>
                    <span className="text-xs uppercase tracking-widest font-bold opacity-60">Target: {tasbihTarget}</span>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 w-full mb-8">
                {phrases.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => { setTasbihPhrase(p.text); setTasbihCount(0); }}
                    className={`p-3 rounded-2xl border text-[10px] font-bold text-center transition-all ${tasbihPhrase === p.text ? 'bg-[#7D8461] border-[#7D8461] text-white' : 'bg-white border-[#E6E2D8] text-[#A49D8B] hover:border-[#7D8461]'}`}
                  >
                    {p.text.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setTasbihCount(0)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F4F1EA] text-[#A49D8B] rounded-full font-bold text-sm hover:text-[#7D8461] transition-colors"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
                <div className="flex items-center gap-2 p-1 bg-[#F4F1EA] rounded-full border border-[#E6E2D8]">
                   {[33, 99, 100].map(val => (
                     <button
                       key={val}
                       onClick={() => setTasbihTarget(val)}
                       className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${tasbihTarget === val ? 'bg-white text-[#7D8461] shadow-sm' : 'text-[#A49D8B]'}`}
                     >
                       {val}
                     </button>
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <IslamicCalendar />
            </motion.div>
          )}

          {activeTab === 'names' && (
            <motion.div 
              key="names"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <NamesOfAllah />
            </motion.div>
          )}

          {activeTab === 'duas' && (
            <motion.div 
              key="duas"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <Duas />
            </motion.div>
          )}

          {activeTab === 'cleaner' && (
            <motion.div 
              key="cleaner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#F4F1EA] text-[#7D8461] rounded-full flex items-center justify-center mb-8">
                <Eraser size={40} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#3E3D39] mb-4">Islamic Spirit Cleaner</h3>
              <p className="text-[#A49D8B] max-w-lg mb-12 italic">
                "Verily, in the remembrance of Allah do hearts find rest." (Ar-Ra'd 13:28)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl text-left">
                {[
                  { icon: <Heart className="text-red-400" />, title: "Gratefulness", desc: "List 3 things you're grateful to Allah for today." },
                  { icon: <Wind className="text-blue-400" />, title: "Deep Breath", desc: "Take a slow breath, saying Allah's name in your heart." },
                  { icon: <Eraser className="text-green-400" />, title: "Forgiveness", desc: "Ask for forgiveness for small mistakes today." },
                  { icon: <Wind className="text-yellow-400" />, title: "Focus", desc: "Clear your mind from worldly distractions for 1 minute." }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-[#F9F7F2] rounded-3xl border border-[#E6E2D8] flex items-start gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 bg-white rounded-2xl shadow-sm">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-[#5A5A40] mb-1">{item.title}</h4>
                      <p className="text-xs text-[#A49D8B] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="mt-12 px-10 py-5 bg-[#7D8461] text-white rounded-[30px] font-bold shadow-lg hover:shadow-[#7D8461]/20 hover:scale-105 transition-all">
                Start Daily Cleansing
              </button>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div 
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <FeaturesModule />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <RecitationHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
