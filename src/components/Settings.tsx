import React, { useState, useEffect } from 'react';
import { QuranService } from '../services/quranApi';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Volume2, Globe, Save, Loader2 } from 'lucide-react';

export default function Settings() {
  const [reciters, setReciters] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReciter, setSelectedReciter] = useState(localStorage.getItem('preferred_reciter') || 'ar.alafasy');
  const [selectedTranslation, setSelectedTranslation] = useState(localStorage.getItem('preferred_translation') || 'en.sahih');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rData, tData] = await Promise.all([
          QuranService.getReciters(),
          QuranService.getTranslations()
        ]);
        setReciters(rData);
        setTranslations(tData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = () => {
    localStorage.setItem('preferred_reciter', selectedReciter);
    localStorage.setItem('preferred_translation', selectedTranslation);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#7D8461]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-12 text-center">
        <div className="w-16 h-16 bg-[#7D8461] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <SettingsIcon size={32} />
        </div>
        <h2 className="text-4xl font-serif font-bold text-[#5A5A40]">Settings</h2>
        <p className="text-[#A49D8B] mt-2">Personalize your reading and listening experience</p>
      </header>

      <div className="space-y-8 bg-white p-8 rounded-[40px] border border-[#E6E2D8] shadow-sm">
        {/* Reciter Selection */}
        <section>
          <div className="flex items-center gap-3 mb-4 text-[#7D8461]">
            <Volume2 size={24} />
            <h3 className="text-xl font-bold font-serif">Preferred Reciter</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <select 
              className="w-full p-4 bg-[#F4F1EA] border border-[#E6E2D8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7D8461] transition-all"
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(e.target.value)}
            >
              {reciters.map((r) => (
                <option key={r.identifier} value={r.identifier}>
                  {r.name} ({r.englishName})
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Translation Selection */}
        <section>
          <div className="flex items-center gap-3 mb-4 text-[#C89B7B]">
            <Globe size={24} />
            <h3 className="text-xl font-bold font-serif">Translation Edition</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <select 
              className="w-full p-4 bg-[#F4F1EA] border border-[#E6E2D8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7D8461] transition-all"
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
            >
              {translations.map((t) => (
                <option key={t.identifier} value={t.identifier}>
                  {t.name} ({t.englishName})
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md
              ${saved ? 'bg-green-600 text-white' : 'bg-[#7D8461] text-white hover:bg-[#5A5A40]'}
            `}
          >
            {saved ? 'Preferences Saved!' : (
              <>
                <Save size={18} />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-[#F4F1EA] rounded-3xl border border-[#E6E2D8]">
        <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-wide mb-2">Note</h4>
        <p className="text-sm text-[#A49D8B] leading-relaxed">
          The selected reciter and translation will be used as the default whenever you open a Surah for reading. You can always change these settings here.
        </p>
      </div>
    </div>
  );
}
