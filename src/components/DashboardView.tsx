/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Clock,
  Briefcase,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign,
  Percent,
  LayoutDashboard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Customer, Order, Course, DesignService, Collaborator, AutomationLog, Expense, YearlyGoal } from '../types';

interface DashboardViewProps {
  customers: Customer[];
  orders: Order[];
  courses: Course[];
  designs: DesignService[];
  collaborators: Collaborator[];
  logs: AutomationLog[];
  expenses: Expense[];
  goals: YearlyGoal[];
  onNavigate: (tab: string) => void;
  googleSheetUrl?: string;
  isSyncing?: boolean;
}

const COLORS = ['#FF3B30', '#1B1325', '#FFA726', '#D946EF', '#7C3AED'];
const EXPENSE_COLORS = ['#FF3B30', '#7C3AED', '#FFA726', '#D946EF', '#3B82F6', '#10B981', '#1B1325'];

export default function DashboardView({
  customers,
  orders,
  courses,
  designs,
  collaborators,
  logs,
  expenses,
  goals,
  onNavigate,
  googleSheetUrl = '',
  isSyncing = false
}: DashboardViewProps) {
  // Time filters: 'day' (today), 'week' (this week), 'month' (this month), 'quarter' (this quarter), 'year' (this year), 'custom' (start/end date)
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('day');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTodayStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => {
    return getTodayStr(currentDateTime);
  }, [currentDateTime]);

  const weekRange = useMemo(() => {
    const d = new Date(currentDateTime);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: getTodayStr(monday),
      end: getTodayStr(sunday)
    };
  }, [currentDateTime]);

  const monthRange = useMemo(() => {
    const year = currentDateTime.getFullYear();
    const month = currentDateTime.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      start: getTodayStr(firstDay),
      end: getTodayStr(lastDay)
    };
  }, [currentDateTime]);

  const quarterRange = useMemo(() => {
    const year = currentDateTime.getFullYear();
    const month = currentDateTime.getMonth();
    const quarter = Math.floor(month / 3);
    const firstDay = new Date(year, quarter * 3, 1);
    const lastDay = new Date(year, (quarter + 1) * 3, 0);
    return {
      start: getTodayStr(firstDay),
      end: getTodayStr(lastDay)
    };
  }, [currentDateTime]);

  const yearRange = useMemo(() => {
    const year = currentDateTime.getFullYear();
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    };
  }, [currentDateTime]);

  const formattedDateTime = useMemo(() => {
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const year = currentDateTime.getFullYear();
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }, [currentDateTime]);

  // Filter lists based on time range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = o.createdAt.substring(0, 10);
      if (timeFilter === 'day') return d === todayStr;
      if (timeFilter === 'week') return d >= weekRange.start && d <= weekRange.end;
      if (timeFilter === 'month') return d >= monthRange.start && d <= monthRange.end;
      if (timeFilter === 'quarter') return d >= quarterRange.start && d <= quarterRange.end;
      if (timeFilter === 'year') return d >= yearRange.start && d <= yearRange.end;
      if (timeFilter === 'custom') {
        return (!customStart || d >= customStart) && (!customEnd || d <= customEnd);
      }
      return true;
    });
  }, [orders, timeFilter, customStart, customEnd, todayStr, weekRange, monthRange, quarterRange, yearRange]);

  const filteredDesigns = useMemo(() => {
    return designs.filter(d => {
      const dateStr = d.createdAt ? d.createdAt.substring(0, 10) : d.deadline;
      if (timeFilter === 'day') return dateStr === todayStr;
      if (timeFilter === 'week') return dateStr >= weekRange.start && dateStr <= weekRange.end;
      if (timeFilter === 'month') return dateStr >= monthRange.start && dateStr <= monthRange.end;
      if (timeFilter === 'quarter') return dateStr >= quarterRange.start && dateStr <= quarterRange.end;
      if (timeFilter === 'year') return dateStr >= yearRange.start && dateStr <= yearRange.end;
      if (timeFilter === 'custom') {
        return (!customStart || dateStr >= customStart) && (!customEnd || dateStr <= customEnd);
      }
      return true;
    });
  }, [designs, timeFilter, customStart, customEnd, todayStr, weekRange, monthRange, quarterRange, yearRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = e.date;
      if (timeFilter === 'day') return d === todayStr;
      if (timeFilter === 'week') return d >= weekRange.start && d <= weekRange.end;
      if (timeFilter === 'month') return d >= monthRange.start && d <= monthRange.end;
      if (timeFilter === 'quarter') return d >= quarterRange.start && d <= quarterRange.end;
      if (timeFilter === 'year') return d >= yearRange.start && d <= yearRange.end;
      if (timeFilter === 'custom') {
        return (!customStart || d >= customStart) && (!customEnd || d <= customEnd);
      }
      return true;
    });
  }, [expenses, timeFilter, customStart, customEnd, todayStr, weekRange, monthRange, quarterRange, yearRange]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const d = c.createdAt.substring(0, 10);
      if (timeFilter === 'day') return d === todayStr;
      if (timeFilter === 'week') return d >= weekRange.start && d <= weekRange.end;
      if (timeFilter === 'month') return d >= monthRange.start && d <= monthRange.end;
      if (timeFilter === 'quarter') return d >= quarterRange.start && d <= quarterRange.end;
      if (timeFilter === 'year') return d >= yearRange.start && d <= yearRange.end;
      if (timeFilter === 'custom') {
        return (!customStart || d >= customStart) && (!customEnd || d <= customEnd);
      }
      return true;
    });
  }, [customers, timeFilter, customStart, customEnd, todayStr, weekRange, monthRange, quarterRange, yearRange]);

  // Financial KPIs
  const totalRevenue = useMemo(() => {
    const orderRev = filteredOrders
      .filter(o => o.paymentStatus === 'Đã thanh toán')
      .reduce((sum, o) => sum + o.price, 0);
    const designRev = filteredDesigns
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return orderRev + designRev;
  }, [filteredOrders, filteredDesigns]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const netProfit = useMemo(() => {
    return totalRevenue - totalExpense;
  }, [totalRevenue, totalExpense]);

  const profitMarginPercent = useMemo(() => {
    if (totalRevenue <= 0) return 0;
    return Math.round((netProfit / totalRevenue) * 100);
  }, [totalRevenue, netProfit]);

  const conversionRatePercent = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    const paidCount = filteredOrders.filter(o => o.paymentStatus === 'Đã thanh toán').length;
    return Math.round((paidCount / filteredOrders.length) * 100);
  }, [filteredOrders]);

  const currentMonthStr = useMemo(() => {
    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentDateTime]);

  // Extra KPI definitions
  const monthRevenue = useMemo(() => {
    const orderMonthRev = orders
      .filter(o => o.paymentStatus === 'Đã thanh toán' && o.createdAt.substring(0, 7) === currentMonthStr)
      .reduce((sum, o) => sum + o.price, 0);
    const designMonthRev = designs
      .filter(d => {
        const dateStr = d.createdAt ? d.createdAt.substring(0, 7) : d.deadline.substring(0, 7);
        return dateStr === currentMonthStr;
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return orderMonthRev + designMonthRev;
  }, [orders, designs, currentMonthStr]);

  const currentMonthCustomers = useMemo(() => {
    return customers.filter(c => c.createdAt.substring(0, 7) === currentMonthStr).length;
  }, [customers, currentMonthStr]);

  const currentMonthOrders = useMemo(() => {
    return orders.filter(o => o.createdAt.substring(0, 7) === currentMonthStr).length;
  }, [orders, currentMonthStr]);

  const activeDesigns = useMemo(() => {
    return designs.filter(d => d.status === 'Đang làm' || d.status === 'Chỉnh sửa').length;
  }, [designs]);

  const upcomingDeadlines = useMemo(() => {
    // Current date and next 3 days
    const dates = [];
    for (let i = 0; i <= 3; i++) {
      const d = new Date(currentDateTime);
      d.setDate(currentDateTime.getDate() + i);
      dates.push(getTodayStr(d));
    }
    return designs.filter(d => {
      if (d.status === 'Hoàn thành') return false;
      const dl = d.deadline;
      return dl && dates.includes(dl);
    }).length;
  }, [designs, currentDateTime]);

  // 2. Charts Data Prep
  // Revenue by product (course)
  const productRevenueData = useMemo(() => {
    const counts: { [name: string]: number } = {};
    filteredOrders
      .filter(o => o.paymentStatus === 'Đã thanh toán')
      .forEach(o => {
        counts[o.productName] = (counts[o.productName] || 0) + o.price;
      });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredOrders]);

  // Operational Expenses Breakdown
  const expensesBreakdownData = useMemo(() => {
    const counts: { [name: string]: number } = {};
    filteredExpenses.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.amount;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredExpenses]);

  // Design executors workload / revenue generated
  const collaboratorPerformanceData = useMemo(() => {
    return collaborators.map(c => {
      const ctvExpenses = filteredExpenses.filter(e => 
        e.category === 'Trả lương' && e.description.includes(c.name)
      );
      const salaryInPeriod = ctvExpenses.reduce((sum, e) => sum + e.amount, 0);
      const revenueInPeriod = Math.round(salaryInPeriod / 0.3);

      return {
        name: c.name.replace(' (CTV)', ''),
        'Doanh thu tạo ra': revenueInPeriod || c.revenue,
        'Lương nhận': salaryInPeriod || c.salary
      };
    });
  }, [collaborators, filteredExpenses]);

  // Monthly Revenue Trend (constructed dynamically from goals and current orders/designs)
  const monthlyRevenueTrend = useMemo(() => {
    const dataMap: { [month: string]: number } = {};
    
    // Find goals for 2026
    const goal2026 = goals.find(g => g.year === 2026);
    
    // Populate historical actual revenues for Month 1 to Month 5
    for (let m = 1; m <= 5; m++) {
      const monthLabel = `Tháng ${String(m).padStart(2, '0')}`;
      const targetMonth = goal2026?.months.find(mo => mo.month === m);
      dataMap[monthLabel] = targetMonth?.actualRevenue || 0;
    }
    
    // Compute current/future month revenues from actual paid orders and designs
    filteredOrders
      .filter(o => o.paymentStatus === 'Đã thanh toán')
      .forEach(o => {
        const monthNum = o.createdAt.substring(5, 7);
        const monthLabel = `Tháng ${monthNum}`;
        dataMap[monthLabel] = (dataMap[monthLabel] || 0) + o.price;
      });

    filteredDesigns.forEach(d => {
      const dateStr = d.createdAt || d.deadline;
      const monthNum = dateStr.substring(5, 7);
      const monthLabel = `Tháng ${monthNum}`;
      dataMap[monthLabel] = (dataMap[monthLabel] || 0) + (d.amount || 0);
    });
      
    return Object.keys(dataMap)
      .sort()
      .map(m => ({
        name: m,
        'Doanh thu VND': dataMap[m]
      }));
  }, [filteredOrders, filteredDesigns, goals]);

  return (
    <div className="space-y-4 md:space-y-8 animate-fade-in" id="dashboard_view_container">
      {/* Page Title Block */}
      <div className="flex justify-between items-center bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm" id="dashboard_page_title">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-secondary font-sans flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Bảng Tổng Quan Hệ Thống CRM
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Thống kê tình hình kinh doanh, doanh thu, chi phí, lợi nhuận và hiệu suất vận hành.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-mono text-xs font-semibold text-slate-650">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Hôm nay: {formattedDateTime}</span>
          </div>
          {isSyncing ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-xl text-xs font-bold font-sans border border-amber-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Đang đồng bộ...
            </div>
          ) : googleSheetUrl ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold font-sans border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Đã kết nối Sheets
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/10 text-slate-500 rounded-xl text-xs font-bold font-sans border border-slate-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Chưa kết nối Sheets
            </div>
          )}
        </div>
      </div>

      {/* Time Filter Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4" id="dashboard_time_filter">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-secondary uppercase font-sans tracking-wider">Bộ Lọc Dữ Liệu Theo Thời Gian</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-50 p-1 border border-slate-150 rounded-xl">
            {(['day', 'week', 'month', 'quarter', 'year', 'custom'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  timeFilter === f ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f === 'day' ? 'Ngày' :
                 f === 'week' ? 'Tuần' :
                 f === 'month' ? 'Tháng' :
                 f === 'quarter' ? 'Quý' :
                 f === 'year' ? 'Năm' : 'Tùy chọn'}
              </button>
            ))}
          </div>

          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-slate-700 font-sans"
              />
              <span className="text-slate-400 text-xs">đến</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-slate-700 font-sans"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" id="kpi_cards_grid">
        {/* Doanh thu */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_revenue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">DOANH THU</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold font-mono tracking-tight text-slate-800">
              {formatVND(totalRevenue)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Tổng thu đơn hàng thành công</p>
          </div>
        </div>

        {/* Chi phí */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_expense">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">CHI PHÍ VẬN HÀNH</span>
            <div className="p-2 bg-red-50 text-red-650 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold font-mono tracking-tight text-slate-800">
              {formatVND(totalExpense)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Chi phí quảng cáo, lương, thuê...</p>
          </div>
        </div>

        {/* Lợi nhuận */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_profit">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">LỢI NHUẬN RÒNG</span>
            <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-lg font-bold font-mono tracking-tight ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatVND(netProfit)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Doanh thu - Chi phí thực tế</p>
          </div>
        </div>

        {/* Tỉ lệ lợi nhuận % */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_margin">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">TỶ SUẤT LỢI NHUẬN</span>
            <div className="p-2 bg-blue-50 text-blue-650 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {profitMarginPercent}%
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Tỉ lệ lợi nhuận / doanh thu</p>
          </div>
        </div>

        {/* Doanh thu tháng */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_month_revenue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">DT THÁNG (T{currentDateTime.getMonth() + 1})</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold font-mono tracking-tight text-slate-800">
              {formatVND(monthRevenue)}
            </span>
            <p className="text-[10px] text-emerald-600 mt-1 font-sans">Tự động đối soát Apps Script</p>
          </div>
        </div>

        {/* Số khách mới */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_new_customers">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">KHÁCH MỚI (T{currentDateTime.getMonth() + 1})</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {currentMonthCustomers}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Khách hàng đăng ký mới</p>
          </div>
        </div>

        {/* Số đơn hàng mới */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_new_orders">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">ĐƠN MỚI (T{currentDateTime.getMonth() + 1})</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {currentMonthOrders}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Mua khóa học / Dịch vụ</p>
          </div>
        </div>

        {/* Đơn đang làm */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_active_designs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">ĐƠN THIẾT KẾ</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {activeDesigns}
            </span>
            <p className="text-[10px] text-amber-600 mt-1 font-sans">CTV đang thực hiện</p>
          </div>
        </div>

        {/* Đơn sắp deadline */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_upcoming_deadlines">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">CẦN GẤP (KPI)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {upcomingDeadlines}
            </span>
            <p className="text-[10px] text-rose-500 mt-1 font-sans">Trước ngày deadline thiết kế</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="charts_grid">
        {/* Doanh thu theo tháng */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="chart_monthly_revenue">
          <div>
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Biểu Đồ Doanh Thu Theo Tháng
            </h3>
            <p className="text-xs text-slate-400 font-sans">Kết quả thực tế tính lũy kế đến hôm nay</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000000}M`} />
                <Tooltip formatter={(value: any) => [formatVND(value), 'Doanh thu']} />
                <Line type="monotone" dataKey="Doanh thu VND" stroke="#1B1325" strokeWidth={3} activeDot={{ r: 8, stroke: '#FF3B30' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doanh thu theo khóa học */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="chart_product_distribution">
          <div>
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Sản Phẩm & Khóa Học
            </h3>
            <p className="text-xs text-slate-400 font-sans">Doanh thu phân bổ theo các gói</p>
          </div>
          <div className="h-56 flex items-center justify-center mt-4">
            {productRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productRevenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatVND(value), 'Doanh thu']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 font-mono">Chưa ghi nhận doanh thu khóa học</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {productRevenueData.slice(0, 3).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate max-w-[120px] text-slate-600 font-sans font-medium">{item.name}</span>
                </div>
                <span className="text-slate-800 font-mono font-semibold">{formatVND(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chi phí theo danh mục */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="chart_expense_distribution">
          <div>
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              Cơ Cấu Chi Phí Vận Hành
            </h3>
            <p className="text-xs text-slate-400 font-sans">Chi phí theo nhóm hoạt động</p>
          </div>
          <div className="h-56 flex items-center justify-center mt-4">
            {expensesBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatVND(value), 'Chi phí']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 font-mono text-center">Chưa ghi nhận chi phí vận hành</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {expensesBreakdownData.slice(0, 3).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}></span>
                  <span className="truncate max-w-[120px] text-slate-600 font-sans font-medium">{item.name}</span>
                </div>
                <span className="text-slate-800 font-mono font-semibold">{formatVND(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTV performance */}
        <div className="lg:col-span-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between animate-fade-in" id="chart_ctv_performance">
          <div>
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Hiệu Suất Cộng Tác Viên & Lương CTV (KPI)
            </h3>
            <p className="text-xs text-slate-400 font-sans">Cơ chế tự động đối soát trích xuất % dựa trên dịch vụ thiết kế hoàn thành</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collaboratorPerformanceData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000000}M`} />
                <Tooltip formatter={(value: any) => [formatVND(value)]} />
                <Legend />
                <Bar dataKey="Doanh thu tạo ra" fill="#1B1325" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lương nhận" fill="#FF3B30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sheet Activity logs & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="activity_and_shortcuts">
        {/* Apps Script Automation Status */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="automation_logs">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Nhật Ký Tác Vụ Tự Động Hóa (Apps Script Simulator)
              </h3>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-mono">Real-time</span>
            </div>
            <p className="text-xs text-slate-400 font-sans">Theo dõi thời hạn và cấp quyền chia sẻ thư mục Google Drive tự động cho học viên</p>
          </div>
          <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-700 font-sans font-medium">{log.message}</p>
                    <div className="flex gap-2 items-center text-[10px] text-slate-400">
                      <span>Mã: {log.orderId}</span>
                      <span>•</span>
                      <span>Bước {log.step}/5</span>
                      <span>•</span>
                      <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center font-mono">Chưa phát sinh tác vụ tự động hóa hôm nay</p>
            )}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="system_shortcuts">
          <div>
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Lối Tắt Hành Động
            </h3>
            <p className="text-xs text-slate-400 font-sans">Thực hiện nhanh các CRM actions</p>
          </div>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => onNavigate('orders')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition text-xs font-semibold text-slate-700 text-left"
            >
              <span>Kích hoạt khóa học (Thanh toán)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('marketing')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition text-xs font-semibold text-slate-700 text-left"
            >
              <span>Gửi email chăm sóc khách Canva</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition text-xs font-semibold text-slate-700 text-left"
            >
              <span>Hỏi Gemini: "Khóa học nào bán chạy nhất?"</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
