import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Book, GraduationCap, Brain, Search, Menu, X, Settings as SettingsIcon, Clock, Sparkles, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SurahList from './components/SurahList';
import QuranReader from './components/QuranReader';
import TajweedGuide from './components/TajweedGuide';
import MemorizationTool from './components/MemorizationTool';
import SearchResults from './components/SearchResults';
import Settings from './components/Settings';
import PrayerTimes from './components/PrayerTimes';
import IslamicTools from './components/IslamicTools';
import IslamicCalendar from './components/IslamicCalendar';
import Home from './components/Home';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-[#FDFCF9] text-[#3E3D39] font-sans selection:bg-[#7D8461]/20">
        {/* Mobile menu button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md md:hidden border border-[#E6E2D8]"
        >
          <Menu size={20} />
        </button>

        {/* Sidebar Navigation - Natural Tones Rail Design */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#F4F1EA] border-r border-[#E6E2D8] transform transition-transform duration-300 ease-in-out
          md:relative md:w-20 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col items-center h-full py-8">
            <div className="mb-10 block">
               <div className="w-12 h-12 bg-[#7D8461] rounded-full flex items-center justify-center text-white shadow-md">
                 <Link to="/"><Book size={24} /></Link>
               </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-6 overflow-y-auto w-full items-center custom-scrollbar">
              <NavLink to="/" icon={<Sparkles size={22} />} label="Home" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/reading" icon={<Book size={22} />} label="Quran" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/tajweed" icon={<GraduationCap size={22} />} label="Tajweed" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/memorize" icon={<Brain size={22} />} label="Hifz" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/calendar" icon={<CalendarDays size={22} />} label="Calendar" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/prayer-times" icon={<Clock size={22} />} label="Prayers" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/tools" icon={<Sparkles size={22} />} label="Tools" onClick={() => setIsSidebarOpen(false)} />
              <NavLink to="/search" icon={<Search size={22} />} label="Search" onClick={() => setIsSidebarOpen(false)} />
            </nav>

            <div className="mt-auto">
              <NavLink to="/settings" icon={<SettingsIcon size={22} />} label="Settings" onClick={() => setIsSidebarOpen(false)} />
            </div>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 md:hidden text-[#7D8461]"
          >
            <X size={24} />
          </button>
        </aside>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-6 md:p-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reading" element={<SurahList />} />
            <Route path="/surah/:number" element={<QuranReader />} />
            <Route path="/tajweed" element={<TajweedGuide />} />
            <Route path="/memorize" element={<MemorizationTool />} />
            <Route path="/calendar" element={<div className="max-w-4xl mx-auto"><div className="mb-12 text-center text-[#5A5A40]"><h2 className="text-4xl font-serif font-bold">Islamic Calendar</h2><p className="text-[#A49D8B] mt-2">Hijri dates and important events</p></div><IslamicCalendar /></div>} />
            <Route path="/prayer-times" element={<PrayerTimes />} />
            <Route path="/tools" element={<IslamicTools />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      title={label}
      className={`
        relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
        ${isActive ? 'bg-white shadow-sm text-[#7D8461] border border-[#E6E2D8]' : 'text-[#3E3D39]/40 hover:text-[#7D8461]'}
      `}
    >
      {icon}
      {/* Tooltip/Label only visible on mobile or as hover hint on desktop */}
      <span className="md:hidden ml-3 fixed left-20 bg-white px-3 py-1 rounded-md shadow-md border border-[#E6E2D8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </span>
    </Link>
  );
}
