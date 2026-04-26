import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Circle, Trophy, Plus, Trash2, X } from 'lucide-react';

interface ProgressItem {
  surahNumber: number;
  surahName: string;
  memorized: boolean;
  notes: string;
}

export default function MemorizationTool() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSurah, setNewSurah] = useState({ number: '', name: '' });

  useEffect(() => {
    const saved = localStorage.getItem('quran_progress');
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  const saveProgress = (newProgress: ProgressItem[]) => {
    setProgress(newProgress);
    localStorage.setItem('quran_progress', JSON.stringify(newProgress));
  };

  const addTarget = () => {
    if (!newSurah.number || !newSurah.name) return;
    const newItem: ProgressItem = {
      surahNumber: parseInt(newSurah.number),
      surahName: newSurah.name,
      memorized: false,
      notes: ''
    };
    saveProgress([...progress, newItem]);
    setNewSurah({ number: '', name: '' });
    setShowAdd(false);
  };

  const toggleMemorized = (idx: number) => {
    const updated = [...progress];
    updated[idx].memorized = !updated[idx].memorized;
    saveProgress(updated);
  };

  const removeTarget = (idx: number) => {
    const updated = progress.filter((_, i) => i !== idx);
    saveProgress(updated);
  };

  const memorizedCount = progress.filter(p => p.memorized).length;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 text-center text-[#5A5A40]">
        <div className="w-16 h-16 bg-[#7D8461] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <Brain size={32} />
        </div>
        <h2 className="text-4xl font-serif font-bold">Memorization Tracker</h2>
        <p className="text-[#A49D8B] mt-2">Track your progress and set goals for Hifz</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-[#7D8461] text-white p-8 rounded-[40px] shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-[80px]" />
          <Trophy className="mx-auto mb-4 text-[#E9E1CE]" size={32} />
          <h3 className="text-4xl font-bold">{memorizedCount}</h3>
          <p className="text-[10px] uppercase tracking-wider text-green-100 opacity-70 mt-1">Surahs Memorized</p>
        </div>
        
        <div className="col-span-2 bg-white p-8 rounded-[40px] border border-[#E6E2D8] flex flex-col justify-center shadow-sm">
          <h4 className="font-serif font-bold text-[#3E3D39] mb-4">My Hifz Journey</h4>
          <div className="w-full bg-[#F4F1EA] h-4 rounded-full overflow-hidden border border-[#E6E2D8]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress.length > 0 ? (memorizedCount / progress.length) * 100 : 0}%` }}
              className="bg-[#C89B7B] h-full transition-all duration-1000 shadow-inner" 
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-[10px] text-[#A49D8B] uppercase tracking-widest font-bold">
              Progress: {progress.length > 0 ? Math.round((memorizedCount / progress.length) * 100) : 0}%
            </p>
            <p className="text-[10px] text-[#A49D8B] uppercase tracking-widest font-bold">
              Goal: {progress.length} Surahs
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-2xl font-serif font-bold text-[#5A5A40]">Target Surahs</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-[#7D8461] text-white rounded-full hover:bg-[#5A5A40] transition-all shadow-md font-bold text-sm"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          <span>{showAdd ? 'Close' : 'Add Surah'}</span>
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white p-8 rounded-[40px] border border-[#C89B7B]/30 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#A49D8B] ml-2">Surah No.</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 67" 
                    className="w-full p-4 bg-[#F4F1EA] border border-[#E6E2D8] rounded-2xl outline-none focus:ring-1 focus:ring-[#7D8461]"
                    value={newSurah.number}
                    onChange={(e) => setNewSurah({...newSurah, number: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#A49D8B] ml-2">Surah Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Al-Mulk" 
                    className="w-full p-4 bg-[#F4F1EA] border border-[#E6E2D8] rounded-2xl outline-none focus:ring-1 focus:ring-[#7D8461]"
                    value={newSurah.name}
                    onChange={(e) => setNewSurah({...newSurah, name: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addTarget}
                    className="w-full bg-[#7D8461] text-white h-14 rounded-2xl font-bold hover:bg-[#5A5A40] transition-colors shadow-sm"
                  >
                    Add to Goals
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {progress.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-[#A49D8B]">
            <Circle className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-serif italic text-lg">Your hifz journey begins with a single goal.</p>
          </div>
        ) : (
          progress.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-6 rounded-[30px] flex items-center justify-between border transition-all duration-300
                ${item.memorized ? 'bg-[#F9F7F2] border-[#7D8461]/30 opacity-60' : 'bg-white border-[#E6E2D8] shadow-sm'}
              `}
            >
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => toggleMemorized(idx)}
                  className={`
                    w-8 h-8 rounded-full border flex items-center justify-center transition-all
                    ${item.memorized ? 'bg-[#7D8461] border-[#7D8461] text-white' : 'border-[#E6E2D8] text-[#A49D8B] hover:border-[#7D8461]'}
                  `}
                >
                  {item.memorized ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div>
                  <h4 className={`font-serif font-bold text-lg ${item.memorized ? 'text-[#3E3D39] line-through' : 'text-[#3E3D39]'}`}>
                    <span className="text-[#A49D8B] font-sans mr-2">{item.surahNumber}.</span> {item.surahName}
                  </h4>
                </div>
              </div>
              <button 
                onClick={() => removeTarget(idx)}
                className="p-3 text-[#A49D8B] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
