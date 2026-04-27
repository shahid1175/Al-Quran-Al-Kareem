import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

interface HijriDate {
  date: string;
  format: string;
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    expanded: string;
  };
  holidays: string[];
}

interface CalendarDay {
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
    };
    hijri: HijriDate;
  };
}

export default function IslamicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTabular, setIsTabular] = useState(true);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthData();
  }, [currentDate, isTabular]);

  const fetchMonthData = async () => {
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    try {
      // Adjustment -1 or 1 can be used for tabular variations, but method=2 is a standard for many calculations.
      // Aladhan API uses tabular by default for many scenarios.
      const response = await fetch(`https://api.aladhan.com/v1/gCalendar/${year}/${month}?latitude=21.4225&longitude=39.8262&method=2${isTabular ? '&adjustment=0' : ''}`);
      const result = await response.json();
      if (result.code === 200) {
        setCalendarData(result.data);
      }
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Group days by week (Sunday to Saturday)
  const renderCalendar = () => {
    if (!calendarData.length) return null;

    const firstDay = parseInt(calendarData[0].date.gregorian.weekday.en === 'Sunday' ? '0' : 
                     calendarData[0].date.gregorian.weekday.en === 'Monday' ? '1' :
                     calendarData[0].date.gregorian.weekday.en === 'Tuesday' ? '2' :
                     calendarData[0].date.gregorian.weekday.en === 'Wednesday' ? '3' :
                     calendarData[0].date.gregorian.weekday.en === 'Thursday' ? '4' :
                     calendarData[0].date.gregorian.weekday.en === 'Friday' ? '5' : '6');

    const blanks = Array(firstDay).fill(null);
    const days = [...blanks, ...calendarData];
    const rows: (CalendarDay | null)[][] = [];
    let cells: (CalendarDay | null)[] = [];

    days.forEach((day, i) => {
      if (i % 7 !== 0 || i === 0) {
        cells.push(day);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(day);
      }
      if (i === days.length - 1) {
        rows.push(cells);
      }
    });

    const allHolidays = calendarData
      .filter(day => day.date.hijri.holidays.length > 0)
      .map(day => ({
        name: day.date.hijri.holidays[0],
        date: day.date.gregorian.date,
        hijri: `${day.date.hijri.day} ${day.date.hijri.month.en}`
      }));

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 mb-4 border-b border-[#E6E2D8] pb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-[#A49D8B]">{d}</div>
          ))}
        </div>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-7 gap-2">
              {row.map((day, j) => {
                if (!day) return <div key={`blank-${j}`} className="h-20" />;
                const isToday = new Date().toDateString() === new Date(parseInt(day.date.timestamp) * 1000).toDateString();
                const hasHoliday = day.date.hijri.holidays.length > 0;

                return (
                  <motion.div
                    key={day.date.timestamp}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      h-20 p-2 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden
                      ${isToday ? 'bg-[#7D8461] border-[#7D8461] shadow-md' : 'bg-white border-[#E6E2D8] hover:border-[#7D8461]'}
                      ${hasHoliday ? 'ring-1 ring-[#C89B7B]' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-[#3E3D39]'}`}>
                        {day.date.gregorian.day}
                      </span>
                      <span className={`text-[10px] font-serif ${isToday ? 'text-white/70' : 'text-[#C89B7B]'}`}>
                        {day.date.hijri.day}
                      </span>
                    </div>
                    
                    <div className="mt-auto">
                       {hasHoliday && (
                         <div className={`text-[8px] leading-tight font-bold uppercase ${isToday ? 'text-white/80' : 'text-[#C89B7B]'} truncate`}>
                           {day.date.hijri.holidays[0]}
                         </div>
                       )}
                       <div className={`text-[8px] uppercase tracking-tighter opacity-40 ${isToday ? 'text-white' : 'text-[#A49D8B]'}`}>
                         {day.date.hijri.month.en}
                       </div>
                    </div>

                    {isToday && (
                      <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-white/10 rounded-full blur-md" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {allHolidays.length > 0 && (
          <div className="mt-8">
            <h5 className="text-sm font-bold text-[#3E3D39] uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C89B7B]" />
              গুরুত্বপূর্ণ দিনসমূহ (Islamic Events)
            </h5>
            <div className="space-y-3">
              {allHolidays.map((holiday, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#F9F7F2] rounded-2xl border border-[#E6E2D8]">
                  <div>
                    <p className="font-bold text-[#5A5A40] text-sm">{holiday.name}</p>
                    <p className="text-[10px] text-[#A49D8B] uppercase font-bold tracking-widest">{holiday.hijri}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#7D8461]">{holiday.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentHijriMonth = calendarData.length > 0 ? calendarData[Math.floor(calendarData.length/2)].date.hijri : null;

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="text-center md:text-left">
          <h4 className="text-3xl font-serif font-bold text-[#3E3D39]">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h4>
          {currentHijriMonth && (
            <p className="text-[#C89B7B] font-bold text-lg mt-1">
              {currentHijriMonth.month.en} / {currentHijriMonth.month.ar} {currentHijriMonth.year} AH
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4 bg-[#F4F1EA] px-4 py-2 rounded-full border border-[#E6E2D8]">
            <input 
              type="checkbox" 
              id="tabular-toggle"
              checked={isTabular}
              onChange={() => setIsTabular(!isTabular)}
              className="w-4 h-4 accent-[#7D8461]"
            />
            <label htmlFor="tabular-toggle" className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider cursor-pointer">
              Enable Hijri Tabular Calendar
            </label>
          </div>
          <button 
            onClick={goToToday}
            className="px-4 py-2 bg-white border border-[#E6E2D8] rounded-full text-xs font-bold text-[#7D8461] hover:bg-[#F9F7F2] transition-colors shadow-sm"
          >
            Today
          </button>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-white border border-[#E6E2D8] rounded-full text-[#A49D8B] hover:text-[#7D8461] transition-colors shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 bg-white border border-[#E6E2D8] rounded-full text-[#A49D8B] hover:text-[#7D8461] transition-colors shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#7D8461] mb-2" size={32} />
          <p className="text-xs text-[#A49D8B] uppercase tracking-widest font-bold">Syncing Moons...</p>
        </div>
      ) : (
        renderCalendar()
      )}

      <div className="mt-10 p-6 bg-[#F9F7F2] rounded-[30px] border border-[#E6E2D8] flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#7D8461] shadow-sm">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h5 className="font-bold text-[#5A5A40]">Hijri Tabular Calendar</h5>
          <p className="text-xs text-[#A49D8B]">Hijri dates are calculated using the tabular system. For exact dates of religious events, please refer to local moon sightings.</p>
        </div>
      </div>
    </div>
  );
}
