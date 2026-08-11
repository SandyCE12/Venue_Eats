import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Order, Vendor } from "../types";
import { TrendingUp, Clock, Award, Coins, BarChart2, PieChart as PieIcon, HelpCircle } from "lucide-react";

interface AdminSalesChartsProps {
  orders: Order[];
  vendors: Vendor[];
}

const VENDOR_COLORS = [
  "#16A34A", // green-600 (Delhi Sensation)
  "#F59E0B", // amber-500 (Bombay Cutting)
  "#10B981", // emerald-500 (Kerala Coastal)
  "#EC4899", // pink-500 (Jaipur Palace)
  "#8B5CF6", // violet-500
  "#3B82F6", // blue-500
  "#EF4444", // red-500
];

export const AdminSalesCharts: React.FC<AdminSalesChartsProps> = ({ orders, vendors }) => {
  const [activeChartTab, setActiveChartTab] = useState<"hourly" | "stalls" | "share">("hourly");

  // Get color for a vendor based on index
  const getVendorColor = (index: number) => {
    return VENDOR_COLORS[index % VENDOR_COLORS.length];
  };

  // 1. Hourly Sales Data: Aggregating baseline festival hours + real orders
  const hourlyData = useMemo(() => {
    const hours = [
      "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", 
      "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
    ];

    // Baseline historical sales (SEK) for a typical Namaste Stockholm day
    const baseline: { [hour: string]: { [vendorId: string]: number } } = {
      "11:00": { "v1": 320, "v2": 240, "v3": 180, "v4": 150 },
      "12:00": { "v1": 1450, "v2": 1100, "v3": 950, "v4": 420 },
      "13:00": { "v1": 1850, "v2": 1350, "v3": 1200, "v4": 850 },
      "14:00": { "v1": 950, "v2": 800, "v3": 750, "v4": 980 },
      "15:00": { "v1": 420, "v2": 310, "v3": 280, "v4": 650 },
      "16:00": { "v1": 550, "v2": 450, "v3": 390, "v4": 780 },
      "17:00": { "v1": 1100, "v2": 950, "v3": 820, "v4": 510 },
      "18:00": { "v1": 2100, "v2": 1750, "v3": 1450, "v4": 820 },
      "19:00": { "v1": 2850, "v2": 2200, "v3": 1890, "v4": 1100 },
      "20:00": { "v1": 2200, "v2": 1950, "v3": 1650, "v4": 1450 },
      "21:00": { "v1": 1350, "v2": 1100, "v3": 920, "v4": 1200 },
      "22:00": { "v1": 650, "v2": 520, "v3": 410, "v4": 750 }
    };

    // Build template hour list
    const data = hours.map(hr => {
      const point: any = { hour: hr };
      vendors.forEach(v => {
        const baseVal = baseline[hr]?.[v.id] || 0;
        point[v.name] = baseVal;
      });
      return point;
    });

    // Merge in real orders placed in simulator
    orders.forEach(order => {
      const amt = order.totalAmount || 0;
      const vName = order.vendorName || "Unknown Vendor";
      
      if (order.timestamp) {
        const parts = order.timestamp.split(":");
        if (parts.length >= 1) {
          const hourNum = parseInt(parts[0], 10);
          if (!isNaN(hourNum)) {
            const hourStr = `${hourNum.toString().padStart(2, '0')}:00`;
            let point = data.find(p => p.hour === hourStr);
            if (!point) {
              point = { hour: hourStr };
              vendors.forEach(v => { point[v.name] = 0; });
              data.push(point);
            }
            if (point[vName] === undefined) {
              point[vName] = 0;
            }
            point[vName] += amt;
          }
        }
      }
    });

    data.sort((a, b) => a.hour.localeCompare(b.hour));
    return data;
  }, [orders, vendors]);

  // 2. Vendor Cumulative Performance totals
  const vendorTotals = useMemo(() => {
    const baselineSales: { [vendorId: string]: number } = {
      "v1": 15810,
      "v2": 12730,
      "v3": 10830,
      "v4": 9860
    };

    const totals = vendors.map((v, idx) => {
      const baseVal = baselineSales[v.id] || 0;
      const realVal = orders
        .filter(o => o.vendorId === v.id)
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const totalSalesVal = baseVal + realVal;
      const totalOrdersVal = orders.filter(o => o.vendorId === v.id).length + Math.round(baseVal / 115);

      return {
        id: v.id,
        name: v.name,
        logo: v.logo,
        cuisine: v.cuisine,
        sales: totalSalesVal,
        ordersCount: totalOrdersVal,
        color: getVendorColor(idx)
      };
    });

    return totals.sort((a, b) => b.sales - a.sales);
  }, [orders, vendors]);

  // 3. KPI Metrics calculations
  const kpis = useMemo(() => {
    const totalSales = vendorTotals.reduce((sum, v) => sum + v.sales, 0);
    const totalOrders = vendorTotals.reduce((sum, v) => sum + v.ordersCount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    const topPerformer = vendorTotals[0] || null;

    // Peak hour calculation
    let peakHour = "19:00";
    let maxHourSales = 0;
    hourlyData.forEach(pt => {
      let hourSum = 0;
      Object.keys(pt).forEach(k => {
        if (k !== "hour") {
          hourSum += pt[k];
        }
      });
      if (hourSum > maxHourSales) {
        maxHourSales = hourSum;
        peakHour = pt.hour;
      }
    });

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      topPerformer,
      peakHour,
      peakHourSales: maxHourSales
    };
  }, [hourlyData, vendorTotals]);

  // Tooltip custom style for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let total = 0;
      return (
        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 shadow-2xl space-y-1.5 text-left text-xs">
          <p className="font-mono font-black text-zinc-400 border-b border-zinc-900 pb-1">{label} SALES</p>
          <div className="space-y-1">
            {payload.map((entry: any, i: number) => {
              total += entry.value;
              return (
                <div key={i} className="flex justify-between items-center gap-6 font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-mono text-white">{entry.value.toLocaleString()} kr</span>
                </div>
              );
            })}
          </div>
          {payload.length > 1 && (
            <div className="border-t border-zinc-900 pt-1.5 flex justify-between font-black text-white">
              <span>Total Volume:</span>
              <span className="font-mono text-emerald-400">{total.toLocaleString()} kr</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="sales-dashboard-analytics">
      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-orange-500" /> Total Festival Volume
            </span>
            <div className="text-xl md:text-2xl font-display font-black text-white leading-none">
              {kpis.totalSales.toLocaleString()} <span className="text-xs text-zinc-400 font-sans font-medium">kr</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 font-bold font-mono pt-2 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12.4% vs last festival
          </div>
        </div>

        {/* KPI 2: Top Performer */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Top Performer
            </span>
            <div className="text-sm md:text-base font-display font-black text-white leading-tight flex items-center gap-1.5">
              <span>{kpis.topPerformer?.logo}</span>
              <span className="truncate uppercase">{kpis.topPerformer?.name.split(" ")[0]}...</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 font-bold font-mono pt-2">
            Revenue: <strong className="text-emerald-400">{kpis.topPerformer?.sales.toLocaleString()} kr</strong>
          </div>
        </div>

        {/* KPI 3: Peak Hour */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Peak Sales Hour
            </span>
            <div className="text-xl md:text-2xl font-display font-black text-white leading-none font-mono">
              {kpis.peakHour} <span className="text-[10px] text-zinc-500 font-sans font-bold">-{parseInt(kpis.peakHour.split(":")[0], 10)+1}:00</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 font-bold font-mono pt-2">
            Hourly: <strong className="text-white">{kpis.peakHourSales.toLocaleString()} kr</strong>
          </div>
        </div>

        {/* KPI 4: Avg Ticket */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" /> Avg Order Ticket
            </span>
            <div className="text-xl md:text-2xl font-display font-black text-white leading-none font-mono">
              {kpis.avgOrderValue.toLocaleString()} <span className="text-xs text-zinc-400 font-sans font-medium">kr</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 font-bold font-mono pt-2">
            Completed: <strong className="text-white">{kpis.totalOrders} total</strong>
          </div>
        </div>
      </div>

      {/* Main Charts & Tabs Container */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-850 overflow-hidden">
        {/* Tab Selector Header */}
        <div className="bg-zinc-950 p-4 border-b border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
              Festival Demand Visualizer
            </h4>
            <p className="text-[10px] text-zinc-500 font-medium">
              Real-time Swish ticket flow combined with baseline festival density models.
            </p>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 gap-1 shrink-0">
            <button
              onClick={() => setActiveChartTab("hourly")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === "hourly"
                  ? "bg-zinc-800 text-white font-bold border border-zinc-700"
                  : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <Clock className="w-3 h-3 text-orange-400" />
              Peak Hours Trend
            </button>
            <button
              onClick={() => setActiveChartTab("stalls")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === "stalls"
                  ? "bg-zinc-800 text-white font-bold border border-zinc-700"
                  : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <BarChart2 className="w-3 h-3 text-amber-400" />
              Stall Comparison
            </button>
            <button
              onClick={() => setActiveChartTab("share")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === "share"
                  ? "bg-zinc-800 text-white font-bold border border-zinc-700"
                  : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <PieIcon className="w-3 h-3 text-emerald-400" />
              Sales Share
            </button>
          </div>
        </div>

        {/* Render Active Chart */}
        <div className="p-4 md:p-6 bg-zinc-950/40">
          <div className="w-full h-[280px]">
            {activeChartTab === "hourly" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    {vendors.map((v, i) => (
                      <linearGradient key={v.id} id={`color_${v.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getVendorColor(i)} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={getVendorColor(i)} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} kr`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                  {vendors.map((v, i) => (
                    <Area
                      key={v.id}
                      type="monotone"
                      dataKey={v.name}
                      stroke={getVendorColor(i)}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#color_${v.id})`}
                      stackId="1"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "stalls" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vendorTotals}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.split(" ")[0]}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} kr`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                    {vendorTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "share" && (
              <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-8">
                <div className="w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vendorTotals}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="sales"
                      >
                        {vendorTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie legend */}
                <div className="flex flex-col gap-2 text-left justify-center shrink-0">
                  {vendorTotals.map((entry) => {
                    const totalSales = vendorTotals.reduce((sum, vt) => sum + vt.sales, 0);
                    const pct = totalSales > 0 ? ((entry.sales / totalSales) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={entry.id} className="flex items-center gap-3">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white uppercase font-mono tracking-tight leading-none flex items-center gap-1">
                            <span>{entry.logo}</span> {entry.name}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-bold font-mono">
                            {entry.sales.toLocaleString()} kr ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advisory recommendation note */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left flex gap-3.5 items-start">
        <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-black text-xs shrink-0 font-mono">
          ADVISORY
        </div>
        <div className="space-y-1">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Optimizing Festival Crowd Logistics
          </h5>
          <p className="text-[10px] text-zinc-400 leading-normal">
            Based on real-time and historical density metrics, traffic spikes occur heavily during lunch (12:00 - 13:30) and dinner (18:30 - 20:15). It is recommended to enable the **Automatic Wait-Time Cushioning** algorithm and advise vendors to prepare extra signature festival bowls in advance to bypass peak ordering bottlenecks.
          </p>
        </div>
      </div>
    </div>
  );
};
