import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QuranService, SurahDetail, Ayah } from '../services/quranApi';
import { AIService } from '../services/aiService';
import { db } from '../services/db';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Sparkles,
  BookOpen,
  Volume2,
  X,
  Mic,
  MicOff,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function QuranReader() {
  const { number } = useParams<{ number: string }>();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Settings from localStorage
  const preferredTranslation = localStorage.getItem('preferred_translation') || 'en.sahih';
  const preferredReciter = localStorage.getItem('preferred_reciter') || 'ar.alafasy';

  // AI analysis state
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Recitation practice state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<number | null>(null);
  const [analyzingRecitationId, setAnalyzingRecitationId] = useState<number | null>(null);
  const [recitationResult, setRecitationResult] = useState<any | null>(null);
  const [fetchingGuideId, setFetchingGuideId] = useState<number | null>(null);
  const [recitationGuide, setRecitationGuide] = useState<any | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Offline state
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (number) {
      setLoading(true);
      const surahNumber = parseInt(number);
      
      // Try offline first
      db.surahs.get(surahNumber).then(offlineData => {
        if (offlineData) {
          setSurah(offlineData.data);
          setIsOffline(true);
          setLoading(false);
        } else {
          // Fetch from API
          QuranService.getSurahDetail(surahNumber, preferredTranslation, preferredReciter).then(data => {
            setSurah(data);
            setIsOffline(false);
            setLoading(false);
          });
        }
      });
    }
  }, [number, preferredTranslation, preferredReciter]);

  const downloadForOffline = async () => {
    if (!surah) return;
    setIsDownloading(true);
    try {
      await db.surahs.put({
        number: surah.number,
        data: surah,
        downloadedAt: Date.now()
      });
      setIsOffline(true);
    } catch (err) {
      console.error("Failed to save surah offline:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const removeOffline = async () => {
    if (!surah) return;
    try {
      await db.surahs.delete(surah.number);
      setIsOffline(false);
    } catch (err) {
      console.error("Failed to remove offline surah:", err);
    }
  };

  const toggleAudio = (ayah: Ayah) => {
    if (playingId === ayah.number) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current && ayah.audio) {
        try {
          audioRef.current.src = ayah.audio;
          audioRef.current.load();
          audioRef.current.play().catch(err => {
            // AbortError is common when clicking play quickly on different verses
            if (err.name !== 'AbortError') {
              console.error("Quran audio playback failed:", err);
              setPlayingId(null);
            }
          });
          setPlayingId(ayah.number);
        } catch (e) {
          console.error("Error setting audio source:", e);
          setPlayingId(null);
        }
      } else {
        console.warn("No audio source available for this ayah.");
      }
    }
  };

  const runAIAnalysis = async (ayah: Ayah) => {
    setAnalyzingId(ayah.number);
    setAnalysisResult(null);
    const result = await AIService.analyzeAyah(ayah.text, ayah.translation || '');
    setAnalysisResult({ id: ayah.number, ...result });
    setAnalyzingId(null);
  };
  
  const getPracticeGuide = async (ayah: Ayah) => {
    setFetchingGuideId(ayah.number);
    setRecitationGuide(null);
    const result = await AIService.getRecitationGuide(ayah.text);
    setRecitationGuide({ id: ayah.number, ...result });
    setFetchingGuideId(null);
  };

  const startRecording = async (ayahId: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const ayah = surah?.ayahs.find(a => a.number === ayahId);
          if (ayah) {
            setAnalyzingRecitationId(ayahId);
            const result = await AIService.analyzeRecitation(base64Audio, ayah.text, 'audio/webm');
            setRecitationResult({ id: ayahId, ...result });
            setAnalyzingRecitationId(null);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingId(ayahId);
      setRecitationResult(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for recitation practice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#7D8461]" size={40} />
      </div>
    );
  }

  if (!surah) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />

      <header className="mb-12 text-center text-[#5A5A40]">
        <div className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-[#E6E2D8] sticky top-0 z-10 shadow-sm">
          <Link to="/" className="p-2 hover:bg-[#F4F1EA] rounded-full transition-colors border border-transparent hover:border-[#E6E2D8] text-[#7D8461]">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex-1 flex flex-col items-center">
             <h2 className="text-2xl font-serif font-bold">{surah.englishName}</h2>
             <span className="text-[10px] bg-[#7D8461]/10 text-[#7D8461] px-2 py-0.5 rounded tracking-wide uppercase font-bold mt-1">Surah {surah.number}</span>
          </div>
          <div className="flex items-center gap-2">
            {isOffline ? (
              <button 
                onClick={removeOffline}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100 flex items-center gap-2"
                title="Remove from offline"
              >
                <Trash2 size={20} />
                <span className="text-[10px] font-bold uppercase hidden md:inline">Offline</span>
              </button>
            ) : (
              <button 
                onClick={downloadForOffline}
                className={`p-2 rounded-full transition-all flex items-center gap-2 ${isDownloading ? 'text-[#7D8461] animate-pulse' : 'text-[#7D8461] hover:bg-[#F4F1EA] border border-transparent hover:border-[#E6E2D8]'}`}
                disabled={isDownloading}
                title="Download for offline"
              >
                {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                {!isDownloading && <span className="text-[10px] font-bold uppercase hidden md:inline">Download</span>}
              </button>
            )}
            <div className="w-8 h-8 rounded-full border border-[#D1CCBF] flex items-center justify-center text-[10px] font-bold text-[#A49D8B] shrink-0">
              {surah.numberOfAyahs}
            </div>
          </div>
        </div>
        
        {surah.number !== 1 && surah.number !== 9 && (
          <div className="arabic-text text-4xl mt-8 py-8 border-y border-[#E6E2D8] text-[#2C2C26]">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </div>
        )}
      </header>

      <div className="space-y-12">
        {surah.ayahs.map((ayah) => (
          <motion.div 
            key={ayah.number}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`
              relative group p-6 rounded-[40px] transition-all duration-500
              ${activeAyah === ayah.number ? 'bg-white shadow-xl border border-[#E6E2D8]' : 'bg-transparent'}
            `}
            onClick={() => setActiveAyah(ayah.number)}
          >
            {/* Active Indicator Bar */}
            <div className={`
              absolute -left-4 top-0 w-1.5 h-full bg-[#7D8461] rounded-full transition-opacity duration-300
              ${activeAyah === ayah.number ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'}
            `} />

            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full border border-[#D1CCBF] text-[#A49D8B] text-[10px] font-bold">
                  {ayah.numberInSurah}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleAudio(ayah); }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm
                      ${playingId === ayah.number ? 'bg-[#7D8461] text-white' : 'bg-white hover:bg-[#F4F1EA] text-[#7D8461] border border-[#E6E2D8]'}
                    `}
                  >
                    {playingId === ayah.number ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); runAIAnalysis(ayah); }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8] bg-white
                      ${analyzingId === ayah.number ? 'bg-[#F4F1EA]' : 'hover:bg-[#F4F1EA] text-[#C89B7B]'}
                    `}
                    title="Verse Analysis"
                  >
                    {analyzingId === ayah.number ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); getPracticeGuide(ayah); }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8] bg-white
                      ${fetchingGuideId === ayah.number ? 'bg-[#F4F1EA]' : 'hover:bg-[#F4F1EA] text-blue-500'}
                    `}
                    title="AI Correction Practice Guide"
                  >
                    {fetchingGuideId === ayah.number ? <Loader2 size={18} className="animate-spin" /> : <Info size={18} />}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (recordingId === ayah.number) stopRecording();
                      else startRecording(ayah.number);
                    }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8]
                      ${recordingId === ayah.number ? 'bg-red-500 text-white animate-pulse' : 'bg-white hover:bg-red-50 text-red-500'}
                      ${analyzingRecitationId === ayah.number ? 'bg-[#F4F1EA]' : ''}
                    `}
                    title="Practice Recitation"
                    disabled={analyzingRecitationId === ayah.number}
                  >
                    {analyzingRecitationId === ayah.number ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : recordingId === ayah.number ? (
                      <MicOff size={18} />
                    ) : (
                      <Mic size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="arabic-text text-xl text-[#A49D8B] opacity-40">
                {surah.name}
              </div>
            </div>

            <div className="text-right mb-6">
              <p className="arabic-text text-4xl leading-[4.5rem] text-[#2C2C26] antialiased">
                {ayah.text}
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-[#5D5C56] font-serif leading-relaxed italic opacity-90 border-l-2 border-[#E6E2D8] pl-6 py-2">
                {ayah.translation}
              </p>
              
              <AnimatePresence>
                {analysisResult && analysisResult.id === ayah.number && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#F9F7F2] border border-[#E6E2D8] rounded-3xl p-6 relative">
                      <div className="absolute -top-3 left-6 bg-[#C89B7B] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">AI Insights</div>
                      
                      <div className="flex justify-end mb-4">
                        <button onClick={() => setAnalysisResult(null)} className="text-[#A49D8B] hover:text-[#3E3D39]">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <section className="space-y-6">
                          <div>
                            <h5 className="font-bold text-[#5A5A40] flex items-center space-x-2 mb-3 uppercase tracking-tighter">
                              <Volume2 size={16} className="text-[#7D8461]" />
                              <span>Tajweed & Pronunciation</span>
                            </h5>
                            <div className="bg-white/60 p-4 rounded-2xl border border-[#E6E2D8] text-[#5D5C56] leading-relaxed">
                              {analysisResult.tajweedAndPronunciation}
                              <div className="mt-3 pt-3 border-t border-[#E6E2D8]/50">
                                <Link to="/tajweed" className="text-[10px] font-bold text-[#7D8461] hover:underline flex items-center gap-1">
                                  <ExternalLink size={10} />
                                  <span>See full rules in Tajweed Guide</span>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {analysisResult.grammarAndContext && (
                            <div>
                              <h5 className="font-bold text-[#5A5A40] flex items-center space-x-2 mb-3 uppercase tracking-tighter">
                                <BookOpen size={16} className="text-[#7D8461]" />
                                <span>Grammar & Context</span>
                              </h5>
                              <div className="text-[#5D5C56] leading-relaxed">
                                {analysisResult.grammarAndContext}
                              </div>
                            </div>
                          )}
                        </section>
                        
                        <section className="space-y-6">
                          <div>
                            <h5 className="font-bold text-[#5A5A40] flex items-center space-x-2 mb-3 uppercase tracking-tighter">
                              <Sparkles size={16} className="text-[#C89B7B]" />
                              <span>Nuanced Translation</span>
                            </h5>
                            <div className="bg-white/80 p-5 rounded-2xl border border-[#E6E2D8] shadow-sm">
                              <p className="text-[#C89B7B] italic font-medium leading-relaxed">"{analysisResult.nuancedTranslation}"</p>
                              {analysisResult.translationNuances && (
                                <div className="mt-4 pt-4 border-t border-[#E6E2D8] text-xs text-[#A49D8B] leading-relaxed">
                                  <p className="font-bold text-[#5A5A40] uppercase tracking-tighter mb-2 text-[10px]">Why this is better:</p>
                                  {analysisResult.translationNuances}
                                </div>
                              )}
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {recitationGuide && recitationGuide.id === ayah.number && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 relative">
                      <div className="absolute -top-3 left-6 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Practice Guide</div>
                      
                      <div className="flex justify-end mb-4">
                        <button onClick={() => setRecitationGuide(null)} className="text-blue-300 hover:text-blue-600">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h6 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center">
                            <AlertCircle size={12} className="mr-2" />
                            Common Pitfalls
                          </h6>
                          <div className="space-y-2">
                            {recitationGuide.commonMistakes.map((m: any, idx: number) => (
                              <div key={idx} className="bg-white/60 p-3 rounded-xl border border-blue-100 text-xs">
                                <p className="font-bold text-blue-900">{m.pitfall}</p>
                                <p className="text-blue-700/70 mt-1">{m.howToAvoid}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h6 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center">
                            <BookOpen size={12} className="mr-2" />
                            Practice Drills
                          </h6>
                          <ul className="space-y-2">
                            {recitationGuide.practiceDrills.map((drill: string, idx: number) => (
                              <li key={idx} className="bg-white/40 p-2 rounded-lg text-xs text-blue-800 border border-blue-50 flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">{idx + 1}</div>
                                {drill}
                              </li>
                            ))}
                          </ul>
                          
                          {recitationGuide.focusWords.length > 0 && (
                            <div className="mt-4">
                              <h6 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">Focus Words</h6>
                              <div className="flex flex-wrap gap-2">
                                {recitationGuide.focusWords.map((f: any, idx: number) => (
                                  <div key={idx} className="bg-white px-2 py-1 rounded border border-blue-100 group relative">
                                    <span className="font-arabic text-sm text-blue-900 cursor-help">{f.word}</span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-blue-600 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                      {f.reason}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {recitationResult && recitationResult.id === ayah.number && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="bg-[#F2F7F2] border border-[#D8E6D8] rounded-3xl p-6 relative">
                      <div className="absolute -top-3 left-6 bg-[#4A7D4A] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Recitation Feedback</div>
                      
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle 
                                cx="24" cy="24" r="20" 
                                fill="transparent" 
                                stroke="#E6EBE6" 
                                strokeWidth="4" 
                              />
                              <motion.circle 
                                cx="24" cy="24" r="20" 
                                fill="transparent" 
                                stroke="#4A7D4A" 
                                strokeWidth="4" 
                                strokeDasharray={125.6}
                                initial={{ strokeDashoffset: 125.6 }}
                                animate={{ strokeDashoffset: 125.6 * (1 - recitationResult.accuracyScore / 100) }}
                                transition={{ duration: 1 }}
                              />
                            </svg>
                            <span className="text-xs font-bold text-[#4A7D4A]">{recitationResult.accuracyScore}%</span>
                          </div>
                          <div>
                            <p className="text-xs text-[#6A8D6A] font-bold uppercase tracking-widest">Accuracy Score</p>
                            <p className="text-[#2C3E2C] font-medium leading-tight">
                              {recitationResult.accuracyScore >= 90 ? 'Excellent Recitation!' : 
                               recitationResult.accuracyScore >= 70 ? 'Good, Keep Practicing' : 'Needs Significant Work'}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setRecitationResult(null)} className="text-[#8DA48D] hover:text-[#2C3E2C]">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="bg-white/60 rounded-2xl p-4 border border-[#D8E6D8] mb-6">
                        <p className="text-sm text-[#3E523E] leading-relaxed italic">
                          <Award size={14} className="inline mr-2 text-[#4A7D4A]" />
                          {recitationResult.overallFeedback}
                        </p>
                      </div>

                      {recitationResult.mistakes && recitationResult.mistakes.length > 0 ? (
                        <div className="space-y-3">
                          <h6 className="text-[10px] font-bold text-[#4A7D4A] uppercase tracking-widest flex items-center">
                            <AlertCircle size={12} className="mr-2" />
                            Areas for Improvement
                          </h6>
                          <div className="grid grid-cols-1 gap-2">
                            {recitationResult.mistakes.map((mistake: any, idx: number) => (
                              <div key={idx} className="flex items-start space-x-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                <span className="bg-white text-xs font-arabic px-2 py-1 rounded border border-red-100 text-[#2C2C26]">
                                  {mistake.word}
                                </span>
                                <div className="text-xs">
                                  <p className="font-bold text-red-700 capitalize">{mistake.type}</p>
                                  <p className="text-red-600/80 mt-0.5">{mistake.feedback}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : recitationResult.accuracyScore > 0 && (
                        <div className="flex items-center space-x-2 text-[#4A7D4A] p-4 bg-white/40 rounded-2xl border border-[#D8E6D8]">
                          <CheckCircle2 size={18} />
                          <p className="text-sm font-bold">Perfect pronunciation and Tajweed! SubhanAllah.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
