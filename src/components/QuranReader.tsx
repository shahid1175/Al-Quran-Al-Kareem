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
  Eye,
  EyeOff,
  History,
  Settings2,
  Info,
  Trash2,
  StickyNote,
  ScrollText,
  ShieldAlert,
  Languages
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
  const [analysisAspect, setAnalysisAspect] = useState<'combined' | 'tajweed' | 'grammar'>('combined');
  const [scholarlySource, setScholarlySource] = useState<'standard' | 'traditional' | 'technical'>('standard');

  // Recitation practice state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<number | null>(null);
  const [isStrictCorrection, setIsStrictCorrection] = useState(false);
  const strictRef = useRef(false);
  const [analyzingRecitationId, setAnalyzingRecitationId] = useState<number | null>(null);
  const [recitationResult, setRecitationResult] = useState<any | null>(null);
  const [fetchingGuideId, setFetchingGuideId] = useState<number | null>(null);
  const [recitationGuide, setRecitationGuide] = useState<any | null>(null);
  const [fetchingTafsirId, setFetchingTafsirId] = useState<number | null>(null);
  const [tafsirData, setTafsirData] = useState<{ id: number; text: string } | null>(null);
  const [selectedTafsir, setSelectedTafsir] = useState<number>(parseInt(localStorage.getItem('preferred_tafsir') || '161'));
  const [memoMode, setMemoMode] = useState(false);
  const [hideTranslation, setHideTranslation] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [verseNotes, setVerseNotes] = useState<Record<number, string>>({});
  const [isListeningNote, setIsListeningNote] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for notes
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript && isListeningNote !== null) {
          setVerseNotes(prev => ({
            ...prev,
            [isListeningNote]: (prev[isListeningNote] || '') + ' ' + finalTranscript
          }));
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          alert('নেটওয়ার্ক ত্রুটি: ভয়েস ইনপুট ব্যবহারের জন্য ইন্টারনেট সংযোগ নিশ্চিত করুন। (Network error: Please check your internet connection for voice input)');
        }
        setIsListeningNote(null);
      };

      recognitionRef.current.onend = () => {
        setIsListeningNote(null);
      };
    }

    // Load notes from localStorage
    if (surah) {
      const savedNotes = JSON.parse(localStorage.getItem(`quran_notes_${surah.number}`) || '{}');
      setVerseNotes(savedNotes);
    }
  }, [surah]);

  // Save notes to localStorage
  useEffect(() => {
    if (surah) {
      localStorage.setItem(`quran_notes_${surah.number}`, JSON.stringify(verseNotes));
    }
  }, [verseNotes, surah]);

  const toggleNoteListening = (ayahId: number) => {
    if (!recognitionRef.current) {
      alert('ভয়েস ইনপুট সমর্থিত নয়। (Voice input not supported)');
      return;
    }

    if (isListeningNote === ayahId) {
      recognitionRef.current.stop();
      setIsListeningNote(null);
    } else {
      if (isListeningNote !== null) recognitionRef.current.stop();
      setIsListeningNote(ayahId);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition start error:', e);
        setIsListeningNote(null);
      }
    }
  };

  const handleNoteChange = (ayahId: number, text: string) => {
    setVerseNotes(prev => ({
      ...prev,
      [ayahId]: text
    }));
  };

  // Save to history when results come in
  useEffect(() => {
    if (recitationResult && recitationResult.id) {
      const history = JSON.parse(localStorage.getItem('quran_recitation_history') || '[]');
      const newEntry = {
        ...recitationResult,
        timestamp: new Date().toISOString(),
        surahName: surah.name,
        surahNumber: surah.number,
        ayahNumber: recitationResult.id
      };
      // Keep last 50 entries
      const updatedHistory = [newEntry, ...history].slice(0, 50);
      localStorage.setItem('quran_recitation_history', JSON.stringify(updatedHistory));
      
      // Update Daily Streak
      const lastCheck = localStorage.getItem('last_practice_date');
      const today = new Date().toDateString();
      if (lastCheck !== today) {
        const streak = parseInt(localStorage.getItem('practice_streak') || '0');
        localStorage.setItem('practice_streak', (streak + 1).toString());
        localStorage.setItem('last_practice_date', today);
      }
    }
  }, [recitationResult, surah]);
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
    const result = await AIService.analyzeAyah(ayah.text, ayah.translation || '', analysisAspect, scholarlySource);
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

  const fetchTafsir = async (ayah: Ayah) => {
    setFetchingTafsirId(ayah.number);
    setTafsirData(null);
    const text = await QuranService.getTafsir(surah!.number, ayah.numberInSurah, selectedTafsir);
    setTafsirData({ id: ayah.number, text });
    setFetchingTafsirId(null);
  };

  const startRecording = async (ayahId: number, strict: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setIsStrictCorrection(strict);
      strictRef.current = strict;

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
            const result = await AIService.analyzeRecitation(base64Audio, ayah.text, 'audio/webm', strictRef.current);
            setRecitationResult({ id: ayahId, ...result });
            setAnalyzingRecitationId(null);
            setIsStrictCorrection(false);
            strictRef.current = false;
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

        {/* Practice Toolbar */}
        <div className="flex items-center justify-center gap-4 py-4 px-6 bg-[#F9F7F2] rounded-[30px] border border-[#E6E2D8] mb-8 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setMemoMode(!memoMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${memoMode ? 'bg-[#7D8461] text-white border-transparent' : 'bg-white text-[#7D8461] border-[#E6E2D8] hover:bg-[#F4F1EA]'}`}
          >
            {memoMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{memoMode ? 'Verses Hidden' : 'Hide Verses'}</span>
          </button>

          <button 
            onClick={() => setHideTranslation(!hideTranslation)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${hideTranslation ? 'bg-[#C89B7B] text-white border-transparent' : 'bg-white text-[#C89B7B] border-[#E6E2D8] hover:bg-[#F4F1EA]'}`}
          >
            {hideTranslation ? <BookOpen size={16} className="opacity-50" /> : <BookOpen size={16} />}
            <span>{hideTranslation ? 'Translation Off' : 'Show Translation'}</span>
          </button>

          <div className="h-4 w-[1px] bg-[#E6E2D8]" />

          <button 
            onClick={() => setAiMode(!aiMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${aiMode ? 'bg-[#C89B7B] text-white border-transparent shadow-sm' : 'bg-white text-[#A49D8B] border-[#E6E2D8] hover:bg-[#F4F1EA]'}`}
          >
            <Sparkles size={14} className={aiMode ? 'text-white' : 'text-[#C89B7B]'} />
            <span>AI Mode {aiMode ? 'On' : 'Off'}</span>
          </button>

          <div className="h-4 w-[1px] bg-[#E6E2D8]" />

          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold text-[#A49D8B] uppercase tracking-widest pl-2">Analysis Type</label>
            <select 
              value={analysisAspect}
              onChange={(e) => setAnalysisAspect(e.target.value as any)}
              className="bg-white border border-[#E6E2D8] rounded-full px-3 py-1 text-[10px] font-bold text-[#7D8461] focus:outline-none focus:ring-1 focus:ring-[#7D8461] cursor-pointer"
            >
              <option value="combined">Combined Analysis</option>
              <option value="tajweed">Tajweed Only</option>
              <option value="grammar">Grammar Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold text-[#A49D8B] uppercase tracking-widest pl-2">Expert Persona</label>
            <select 
              value={scholarlySource}
              onChange={(e) => setScholarlySource(e.target.value as any)}
              className="bg-white border border-[#E6E2D8] rounded-full px-3 py-1 text-[10px] font-bold text-[#C89B7B] focus:outline-none focus:ring-1 focus:ring-[#C89B7B] cursor-pointer"
            >
              <option value="standard">Standard Scholar</option>
              <option value="traditional">Traditional Exegete</option>
              <option value="technical">Linguistic Researcher</option>
            </select>
          </div>

          <div className="h-4 w-[1px] bg-[#E6E2D8]" />

          <div className="flex items-center gap-2">
            <ScrollText size={14} className="text-[#7D8461]" />
            <select 
              value={selectedTafsir}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedTafsir(val);
                localStorage.setItem('preferred_tafsir', val.toString());
              }}
              className="bg-white border border-[#E6E2D8] rounded-full px-3 py-1.5 text-xs font-bold text-[#7D8461] focus:outline-none focus:ring-1 focus:ring-[#7D8461] cursor-pointer"
            >
              {QuranService.BENGALI_TAFSIRS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
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

            {recordingId === ayah.number && isStrictCorrection && (
              <div className="absolute top-6 right-6 bg-orange-500 text-white text-[8px] px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse shadow-lg flex items-center gap-2 z-10 border border-orange-400">
                <ShieldAlert size={10} />
                Strict Correction Mode
              </div>
            )}

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

                  {aiMode && (
                    <>
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
                          ${fetchingGuideId === ayah.number ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-indigo-50 text-indigo-500'}
                        `}
                        title="AI Recitation Analysis (তিলাওয়াত বিশ্লেষণ)"
                      >
                        {fetchingGuideId === ayah.number ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
                      </button>
                    </>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); fetchTafsir(ayah); }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8] bg-white
                      ${fetchingTafsirId === ayah.number ? 'bg-[#F4F1EA]' : 'hover:bg-[#F4F1EA] text-[#7D8461]'}
                    `}
                    title="Read Tafsir (Exegesis)"
                  >
                    {fetchingTafsirId === ayah.number ? <Loader2 size={18} className="animate-spin" /> : <ScrollText size={18} />}
                  </button>

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (recordingId === ayah.number) stopRecording();
                      else startRecording(ayah.number);
                    }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8]
                      ${recordingId === ayah.number && !isStrictCorrection ? 'bg-red-500 text-white animate-pulse border-transparent' : 'bg-white hover:bg-red-50 text-red-500'}
                      ${analyzingRecitationId === ayah.number ? 'bg-[#F4F1EA]' : ''}
                    `}
                    title="Practice Recitation"
                    disabled={analyzingRecitationId === ayah.number || (recordingId === ayah.number && isStrictCorrection)}
                  >
                    {analyzingRecitationId === ayah.number && !isStrictCorrection ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (recordingId === ayah.number && !isStrictCorrection) ? (
                      <MicOff size={18} />
                    ) : (
                      <Mic size={18} />
                    )}
                  </button>

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (recordingId === ayah.number) stopRecording();
                      else startRecording(ayah.number, true);
                    }}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8]
                      ${recordingId === ayah.number && isStrictCorrection ? 'bg-orange-500 text-white animate-pulse border-transparent shadow-sm' : 'bg-white hover:bg-orange-50 text-orange-500'}
                    `}
                    title="Strict AI Correction Practice (ভুল ধরার অনুশীলন)"
                    disabled={analyzingRecitationId === ayah.number || (recordingId === ayah.number && !isStrictCorrection)}
                  >
                    {analyzingRecitationId === ayah.number && isStrictCorrection ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (recordingId === ayah.number && isStrictCorrection) ? (
                      <MicOff size={18} />
                    ) : (
                      <ShieldAlert size={18} />
                    )}
                  </button>

                  {aiMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleNoteListening(ayah.number); }}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#E6E2D8]
                        ${isListeningNote === ayah.number ? 'bg-amber-500 text-white animate-pulse border-transparent' : 'bg-white hover:bg-amber-50 text-amber-600'}
                      `}
                      title="Add Voice Note"
                    >
                      <StickyNote size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="arabic-text text-xl text-[#A49D8B] opacity-40">
                {surah.name}
              </div>
            </div>

            <div className="text-right mb-6">
              <p className={`
                arabic-text leading-[4.5rem] antialiased transition-all duration-700
                ${memoMode ? 'text-4xl text-transparent bg-clip-text bg-gradient-to-l from-[#E6E2D8] to-[#F4F1EA] select-none blur-sm' : 'text-4xl text-[#2C2C26]'}
              `}>
                {ayah.text}
              </p>
              {memoMode && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setMemoMode(false); }}
                  className="mt-2 text-[10px] font-bold text-[#7D8461] uppercase tracking-widest hover:underline"
                >
                  Click to peek
                </button>
              )}
            </div>

            <div className="space-y-6">
              {aiMode && (
                <div className="mt-4 pt-4 border-t border-[#E6E2D8]/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-[#A49D8B] uppercase tracking-widest flex items-center gap-2">
                      <StickyNote size={12} />
                      আমার নোট (My Note)
                    </label>
                    {isListeningNote === ayah.number && (
                      <span className="text-[8px] font-bold text-amber-500 uppercase animate-pulse">রেকর্ড হচ্ছে... (Listening...)</span>
                    )}
                  </div>
                  <textarea
                    value={verseNotes[ayah.number] || ''}
                    onChange={(e) => handleNoteChange(ayah.number, e.target.value)}
                    placeholder="এই আয়াত নিয়ে আপনার নোট বা ফিডব্যাক লিখুন (Voice icon ব্যবহার করে কথা বলে ইনপুট দিতে পারেন)..."
                    className="w-full bg-[#F9F7F2]/50 border border-[#E6E2D8] rounded-2xl p-4 text-sm text-[#5D5C56] focus:outline-none focus:ring-1 focus:ring-[#7D8461] focus:bg-white transition-all resize-none min-h-[80px]"
                  />
                </div>
              )}

              {!hideTranslation && (
                <p className="text-lg text-[#5D5C56] font-serif leading-relaxed italic opacity-90 border-l-2 border-[#E6E2D8] pl-6 py-2">
                  {ayah.translation}
                </p>
              )}

              <AnimatePresence>
                {tafsirData && tafsirData.id === ayah.number && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#F4F1EA]/30 border border-[#E6E2D8] rounded-3xl p-6 relative">
                      <div className="absolute -top-3 left-6 bg-[#7D8461] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                        <ScrollText size={10} />
                        <span>তাফসীর: {QuranService.BENGALI_TAFSIRS.find(t => t.id === selectedTafsir)?.name.split(' (')[0] || 'Tafsir'}</span>
                      </div>
                      <div className="flex justify-end mb-2">
                        <button onClick={() => setTafsirData(null)} className="text-[#A49D8B] hover:text-[#7D8461]">
                          <X size={16} />
                        </button>
                      </div>
                      <div 
                        className="text-sm text-[#5D5C56] leading-relaxed tafsir-content max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                        dangerouslySetInnerHTML={{ __html: tafsirData.text }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {analysisResult && analysisResult.id === ayah.number && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#F9F7F2] border border-[#E6E2D8] rounded-3xl p-6 relative">
                      <div className="absolute -top-3 left-6 bg-[#C89B7B] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        এআই বিশ্লেষণ (AI Analysis)
                      </div>
                      
                      <div className="flex justify-end mb-4">
                        <button onClick={() => setAnalysisResult(null)} className="text-[#A49D8B] hover:text-[#3E3D39]">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <section className="space-y-6">
                          {analysisResult.tajweedAndPronunciation && analysisResult.tajweedAndPronunciation !== "Not requested" && (
                            <div>
                              <h5 className="font-bold text-[#5A5A40] flex items-center space-x-2 mb-3 tracking-tighter">
                                <Volume2 size={16} className="text-[#7D8461]" />
                                <span>তাজবীদ ও উচ্চারণ (Tajweed)</span>
                              </h5>
                              <div className="bg-white/60 p-4 rounded-2xl border border-[#E6E2D8] text-[#5D5C56] leading-relaxed whitespace-pre-wrap">
                                {analysisResult.tajweedAndPronunciation}
                                <div className="mt-3 pt-3 border-t border-[#E6E2D8]/50">
                                  <Link to="/tajweed" className="text-[10px] font-bold text-[#7D8461] hover:underline flex items-center gap-1">
                                    <ExternalLink size={10} />
                                    <span>তাজবীদ গাইডে পূর্ণ নিয়ম দেখুন</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}

                          {analysisResult.grammarAndContext && analysisResult.grammarAndContext !== "Not requested" && (
                            <div>
                              <h5 className="font-bold text-[#5A5A40] flex items-center space-x-2 mb-3 tracking-tighter">
                                <BookOpen size={16} className="text-[#7D8461]" />
                                <span>ব্যাকরণ ও প্রেক্ষাপট (Grammar)</span>
                              </h5>
                              <div className="text-[#5D5C56] leading-relaxed bg-white/40 p-4 rounded-2xl border border-[#E6E2D8]/50 whitespace-pre-wrap">
                                {analysisResult.grammarAndContext}
                              </div>
                            </div>
                          )}
                        </section>
                        
                        <section className="space-y-6">
                          <div>
                            <h5 className="font-bold text-[#5A5A40] flex items-center space-x-2 mb-3 tracking-tighter">
                              <Sparkles size={16} className="text-[#C89B7B]" />
                              <span>সূক্ষ্ম অনুবাদ (Nuanced Translation)</span>
                            </h5>
                            <div className="bg-white/80 p-5 rounded-2xl border border-[#E6E2D8] shadow-sm">
                              <p className="text-[#C89B7B] font-medium leading-relaxed italic">"{analysisResult.nuancedTranslation}"</p>
                              {analysisResult.translationNuances && (
                                <div className="mt-4 pt-4 border-t border-[#E6E2D8] text-xs text-[#A49D8B] leading-relaxed whitespace-pre-wrap">
                                  <p className="font-bold text-[#5A5A40] uppercase tracking-tighter mb-2 text-[10px]">কেন এই অনুবাদটি উন্নত:</p>
                                  {analysisResult.translationNuances}
                                </div>
                              )}
                            </div>
                          </div>

                          {analysisResult.analysisSources && (
                            <div className="bg-white/30 p-4 rounded-2xl border border-dashed border-[#E6E2D8]">
                              <p className="text-[10px] font-bold text-[#A49D8B] uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Info size={12} />
                                সূত্রসমূহ (References)
                              </p>
                              <div className="text-[10px] text-[#5D5C56] leading-relaxed italic whitespace-pre-wrap">
                                {analysisResult.analysisSources}
                              </div>
                            </div>
                          )}
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
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-3xl p-6 relative">
                      <div className="absolute -top-3 left-6 bg-indigo-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                        <Languages size={10} />
                        তিলাওয়াত বিশ্লেষণ (Recitation Analysis)
                      </div>
                      
                      <div className="flex justify-end mb-4">
                        <button onClick={() => setRecitationGuide(null)} className="text-indigo-300 hover:text-indigo-600">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h6 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center mb-3">
                              <AlertCircle size={12} className="mr-2" />
                              উচ্চারণ সতর্কতা (Pronunciation Tips)
                            </h6>
                            <div className="space-y-2">
                              {recitationGuide.pronunciationFeedback?.map((m: any, idx: number) => (
                                <div key={idx} className="bg-white/60 p-3 rounded-xl border border-indigo-100 text-xs">
                                  <p className="font-bold text-indigo-900">{m.point}</p>
                                  <p className="text-indigo-700/70 mt-1">{m.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h6 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center mb-3">
                              <Volume2 size={12} className="mr-2" />
                              প্রযুক্ত তাজবীদ নিয়ম (Tajweed Rules)
                            </h6>
                            <div className="space-y-2">
                              {recitationGuide.tajweedRulesApplied?.map((rule: any, idx: number) => (
                                <div key={idx} className="bg-white/40 p-3 rounded-xl border border-indigo-50 text-xs">
                                  <p className="font-bold text-indigo-900">{rule.rule}</p>
                                  <p className="text-indigo-800/80 mt-1">{rule.application}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h6 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center mb-3">
                              <ShieldAlert size={12} className="mr-2" />
                              কঠিন স্থানসমূহ (Difficulty Areas)
                            </h6>
                            <div className="flex flex-wrap gap-3">
                              {recitationGuide.difficultAreas?.map((area: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm flex-1 min-w-[140px]">
                                  <span className="font-arabic text-lg text-indigo-900 block mb-1 text-right">{area.word}</span>
                                  <p className="text-[10px] text-indigo-600 leading-tight">{area.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h6 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center mb-3">
                              <BookOpen size={12} className="mr-2" />
                              অনুশীলন ড্রিল (Practice Drills)
                            </h6>
                            <ul className="space-y-2">
                              {recitationGuide.practiceDrills?.map((drill: string, idx: number) => (
                                <li key={idx} className="bg-white/40 p-2 rounded-lg text-xs text-indigo-800 border border-indigo-50 flex items-center gap-2">
                                  <div className="w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">{idx + 1}</div>
                                  {drill}
                                </li>
                              ))}
                            </ul>
                          </div>
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
                      <div className="absolute -top-3 left-6 bg-[#4A7D4A] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        তেলাওয়াত ফিডব্যাক (Recitation Feedback)
                      </div>
                      
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
                            <p className="text-xs text-[#6A8D6A] font-bold uppercase tracking-widest">সঠিকতা (Accuracy)</p>
                            <p className="text-[#2C3E2C] font-medium leading-tight">
                              {recitationResult.accuracyScore >= 90 ? 'চমৎকার তেলাওয়াত!' : 
                               recitationResult.accuracyScore >= 70 ? 'ভালো, আরও অনুশীলন করুন' : 'আরও অনেক উন্নতির প্রয়োজন'}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setRecitationResult(null)} className="text-[#8DA48D] hover:text-[#2C3E2C]">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="bg-white/60 rounded-2xl p-4 border border-[#D8E6D8] mb-6">
                        <p className="text-sm text-[#3E523E] leading-relaxed">
                          <Award size={14} className="inline mr-2 text-[#4A7D4A]" />
                          {recitationResult.overallFeedback}
                        </p>
                      </div>

                      {recitationResult.mistakes && recitationResult.mistakes.length > 0 ? (
                        <div className="space-y-3">
                          <h6 className="text-[10px] font-bold text-[#4A7D4A] uppercase tracking-widest flex items-center">
                            <AlertCircle size={12} className="mr-2" />
                            উন্নতির ক্ষেত্রসমূহ (Areas for Improvement)
                          </h6>
                          <div className="grid grid-cols-1 gap-2">
                            {recitationResult.mistakes.map((mistake: any, idx: number) => (
                              <div key={idx} className="flex items-start space-x-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                <span className="bg-white text-xs font-arabic px-2 py-1 rounded border border-red-100 text-[#2C2C26]">
                                  {mistake.word}
                                </span>
                                <div className="text-xs">
                                  <p className="font-bold text-red-700 capitalize">ভুলের ধরন: {mistake.type === 'pronunciation' ? 'উচ্চারণ' : mistake.type === 'tajweed' ? 'তাজবীদ' : 'বাদ পড়া'}</p>
                                  <p className="text-red-600/80 mt-0.5">{mistake.feedback}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : recitationResult.accuracyScore > 0 && (
                        <div className="flex items-center space-x-2 text-[#4A7D4A] p-4 bg-white/40 rounded-2xl border border-[#D8E6D8]">
                          <CheckCircle2 size={18} />
                          <p className="text-sm font-bold">নিখুঁত উচ্চারণ এবং তাজবীদ! সুবাহানাল্লাহ।</p>
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
