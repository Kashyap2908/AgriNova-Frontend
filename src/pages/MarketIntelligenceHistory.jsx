import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FarmContext } from '../context/farm-context';
import { fetchHistoricalMarketDataApi } from '../services/api';
import {
  ArrowLeft, Search, Filter, Download, LineChart, TrendingUp, TrendingDown,
  Activity, Store, IndianRupee, MapPin, Target, Calendar, BarChart2, Lightbulb, History
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HistoricalMarketExplorer = () => {
  const { selectedFarm } = useContext(FarmContext);
  
  const [filters, setFilters] = useState({
    crop: 'Mungbean',
    state: selectedFarm?.state || 'Gujarat',
    district: selectedFarm?.district || 'Navsari',
    viewMode: 'Monthly'
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Section 3 toggle
  const [chartMode, setChartMode] = useState('Price'); // Price, Arrival, Both
  // Section 4 sorting/pagination
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  const handleFetch = async () => {
    if (!filters.crop || !filters.state) return;
    setLoading(true);
    setError(null);
    
    let days = 30;
    if (filters.viewMode === 'Weekly') days = 90;
    if (filters.viewMode === 'Monthly') days = 365;
    if (filters.viewMode === 'Yearly') days = 1825; // 5 years

    try {
      const response = await fetchHistoricalMarketDataApi(filters.crop, filters.state, filters.district, days);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.state) {
      handleFetch();
    }
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // --- AGGREGATION LOGIC ---
  const getAggregatedData = () => {
    if (!data?.raw_records) return [];
    const grouped = {};
    
    data.raw_records.forEach(r => {
      let key;
      const d = new Date(r.date);
      if (filters.viewMode === 'Yearly') {
         key = d.getFullYear().toString();
      } else if (filters.viewMode === 'Monthly') {
         const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
         key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      } else if (filters.viewMode === 'Weekly') {
         const start = new Date(d.getFullYear(), 0, 1);
         const week = Math.ceil((((d - start) / 86400000) + start.getDay() + 1) / 7);
         key = `Week ${week}, ${d.getFullYear()}`;
      } else {
         key = r.date; // Daily
      }
      
      if (!grouped[key]) {
        grouped[key] = { period: key, originalDate: r.date, prices: [], arrivals: [], min_prices: [], max_prices: [] };
      }
      if (r.modal_price > 0) grouped[key].prices.push(r.modal_price);
      if (r.arrival_quantity > 0) grouped[key].arrivals.push(r.arrival_quantity);
      if (r.minimum_price > 0) grouped[key].min_prices.push(r.minimum_price);
      if (r.maximum_price > 0) grouped[key].max_prices.push(r.maximum_price);
    });
    
    const result = Object.values(grouped).map(g => {
      const avgPrice = g.prices.length ? (g.prices.reduce((a,b)=>a+b,0) / g.prices.length) : 0;
      const avgArr = g.arrivals.length ? (g.arrivals.reduce((a,b)=>a+b,0) / g.arrivals.length) : 0;
      const minP = g.min_prices.length ? Math.min(...g.min_prices) : 0;
      const maxP = g.max_prices.length ? Math.max(...g.max_prices) : 0;
      return {
        period: g.period,
        originalDate: g.originalDate, // for sorting
        modal_price: avgPrice.toFixed(2),
        arrival_quantity: avgArr.toFixed(2),
        minimum_price: minP.toFixed(2),
        maximum_price: maxP.toFixed(2)
      };
    });
    
    // Sort chronological ascending for chart
    return result.sort((a,b) => new Date(a.originalDate) - new Date(b.originalDate));
  };

  const aggregatedRecords = getAggregatedData();

  // --- CHART LOGIC ---
  const getChartData = () => {
    if (!aggregatedRecords.length) return { labels: [], datasets: [] };
    const labels = aggregatedRecords.map(r => r.period);
    const datasets = [];

    if (chartMode === 'Price' || chartMode === 'Both') {
      datasets.push({
        label: `Avg Modal Price (₹)`,
        data: aggregatedRecords.map(r => r.modal_price),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        yAxisID: 'y',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
      });
    }

    if (chartMode === 'Arrival' || chartMode === 'Both') {
      datasets.push({
        label: `Avg Arrival Quantity`,
        data: aggregatedRecords.map(r => r.arrival_quantity),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        yAxisID: chartMode === 'Both' ? 'y1' : 'y',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
      });
    }

    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { type: 'linear', display: true, position: 'left' },
      y1: { 
        type: 'linear', display: chartMode === 'Both', position: 'right',
        grid: { drawOnChartArea: false }
      }
    }
  };

  // --- TABLE LOGIC ---
  let sortedRecords = [...aggregatedRecords].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  // Default to newest first in table
  if (sortConfig.key === 'date') sortedRecords.reverse();

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 print:p-0 print:m-0 print:max-w-full" id="historical-explorer">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/market-intelligence" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <History className="w-7 h-7" />
            </div>
            Historical Market Explorer
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            Explore historical agricultural market prices, arrivals, and trends from AGMARKNET.
          </p>
        </div>
        <div className="print:hidden">
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:opacity-90">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* SECTION 1: Filters */}
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md print:hidden">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Historical Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Commodity</label>
            <select name="crop" value={filters.crop} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <option value="Mungbean">Mungbean</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Tomato">Tomato</option>
              <option value="Onion">Onion</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
            <select name="state" value={filters.state} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Punjab">Punjab</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">District</label>
            <select name="district" value={filters.district} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <option value="all">All Districts</option>
              <option value="Navsari">Navsari</option>
              <option value="Surat">Surat</option>
              <option value="Pune">Pune</option>
              <option value="Nashik">Nashik</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Report Type</label>
            <select name="viewMode" value={filters.viewMode} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleFetch} className="w-full bg-primary text-white font-bold rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
              <Search className="w-4 h-4" /> Analyze
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching deep historical records from AGMARKNET...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-medium text-center border border-rose-100 dark:border-rose-800">
          {error}
        </div>
      ) : data ? (
        <div className="space-y-8">
          
          {/* SECTION 8: AI Observations */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 shadow-sm print:break-inside-avoid">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-500" /> AI Observations
            </h3>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {data.ai_observations}
            </p>
          </div>

          {/* SECTION 2: Market Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            {[
              { label: 'Average Price', value: `₹${data?.summary?.average_price || 0}`, icon: Target },
              { label: 'Highest Price', value: `₹${data?.summary?.highest_price || 0}`, icon: TrendingUp },
              { label: 'Lowest Price', value: `₹${data?.summary?.lowest_price || 0}`, icon: TrendingDown },
              { label: 'Avg Arrival', value: data?.summary?.average_arrival || 0, icon: BarChart2 },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md print:break-inside-avoid">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <div className="flex items-center gap-2 mt-2">
                  <kpi.icon className="w-4 h-4 text-primary opacity-80" />
                  <span className="text-lg font-extrabold text-slate-800 dark:text-white truncate">{kpi.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
            
            {/* SECTION 3: Historical Trend Chart */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md print:break-inside-avoid">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Historical Trend</h3>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  {['Price', 'Arrival', 'Both'].map(mode => (
                    <button key={mode} onClick={() => setChartMode(mode)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartMode === mode ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500'}`}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72">
                {aggregatedRecords.length > 0 ? (
                   <Line data={getChartData()} options={chartOptions} />
                ) : (
                   <div className="h-full flex items-center justify-center text-slate-400">No trend data available</div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: Aggregated Market Records */}
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md overflow-hidden print:break-inside-avoid">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> 
                {filters.viewMode} Market Records
              </h3>
            </div>
            
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-sm">
                  <tr>
                    {['period', 'arrival_quantity', 'minimum_price', 'maximum_price', 'modal_price'].map(key => (
                      <th key={key} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={() => requestSort(key)}>
                        {key.replace('_', ' ')}
                        {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {currentRecords.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{item.period}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{item.arrival_quantity}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">₹{item.minimum_price}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">₹{item.maximum_price}</td>
                      <td className="px-6 py-3 text-sm font-bold text-slate-800 dark:text-white">₹{item.modal_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center print:hidden">
              <span className="text-sm text-slate-500 font-medium">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, sortedRecords.length)} of {sortedRecords.length} {filters.viewMode.toLowerCase()} records</span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold disabled:opacity-50">Prev</button>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};

export default HistoricalMarketExplorer;
