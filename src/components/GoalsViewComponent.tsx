/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Target,
  TrendingUp,
  Edit3,
  Save,
  X,
  Calendar,
  BarChart3,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { MonthlyTarget, YearlyGoal, Order, DesignService, Expense } from '../types';

interface GoalsViewComponentProps {
  goals: YearlyGoal[];
  onUpdateGoals: (updatedGoals: YearlyGoal[]) => void;
  orders: Order[];
  designs: DesignService[];
  expenses: Expense[];
}

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const CURRENT_MONTH = new Date().getMonth() + 1; // Dynamic current month (1-12)

const formatVND = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatCompact = (value: number): string =>
  `${(value / 1_000_000).toFixed(0)}M`;

const getPctColor = (pct: number): string => {
  if (pct >= 80) return 'text-emerald-600';
  if (pct >= 50) return 'text-amber-500';
  return 'text-red-500';
};

const getPctBg = (pct: number): string => {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-red-500';
};

const getPctBgLight = (pct: number): string => {
  if (pct >= 80) return 'bg-emerald-50';
  if (pct >= 50) return 'bg-amber-50';
  return 'bg-red-50';
};

const getStatusIcon = (pct: number | null) => {
  if (pct === null) return <span className="text-slate-300 font-medium">—</span>;
  if (pct >= 80) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (pct >= 50) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
};

function createDefaultMonths(): MonthlyTarget[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    revenueTarget: 30_000_000,
    revenueCourseTarget: 20_000_000,
    revenueDesignTarget: 10_000_000,
    expenseAdsTarget: 5_000_000,
    expenseStaffTarget: 8_000_000,
    profitTarget: 17_000_000,
  }));
}

function createDefaultGoal(year: number): YearlyGoal {
  return {
    id: `GOAL_${year}`,
    year,
    months: createDefaultMonths(),
  };
}

