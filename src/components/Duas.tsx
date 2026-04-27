import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Share2, Copy, Check } from 'lucide-react';

interface Dua {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
}

export default function Duas() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const duas: Dua[] = [
    {
      id: 1,
      title: "Before Eating",
      arabic: "بِسْمِ اللَّهِ",
      transliteration: "Bismillāh",
      translation: "In the name of Allah",
      category: "Daily"
    },
    {
      id: 2,
      title: "After Eating",
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
      transliteration: "Alhamdu lillāhillażī aṭ'amanā wasaqānā wa ja'alanā muslimīn",
      translation: "Praise be to Allah Who has fed us and given us drink and made us Muslims",
      category: "Daily"
    },
    {
      id: 3,
      title: "For Parents",
      arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      transliteration: "Rabbi irḥamhumā kamā rabbayānī ṣaghīrā",
      translation: "My Lord, have mercy upon them as they brought me up [when I was] small",
      category: "Family"
    },
    {
      id: 4,
      title: "For Forgiveness",
      arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      transliteration: "Allāhumma innaka 'afuwwun tuḥibbul-'afwa fa'fu 'annī",
      translation: "O Allah, You are Forgiving and You love forgiveness, so forgive me",
      category: "Forgiveness"
    },
    {
       id: 5,
       title: "When Entering Mosque",
       arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
       transliteration: "Allāhumma-ftaḥ lī abwāba raḥmatik",
       translation: "O Allah, open for me the gates of Your mercy",
       category: "Spiritual"
    }
  ];

  const filteredDuas = duas.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (dua: Dua) => {
    const text = `${dua.arabic}\n${dua.transliteration}\n${dua.translation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full">
      <div className="relative max-w-md mx-auto mb-10">
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a Dua (e.g. Eating, Parents)..."
          className="w-full bg-[#F4F1EA] border border-[#E6E2D8] rounded-full py-4 pl-12 pr-6 text-[#3E3D39] focus:outline-none focus:ring-2 focus:ring-[#7D8461]/20 focus:border-[#7D8461] transition-all shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49D8B]" size={20} />
      </div>

      <div className="space-y-6">
        {filteredDuas.map((dua) => (
          <motion.div
            key={dua.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] border border-[#E6E2D8] hover:border-[#7D8461] transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-[#F4F1EA] text-[#A49D8B] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#E6E2D8]/50">
                {dua.category}
              </span>
              <div className="flex gap-2">
                 <button 
                  onClick={() => copyToClipboard(dua)}
                  className="p-2 text-[#A49D8B] hover:text-[#7D8461] transition-colors"
                  title="Copy Dua"
                 >
                   {copiedId === dua.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                 </button>
                 <button className="p-2 text-[#A49D8B] hover:text-[#7D8461] transition-colors">
                   <Share2 size={18} />
                 </button>
              </div>
            </div>

            <h3 className="text-xl font-serif font-bold text-[#3E3D39] mb-6">{dua.title}</h3>
            
            <div className="text-center space-y-6">
              <p className="text-3xl font-arabic text-[#5A5A40] leading-loose" dir="rtl">
                {dua.arabic}
              </p>
              
              <div className="space-y-2 max-w-2xl mx-auto">
                <p className="text-[#C89B7B] font-bold text-sm italic">
                  {dua.transliteration}
                </p>
                <div className="w-8 h-[1px] bg-[#E6E2D8] mx-auto" />
                <p className="text-[#5D5C56] font-serif leading-relaxed">
                  "{dua.translation}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
