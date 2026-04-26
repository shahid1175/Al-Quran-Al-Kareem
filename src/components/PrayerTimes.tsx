import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Loader2, 
  Calendar as CalendarIcon, 
  Search, 
  Navigation,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerData {
  timings: Timings;
  date: {
    readable: string;
    hijri: {
      date: string;
      month: { en: string; ar: string };
      year: string;
      day: string;
    };
  };
  meta: {
    timezone: string;
    method: { name: string };
  };
}

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
}

export default function PrayerTimes() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [method, setMethod] = useState(2); // Default to ISNA or common method
  
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [fetchingMosques, setFetchingMosques] = useState(false);
  const [showMosques, setShowMosques] = useState(false);

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [weeklyTimings, setWeeklyTimings] = useState<any[]>([]);
  const [showWeekly, setShowWeekly] = useState(false);

  const calculationMethods = [
    { id: 1, name: "University of Islamic Sciences, Karachi" },
    { id: 2, name: "Islamic Society of North America (ISNA)" },
    { id: 3, name: "Muslim World League" },
    { id: 4, name: "Umm Al-Qura University, Makkah" },
    { id: 5, name: "Egyptian General Authority of Survey" },
    { id: 7, name: "Institute of Geophysics, University of Tehran" },
    { id: 8, name: "Gulf Region" },
    { id: 9, name: "Kuwait" },
    { id: 10, name: "Qatar" },
    { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
    { id: 12, name: "Union Organization islamic de France" },
    { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
    { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  ];

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchPrayerTimesByCoords(location.lat, location.lng, method);
      fetchWeeklyPrayerTimes(location.lat, location.lng, method);
      if (showMosques) fetchNearbyMosques(location.lat, location.lng);
    } else if (address) {
      fetchPrayerTimesByAddress(address, method);
      // For weekly times by address we'll need to update fetchPrayerTimesByAddress or have a separate one
    }
  }, [location, method, showMosques]);

  useEffect(() => {
    if (!data) return;
    
    const timer = setInterval(() => {
      calculateNextPrayer();
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const calculateNextPrayer = () => {
    if (!data) return;

    const now = new Date();
    const timings = data.timings;
    const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    let found = false;
    for (const name of prayerNames) {
      const [hours, minutes] = timings[name as keyof Timings].split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      if (prayerTime > now) {
        const diff = prayerTime.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        setNextPrayer({
          name,
          time: timings[name as keyof Timings],
          countdown: `${h}h ${m}m ${s}s`
        });
        found = true;
        break;
      }
    }

    if (!found) {
      // It's after Isha, next is Fajr tomorrow
      const [hours, minutes] = timings.Fajr.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setDate(prayerTime.getDate() + 1);
      prayerTime.setHours(hours, minutes, 0, 0);

      const diff = prayerTime.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setNextPrayer({
        name: 'Fajr (Tomorrow)',
        time: timings.Fajr,
        countdown: `${h}h ${m}m ${s}s`
      });
    }
  };

  const fetchWeeklyPrayerTimes = async (lat: number, lng: number, methodId: number) => {
    try {
      const response = await fetch(`https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=${methodId}`);
      const result = await response.json();
      if (result.code === 200) {
        // Just take the next 7 days from today
        const today = new Date().getDate();
        setWeeklyTimings(result.data.slice(today - 1, today + 6));
      }
    } catch (err) {
      console.error("Weekly fetch error:", err);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setError(null);
        },
        () => {
          setAddress("Mecca, Saudi Arabia");
        }
      );
    } else {
      setAddress("Mecca, Saudi Arabia");
    }
  };

  const fetchPrayerTimesByCoords = async (lat: number, lng: number, methodId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${methodId}`);
      const result = await response.json();
      if (result.code === 200) {
        setData(result.data);
      } else {
        setError("Failed to fetch prayer times.");
      }
    } catch (err) {
      setError("An error occurred while fetching prayer times.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerTimesByAddress = async (addr: string, methodId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(addr)}&method=${methodId}`);
      const result = await response.json();
      if (result.code === 200) {
        setData(result.data);
        setError(null);
        // Also fetch weekly calendar for address
        const calResponse = await fetch(`https://api.aladhan.com/v1/calendarByAddress?address=${encodeURIComponent(addr)}&method=${methodId}`);
        const calResult = await calResponse.json();
        if (calResult.code === 200) {
          const today = new Date().getDate();
          setWeeklyTimings(calResult.data.slice(today - 1, today + 6));
        }
      } else {
        setError("Could not find prayer times for this location.");
      }
    } catch (err) {
      setError("An error occurred while fetching prayer times.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyMosques = async (lat: number, lng: number) => {
    setFetchingMosques(true);
    try {
      // Overpass API query for mosques within 5km
      const query = `
        [out:json];
        node["amenity"="place_of_worship"]["religion"="muslim"](around:5000, ${lat}, ${lng});
        out body;
      `;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      const foundMosques = result.elements.map((el: any) => ({
        id: el.id,
        name: el.tags.name || "Masjid / Mosque",
        lat: el.lat,
        lon: el.lon,
        address: el.tags['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}` : undefined
      }));
      
      setMosques(foundMosques);
    } catch (err) {
      console.error("Error fetching mosques:", err);
    } finally {
      setFetchingMosques(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(null);
      setAddress(searchQuery);
      fetchPrayerTimesByAddress(searchQuery, method);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Loader2 className="animate-spin text-[#7D8461] mb-4" size={48} />
        <p className="text-[#A49D8B] font-serif italic">Calculating prayer times...</p>
      </div>
    );
  }

  const prayers = data ? [
    { name: 'Fajr', time: data.timings.Fajr, icon: '🌅' },
    { name: 'Sunrise', time: data.timings.Sunrise, icon: '☀️' },
    { name: 'Dhuhr', time: data.timings.Dhuhr, icon: '🌤️' },
    { name: 'Asr', time: data.timings.Asr, icon: '🌥️' },
    { name: 'Maghrib', time: data.timings.Maghrib, icon: '🌇' },
    { name: 'Isha', time: data.timings.Isha, icon: '🌙' },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <header className="mb-12 text-center text-[#5A5A40]">
        <div className="w-16 h-16 bg-[#7D8461] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <Clock size={32} />
        </div>
        <h2 className="text-4xl font-serif font-bold">Global Prayer Times</h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-[#A49D8B]">
          <MapPin size={16} />
          <span className="text-sm font-medium">{data?.meta.timezone || "Detecting..."}</span>
        </div>
      </header>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city (e.g. Istanbul, Tokyo, New York)..."
            className="w-full bg-white border border-[#E6E2D8] rounded-full py-4 pl-12 pr-6 text-[#3E3D39] focus:outline-none focus:ring-2 focus:ring-[#7D8461]/20 focus:border-[#7D8461] transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49D8B]" size={20} />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7D8461] text-white rounded-full px-6 py-2 text-sm font-bold hover:bg-[#5A5A40] transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-center">
        <div className="flex items-center gap-3 text-[#A49D8B] text-sm">
          <span>Calculation Method:</span>
          <select 
            value={method}
            onChange={(e) => setMethod(parseInt(e.target.value))}
            className="bg-white border border-[#E6E2D8] rounded-lg px-3 py-1 text-[#3E3D39] focus:outline-none focus:ring-1 focus:ring-[#7D8461]"
          >
            {calculationMethods.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={detectLocation}
            className="flex items-center gap-2 text-[#7D8461] text-sm font-bold underline hover:no-underline"
          >
            <Navigation size={14} />
            Use My Current Location
          </button>
          <button 
            onClick={() => {
              setSearchQuery("London");
              setAddress("London");
              fetchPrayerTimesByAddress("London", method);
            }}
            className="text-[#7D8461] text-sm font-bold hover:text-[#5A5A40]"
          >
            London Times
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-10 bg-red-50 rounded-[40px] border border-red-100 mb-12">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[40px] border border-[#E6E2D8] shadow-sm flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 text-[#7D8461] mb-6">
                <CalendarIcon size={24} />
                <h3 className="text-xl font-bold font-serif">Date & Location</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-serif text-[#3E3D39]">{data.date.readable}</p>
                  <div className="flex items-center gap-2 text-[#C89B7B]">
                    <span className="text-lg font-bold">{data.date.hijri.day} {data.date.hijri.month.en} {data.date.hijri.year}</span>
                    <span className="bg-[#F4F1EA] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-[#A49D8B]">Hijri</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F4F1EA]">
                  <p className="text-xs text-[#A49D8B] uppercase tracking-widest font-bold">Timezone</p>
                  <p className="text-sm text-[#5D5C56]">{data.meta.timezone}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#7D8461] p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between"
            >
              {nextPrayer ? (
                <div>
                  <h4 className="text-sm uppercase tracking-widest font-bold opacity-70 mb-2">Next Prayer: {nextPrayer.name}</h4>
                  <p className="text-4xl font-serif font-bold mb-1">{nextPrayer.time}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded font-bold uppercase">Time Left</span>
                    <p className="text-xl font-mono">{nextPrayer.countdown}</p>
                  </div>
                </div>
              ) : (
                <div>
                   <h4 className="text-sm uppercase tracking-widest font-bold opacity-70 mb-2">Calculation Method</h4>
                   <p className="text-xl font-serif leading-tight">{data.meta.method.name}</p>
                </div>
              )}
              <p className="text-xs opacity-60 mt-8 leading-relaxed italic border-t border-white/20 pt-4">
                "Indeed, prayer has been decreed upon the believers a decree of specified times." (Surah An-Nisa 4:103)
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {prayers.map((prayer, idx) => (
              <motion.div
                key={prayer.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white p-7 rounded-[40px] border border-[#E6E2D8] hover:border-[#7D8461] hover:shadow-xl hover:shadow-[#7D8461]/5 transition-all text-center relative overflow-hidden"
              >
                <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 relative z-10">
                   {prayer.icon}
                </div>
                <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-[#A49D8B] mb-2 relative z-10">{prayer.name}</h4>
                <p className="text-3xl font-serif font-bold text-[#3E3D39] group-hover:text-[#7D8461] transition-colors relative z-10">{prayer.time}</p>
                
                {/* Decorative background circle */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#7D8461]/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-bold text-[#5A5A40]">Weekly Schedule</h3>
              <button 
                onClick={() => setShowWeekly(!showWeekly)}
                className="text-sm font-bold text-[#7D8461] hover:underline"
              >
                {showWeekly ? "Hide Schedule" : "View Weekly Times"}
              </button>
            </div>

            <AnimatePresence>
              {showWeekly && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="overflow-x-auto pb-4"
                >
                  <table className="w-full text-left border-collapse bg-white rounded-3xl overflow-hidden border border-[#E6E2D8]">
                    <thead>
                      <tr className="bg-[#F4F1EA] text-[#A49D8B] text-xs uppercase tracking-widest">
                        <th className="p-4">Date</th>
                        <th className="p-4">Fajr</th>
                        <th className="p-4">Sunrise</th>
                        <th className="p-4">Dhuhr</th>
                        <th className="p-4">Asr</th>
                        <th className="p-4">Maghrib</th>
                        <th className="p-4">Isha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyTimings.map((day, idx) => (
                        <tr key={idx} className="border-t border-[#F4F1EA] hover:bg-[#F4F1EA]/30 transition-colors text-sm text-[#3E3D39]">
                          <td className="p-4 font-bold">{day.date.readable.split(' ').slice(0, 2).join(' ')}</td>
                          <td className="p-4">{day.timings.Fajr.split(' ')[0]}</td>
                          <td className="p-4">{day.timings.Sunrise.split(' ')[0]}</td>
                          <td className="p-4">{day.timings.Dhuhr.split(' ')[0]}</td>
                          <td className="p-4">{day.timings.Asr.split(' ')[0]}</td>
                          <td className="p-4">{day.timings.Maghrib.split(' ')[0]}</td>
                          <td className="p-4">{day.timings.Isha.split(' ')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#F4F1EA] rounded-[40px] p-8 border border-[#E6E2D8]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#5A5A40]">Nearby Mosques</h3>
                <p className="text-sm text-[#A49D8B]">Find places of worship within 5km of your location</p>
              </div>
              <button 
                onClick={() => {
                  if (!location) {
                    detectLocation();
                  }
                  setShowMosques(!showMosques);
                }}
                className="bg-[#7D8461] text-white rounded-full px-6 py-2 font-bold shadow-lg shadow-[#7D8461]/20 hover:bg-[#5A5A40] transition-all"
              >
                {showMosques ? "Hide Mosques" : "Find Nearby Mosques"}
              </button>
            </div>

            <AnimatePresence>
              {showMosques && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {fetchingMosques ? (
                    <div className="flex flex-col items-center py-10">
                      <Loader2 size={32} className="animate-spin text-[#7D8461] mb-2" />
                      <p className="text-sm text-[#A49D8B]">Scanning area for masjids...</p>
                    </div>
                  ) : mosques.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mosques.map((mosque) => (
                        <div key={mosque.id} className="bg-white p-5 rounded-3xl border border-[#E6E2D8] flex items-center justify-between group hover:border-[#7D8461] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F4F1EA] rounded-full flex items-center justify-center text-[#7D8461]">
                              <Navigation size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-[#3E3D39] line-clamp-1">{mosque.name}</h4>
                              {mosque.address && <p className="text-xs text-[#A49D8B] line-clamp-1">{mosque.address}</p>}
                            </div>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${mosque.lat},${mosque.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#A49D8B] hover:text-[#7D8461] transition-colors"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white/50 rounded-3xl border border-dashed border-[#E6E2D8]">
                      <p className="text-[#A49D8B]">No mosques found in your immediate area using GPS.</p>
                      <a 
                        href="https://www.google.com/maps/search/mosque+near+me" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#7D8461] text-sm font-bold underline mt-2 block"
                      >
                        Try searching on Google Maps
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

