import React, { useState } from "react";
import { Vendor, Order } from "../types";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Award, 
  BarChart3, 
  Layers, 
  Clock, 
  Zap,
  Percent
} from "lucide-react";

interface VendorAnalyticsProps {
  vendor: Vendor;
  orders: Order[]; // All orders for this vendor
}

export default function VendorAnalytics({ vendor, orders }: VendorAnalyticsProps) {
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  // 1. Core metrics calculations
  const completedOrders = orders.filter(o => o.status === "Completed");
  const activeOrders = orders.filter(o => ["Placed", "Preparing", "Ready"].includes(o.status));
  
  const completedRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingRevenue = activeOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalVolume = orders.length;
  
  const averageOrderValue = completedOrders.length > 0 
    ? Math.round(completedRevenue / completedOrders.length) 
    : 0;

  // 2. Popular items calculation
  const itemQuantities: { [itemId: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const id = item.menuItem.id;
      itemQuantities[id] = (itemQuantities[id] || 0) + item.quantity;
    });
  });

  // Map to full menu item info and sort
  const popularItems = Object.entries(itemQuantities)
    .map(([itemId, qty]) => {
      const menuItem = vendor.menu.find(m => m.id === itemId);
      return {
        id: itemId,
        name: menuItem ? menuItem.name : "Unknown Item",
        price: menuItem ? menuItem.price : 0,
        imageUrl: menuItem ? menuItem.imageUrl : "",
        category: menuItem ? menuItem.category : "Food",
        quantitySold: qty,
        totalRevenue: qty * (menuItem ? menuItem.price : 0),
      };
    })
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 4); // Top 4 items

  // Maximum quantity sold for progress bar normalization
  const maxQtySold = popularItems.length > 0 
    ? Math.max(...popularItems.map(item => item.quantitySold)) 
    : 1;

  // 3. Hourly order tracking (X-axis data)
  // Let's create a fixed list of hours to represent a standard event day: 10:00 to 19:00
  const hoursRange = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  
  // Group real-time orders by hour
  const hourlyData = hoursRange.map(hourStr => {
    const targetHour = parseInt(hourStr.split(":")[0]);
    
    // Filter orders matching this hour
    const matchingOrders = orders.filter(o => {
      if (!o.timestamp) return false;
      // Timestamp formats: "12:34" or "09:41"
      const orderHour = parseInt(o.timestamp.split(":")[0]);
      return orderHour === targetHour;
    });

    const revenue = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const count = matchingOrders.length;

    return {
      hour: hourStr,
      revenue,
      count,
    };
  });

  // Calculate dynamic max value for SVG graph scaling
  const maxRevenue = Math.max(...hourlyData.map(d => d.revenue), 100);
  const maxCount = Math.max(...hourlyData.map(d => d.count), 5);

  // SVG dimensions
  const width = 500;
  const height = 140;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate SVG coordinates for Area Chart (using Revenue)
  const points = hourlyData.map((d, index) => {
    const x = paddingLeft + (index / (hourlyData.length - 1)) * chartWidth;
    const y = height - paddingBottom - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  // Create SVG path string
  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  // Create closed area path string for gradient fill
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  return (
    <div className="space-y-6 text-zinc-100" id="vendor-analytics-dashboard">
      
      {/* 3-Column Core Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Revenue Card */}
        <div className="bg-zinc-950 p-4 rounded-2xl border-2 border-zinc-800 hover:border-zinc-700 transition-all shadow-md text-left flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Total Gross Revenue</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-xl text-white font-mono flex items-baseline gap-1">
              {completedRevenue} <span className="text-xs text-zinc-400 font-bold">kr</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {pendingRevenue > 0 ? (
                <span className="text-[8px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                  <Clock className="w-2.5 h-2.5" /> +{pendingRevenue} kr pending
                </span>
              ) : (
                <span className="text-[8px] text-zinc-500 font-semibold flex items-center gap-0.5">
                  <Percent className="w-2.5 h-2.5" /> Excl. 12% food VAT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Orders Volume Card */}
        <div className="bg-zinc-950 p-4 rounded-2xl border-2 border-zinc-800 hover:border-zinc-700 transition-all shadow-md text-left flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Volume Processed</span>
            <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-xl text-white font-mono flex items-baseline gap-1">
              {totalVolume} <span className="text-xs text-zinc-400 font-bold">order{totalVolume === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[8px] text-zinc-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                {completedOrders.length} Completed
              </span>
              <span className="text-[8px] text-zinc-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                {activeOrders.length} Active
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Ticket Value */}
        <div className="bg-zinc-950 p-4 rounded-2xl border-2 border-zinc-800 hover:border-zinc-700 transition-all shadow-md text-left flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Average Order Value</span>
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-xl text-white font-mono flex items-baseline gap-1">
              {averageOrderValue} <span className="text-xs text-zinc-400 font-bold">kr</span>
            </div>
            <p className="text-[8px] text-zinc-500 font-semibold mt-2">
              Based on completed Swish checkouts
            </p>
          </div>
        </div>
      </div>

      {/* Main Dual Charts Section (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Hourly Revenue Sales Trend (Left 7-columns) */}
        <div className="lg:col-span-7 bg-zinc-950 p-5 rounded-3xl border-2 border-zinc-800 space-y-4 shadow-inner text-left">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-zinc-400 block uppercase tracking-wider font-mono">Live Hourly Revenue Trend</span>
              <p className="text-[10px] text-zinc-500">Track incoming order volume peaks during Gärdet festival hours</p>
            </div>
            
            {/* Live pulsating dot to indicate real-time connection */}
            <span className="text-[8px] font-mono text-zinc-500 font-bold flex items-center gap-1 border border-zinc-800 px-2 py-0.5 rounded-lg bg-zinc-950 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
              REALTIME
            </span>
          </div>

          {/* Interactive Responsive SVG Area Chart */}
          <div className="relative pt-2">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Gradient Fill for Area Chart */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                </linearGradient>
                {/* Stroke Gradient */}
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingTop + ratio * chartHeight;
                const value = Math.round(maxRevenue - ratio * maxRevenue);
                return (
                  <g key={idx} className="opacity-40">
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={width - paddingRight} 
                      y2={y} 
                      stroke="#27272a" 
                      strokeWidth="1" 
                      strokeDasharray="3 3"
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 3} 
                      fill="#71717a" 
                      fontSize="8" 
                      textAnchor="end" 
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Area path with orange gradient */}
              {pathD && (
                <path 
                  d={areaD} 
                  fill="url(#areaGradient)" 
                  className="transition-all duration-700 ease-in-out"
                />
              )}

              {/* Stroke line path */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="url(#strokeGradient)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-in-out"
                />
              )}

              {/* Invisible interactive vertical lines for hover states */}
              {points.map((p, index) => {
                const isHovered = hoveredHour === p.hour;
                return (
                  <g key={index}>
                    {/* Hover vertical line */}
                    {isHovered && (
                      <line 
                        x1={p.x} 
                        y1={paddingTop} 
                        x2={p.x} 
                        y2={height - paddingBottom} 
                        stroke="#16a34a" 
                        strokeWidth="1" 
                        opacity="0.6"
                      />
                    )}

                    {/* Interactive anchor dot */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={isHovered ? 5.5 : 3.5} 
                      fill={isHovered ? "#16a34a" : "#18181b"} 
                      stroke={isHovered ? "#fff" : "#16a34a"} 
                      strokeWidth={isHovered ? 2.5 : 2} 
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredHour(p.hour)}
                      onMouseLeave={() => setHoveredHour(null)}
                    />

                    {/* Broad invisible rect for easier mouse hover catching */}
                    <rect 
                      x={p.x - chartWidth / (hourlyData.length - 1) / 2} 
                      y={paddingTop} 
                      width={chartWidth / (hourlyData.length - 1)} 
                      height={chartHeight} 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredHour(p.hour)}
                      onMouseLeave={() => setHoveredHour(null)}
                    />
                  </g>
                );
              })}

              {/* Horizontal X Axis line */}
              <line 
                x1={paddingLeft} 
                y1={height - paddingBottom} 
                x2={width - paddingRight} 
                y2={height - paddingBottom} 
                stroke="#27272a" 
                strokeWidth="1.5"
              />

              {/* X Axis Labels */}
              {points.map((p, index) => {
                // Show every other label to fit nicely on small widths
                if (index % 2 !== 0 && index !== points.length - 1) return null;
                return (
                  <text 
                    key={index} 
                    x={p.x} 
                    y={height - paddingBottom + 14} 
                    fill={hoveredHour === p.hour ? "#16a34a" : "#52525b"} 
                    fontSize="8" 
                    textAnchor="middle" 
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="transition-colors duration-200"
                  >
                    {p.hour}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Dynamic Info Banner based on hovered hour or current state */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex justify-between items-center transition-all duration-300">
            {hoveredHour ? (() => {
              const hoverObj = hourlyData.find(d => d.hour === hoveredHour)!;
              return (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[10px] font-bold text-zinc-300">Hour: <span className="font-mono text-white">{hoveredHour}</span></span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[10px] text-zinc-400 font-bold">Revenue: <span className="font-mono text-emerald-400 font-black">{hoverObj.revenue} kr</span></span>
                    <span className="text-[10px] text-zinc-400 font-bold">Orders: <span className="font-mono text-orange-400 font-black">{hoverObj.count}</span></span>
                  </div>
                </>
              );
            })() : (
              <>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold">
                  <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Tip: Hover nodes above to inspect hourly performance values</span>
                </div>
                <div className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
                  ACTIVE FESTIVAL ZONE
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Selling Menu Items Leaderboard (Right 5-columns) */}
        <div className="lg:col-span-5 bg-zinc-950 p-5 rounded-3xl border-2 border-zinc-800 space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider font-mono">Popular Menu Items</span>
            </div>
            <p className="text-[10px] text-zinc-500">Most requested dishes sorted by volume</p>
          </div>

          {popularItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 space-y-2 my-2">
              <BarChart3 className="w-6 h-6 text-zinc-600 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-wider">No Sales Registered</p>
              <p className="text-[9px] text-zinc-600 leading-snug">Place orders using the attendee simulator on the left to watch live stats populate here.</p>
            </div>
          ) : (
            <div className="space-y-3.5 my-2 flex-1">
              {popularItems.map((item, index) => {
                const ratio = Math.max(8, (item.quantitySold / maxQtySold) * 100);
                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Rank Badge */}
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black font-mono shrink-0 ${
                          index === 0 ? "bg-amber-500 text-zinc-950" :
                          index === 1 ? "bg-zinc-300 text-zinc-900" :
                          index === 2 ? "bg-amber-700 text-white" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {index + 1}
                        </span>
                        
                        <span className="text-xs font-bold text-zinc-200 truncate">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-right shrink-0">
                        <span className="text-[10px] font-black font-mono text-zinc-300">{item.quantitySold} sold</span>
                        <span className="text-[9px] font-semibold text-zinc-500 font-mono">({item.totalRevenue} kr)</span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
                          index === 0 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                          index === 1 ? "bg-gradient-to-r from-zinc-400 to-zinc-500" :
                          "bg-gradient-to-r from-orange-500/80 to-red-500/80"
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mini Insights Banner */}
          <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-center">
            <span className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              Menu Coverage
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-400">
              {vendor.menu.filter(m => m.stock).length} / {vendor.menu.length} items active
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
