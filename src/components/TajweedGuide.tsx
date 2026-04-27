import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Music, Languages, Play, Volume2, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface Subrule {
  name: Record<string, string>;
  description: Record<string, string>;
  examples: Array<{
    arabic: string;
    pronunciation: Record<string, string>;
  }>;
}

interface TajweedRule {
  title: Record<string, string>;
  description: Record<string, string>;
  detailedSubrules: Subrule[];
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
      detailedSubrules: [
        {
          name: { en: "Izhaar", bn: "ইজহার" },
          description: { en: "Pronouncing the 'N' sound clearly without any nasalization.", bn: "গুণ্নাহ ছাড়া স্পষ্টভাবে উচ্চারণ করা।" },
          examples: [{ arabic: "مِنْ حَيْثُ", pronunciation: { en: "Min Haithu", bn: "মিন হাইসু" } }]
        },
        {
          name: { en: "Idghaam", bn: "ইদগাম" },
          description: { en: "Merging the 'N' into the following letter.", bn: "পরবর্তী অক্ষরের সাথে মিলিয়ে পড়া।" },
          examples: [{ arabic: "مَن يَقُولُ", pronunciation: { en: "May-yaqool", bn: "মাই-ইয়াকুল" } }]
        },
        {
          name: { en: "Iqlaab", bn: "ইকলাব" },
          description: { en: "Changing the 'N' sound into a 'M' sound when followed by Baa.", bn: "নূনকে মীম দ্বারা পরিবর্তন করে পড়া।" },
          examples: [{ arabic: "مِن بَعْدِ", pronunciation: { en: "Mim-ba'di", bn: "মিম-বাদি" } }]
        },
        {
          name: { en: "Ikhfaa", bn: "ইখফা" },
          description: { en: "Hiding the 'N' sound with a light nasalization.", bn: "নূনকে লুকিয়ে গুন্নাহর সাথে পড়া।" },
          examples: [{ arabic: "أَنتُمْ", pronunciation: { en: "An-tum (nasalized)", bn: "আন-তুম (গুন্নাহসহ)" } }]
        }
      ],
      letters: "ء ه ع ح غ خ",
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    },
    {
      title: { en: "Meem Sakinah", bn: "মীম সাকিন" },
      description: { 
        en: "Rules for the static 'M' sound.",
        bn: "স্থির 'ম' উচ্চারণের নিয়ম।"
      },
      detailedSubrules: [
        {
          name: { en: "Ikhfaa Shafawi", bn: "ইখফায়ে শাফায়ি" },
          description: { en: "Hiding the Meem when followed by Baa with Ghunnah.", bn: "মীমের পর বা আসলে গুন্নাহর সাথে পড়া।" },
          examples: [{ arabic: "تَرْمِيهِم بِحِجَارَةٍ", pronunciation: { en: "Tarmeehim-bihijarah", bn: "তারমিহিম-বিহিতজারাহ" } }]
        },
        {
          name: { en: "Idghaam Shafawi", bn: "ইদগামে শাফাওয়ি" },
          description: { en: "Merging the Meem when followed by another Meem.", bn: "মীমের পর মীম আসলে মিলিয়ে পড়া।" },
          examples: [{ arabic: "لَكُم مَّا سَأَلْتُمْ", pronunciation: { en: "Lakum-masa-altum", bn: "লাকুম-মাসালতুম" } }]
        },
        {
          name: { en: "Izhaar Shafawi", bn: "ইজহারে শাফাওয়ি" },
          description: { en: "Pronouncing the Meem clearly before all other letters.", bn: "অন্যান্য সকল অক্ষরের পূর্বে মীমকে স্পষ্টভাবে পড়া।" },
          examples: [{ arabic: "أَمْ لَمْ تُنذِرْهُمْ", pronunciation: { en: "Am-lam-tunzirhum", bn: "আম-লাম-তুনজিরহুম" } }]
        }
      ],
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3", 
    },
    {
      title: { en: "Madd (Prolongation)", bn: "মদ্দ (টানা)" },
      description: { 
        en: "Stretching the sound of long vowels.",
        bn: "দীর্ঘ স্বরবর্ণের উচ্চারণ দীর্ঘ করা।"
      },
      detailedSubrules: [
        {
          name: { en: "Madd Asli", bn: "মদ্দে আসলি" },
          description: { en: "The original prolongation (2 counts).", bn: "স্বাভাবিক মদ্দ (২ হরকত পরিমাণ টানা)।" },
          examples: [{ arabic: "قَالَ", pronunciation: { en: "Qaala", bn: "ক্বালা" } }]
        },
        {
          name: { en: "Madd Muttasil", bn: "মদ্দে মুত্তাসিল" },
          description: { en: "Prolongation when Hamzah follows the Madd letter in the same word (4-5 counts).", bn: "একই শব্দে মদ্দের অক্ষরের পর হামযা আসলে ৪-৫ হরকত টানা।" },
          examples: [{ arabic: "جَاءَ", pronunciation: { en: "Jaaaa-a", bn: "জা-আ" } }]
        },
        {
          name: { en: "Madd Munfasil", bn: "মদ্দে মুনফাসিল" },
          description: { en: "Prolongation when Hamzah follows the Madd letter in the next word (2-5 counts).", bn: "আলাদা শব্দে মদ্দের অক্ষরের পর হামযা আসলে ২-৫ হরকত টানা।" },
          examples: [{ arabic: "إِنَّا أَعْطَيْنَاكَ", pronunciation: { en: "Innaaaa-Ataynaka", bn: " ইন্না-আতাইনাকা" } }]
        }
      ],
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    },
    {
      title: { en: "Qamariyah & Shamsiyah Letters", bn: "হরফে ক্কামারিয়া ও সামছিয়া" },
      description: { 
        en: "Rules regarding the definite article 'Al' (ال) pronunciation.",
        bn: "নির্দিষ্টকারক শব্দ 'আল' (ال) উচ্চারণের নিয়ম।"
      },
      detailedSubrules: [
        {
          name: { en: "Huruf al-Qamariyah (Moon Letters)", bn: "হরফে ক্কামারিয়া (চন্দ্র অক্ষর)" },
          description: { en: "When 'Al' is followed by these 14 letters, the 'L' is pronounced clearly.", bn: "এই ১৪টি অক্ষরের পূর্বে 'আল' আসলে 'লাম' স্পষ্ট করে পড়তে হয়।" },
          examples: [
            { arabic: "الْقَمَر", pronunciation: { en: "Al-Qamar", bn: "আল-ক্কামার" } },
            { arabic: "الْحَمْد", pronunciation: { en: "Al-Hamdu", bn: "আল-হামদু" } }
          ]
        },
        {
          name: { en: "Huruf al-Shamsiyah (Sun Letters)", bn: "হরফে সামছিয়া (সূর্য অক্ষর)" },
          description: { en: "When 'Al' is followed by these 14 letters, the 'L' is silent and merges.", bn: "এই ১৪টি অক্ষরের পূর্বে 'আল' আসলে 'লাম' উহ্য থাকে এবং পরবর্তী অক্ষরে তাসদীদ হয়।" },
          examples: [
            { arabic: "الشَّمْس", pronunciation: { en: "Ash-Shams", bn: "আশ-শামস" } },
            { arabic: "الدِّين", pronunciation: { en: "Ad-Deen", bn: "আদ-দীন" } }
          ]
        }
      ],
      letters: "১. ا ب ج ح خ ع غ ف ق ك م و ه ي | ২. ت ث د ذ ر ز س ش ص ض ط ظ ل ن",
      exampleAudio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    },
    {
      title: { en: "Qalqalah (Echoing)", bn: "কলকলাহ (প্রতিধ্বনি)" },
      description: { 
        en: "The bouncing sound made on certain letters when static.",
        bn: "স্থির অবস্থায় নির্দিষ্ট কিছু অক্ষরে প্রতিধ্বনি সৃষ্টি করা।"
      },
      detailedSubrules: [
        {
          name: { en: "Qalqalah Sughra", bn: "কলকলাহ সুগরা" },
          description: { en: "A light echo when the letter is in the middle of a word.", bn: "শব্দের মাঝখানে কলকলার অক্ষরে জযম থাকলে হালকা প্রতিধ্বনি করা।" },
          examples: [{ arabic: "يَقُولُ", pronunciation: { en: "Yaq-ool (light bounce on q)", bn: "ইয়াক্ব-উল" } }]
        },
        {
          name: { en: "Qalqalah Kubra", bn: "কলকলাহ কুবরা" },
          description: { en: "A strong echo when the letter is at the end of a word.", bn: "শব্দের শেষে কলকলার অক্ষরে তাসদীদ বা জযম থাকলে কড়া প্রতিধ্বনি করা।" },
          examples: [{ arabic: "الْفَلَقِ", pronunciation: { en: "Al-Falaq (strong bounce on q)", bn: "আল-ফালাক্ব" } }]
        }
      ],
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
                  {rule.detailedSubrules.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F4F1EA] text-[#7D8461] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#E6E2D8]">
                      {s.name[lang]}
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
                  <div className="space-y-10">
                    {rule.detailedSubrules.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-[#7D8461] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {sub.name[lang]}
                          </div>
                          <div className="h-[1px] flex-1 bg-[#E6E2D8]" />
                        </div>
                        
                        <p className="text-[#5A5A40] text-sm leading-relaxed">{sub.description[lang]}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sub.examples.map((ex, eIdx) => (
                            <div key={eIdx} className="bg-white p-6 rounded-3xl border border-[#E6E2D8] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                              <span className="arabic-text text-3xl text-[#3E3D39] mb-4">{ex.arabic}</span>
                              <div className="flex items-center gap-2 text-[#C89B7B]">
                                <Volume2 size={14} className="opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-widest">{ex.pronunciation[lang]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E6E2D8]">
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span>{lang === 'bn' ? 'অডিও উদাহরণ' : 'Audio Example'}</span>
                        </h5>
                        <button 
                          onClick={() => playAudio(rule.exampleAudio!)}
                          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-green-100 hover:bg-green-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Play size={20} className="text-green-600 fill-current" />
                            <span className="text-sm font-medium text-green-800">{lang === 'bn' ? 'শুনুন' : 'Listen Now'}</span>
                          </div>
                          <Volume2 size={16} className="text-green-300 group-hover:text-green-500" />
                        </button>
                      </div>

                      {rule.letters && (
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest">
                            {lang === 'bn' ? 'অক্ষরসমূহ' : 'Key Letters'}
                          </h5>
                          <div className="p-4 bg-white rounded-2xl border border-[#E6E2D8] flex items-center justify-center">
                            <span className="arabic-text text-xl text-[#3E3D39]">{rule.letters}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
