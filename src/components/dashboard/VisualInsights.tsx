"use client";

import React, { useMemo } from "react";
import { UserHistory } from "@/lib/db";
import { TOOLS_REGISTRY } from "@/config/toolsRegistry";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface VisualInsightsProps {
  tasks: UserHistory[];
}

export function VisualInsights({ tasks }: VisualInsightsProps) {
  const stats = useMemo(() => {
    const toolCounts: Record<string, number> = {};
    const daysSet = new Set<string>();
    const categoryCounts: Record<string, number> = {};
    const last30DaysCounts: Record<string, number> = {};

    // Initialize last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last30DaysCounts[dateStr] = 0;
    }

    tasks.forEach((task) => {
      // 1. Tool Counts (for Most Used Tool)
      toolCounts[task.toolUsed] = (toolCounts[task.toolUsed] || 0) + 1;

      // 2. Active Days
      const taskDate = new Date(task.createdAt);
      const dateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
      daysSet.add(dateStr);

      // 3. Category Breakdown
      const tool = TOOLS_REGISTRY.find((t) => t.slug === task.toolUsed);
      const cat = tool?.category || "other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // 4. Bar Chart (Last 30 days)
      if (last30DaysCounts[dateStr] !== undefined) {
        last30DaysCounts[dateStr]++;
      }
    });

    let mostUsedToolSlug = "";
    let maxCount = 0;
    Object.entries(toolCounts).forEach(([slug, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedToolSlug = slug;
      }
    });
    
    const mostUsedToolName = TOOLS_REGISTRY.find((t) => t.slug === mostUsedToolSlug)?.name || mostUsedToolSlug || "N/A";

    // Format for Recharts
    const barData = Object.entries(last30DaysCounts).map(([date, count]) => {
      const [year, month, day] = date.split('-');
      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
      return {
        date: localDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      };
    });

    const pieData = Object.entries(categoryCounts).map(([cat, count]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1) + " Tools",
      value: count,
    }));

    return {
      totalFiles: tasks.length,
      mostUsedTool: mostUsedToolName,
      activeDays: daysSet.size,
      barData,
      pieData,
    };
  }, [tasks]);

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (tasks.length === 0) {
    return null; // Or a placeholder
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#64748B] dark:text-white/60 mb-1">Total Files Processed</p>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white">{stats.totalFiles}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#64748B] dark:text-white/60 mb-1">Most Used Tool</p>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white truncate" title={stats.mostUsedTool}>{stats.mostUsedTool}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#64748B] dark:text-white/60 mb-1">Active Days</p>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white">{stats.activeDays}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-4">Files Processed (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-neutral-800" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'currentColor' }} 
                  className="text-slate-500 dark:text-neutral-400 text-xs" 
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fill: 'currentColor' }} 
                  className="text-slate-500 dark:text-neutral-400 text-xs" 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  contentStyle={{ 
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#F8FAFC'
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  wrapperClassName="dark:!bg-neutral-800 dark:!border-neutral-700 !bg-white !border-slate-200 !text-slate-900 dark:!text-white rounded-lg shadow-lg"
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Files" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-4">Breakdown by Tool Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  wrapperClassName="dark:!bg-neutral-800 dark:!border-neutral-700 !bg-white !border-slate-200 !text-slate-900 dark:!text-white rounded-lg shadow-lg"
                  itemStyle={{ color: 'inherit' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
