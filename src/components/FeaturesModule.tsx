import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Trophy, 
  Mic, 
  Volume2, 
  Search, 
  BookOpen, 
  Smartphone,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function FeaturesModule() {
  const sections = [
    {
      title: "Memorization",
      icon: <Brain size={20} className="text-[#7D8461]" />,
      features: ["Hide verses", "Mistake detection", "Verse peeking", "Mistake history", "Mistake frequency", "Mistake playback"]
    },
    {
      title: "Progress",
      icon: <TrendingUp size={20} className="text-[#C89B7B]" />,
      features: ["Streaks", "Session history", "Analytics", "Memorization progress", "Add External sessions"]
    },
    {
      title: "Challenges",
      icon: <Trophy size={20} className="text-[#5A5A40]" />,
      features: ["Goals", "Badges", "Notifications"]
    },
    {
      title: "Recitation",
      icon: <Mic size={20} className="text-[#A49D8B]" />,
      features: ["Following along", "Session audio", "Share audio", "Session pausing"]
    },
    {
      title: "Audio",
      icon: <Volume2 size={20} className="text-[#7D8461]" />,
      features: ["Audio follow along", "Various recitations", "Repeat functionality", "Custom range"]
    },
    {
      title: "Search",
      icon: <Search size={20} className="text-[#C89B7B]" />,
      features: ["Voice search", "Recent search history"]
    },
    {
      title: "Mushaf",
      icon: <BookOpen size={20} className="text-[#5A5A40]" />,
      features: ["Indopak / Madani", "Translation / Transliteration", "Tafaseer", "Bookmarks"]
    },
    {
      title: "Devices",
      icon: <Smartphone size={20} className="text-[#A49D8B]" />,
      features: ["Devices Support", "Cross device syncing", "Language support"]
    }
  ];

  return (
    <div className="w-full space-y-12">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-serif font-bold text-[#3E3D39] mb-4">Application Features</h3>
        <p className="text-[#A49D8B] max-w-lg mx-auto">
          Explore the comprehensive tools and features designed to enhance your spiritual journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#F9F7F2] p-8 rounded-[40px] border border-[#E6E2D8] hover:border-[#7D8461] transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h4 className="font-serif font-bold text-xl text-[#3E3D39]">{section.title}</h4>
              </div>
              {idx < 2 && (
                <span className="text-[8px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Live</span>
              )}
            </div>

            <ul className="space-y-4">
              {section.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-center gap-3 group/item">
                  <div className="w-5 h-5 rounded-full border border-[#E6E2D8] flex items-center justify-center group-hover/item:border-[#7D8461] transition-colors">
                    <CheckCircle2 size={12} className="text-[#E6E2D8] group-hover/item:text-[#7D8461]" />
                  </div>
                  <span className="text-sm text-[#5D5C56] font-medium group-hover/item:text-[#3E3D39] transition-colors">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-16 p-10 bg-[#7D8461] text-white rounded-[60px] text-center shadow-xl"
      >
        <div className="flex justify-center mb-6 text-white/30">
          <Clock size={48} />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-4">Continuous Improvement</h3>
        <p className="text-white/80 max-w-2xl mx-auto leading-relaxed">
          We are committed to building the most helpful ecosystem for Quran memorization and recitation. 
          New features are released regularly based on user feedback and spiritual needs.
        </p>
      </motion.div>
    </div>
  );
}