// ----- Custom Tooltip Components -----
const LineChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold font-mono text-slate-800">{formatVND(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const BarChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold font-mono text-slate-800">{formatVND(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ===== MAIN COMPONENT =====
export default function GoalsViewComponent({
  goals,
  onUpdateGoals,
  orders = [],
  designs = [],
  expenses = []
}: GoalsViewComponentProps) {
  // Convert ISO UTC date string to local YYYY-MM-DD for correct timezone comparison
  const toLocalDateStr = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.length === 10 && !dateStr.includes('T')) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.substring(0, 10);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const availableYears = useMemo(() => {
    const years = goals.map(g => g.year);
    if (!years.includes(2026)) years.push(2026);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [goals]);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<YearlyGoal | null>(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [expandedEditMonth, setExpandedEditMonth] = useState<number | null>(6);

  // Get current year goal
  const currentGoal = useMemo(() => {
    return goals.find(g => g.year === selectedYear) || null;
  }, [goals, selectedYear]);

  // Calculate actual goal metrics dynamically from CRM data in real-time
  const months = useMemo(() => {
    if (!currentGoal) return [];

    return currentGoal.months.map(m => {
      // Find orders for this month & year
      const monthOrders = orders.filter(o => {
        if (o.paymentStatus !== 'Đã thanh toán') return false;
        const d = toLocalDateStr(o.createdAt);
        const parts = d.split('-');
        if (parts.length >= 2) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          return year === selectedYear && month === m.month;
        }
        return false;
      });

      // Find designs for this month & year
      const monthDesigns = designs.filter(d => {
        const dateStr = toLocalDateStr(d.createdAt || d.deadline || '');
        if (!dateStr) return false;
        const parts = dateStr.split('-');
        if (parts.length >= 2) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          return year === selectedYear && month === m.month;
        }
        return false;
      });

      // Find expenses for this month & year
      const monthExpenses = expenses.filter(e => {
        const d = e.date;
        if (!d) return false;
        const parts = d.split('-');
        if (parts.length >= 2) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          return year === selectedYear && month === m.month;
        }
        return false;
      });

      // Course actual (KH Thực)
      const dynamicCourseActual = monthOrders.reduce((sum, o) => sum + o.price, 0);

      // Design actual (TK Thực)
      const dynamicDesignActual = monthDesigns.reduce((sum, d) => sum + (d.amount || 0), 0);

      // Total revenue (DT Thực đạt)
      const dynamicRevenueActual = dynamicCourseActual + dynamicDesignActual;

      // Expense actual - Ads (CP QC Thực)
      const dynamicExpenseAds = monthExpenses
        .filter(e => e.category === 'Chi phí quảng cáo')
        .reduce((sum, e) => sum + e.amount, 0);

      // Expense actual - Other
      const dynamicExpenseOther = monthExpenses
        .filter(e => e.category !== 'Chi phí quảng cáo')
        .reduce((sum, e) => sum + e.amount, 0);

      // Total Expense actual
      const dynamicTotalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Profit actual (LN Thực)
      const dynamicProfitActual = dynamicRevenueActual - dynamicTotalExpense;

      // If we have dynamic transactions (revenue actual > 0 or expense actual > 0), we use the dynamic calculations.
      // Otherwise, we fallback to the static values already defined in the goals database (which might be pre-populated mock values for T1-T5).
      const hasDynamicData = dynamicRevenueActual > 0 || dynamicTotalExpense > 0;

      const actualRevenue = hasDynamicData ? dynamicRevenueActual : m.actualRevenue;
      const actualRevenueCourse = hasDynamicData ? dynamicCourseActual : m.actualRevenueCourse;
      const actualRevenueDesign = hasDynamicData ? dynamicDesignActual : m.actualRevenueDesign;
      const actualExpenseAds = hasDynamicData ? dynamicExpenseAds : m.actualExpenseAds;
      const actualExpenseOther = hasDynamicData ? dynamicExpenseOther : m.actualExpenseOther;
      const actualProfit = hasDynamicData ? dynamicProfitActual : m.actualProfit;

      return {
        ...m,
        actualRevenue,
        actualRevenueCourse,
        actualRevenueDesign,
        actualExpenseAds,
        actualExpenseOther,
        actualProfit
      };
    });
  }, [currentGoal, selectedYear, orders, designs, expenses]);

  // YTD calculations (months 1 through CURRENT_MONTH)
  const ytdStats = useMemo(() => {
    const ytdMonths = months.filter(m => m.month <= CURRENT_MONTH);
    const sumTarget = ytdMonths.reduce((s, m) => s + m.revenueTarget, 0);
    const sumActual = ytdMonths.reduce((s, m) => s + (m.actualRevenue || 0), 0);
    const sumCourseTarget = ytdMonths.reduce((s, m) => s + m.revenueCourseTarget, 0);
    const sumCourseActual = ytdMonths.reduce((s, m) => s + (m.actualRevenueCourse || 0), 0);
    const sumDesignTarget = ytdMonths.reduce((s, m) => s + m.revenueDesignTarget, 0);
    const sumDesignActual = ytdMonths.reduce((s, m) => s + (m.actualRevenueDesign || 0), 0);
    const sumProfitTarget = ytdMonths.reduce((s, m) => s + m.profitTarget, 0);
    const sumProfitActual = ytdMonths.reduce((s, m) => s + (m.actualProfit || 0), 0);
    const hasAnyActual = ytdMonths.some(m => m.actualRevenue !== undefined);
    return {
      revenueTarget: sumTarget,
      revenueActual: sumActual,
      revenuePct: sumTarget > 0 ? Math.round((sumActual / sumTarget) * 100) : 0,
      courseTarget: sumCourseTarget,
      courseActual: sumCourseActual,
      coursePct: sumCourseTarget > 0 ? Math.round((sumCourseActual / sumCourseTarget) * 100) : 0,
      designTarget: sumDesignTarget,
      designActual: sumDesignActual,
      designPct: sumDesignTarget > 0 ? Math.round((sumDesignActual / sumDesignTarget) * 100) : 0,
      profitTarget: sumProfitTarget,
      profitActual: sumProfitActual,
      profitPct: sumProfitTarget > 0 ? Math.round((sumProfitActual / sumProfitTarget) * 100) : 0,
      hasAnyActual,
    };
  }, [months]);

  // Chart data - Line chart
  const lineChartData = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      const m = months.find(mo => mo.month === idx + 1);
      return {
        name: label,
        'Mục tiêu': m?.revenueTarget || 0,
        'Thực đạt': m?.actualRevenue ?? null,
      };
    });
  }, [months]);

  // Chart data - Bar chart
  const barChartData = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      const m = months.find(mo => mo.month === idx + 1);
      return {
        name: label,
        'KH Mục tiêu': m?.revenueCourseTarget || 0,
        'KH Thực': m?.actualRevenueCourse ?? 0,
        'TK Mục tiêu': m?.revenueDesignTarget || 0,
        'TK Thực': m?.actualRevenueDesign ?? 0,
      };
    });
  }, [months]);

  // Yearly totals
  const yearlyTotals = useMemo(() => {
    return {
      revenueTarget: months.reduce((s, m) => s + m.revenueTarget, 0),
      actualRevenue: months.reduce((s, m) => s + (m.actualRevenue || 0), 0),
      expenseAdsTarget: months.reduce((s, m) => s + m.expenseAdsTarget, 0),
      actualExpenseAds: months.reduce((s, m) => s + (m.actualExpenseAds || 0), 0),
      profitTarget: months.reduce((s, m) => s + m.profitTarget, 0),
      actualProfit: months.reduce((s, m) => s + (m.actualProfit || 0), 0),
    };
  }, [months]);

  // Handlers
  const handleCreateDefaultGoal = useCallback(() => {
    const newGoal = createDefaultGoal(selectedYear);
    onUpdateGoals([...goals, newGoal]);
  }, [goals, onUpdateGoals, selectedYear]);

  const handleAddYear = useCallback(() => {
    const nextYear = Math.max(...availableYears, 2025) + 1;
    const newGoal = createDefaultGoal(nextYear);
    onUpdateGoals([...goals, newGoal]);
    setSelectedYear(nextYear);
  }, [goals, onUpdateGoals, availableYears]);

  const handleOpenEdit = useCallback(() => {
    if (!currentGoal) return;
    setEditingGoal(JSON.parse(JSON.stringify(currentGoal)));
    setShowEditModal(true);
  }, [currentGoal]);

  const handleEditFieldChange = useCallback((monthIdx: number, field: keyof MonthlyTarget, value: string) => {
    if (!editingGoal) return;
    const numVal = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    setEditingGoal(prev => {
      if (!prev) return prev;
      const updated = { ...prev, months: prev.months.map((m, i) => i === monthIdx ? { ...m, [field]: numVal } : m) };
      return updated;
    });
  }, [editingGoal]);

  const handleSaveEdit = useCallback(() => {
    if (!editingGoal) return;
    const updatedGoals = goals.map(g => g.id === editingGoal.id ? editingGoal : g);
    onUpdateGoals(updatedGoals);
    setShowEditModal(false);
    setEditingGoal(null);
  }, [editingGoal, goals, onUpdateGoals]);

  // ----- RENDER -----

  // Empty state
  if (!currentGoal) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-secondary font-sans flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Quản Lý Mục Tiêu
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Thiết lập và theo dõi mục tiêu doanh thu, chi phí, lợi nhuận hàng tháng.
            </p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent-orange/10 flex items-center justify-center mb-6 animate-pulse">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có mục tiêu cho năm {selectedYear}</h3>
          <p className="text-sm text-slate-400 mb-8 max-w-md text-center">
            Tạo mục tiêu để theo dõi doanh thu, chi phí và lợi nhuận cho từng tháng trong năm.
          </p>
          <button
            onClick={handleCreateDefaultGoal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent-orange text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Tạo mục tiêu mặc định cho {selectedYear}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="goals_view_container">
      {/* ───── Header ───── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" id="goals_page_title">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-secondary font-sans flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Quản Lý Mục Tiêu
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Thiết lập và theo dõi mục tiêu doanh thu, chi phí, lợi nhuận hàng tháng.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Year selector */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-primary" />
              Năm {selectedYear}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showYearDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden min-w-[120px] animate-fade-in">
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => { setSelectedYear(yr); setShowYearDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold cursor-pointer transition ${
                      yr === selectedYear
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add year */}
          <button
            onClick={handleAddYear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-primary border border-slate-200 rounded-xl hover:border-primary/30 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Thêm năm mới
          </button>

          {/* Edit */}
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent-orange text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Chỉnh sửa mục tiêu
          </button>
        </div>
      </div>

      {/* ───── YTD Summary Cards ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="ytd_summary_cards">
        {/* Revenue */}
        <SummaryCard
          label="TỔNG DT MỤC TIÊU (YTD)"
          target={ytdStats.revenueTarget}
          actual={ytdStats.revenueActual}
          pct={ytdStats.revenuePct}
          icon={<TrendingUp className="w-4 h-4" />}
          hasData={ytdStats.hasAnyActual}
        />
        {/* Course Revenue */}
        <SummaryCard
          label="DT KHOÁ HỌC (YTD)"
          target={ytdStats.courseTarget}
          actual={ytdStats.courseActual}
          pct={ytdStats.coursePct}
          icon={<BarChart3 className="w-4 h-4" />}
          hasData={ytdStats.hasAnyActual}
        />
        {/* Design Revenue */}
        <SummaryCard
          label="DT THIẾT KẾ (YTD)"
          target={ytdStats.designTarget}
          actual={ytdStats.designActual}
          pct={ytdStats.designPct}
          icon={<Target className="w-4 h-4" />}
          hasData={ytdStats.hasAnyActual}
        />
        {/* Profit */}
        <SummaryCard
          label="LỢI NHUẬN (YTD)"
          target={ytdStats.profitTarget}
          actual={ytdStats.profitActual}
          pct={ytdStats.profitPct}
          icon={<TrendingUp className="w-4 h-4" />}
          hasData={ytdStats.hasAnyActual}
        />
      </div>

      {/* ───── Charts ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="goals_charts_section">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-shadow hover:shadow-md">
          <h3 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            So Sánh Doanh Thu
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatCompact} width={55} />
              <Tooltip content={<LineChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                iconType="plainline"
              />
              <Line
                type="monotone"
                dataKey="Mục tiêu"
                stroke="#FF3B30"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ r: 3, fill: '#FF3B30', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="Thực đạt"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-shadow hover:shadow-md">
          <h3 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Chi Tiết Theo Tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatCompact} width={55} />
              <Tooltip content={<BarChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              <Bar dataKey="KH Mục tiêu" fill="#2563EB" radius={[3, 3, 0, 0]} opacity={0.35} />
              <Bar dataKey="KH Thực" fill="#FF3B30" radius={[3, 3, 0, 0]} />
              <Bar dataKey="TK Mục tiêu" fill="#10B981" radius={[3, 3, 0, 0]} opacity={0.35} />
              <Bar dataKey="TK Thực" fill="#FBBF24" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ───── Monthly Detail Table ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="goals_monthly_table">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Chi Tiết Mục Tiêu Theo Tháng — {selectedYear}
          </h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tháng</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">DT Mục tiêu</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">DT Thực đạt</th>
                <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">% Đạt</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">CP QC Mục tiêu</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">CP QC Thực</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">LN Mục tiêu</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">LN Thực</th>
                <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, idx) => {
                const hasActual = m.actualRevenue !== undefined;
                const pct = hasActual && m.revenueTarget > 0
                  ? Math.round(((m.actualRevenue || 0) / m.revenueTarget) * 100)
                  : null;
                const clampedPct = pct !== null ? Math.min(pct, 100) : 0;
                return (
                  <tr
                    key={m.month}
                    className={`border-b border-slate-50 transition-colors duration-150 hover:bg-primary/[0.03] ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } ${m.month === CURRENT_MONTH ? 'ring-1 ring-primary/20 ring-inset' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-bold ${m.month === CURRENT_MONTH ? 'text-primary' : 'text-slate-700'}`}>
                        {MONTH_LABELS[m.month - 1]}
                      </span>
                      {m.month === CURRENT_MONTH && (
                        <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">Hiện tại</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">{formatVND(m.revenueTarget)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {hasActual ? (
                        <span className="text-slate-800">{formatVND(m.actualRevenue!)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pct !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              style={{ width: `${clampedPct}%` }}
                              className={`h-2 rounded-full transition-all duration-500 ${getPctBg(pct)}`}
                            />
                          </div>
                          <span className={`font-bold font-mono text-xs min-w-[36px] text-right ${getPctColor(pct)}`}>{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-center block">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">{formatVND(m.expenseAdsTarget)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {m.actualExpenseAds !== undefined ? (
                        <span className="text-slate-800">{formatVND(m.actualExpenseAds)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">{formatVND(m.profitTarget)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {m.actualProfit !== undefined ? (
                        <span className={m.actualProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {formatVND(m.actualProfit)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">{getStatusIcon(pct)}</div>
                    </td>
                  </tr>
                );
              })}

              {/* Totals row */}
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-200 font-bold">
                <td className="px-4 py-3 text-slate-800 uppercase tracking-wider">Tổng năm</td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatVND(yearlyTotals.revenueTarget)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatVND(yearlyTotals.actualRevenue)}</td>
                <td className="px-4 py-3">
                  {yearlyTotals.revenueTarget > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(Math.round((yearlyTotals.actualRevenue / yearlyTotals.revenueTarget) * 100), 100)}%` }}
                          className={`h-2 rounded-full transition-all duration-500 ${getPctBg(Math.round((yearlyTotals.actualRevenue / yearlyTotals.revenueTarget) * 100))}`}
                        />
                      </div>
                      <span className={`font-bold font-mono text-xs min-w-[36px] text-right ${getPctColor(Math.round((yearlyTotals.actualRevenue / yearlyTotals.revenueTarget) * 100))}`}>
                        {Math.round((yearlyTotals.actualRevenue / yearlyTotals.revenueTarget) * 100)}%
                      </span>
                    </div>
                  ) : <span className="text-slate-300 text-center block">—</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatVND(yearlyTotals.expenseAdsTarget)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatVND(yearlyTotals.actualExpenseAds)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatVND(yearlyTotals.profitTarget)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatVND(yearlyTotals.actualProfit)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    {yearlyTotals.revenueTarget > 0
                      ? getStatusIcon(Math.round((yearlyTotals.actualRevenue / yearlyTotals.revenueTarget) * 100))
                      : getStatusIcon(null)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile card list for monthly details */}
        <div className="block md:hidden p-4 space-y-3" id="goals_monthly_cards_mobile">
          {months.map((m, idx) => {
            const hasActual = m.actualRevenue !== undefined;
            const pct = hasActual && m.revenueTarget > 0
              ? Math.round(((m.actualRevenue || 0) / m.revenueTarget) * 100)
              : null;
            const clampedPct = pct !== null ? Math.min(pct, 100) : 0;
            return (
              <div
                key={m.month}
                className={`p-4 rounded-xl border border-slate-200 space-y-3 bg-white ${
                  m.month === CURRENT_MONTH ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-700 text-sm">
                    Tháng {m.month} {m.month === CURRENT_MONTH ? '(Hiện tại)' : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(pct)}
                    {pct !== null && <span className={`font-bold font-mono text-xs ${getPctColor(pct)}`}>{pct}%</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DT Mục tiêu:</span>
                    <span className="font-semibold text-slate-700 font-mono">{formatVND(m.revenueTarget)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DT Thực đạt:</span>
                    <span className="font-semibold text-slate-800 font-mono">{hasActual ? formatVND(m.actualRevenue!) : '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CP QC Mục tiêu:</span>
                    <span className="font-semibold text-slate-700 font-mono">{formatVND(m.expenseAdsTarget)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CP QC Thực:</span>
                    <span className="font-semibold text-slate-800 font-mono">{m.actualExpenseAds !== undefined ? formatVND(m.actualExpenseAds) : '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LN Mục tiêu:</span>
                    <span className="font-semibold text-slate-700 font-mono">{formatVND(m.profitTarget)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LN Thực:</span>
                    <span className={`font-semibold font-mono ${m.actualProfit !== undefined && m.actualProfit < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                      {m.actualProfit !== undefined ? formatVND(m.actualProfit) : '—'}
                    </span>
                  </div>
                </div>
                
                {pct !== null && (
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        style={{ width: `${clampedPct}%` }}
                        className={`h-1.5 rounded-full ${getPctBg(pct)}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Total card for mobile */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-md" id="goals_total_card_mobile">
            <div className="font-bold text-sm border-b border-slate-800 pb-2 flex justify-between">
              <span>TỔNG CỘNG CẢ NĂM</span>
              <span className="text-xs text-primary font-mono font-bold">
                {yearlyTotals.revenueTarget > 0 ? `${Math.round((yearlyTotals.actualRevenue / yearlyTotals.revenueTarget) * 100)}%` : '—'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng DT Mục tiêu:</span>
                <span className="font-semibold text-slate-200 font-mono">{formatVND(yearlyTotals.revenueTarget)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng DT Thực đạt:</span>
                <span className="font-semibold text-emerald-400 font-mono">{formatVND(yearlyTotals.actualRevenue)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng CP QC Mục tiêu:</span>
                <span className="font-semibold text-slate-200 font-mono">{formatVND(yearlyTotals.expenseAdsTarget)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng CP QC Thực:</span>
                <span className="font-semibold text-slate-200 font-mono">{formatVND(yearlyTotals.actualExpenseAds)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng LN Mục tiêu:</span>
                <span className="font-semibold text-slate-200 font-mono">{formatVND(yearlyTotals.profitTarget)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng LN Thực đạt:</span>
                <span className={`font-semibold font-mono ${yearlyTotals.actualProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatVND(yearlyTotals.actualProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Edit Modal ───── */}
      {showEditModal && editingGoal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" id="goals_edit_modal_overlay">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => { setShowEditModal(false); setEditingGoal(null); }}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl mx-4 animate-fade-in z-10">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-primary to-accent-orange rounded-t-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Chỉnh Sửa Mục Tiêu — Năm {editingGoal.year}
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingGoal(null); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal body */}
            <div className="hidden md:block p-6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">Tháng</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">DT Tổng<br/>Mục tiêu</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">DT Khoá học<br/>Mục tiêu</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">DT Thiết kế<br/>Mục tiêu</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">CP QC<br/>Mục tiêu</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">CP Nhân sự<br/>Mục tiêu</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">Lợi nhuận<br/>Mục tiêu</th>
                    <th className="text-center px-3 py-2 font-bold text-primary uppercase tracking-wider border-l-2 border-primary/20">DT Thực</th>
                    <th className="text-center px-3 py-2 font-bold text-primary uppercase tracking-wider">KH Thực</th>
                    <th className="text-center px-3 py-2 font-bold text-primary uppercase tracking-wider">TK Thực</th>
                    <th className="text-center px-3 py-2 font-bold text-primary uppercase tracking-wider">CP QC Thực</th>
                    <th className="text-center px-3 py-2 font-bold text-primary uppercase tracking-wider">LN Thực</th>
                  </tr>
                </thead>
                <tbody>
                  {editingGoal.months.map((m, idx) => (
                    <tr key={m.month} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-3 py-2 font-bold text-slate-700">{MONTH_LABELS[m.month - 1]}</td>
                      {/* Target fields */}
                      {(['revenueTarget', 'revenueCourseTarget', 'revenueDesignTarget', 'expenseAdsTarget', 'expenseStaffTarget', 'profitTarget'] as const).map((field, fIdx) => (
                        <td key={field} className="px-1.5 py-1.5">
                          <input
                            type="number"
                            value={m[field]}
                            onChange={e => handleEditFieldChange(idx, field, e.target.value)}
                            className="w-full text-right bg-slate-50 border border-slate-200 rounded-lg text-base md:text-xs font-mono text-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition"
                          />
                        </td>
                      ))}
                      {/* Actual fields */}
                      {(['actualRevenue', 'actualRevenueCourse', 'actualRevenueDesign', 'actualExpenseAds', 'actualProfit'] as const).map((field, fIdx) => (
                        <td key={field} className={`px-1.5 py-1.5 ${fIdx === 0 ? 'border-l-2 border-primary/20' : ''}`}>
                          <input
                            type="number"
                            value={m[field] ?? ''}
                            onChange={e => handleEditFieldChange(idx, field, e.target.value)}
                            placeholder="—"
                            className="w-full text-right bg-primary/[0.03] border border-primary/15 rounded-lg text-base md:text-xs font-mono text-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition placeholder:text-slate-300"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Modal Body - Accordion style */}
            <div className="block md:hidden p-4 max-h-[60vh] overflow-y-auto space-y-2 bg-slate-50" id="goals_edit_accordion_mobile">
              {editingGoal.months.map((m, idx) => {
                const isOpen = expandedEditMonth === m.month;
                return (
                  <div key={m.month} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    {/* Header bar */}
                    <button
                      onClick={() => setExpandedEditMonth(isOpen ? null : m.month)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
                    >
                      <span className="font-bold text-slate-700 text-xs">
                        Tháng {m.month} ({MONTH_LABELS[m.month - 1]})
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Content panels */}
                    {isOpen && (
                      <div className="p-4 space-y-4 bg-white animate-fade-in text-[11px]">
                        {/* Section: Mục tiêu */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-primary border-b border-primary/10 pb-1 uppercase tracking-wide text-[10px]">Chỉ tiêu mục tiêu</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-400 block mb-1">DT Tổng:</label>
                              <input
                                type="number"
                                value={m.revenueTarget}
                                onChange={e => handleEditFieldChange(idx, 'revenueTarget', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">DT Khóa học:</label>
                              <input
                                type="number"
                                value={m.revenueCourseTarget}
                                onChange={e => handleEditFieldChange(idx, 'revenueCourseTarget', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">DT Thiết kế:</label>
                              <input
                                type="number"
                                value={m.revenueDesignTarget}
                                onChange={e => handleEditFieldChange(idx, 'revenueDesignTarget', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">CP Quảng cáo:</label>
                              <input
                                type="number"
                                value={m.expenseAdsTarget}
                                onChange={e => handleEditFieldChange(idx, 'expenseAdsTarget', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">CP Nhân sự:</label>
                              <input
                                type="number"
                                value={m.expenseStaffTarget}
                                onChange={e => handleEditFieldChange(idx, 'expenseStaffTarget', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">Lợi nhuận:</label>
                              <input
                                type="number"
                                value={m.profitTarget}
                                onChange={e => handleEditFieldChange(idx, 'profitTarget', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Section: Thực tế đạt */}
                        <div className="space-y-3 pt-2">
                          <h4 className="font-bold text-emerald-600 border-b border-emerald-500/10 pb-1 uppercase tracking-wide text-[10px]">Số liệu thực đạt</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-400 block mb-1">DT Thực:</label>
                              <input
                                type="number"
                                value={m.actualRevenue ?? ''}
                                onChange={e => handleEditFieldChange(idx, 'actualRevenue', e.target.value)}
                                placeholder="—"
                                className="w-full p-2 bg-emerald-50/10 border border-emerald-500/15 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">KH Thực:</label>
                              <input
                                type="number"
                                value={m.actualRevenueCourse ?? ''}
                                onChange={e => handleEditFieldChange(idx, 'actualRevenueCourse', e.target.value)}
                                placeholder="—"
                                className="w-full p-2 bg-emerald-50/10 border border-emerald-500/15 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">TK Thực:</label>
                              <input
                                type="number"
                                value={m.actualRevenueDesign ?? ''}
                                onChange={e => handleEditFieldChange(idx, 'actualRevenueDesign', e.target.value)}
                                placeholder="—"
                                className="w-full p-2 bg-emerald-50/10 border border-emerald-500/15 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">CP QC Thực:</label>
                              <input
                                type="number"
                                value={m.actualExpenseAds ?? ''}
                                onChange={e => handleEditFieldChange(idx, 'actualExpenseAds', e.target.value)}
                                placeholder="—"
                                className="w-full p-2 bg-emerald-50/10 border border-emerald-500/15 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-slate-400 block mb-1">LN Thực:</label>
                              <input
                                type="number"
                                value={m.actualProfit ?? ''}
                                onChange={e => handleEditFieldChange(idx, 'actualProfit', e.target.value)}
                                placeholder="—"
                                className="w-full p-2 bg-emerald-50/10 border border-emerald-500/15 rounded-lg text-base font-mono text-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => { setShowEditModal(false); setEditingGoal(null); }}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent-orange text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Sub-component: Summary Card =====
interface SummaryCardProps {
  label: string;
  target: number;
  actual: number;
  pct: number;
  icon: React.ReactNode;
  hasData: boolean;
}

function SummaryCard({ label, target, actual, pct, icon, hasData }: SummaryCardProps) {
  const clampedPct = Math.min(pct, 100);
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans leading-tight">
          {label}
        </span>
        <div className={`p-2 rounded-xl transition-colors ${getPctBgLight(pct)}`}>
          {icon}
        </div>
      </div>

      {/* Target */}
      <div className="mb-1">
        <span className="text-[10px] text-slate-400">Mục tiêu:</span>
        <p className="text-sm font-bold font-mono text-slate-700 tracking-tight">{formatVND(target)}</p>
      </div>

      {/* Actual */}
      <div className="mb-3">
        <span className="text-[10px] text-slate-400">Thực đạt:</span>
        <p className="text-sm font-bold font-mono tracking-tight">
          {hasData ? (
            <span className={pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}>
              {formatVND(actual)}
            </span>
          ) : (
            <span className="text-slate-300">Chưa có dữ liệu</span>
          )}
        </p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400">Hoàn thành</span>
          <span className={`text-xs font-bold font-mono ${getPctColor(pct)}`}>
            {hasData ? `${pct}%` : '—'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            style={{ width: `${hasData ? clampedPct : 0}%` }}
            className={`h-2 rounded-full transition-all duration-700 ease-out ${getPctBg(pct)}`}
          />
        </div>
      </div>
    </div>
  );
}

