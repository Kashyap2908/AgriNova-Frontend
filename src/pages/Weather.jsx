import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FarmContext } from '../context/farm-context';
import api, { geocodeLocation } from '../services/api';
import { 
  CloudRain, Sun, Cloud, CloudLightning, CloudSnow, Wind, Droplets, 
  Thermometer, MapPin, Calendar, Sunrise, Sunset, Navigation, AlertCircle
} from 'lucide-react';

const Weather = () => {
  const { selectedFarm } = useContext(FarmContext);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeDay, setActiveDay] = useState(0);

  // Drag-to-scroll logic for hourly container
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const getWeatherIcon = (code, className = "w-16 h-16") => {
    if (code === 0) return <Sun className={`${className} text-amber-400 drop-shadow-md`} />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-slate-300 drop-shadow-md`} />;
    if (code >= 45 && code <= 48) return <Cloud className={`${className} text-slate-400 opacity-80`} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={`${className} text-blue-400 drop-shadow-md`} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-sky-200 drop-shadow-md`} />;
    if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-indigo-400 drop-shadow-md`} />;
    return <Sun className={`${className} text-amber-400 drop-shadow-md`} />;
  };

  const getWeatherDescription = (code) => {
    const codes = {
      0: 'Clear sky',
      1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm, slight hail', 99: 'Thunderstorm, heavy hail'
    };
    return codes[code] || 'Unknown';
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedFarm) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let lat = selectedFarm.latitude;
        let lon = selectedFarm.longitude;

        if (!lat || !lon) {
          const coords = await geocodeLocation({
            village: selectedFarm.village,
            taluka: selectedFarm.taluka,
            district: selectedFarm.district,
            state: selectedFarm.state
          });
          
          if (coords) {
            lat = coords.lat;
            lon = coords.lon;
          } else {
            throw new Error("Could not determine precise farm location. Please update your farm address.");
          }
        }

        const url = `/weather/current/?farm_id=${selectedFarm.id}`;
        
        const response = await api.get(url);
        const json = response.data;
        if (!json.success) throw new Error(json.error || "Failed to fetch weather data from satellite");
        
        const bData = json.data;
        
        // Re-construct the format expected by the UI arrays
        const hourlyTimes = [];
        const hourlyTemps = [];
        const hourlyPrecip = [];
        const hourlyCodes = [];
        const hourlyWind = [];
        
        const allHourly = [
          ...(bData.today_hourly_forecast || []), 
          ...(bData.weekly_hourly_forecast || [])
        ];
        
        allHourly.forEach(h => {
          hourlyTimes.push(h.time);
          hourlyTemps.push(h.temperature);
          hourlyPrecip.push(h.precipitation_probability || 0);
          hourlyCodes.push(h.weather_code);
          hourlyWind.push(h.wind_speed || 0);
        });

        const dailyTimes = [];
        const dailyMax = [];
        const dailyMin = [];
        const dailySunrise = [];
        const dailySunset = [];
        const dailyPrecip = [];
        const dailyUv = [];
        const dailyCodes = [];

        // Exclude the first day (Yesterday) to align with UI expectations of starting from Today
        const validDaily = (bData.daily_forecast || []).slice(1);

        validDaily.forEach(d => {
          // Append T00:00:00 to force local timezone parsing and avoid date shifting
          dailyTimes.push(d.date.includes('T') ? d.date : d.date + 'T00:00:00');
          dailyMax.push(d.max_temp);
          dailyMin.push(d.min_temp);
          dailySunrise.push(d.sunrise);
          dailySunset.push(d.sunset);
          dailyPrecip.push(d.rainfall);
          dailyUv.push(d.uv_index_max || 0);
          dailyCodes.push(d.weather_code);
        });

        const data = {
          current: {
            temperature_2m: bData.current_weather.temperature,
            apparent_temperature: bData.current_weather.feels_like,
            relative_humidity_2m: bData.current_weather.humidity,
            wind_speed_10m: bData.current_weather.wind_speed,
            precipitation: bData.current_weather.rainfall,
            weather_code: bData.current_weather.weather_code,
            time: bData.current_weather.timestamp,
          },
          yesterday_hourly: bData.yesterday_hourly_forecast || [],
          hourly: {
            time: hourlyTimes,
            temperature_2m: hourlyTemps,
            precipitation_probability: hourlyPrecip,
            weather_code: hourlyCodes,
            wind_speed_10m: hourlyWind,
          },
          daily: {
            time: dailyTimes,
            temperature_2m_max: dailyMax,
            temperature_2m_min: dailyMin,
            sunrise: dailySunrise,
            sunset: dailySunset,
            precipitation_sum: dailyPrecip,
            uv_index_max: dailyUv,
            weather_code: dailyCodes,
          }
        };

        setWeatherData(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedFarm]);

  if (!selectedFarm) {
    return (
      <div className="py-20 h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="saas-card max-w-lg p-10 text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">No Farm Selected</h2>
          <p className="text-slate-500 mb-6">Select a farm from the dashboard to view localized weather metrics.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 h-full flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <Sun className="w-16 h-16 text-amber-400 animate-spin-slow relative z-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connecting to Satellite...</h3>
        <p className="text-slate-500 font-medium">Fetching hyper-local atmospheric data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center h-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card p-12 max-w-xl text-center border-rose-200 dark:border-rose-900/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-rose-50 dark:bg-rose-900/10 z-0"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/10">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Weather Unavailable</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!weatherData) return null;

  const current = weatherData.current;
  const daily = weatherData.daily;
  const hourly = weatherData.hourly;
  const isNight = current.weather_code === 0 && (new Date().getHours() < 6 || new Date().getHours() > 19);

  // Find index for current hour in hourly data
  const currentHourTime = new Date();
  currentHourTime.setMinutes(0, 0, 0);
  const currentHourIndex = hourly.time.findIndex(t => new Date(t) >= currentHourTime);
  const next24Hours = activeDay === 0 
    ? (currentHourIndex !== -1 ? currentHourIndex : 0) 
    : activeDay * 24;

  return (
    <div className="py-8 max-w-[1400px] mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Atmosphere
          </h1>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium text-lg">
            <MapPin className="w-5 h-5 text-blue-500" /> {selectedFarm.name}
            <span className="text-slate-300 dark:text-slate-600 px-2">•</span> 
            {selectedFarm.village}, {selectedFarm.district}
          </p>
        </div>
        <div className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Live Satellite Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Main Current Weather Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-8 w-full rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between ${
            isNight 
              ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-black shadow-indigo-500/20'
              : 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-blue-500/30'
          }`}
        >
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative z-10 mb-12 flex justify-between items-start">
            <div>
              <p className="text-white/80 font-bold uppercase tracking-widest text-sm mb-2 drop-shadow-md">Currently</p>
              <h2 className="text-[6rem] leading-none font-black tracking-tighter mb-4 drop-shadow-lg">
                {Math.round(current.temperature_2m)}°
              </h2>
              <div className="flex items-center gap-4">
                {getWeatherIcon(current.weather_code, "w-12 h-12")}
                <p className="text-3xl font-bold text-white drop-shadow-md capitalize">
                  {getWeatherDescription(current.weather_code)}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end text-white/90 font-medium space-y-1">
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p>Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Thermometer className="w-4 h-4 text-rose-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Feels Like</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(current.apparent_temperature)}°</p>
            </div>
            
            <div className="flex flex-col items-center sm:items-start border-l border-white/10 pl-0 sm:pl-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Droplets className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Humidity</span>
              </div>
              <p className="text-2xl font-bold">{current.relative_humidity_2m}%</p>
            </div>
            
            <div className="flex flex-col items-center sm:items-start border-l-0 sm:border-l border-white/10 pl-0 sm:pl-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Wind className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Wind</span>
              </div>
              <p className="text-2xl font-bold">{current.wind_speed_10m} km/h</p>
            </div>

            <div className="flex flex-col items-center sm:items-start border-l border-white/10 pl-0 sm:pl-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <CloudRain className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Precip</span>
              </div>
              <p className="text-2xl font-bold">{current.precipitation} mm</p>
            </div>
          </div>
        </motion.div>

        {/* Side Panel: Sunrise/Sunset & UV */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="saas-card p-8 flex-1 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 opacity-5 dark:opacity-10">
              <Sun className="w-48 h-48" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> Solar Cycle
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shadow-inner">
                  <Sunrise className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Sunrise</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {formatTime(daily.sunrise[activeDay >= 0 ? activeDay : 0])}
                  </p>
                </div>
              </div>
              
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 ml-7"></div>
              
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shadow-inner">
                  <Sunset className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Sunset</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {formatTime(daily.sunset[activeDay >= 0 ? activeDay : 0])}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="saas-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-900/30 flex items-center justify-between"
          >
            <div>
              <p className="text-amber-800 dark:text-amber-400 font-bold mb-1">UV Index Max</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-300">
                {daily.uv_index_max[activeDay >= 0 ? activeDay : 0]}
              </p>
            </div>
            <Sun className="w-12 h-12 text-amber-400/50" />
          </motion.div>
        </div>
      </div>

      {/* 24-Hour Forecast Strip */}
      <motion.div 
        layout
        className="mb-10"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" /> Hourly Forecast ({activeDay === -1 ? 'Yesterday' : activeDay === 0 ? 'Next 24h' : new Date(daily.time[activeDay]).toLocaleDateString('en-US', { weekday: 'long' })})
        </h3>
        
        <div 
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 no-scrollbar cursor-grab active:cursor-grabbing"
        >
          {activeDay === -1 ? (
            (weatherData.yesterday_hourly || []).map((h, i) => {
              const timeObj = new Date(h.time);
              const timeStr = timeObj.toLocaleTimeString([], { hour: 'numeric' });
              return (
                <motion.div 
                  key={`yest-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex-shrink-0 w-24 p-4 rounded-[1.5rem] flex flex-col items-center justify-between text-center border transition-all select-none pointer-events-none sm:pointer-events-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <span className="text-xs font-bold mb-3 text-slate-400">
                    {timeStr}
                  </span>
                  
                  <div className="scale-75 my-1">
                    {getWeatherIcon(h.weather_code)}
                  </div>
                  
                  <span className="text-xl font-black mt-2">
                    {Math.round(h.temperature)}°
                  </span>
                  
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-500">
                    <Droplets className="w-3 h-3" />
                    {h.precipitation_probability || 0}%
                  </div>
                </motion.div>
              );
            })
          ) : (
            Array.from({ length: 24 }).map((_, i) => {
              const idx = next24Hours + i;
              if (idx >= hourly.time.length) return null;
              
              const timeObj = new Date(hourly.time[idx]);
              const isNow = activeDay === 0 && i === 0;
              const timeStr = isNow ? 'Now' : timeObj.toLocaleTimeString([], { hour: 'numeric' });
              
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 + 0.2 }}
                  className={`flex-shrink-0 w-24 p-4 rounded-[1.5rem] flex flex-col items-center justify-between text-center border transition-all select-none pointer-events-none sm:pointer-events-auto ${
                    isNow 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-bold mb-3 ${isNow ? 'text-primary-100' : 'text-slate-400'}`}>
                    {timeStr}
                  </span>
                  
                  <div className="scale-75 my-1">
                    {getWeatherIcon(hourly.weather_code[idx])}
                  </div>
                  
                  <span className="text-xl font-black mt-2">
                    {Math.round(hourly.temperature_2m[idx])}°
                  </span>
                  
                  <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${isNow ? 'text-primary-200' : 'text-blue-500'}`}>
                    <Droplets className="w-3 h-3" />
                    {hourly.precipitation_probability[idx]}%
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* 7-Day Forecast / Outlook */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" /> Outlook
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {/* Yesterday Card */}
        {(() => {
          const yestArr = weatherData.yesterday_hourly || [];
          const yestMax = yestArr.length ? Math.max(...yestArr.map(h => h.temperature)) : null;
          const yestMin = yestArr.length ? Math.min(...yestArr.map(h => h.temperature)) : null;
          const yestCode = yestArr.length ? (yestArr[Math.floor(yestArr.length / 2)]?.weather_code ?? yestArr[0]?.weather_code ?? 0) : 0;
          const yestDate = yestArr.length && yestArr[0].time ? new Date(yestArr[0].time) : new Date(Date.now() - 86400000);
          return (
            <motion.div 
              key="yesterday-card"
              onClick={() => setActiveDay(-1)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`saas-card p-5 cursor-pointer flex flex-col items-center justify-between text-center min-h-[220px] transition-all duration-300 ${
                activeDay === -1 
                  ? 'border-primary bg-primary/[0.05] shadow-primary/20 shadow-2xl ring-2 ring-primary/50' 
                  : 'hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="mb-4">
                <p className="text-sm font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Yesterday
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {yestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              
              <div className="flex-1 flex items-center justify-center my-2 scale-[1.15]">
                {getWeatherIcon(yestCode)}
              </div>
              
              <div className="mt-4 w-full">
                <div className="flex items-center justify-center gap-3 text-base mb-2">
                  <span className="font-black text-slate-900 dark:text-white">
                    {yestMax !== null ? `${Math.round(yestMax)}°` : '--'}
                  </span>
                  <span className="font-bold text-slate-400">
                    {yestMin !== null ? `${Math.round(yestMin)}°` : '--'}
                  </span>
                </div>
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-2"></div>
                <p className="text-[11px] font-bold text-slate-500 line-clamp-2 leading-tight">
                  {getWeatherDescription(yestCode)}
                </p>
              </div>
            </motion.div>
          );
        })()}

        {daily.time.map((dateStr, index) => {
          const date = new Date(dateStr);
          const isToday = index === 0;
          const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
          
          return (
            <motion.div 
              key={index}
              onClick={() => setActiveDay(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`saas-card p-5 cursor-pointer flex flex-col items-center justify-between text-center min-h-[220px] transition-all duration-300 ${
                index === activeDay 
                  ? 'border-primary bg-primary/[0.05] shadow-primary/20 shadow-2xl ring-2 ring-primary/50' 
                  : 'hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="mb-4">
                <p className={`text-sm font-extrabold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                  {dayName}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              
              <div className="flex-1 flex items-center justify-center my-2 scale-[1.15]">
                {getWeatherIcon(daily.weather_code[index])}
              </div>
              
              <div className="mt-4 w-full">
                <div className="flex items-center justify-center gap-3 text-base mb-2">
                  <span className="font-black text-slate-900 dark:text-white">{Math.round(daily.temperature_2m_max[index])}°</span>
                  <span className="font-bold text-slate-400">{Math.round(daily.temperature_2m_min[index])}°</span>
                </div>
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-2"></div>
                <p className="text-[11px] font-bold text-slate-500 line-clamp-2 leading-tight">
                  {getWeatherDescription(daily.weather_code[index])}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};

export default Weather;
