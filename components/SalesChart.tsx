'use client';
import React from 'react';
import { Sale, formatRupiah } from '@/lib/db';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { AreaChart as ChartIcon, PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface SalesChartProps {
  sales: Sale[];
}

export function SalesChart({ sales }: SalesChartProps) {
  // 1. Calculate Last 7 Days Revenue with useMemo
  const chartData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const daySales = sales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate.getDate() === date.getDate() &&
               saleDate.getMonth() === date.getMonth() &&
               saleDate.getFullYear() === date.getFullYear();
      });

      const total = daySales.reduce((sum, s) => sum + s.amount, 0);
      data.push({
        name: dateStr,
        Revenue: total,
      });
    }
    return data;
  }, [sales]);

  // 2. Calculate Category Breakdown with useMemo
  const categoryData = React.useMemo(() => {
    const categories = ['Refill', 'Galon Baru', 'Air Botol', 'Lain-lain'];
    const data = categories.map((cat, idx) => {
      const catSales = sales.filter(s => {
        if (cat === 'Lain-lain') {
          return s.item !== 'Refill' && s.item !== 'Galon Baru' && s.item !== 'Air Botol';
        }
        return s.item === cat;
      });
      const total = catSales.reduce((sum, s) => sum + s.amount, 0);
      return {
        name: cat,
        value: total,
        color: ['#38BDF8', '#C084FC', '#FBBF24', '#94A3B8'][idx],
      };
    }).filter(item => item.value > 0);

    return data;
  }, [sales]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D111A] border border-[#202C3F] p-3 rounded-xl shadow-2xl font-sans">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{payload[0].name}</p>
          <p className="text-sm font-black text-slate-100 font-mono mt-1">
            Rp {formatRupiah(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const hasSales = sales && sales.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Chart 1: 7 Days Trend */}
      <div className="bg-[#151B26] p-6 rounded-2xl border border-[#242F41] shadow-xl md:col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-sky-400" />
              Tren Penjualan 7 Hari Terakhir
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Grafik pendapatan omset harian depot.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pendapatan Kotor</span>
          </div>
        </div>

        <div className="h-[220px] w-full pt-2">
          {hasSales ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rp ${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0D111A] border border-[#202C3F] border-dashed rounded-xl">
              <span className="text-xs text-slate-500 font-bold">Belum ada transaksi terekam untuk divisualisasikan.</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Category distribution */}
      <div className="bg-[#151B26] p-6 rounded-2xl border border-[#242F41] shadow-xl md:col-span-4 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-sky-400" />
            Distribusi Omset Menu
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Porsi pendapatan dari setiap kategori menu.</p>
        </div>

        <div className="h-[140px] w-full flex items-center justify-center relative">
          {hasSales && categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0D111A] border border-[#202C3F] border-dashed rounded-xl">
              <span className="text-xs text-slate-500 font-bold">Kosong</span>
            </div>
          )}
          {hasSales && categoryData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold leading-none">Total</span>
              <span className="text-xs font-black font-mono mt-0.5 text-slate-100">
                Rp {formatRupiah(categoryData.reduce((sum, item) => sum + item.value, 0))}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 mt-1">
          {categoryData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px] font-medium text-slate-300">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-100 shrink-0 ml-1">
                Rp {formatRupiah(item.value)}
              </span>
            </div>
          ))}
          {categoryData.length === 0 && (
            <span className="text-[10px] text-slate-500 text-center font-bold">Menunggu data transaksi...</span>
          )}
        </div>
      </div>
    </div>
  );
}
