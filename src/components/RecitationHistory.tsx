import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Award, 
  AlertCircle, 
  Trash2, 
  TrendingUp, 
  BarChart3, 
  Target,
  Zap
} from 'lucide-react';

interface HistoryEntry {
  accuracyScore: number;
  overallFeedback: string;
  mistakes: Array<{ word: string; type: string; feedback: string }>;
  timestamp: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

export default function RecitationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [view, setView] = useState<'list' | 'analytics'>('list');

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('quran_recitation_history') || '[]');
    const savedStreak = parseInt(localStorage.getItem('practice_streak') || '0');
    setHistory(savedHistory);
    setStreak(savedStreak);
  }, []);

  const clearHistory = () => {
    if (window.confirm('একদম সব ইতিহাস মুছে ফেলতে চান? (Clear all practice history?)')) {
      localStorage.removeItem('quran_recitation_history');
      setHistory([]);
    }
  };

  const getAnalytics = () => {
    if (history.length === 0) return null;
    
    const avgScore = Math.round(history.reduce((acc, curr) => acc + curr.accuracyScore, 0) / history.length);
    const totalMistakes = history.reduce((acc, curr) => acc + curr.mistakes.length, 0);
    
    const mistakeTypes: Record<string, number> = {};
    history.forEach(entry => {
      entry.mistakes.forEach(m => {
        mistakeTypes[m.type] = (mistakeTypes[m.type] || 0) + 1;
      });
    });

    const bestSurah = history.reduce((acc: any, curr) => {
      if (!acc[curr.surahName] || acc[curr.surahName].score < curr.accuracyScore) {
        acc[curr.surahName] = { score: curr.accuracyScore, count: (acc[curr.surahName]?.count || 0) + 1 };
      } else {
        acc[curr.surahName].count++;
      }
      return acc;
    }, {});

    return { avgScore, totalMistakes, mistakeTypes, bestSurah };
  };

  const analytics = getAnalytics();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-3xl font-serif font-bold text-[#3E3D39] mb-2">অনুশীলনের ইতিহাস (Practice History)</h3>
          <p className="text-[#A49D8B]">আপনার হেফজ এবং তেলাওয়াতের অগ্রগতির চিত্র।</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#7D8461] text-white px-6 py-4 rounded-[30px] flex items-center gap-4 shadow-lg">
            <div className="p-2 bg-white/20 rounded-xl">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">দিন একটানা (Streak)</p>
              <p className="text-xl font-bold">{streak} দিন</p>
            </div>
          </div>
          
          <button 
            onClick={clearHistory}
            className="p-4 rounded-[24px] border border-[#E6E2D8] text-[#A49D8B] hover:text-red-500 hover:bg-white transition-all"
            title="Clear History"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex gap-4 mb-8 p-1 bg-[#F4F1EA] rounded-full w-fit">
          <button 
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${view === 'list' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B]'}`}
          >
            তালিকা (List)
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${view === 'analytics' ? 'bg-[#7D8461] text-white shadow-md' : 'text-[#A49D8B]'}`}
          >
            বিশ্লেষণ (Analytics)
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-[#F9F7F2] rounded-full flex items-center justify-center mx-auto mb-6">
            <History size={32} className="text-[#E6E2D8]" />
          </div>
          <h4 className="text-xl font-bold text-[#3E3D39] mb-2">এখনো কোনো তথ্য নেই</h4>
          <p className="text-[#A49D8B]">কোরআন রিডারে তেলাওয়াত শুরু করলে এখানে আপনার উন্নতি দেখতে পাবেন।</p>
        </div>
      ) : view === 'analytics' && analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#F9F7F2] p-8 rounded-[40px] border border-[#E6E2D8]">
            <div className="flex items-center gap-3 mb-6 text-[#7D8461]">
              <Target size={24} />
              <h4 className="font-bold">গড় সঠিকতা (Avg Accuracy)</h4>
            </div>
            <p className="text-5xl font-bold text-[#3E3D39] mb-2">{analytics.avgScore}%</p>
            <p className="text-sm text-[#A49D8B]">আপনার সামগ্রিক তেলাওয়াতের মান।</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#F9F7F2] p-8 rounded-[40px] border border-[#E6E2D8]">
            <div className="flex items-center gap-3 mb-6 text-[#C89B7B]">
              <AlertCircle size={24} />
              <h4 className="font-bold">মোট ভুল (Total Mistakes)</h4>
            </div>
            <p className="text-5xl font-bold text-[#3E3D39] mb-2">{analytics.totalMistakes}</p>
            <p className="text-sm text-[#A49D8B]">এ পর্যন্ত শনাক্তকৃত মোট ভুলের সংখ্যা।</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#F9F7F2] p-8 rounded-[40px] border border-[#E6E2D8]">
            <div className="flex items-center gap-3 mb-6 text-[#5A5A40]">
              <BarChart3 size={24} />
              <h4 className="font-bold">ভুলের ধরন (Mistake Types)</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.mistakeTypes).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="capitalize text-[#5D5C56]">{type === 'pronunciation' ? 'উচ্চারণ' : type === 'tajweed' ? 'তাজবীদ' : type}</span>
                  <span className="font-bold text-[#3E3D39]">{count} বার</span>
                </div>
              ))}
              {Object.keys(analytics.mistakeTypes).length === 0 && <p className="text-sm italic text-[#A49D8B]">কোনো ভুল নেই!</p>}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-[#F9F7F2] border border-[#E6E2D8] rounded-[30px] p-6 hover:border-[#7D8461] transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm
                    ${entry.accuracyScore >= 90 ? 'bg-green-100 text-green-700' : 
                      entry.accuracyScore >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                  `}>
                    {entry.accuracyScore}%
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#3E3D39] text-xl">
                      সুরা {entry.surahName}
                    </h4>
                    <p className="text-[10px] font-bold text-[#A49D8B] uppercase tracking-widest mt-1">
                      আয়াত {entry.ayahNumber} • {new Date(entry.timestamp).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {entry.mistakes.length > 0 ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100/50 border border-red-100 px-4 py-2 rounded-full text-xs font-bold">
                      <AlertCircle size={14} />
                      {entry.mistakes.length}টি ভুল ধরা পড়েছে
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 bg-green-100/50 border border-green-100 px-4 py-2 rounded-full text-xs font-bold">
                      <Award size={14} />
                      নিখুঁত তেলাওয়াত
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E6E2D8] text-sm text-[#5D5C56] leading-relaxed italic">
                "{entry.overallFeedback}"
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
