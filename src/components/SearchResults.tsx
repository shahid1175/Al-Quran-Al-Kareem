import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuranService } from '../services/quranApi';
import { Search, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const RESULTS_PER_PAGE = 10;

export default function SearchResults() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setVisibleCount(RESULTS_PER_PAGE);
        return;
      }
      
      setLoading(true);
      try {
        const data = await QuranService.search(debouncedQuery);
        setResults(data?.matches || []);
        setVisibleCount(RESULTS_PER_PAGE);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + RESULTS_PER_PAGE, results.length));
  }, [results.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < results.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, results.length, loadMore]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  const displayedResults = results.slice(0, visibleCount);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 text-center text-[#5A5A40]">
        <h2 className="text-4xl font-serif font-bold mb-6">Global Search</h2>
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49D8B]" size={20} />
          <input 
            type="text" 
            placeholder="Search words in the Quran (English)" 
            className="w-full pl-12 pr-32 py-4 bg-white border border-[#E6E2D8] rounded-[30px] focus:outline-none focus:ring-1 focus:ring-[#7D8461] shadow-lg transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 bg-[#7D8461] text-white rounded-full font-bold hover:bg-[#5A5A40] transition-colors"
          >
            Search
          </button>
        </form>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-[#E6E2D8] shadow-sm">
          <Loader2 className="animate-spin text-[#7D8461] mb-4" size={32} />
          <p className="text-[#A49D8B] font-serif italic">Searching through the verses...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <p className="text-[10px] text-[#A49D8B] uppercase tracking-widest font-bold">
              Found {results.length} matches
            </p>
            <p className="text-[10px] text-[#7D8461] uppercase tracking-widest font-bold">
              Showing {displayedResults.length} of {results.length}
            </p>
          </div>
          
          <div className="space-y-6">
            {displayedResults.map((result, idx) => (
              <motion.div
                key={`${result.surah.number}-${result.numberInSurah}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 rounded-[40px] border border-[#E6E2D8] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4 border-b border-[#E6E2D8]/50 pb-4">
                  <div className="text-[#5A5A40] font-serif font-bold text-lg">
                    Surah {result.surah.number}: {result.surah.englishName}
                    <span className="ml-2 text-[#A49D8B] font-sans text-xs uppercase tracking-tighter">Verse {result.numberInSurah}</span>
                  </div>
                  <div className="arabic-text text-2xl text-[#A49D8B] opacity-60">{result.surah.name}</div>
                </div>
                
                <div className="text-right mb-6">
                  <p className="arabic-text text-3xl leading-relaxed text-[#2C2C26]">{result.text}</p>
                </div>
                
                <div className="bg-[#F9F7F2] p-6 rounded-2xl italic text-[#5D5C56] font-serif border-l-4 border-[#C89B7B]">
                  {result.text}
                </div>
              </motion.div>
            ))}
          </div>

          {visibleCount < results.length && (
            <div 
              ref={observerTarget}
              className="flex justify-center py-8"
            >
              <button 
                onClick={loadMore}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-[#E6E2D8] text-[#7D8461] rounded-full font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm"
              >
                <ChevronDown size={20} />
                Load More Results
              </button>
            </div>
          )}
        </div>
      ) : query && !loading ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-[#E6E2D8] text-[#A49D8B]">
          <p className="font-serif italic font-lg">No results found for "{query}". Try searching another word.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#C89B7B]/10 text-[#C89B7B] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} />
          </div>
          <p className="text-[#A49D8B] font-serif italic">Search for concepts like "Mercy", "Patience", or "Paradise"</p>
        </div>
      )}
    </div>
  );
}
