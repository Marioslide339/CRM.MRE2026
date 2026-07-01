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
  const [selectedDayOption, setSelectedDayOption] = useState<'today' | 'yesterday' | '7days' | '30days'>('today');
  const [selectedWeekOption, setSelectedWeekOption] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMonthOption, setSelectedMonthOption] = useState<number>(new Date().getMonth() + 1);
  const [selectedQuarterOption, setSelectedQuarterOption] = useState<1 | 2 | 3 | 4>(1);
  const [selectedYearOption, setSelectedYearOption] = useState<number>(new Date().getFullYear());
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

  // Convert any date string (ISO UTC or plain YYYY-MM-DD) to local date string YYYY-MM-DD
  // This fixes timezone issues: new Date().toISOString() stores UTC, but we compare with local date
  const toLocalDateStr = (dateStr: string): string => {
    if (!dateStr) return '';
    // If it's already a plain date (YYYY-MM-DD, 10 chars, no T), return as-is
    if (dateStr.length === 10 && !dateStr.includes('T')) return dateStr;
    // Parse as Date object and use LOCAL time methods
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.substring(0, 10);
    return getTodayStr(d);
  };

  const todayStr = useMemo(() => {
    return getTodayStr(currentDateTime);
  }, [currentDateTime]);

  const activeRange = useMemo(() => {
    const today = new Date(currentDateTime);
    
    if (timeFilter === 'day') {
      if (selectedDayOption === 'today') {
        const str = getTodayStr(today);
        return { start: str, end: str };
      } else if (selectedDayOption === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const str = getTodayStr(yesterday);
        return { start: str, end: str };
      } else if (selectedDayOption === '7days') {
        const start = new Date(today);
        start.setDate(today.getDate() - 6); // 7 days including today
        return { start: getTodayStr(start), end: getTodayStr(today) };
      } else if (selectedDayOption === '30days') {
        const start = new Date(today);
        start.setDate(today.getDate() - 29); // 30 days including today
        return { start: getTodayStr(start), end: getTodayStr(today) };
      }
    }
    
    if (timeFilter === 'week') {
      const year = selectedYearOption;
      const month = selectedMonthOption - 1; // 0-indexed
      if (selectedWeekOption === 1) {
        return {
          start: `${year}-${String(month + 1).padStart(2, '0')}-01`,
          end: `${year}-${String(month + 1).padStart(2, '0')}-07`
        };
      } else if (selectedWeekOption === 2) {
        return {
          start: `${year}-${String(month + 1).padStart(2, '0')}-08`,
          end: `${year}-${String(month + 1).padStart(2, '0')}-14`
        };
      } else if (selectedWeekOption === 3) {
        return {
          start: `${year}-${String(month + 1).padStart(2, '0')}-15`,
          end: `${year}-${String(month + 1).padStart(2, '0')}-21`
        };
      } else {
        const lastDay = new Date(year, month + 1, 0).getDate();
        return {
          start: `${year}-${String(month + 1).padStart(2, '0')}-22`,
          end: `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        };
      }
    }
    
    if (timeFilter === 'month') {
      const year = selectedYearOption;
      const month = selectedMonthOption - 1; // 0-indexed
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        start: getTodayStr(firstDay),
        end: getTodayStr(lastDay)
      };
    }
    
    if (timeFilter === 'quarter') {
      const year = selectedYearOption;
      if (selectedQuarterOption === 1) {
        return { start: `${year}-01-01`, end: `${year}-03-31` };
      } else if (selectedQuarterOption === 2) {
        return { start: `${year}-04-01`, end: `${year}-06-30` };
      } else if (selectedQuarterOption === 3) {
        return { start: `${year}-07-01`, end: `${year}-09-30` };
      } else {
        return { start: `${year}-10-01`, end: `${year}-12-31` };
      }
    }
    
    if (timeFilter === 'year') {
      const year = selectedYearOption;
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`
      };
    }
    
    if (timeFilter === 'custom') {
      return {
        start: customStart || '1970-01-01',
        end: customEnd || '9999-12-31'
      };
    }
    
    const todayS = getTodayStr(today);
    return { start: todayS, end: todayS };
  }, [timeFilter, selectedDayOption, selectedWeekOption, selectedMonthOption, selectedYearOption, customStart, customEnd, currentDateTime]);

  const formattedDateTime = useMemo(() => {
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const year = currentDateTime.getFullYear();
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }, [currentDateTime]);

  // Filter lists based on time range (using local date conversion)
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.orderType === 'Gửi lại') return false;
      const d = toLocalDateStr(o.createdAt);
      return d >= activeRange.start && d <= activeRange.end;
    });
  }, [orders, activeRange]);

  const getDesignDateStr = (d: DesignService): string => {
    if (d.createdAt) {
      return toLocalDateStr(d.createdAt);
    }
    return d.deadline || '';
  };

  const filteredDesigns = useMemo(() => {
    return designs.filter(d => {
      const dateStr = getDesignDateStr(d);
      if (!dateStr) return false;
      return dateStr >= activeRange.start && dateStr <= activeRange.end;
    });
  }, [designs, activeRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = e.date;
      return d >= activeRange.start && d <= activeRange.end;
    });
  }, [expenses, activeRange]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const d = toLocalDateStr(c.createdAt);
      return d >= activeRange.start && d <= activeRange.end;
    });
  }, [customers, activeRange]);

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


  // Extra KPI definitions - now all use filtered data to react to time filter
  const filteredPaidRevenue = useMemo(() => {
    const orderRev = filteredOrders
      .filter(o => o.paymentStatus === 'Đã thanh toán')
      .reduce((sum, o) => sum + o.price, 0);
    const designRev = filteredDesigns
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return orderRev + designRev;
  }, [filteredOrders, filteredDesigns]);

  const activeDesigns = useMemo(() => {
    return designs.filter(d => d.status !== 'Hoàn thành').length;
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
  // Revenue structure breakdown (courses & design services)
  const revenueStructureData = useMemo(() => {
    const courseItemsMap: { [name: string]: number } = {};
    const designItemsMap: { [name: string]: number } = {};

    // 1. Accumulate paid courses (orders)
    filteredOrders
      .filter(o => o.paymentStatus === 'Đã thanh toán')
      .forEach(o => {
        courseItemsMap[o.productName] = (courseItemsMap[o.productName] || 0) + o.price;
      });

    // 2. Accumulate design services
    filteredDesigns.forEach(d => {
      const serviceName = d.serviceType || 'Thiết kế PowerPoint';
      designItemsMap[serviceName] = (designItemsMap[serviceName] || 0) + (d.amount || 0);
    });

    // Convert to sorted arrays
    const sortedCourseItems = Object.keys(courseItemsMap)
      .map(name => ({
        name,
        value: courseItemsMap[name],
        type: 'course' as const
      }))
      .sort((a, b) => b.value - a.value);

    const sortedDesignItems = Object.keys(designItemsMap)
      .map(name => ({
        name,
        value: designItemsMap[name],
        type: 'design' as const
      }))
      .sort((a, b) => b.value - a.value);

    const totalCourseRev = sortedCourseItems.reduce((sum, item) => sum + item.value, 0);
    const totalDesignRev = sortedDesignItems.reduce((sum, item) => sum + item.value, 0);

    // Outer Ring Data (2 main colors: Course & Design)
    const outerRingData = [];
    if (totalCourseRev > 0) {
      outerRingData.push({
        name: 'Khóa học',
        value: totalCourseRev,
        type: 'course' as const,
        color: '#6366F1' // Premium Indigo
      });
    }
    if (totalDesignRev > 0) {
      outerRingData.push({
        name: 'Thiết kế',
        value: totalDesignRev,
        type: 'design' as const,
        color: '#F97316' // Premium Orange
      });
    }

    // Assign matching shades to inner ring items
    const courseShades = [
      '#4F46E5', // indigo-600
      '#6366F1', // indigo-500
      '#818CF8', // indigo-400
      '#A5B4FC', // indigo-300
      '#C7D2FE', // indigo-200
      '#E0E7FF'  // indigo-100
    ];

    const designShades = [
      '#EA580C', // orange-600
      '#F97316', // orange-500
      '#FB923C', // orange-400
      '#FDBA74', // orange-300
      '#FED7AA', // orange-200
      '#FFEDD5'  // orange-100
    ];

    const innerRingData: { name: string; value: number; type: 'course' | 'design'; color: string; displayName: string }[] = [];

    sortedCourseItems.forEach((item, index) => {
      innerRingData.push({
        ...item,
        color: courseShades[index % courseShades.length],
        displayName: `[Khóa học] ${item.name}`
      });
    });

    sortedDesignItems.forEach((item, index) => {
      innerRingData.push({
        ...item,
        color: designShades[index % designShades.length],
        displayName: `[Thiết kế] ${item.name}`
      });
    });

    return {
      outerRingData,
      innerRingData,
      totalRevenue: totalCourseRev + totalDesignRev
    };
  }, [filteredOrders, filteredDesigns]);

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

  const trendChartData = useMemo(() => {
    // 1. Hourly breakdown (for today / yesterday)
    if (timeFilter === 'day' && (selectedDayOption === 'today' || selectedDayOption === 'yesterday')) {
      const bins = Array.from({ length: 24 }, (_, i) => ({
        name: `${String(i).padStart(2, '0')}:00`,
        'Doanh thu': 0,
        'Chi phí': 0,
        'Lợi nhuận': 0
      }));

      filteredOrders.forEach(o => {
        if (o.paymentStatus === 'Đã thanh toán') {
          const hr = new Date(o.createdAt).getHours();
          if (hr >= 0 && hr < 24) bins[hr]['Doanh thu'] += o.price;
        }
      });

      filteredDesigns.forEach(d => {
        const dateStr = d.createdAt || d.deadline;
        const hr = new Date(dateStr).getHours();
        if (hr >= 0 && hr < 24) bins[hr]['Doanh thu'] += d.amount || 0;
      });

      filteredExpenses.forEach(e => {
        const hr = new Date(e.date).getHours();
        if (hr >= 0 && hr < 24) bins[hr]['Chi phí'] += e.amount;
      });

      bins.forEach(b => {
        b['Lợi nhuận'] = b['Doanh thu'] - b['Chi phí'];
      });

      return bins;
    }

    // 2. Yearly breakdown (for year filter)
    if (timeFilter === 'year') {
      const currentYear = selectedYearOption;
      const activeMonthNum = (selectedYearOption === new Date().getFullYear()) ? new Date().getMonth() + 1 : 13;
      const goalForYear = goals.find(g => g.year === currentYear) || goals[0];

      const bins = Array.from({ length: 12 }, (_, i) => {
        const mNum = i + 1;
        return {
          name: `Tháng ${String(mNum).padStart(2, '0')}`,
          month: mNum,
          'Doanh thu': 0,
          'Chi phí': 0,
          'Lợi nhuận': 0
        };
      });

      bins.forEach(b => {
        if (b.month < activeMonthNum) {
          const targetMonth = goalForYear?.months.find(mo => mo.month === b.month);
          if (targetMonth) {
            b['Doanh thu'] = targetMonth.actualRevenue || 0;
            b['Chi phí'] = (targetMonth.actualExpenseAds || 0) + (targetMonth.actualExpenseOther || 0);
            b['Lợi nhuận'] = targetMonth.actualProfit || (b['Doanh thu'] - b['Chi phí']);
          }
        }
      });

      filteredOrders.forEach(o => {
        if (o.paymentStatus === 'Đã thanh toán') {
          const m = new Date(o.createdAt).getMonth() + 1;
          if (m >= activeMonthNum) {
            const bin = bins.find(b => b.month === m);
            if (bin) bin['Doanh thu'] += o.price;
          }
        }
      });

      filteredDesigns.forEach(d => {
        const dateStr = d.createdAt || d.deadline;
        const m = new Date(dateStr).getMonth() + 1;
        if (m >= activeMonthNum) {
          const bin = bins.find(b => b.month === m);
          if (bin) bin['Doanh thu'] += d.amount || 0;
        }
      });

      filteredExpenses.forEach(e => {
        const m = new Date(e.date).getMonth() + 1;
        if (m >= activeMonthNum) {
          const bin = bins.find(b => b.month === m);
          if (bin) bin['Chi phí'] += e.amount;
        }
      });

      bins.forEach(b => {
        if (b.month >= activeMonthNum) {
          b['Lợi nhuận'] = b['Doanh thu'] - b['Chi phí'];
        }
      });

      return bins;
    }

    // 2b. Quarterly breakdown (for quarter filter)
    if (timeFilter === 'quarter') {
      const year = selectedYearOption;
      const quarterStartMonth = (selectedQuarterOption - 1) * 3; // 0, 3, 6, 9

      const bins = Array.from({ length: 3 }, (_, i) => {
        const mNum = quarterStartMonth + i + 1;
        return {
          name: `Tháng ${String(mNum).padStart(2, '0')}`,
          month: mNum,
          'Doanh thu': 0,
          'Chi phí': 0,
          'Lợi nhuận': 0
        };
      });

      filteredOrders.forEach(o => {
        if (o.paymentStatus === 'Đã thanh toán') {
          const m = new Date(o.createdAt).getMonth() + 1;
          const bin = bins.find(b => b.month === m);
          if (bin) bin['Doanh thu'] += o.price;
        }
      });

      filteredDesigns.forEach(d => {
        const dateStr = d.createdAt || d.deadline;
        const m = new Date(dateStr).getMonth() + 1;
        const bin = bins.find(b => b.month === m);
        if (bin) bin['Doanh thu'] += d.amount || 0;
      });

      filteredExpenses.forEach(e => {
        const m = new Date(e.date).getMonth() + 1;
        const bin = bins.find(b => b.month === m);
        if (bin) bin['Chi phí'] += e.amount;
      });

      bins.forEach(b => {
        b['Lợi nhuận'] = b['Doanh thu'] - b['Chi phí'];
      });

      return bins;
    }

    // 3. Monthly breakdown (for month filter)
    if (timeFilter === 'month') {
      const year = selectedYearOption;
      const month = selectedMonthOption - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const bins = Array.from({ length: daysInMonth }, (_, i) => ({
        name: `Ngày ${String(i + 1).padStart(2, '0')}`,
        'Doanh thu': 0,
        'Chi phí': 0,
        'Lợi nhuận': 0
      }));

      filteredOrders.forEach(o => {
        if (o.paymentStatus === 'Đã thanh toán') {
          const d = new Date(o.createdAt).getDate();
          if (d >= 1 && d <= daysInMonth) {
            bins[d - 1]['Doanh thu'] += o.price;
          }
        }
      });

      filteredDesigns.forEach(d => {
        const dateStr = d.createdAt || d.deadline;
        const dVal = new Date(dateStr).getDate();
        if (dVal >= 1 && dVal <= daysInMonth) {
          bins[dVal - 1]['Doanh thu'] += d.amount || 0;
        }
      });

      filteredExpenses.forEach(e => {
        const dVal = new Date(e.date).getDate();
        if (dVal >= 1 && dVal <= daysInMonth) {
          bins[dVal - 1]['Chi phí'] += e.amount;
        }
      });

      bins.forEach(b => {
        b['Lợi nhuận'] = b['Doanh thu'] - b['Chi phí'];
      });

      return bins;
    }

    // 4. Daily breakdown (for 7days, 30days, week, custom)
    const startDate = new Date(activeRange.start);
    const endDate = new Date(activeRange.end);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 45) {
      const bins: { name: string; dateStr: string; 'Doanh thu': number; 'Chi phí': number; 'Lợi nhuận': number }[] = [];
      const curr = new Date(startDate);
      while (curr <= endDate) {
        const dStr = getTodayStr(curr);
        const label = `${String(curr.getDate()).padStart(2, '0')}/${String(curr.getMonth() + 1).padStart(2, '0')}`;
        bins.push({
          name: label,
          dateStr: dStr,
          'Doanh thu': 0,
          'Chi phí': 0,
          'Lợi nhuận': 0
        });
        curr.setDate(curr.getDate() + 1);
      }

      filteredOrders.forEach(o => {
        if (o.paymentStatus === 'Đã thanh toán') {
          const oDateStr = toLocalDateStr(o.createdAt);
          const bin = bins.find(b => b.dateStr === oDateStr);
          if (bin) bin['Doanh thu'] += o.price;
        }
      });

      filteredDesigns.forEach(d => {
        const dateStr = toLocalDateStr(d.createdAt || d.deadline);
        const bin = bins.find(b => b.dateStr === dateStr);
        if (bin) bin['Doanh thu'] += d.amount || 0;
      });

      filteredExpenses.forEach(e => {
        const bin = bins.find(b => b.dateStr === e.date);
        if (bin) bin['Chi phí'] += e.amount;
      });

      bins.forEach(b => {
        b['Lợi nhuận'] = b['Doanh thu'] - b['Chi phí'];
      });

      return bins;
    } else {
      // Monthly bins for ranges > 45 days
      const bins: { name: string; yearMonth: string; 'Doanh thu': number; 'Chi phí': number; 'Lợi nhuận': number }[] = [];
      const curr = new Date(startDate);
      curr.setDate(1);
      const endLimit = new Date(endDate);

      while (curr <= endLimit) {
        const ym = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        const label = `T${String(curr.getMonth() + 1).padStart(2, '0')}/${curr.getFullYear()}`;
        bins.push({
          name: label,
          yearMonth: ym,
          'Doanh thu': 0,
          'Chi phí': 0,
          'Lợi nhuận': 0
        });
        curr.setMonth(curr.getMonth() + 1);
      }

      filteredOrders.forEach(o => {
        if (o.paymentStatus === 'Đã thanh toán') {
          const oDate = new Date(o.createdAt);
          const ym = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, '0')}`;
          const bin = bins.find(b => b.yearMonth === ym);
          if (bin) bin['Doanh thu'] += o.price;
        }
      });

      filteredDesigns.forEach(d => {
        const dDate = new Date(d.createdAt || d.deadline);
        const ym = `${dDate.getFullYear()}-${String(dDate.getMonth() + 1).padStart(2, '0')}`;
        const bin = bins.find(b => b.yearMonth === ym);
        if (bin) bin['Doanh thu'] += d.amount || 0;
      });

      filteredExpenses.forEach(e => {
        const eDate = new Date(e.date);
        const ym = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`;
        const bin = bins.find(b => b.yearMonth === ym);
        if (bin) bin['Chi phí'] += e.amount;
      });

      bins.forEach(b => {
        b['Lợi nhuận'] = b['Doanh thu'] - b['Chi phí'];
      });

      return bins;
    }
  }, [filteredOrders, filteredDesigns, filteredExpenses, timeFilter, selectedDayOption, selectedWeekOption, selectedMonthOption, selectedYearOption, customStart, customEnd, currentDateTime, goals, activeRange]);

  // Dynamic Chart Title & Description
  const chartInfo = useMemo(() => {
    let title = 'Biểu Đồ Tài Tài Chính';
    let desc = 'Kết quả kinh doanh';
    
    if (timeFilter === 'day') {
      const optionLabel = selectedDayOption === 'today' ? 'Hôm nay' :
                          selectedDayOption === 'yesterday' ? 'Hôm qua' :
                          selectedDayOption === '7days' ? '7 ngày qua' : '30 ngày qua';
      title = `Biểu Đồ Tài Chính (${optionLabel})`;
      desc = selectedDayOption === 'today' || selectedDayOption === 'yesterday'
        ? 'Doanh thu, chi phí và lợi nhuận theo giờ trong ngày'
        : 'Doanh thu, chi phí và lợi nhuận theo ngày';
    } else if (timeFilter === 'week') {
      title = `Biểu Đồ Tài Chính (Tuần ${selectedWeekOption} - T${selectedMonthOption}/${selectedYearOption})`;
      desc = 'Doanh thu, chi phí và lợi nhuận các ngày trong tuần';
    } else if (timeFilter === 'month') {
      title = `Biểu Đồ Tài Chính (Tháng ${selectedMonthOption}/${selectedYearOption})`;
      desc = 'Doanh thu, chi phí và lợi nhuận các ngày trong tháng';
    } else if (timeFilter === 'quarter') {
      title = `Biểu Đồ Tài Chính (Quý ${selectedQuarterOption} - Năm ${selectedYearOption})`;
      desc = 'Doanh thu, chi phí và lợi nhuận chi tiết theo các tháng trong quý';
    } else if (timeFilter === 'year') {
      title = `Biểu Đồ Tài Chính (Năm ${selectedYearOption})`;
      desc = 'Doanh thu, chi phí và lợi nhuận các tháng trong năm';
    } else if (timeFilter === 'custom') {
      title = 'Biểu Đồ Tài Chính (Tùy chọn)';
      desc = 'Kết quả kinh doanh trong khoảng thời gian tùy chọn';
    }
    
    return { title, desc };
  }, [timeFilter, selectedDayOption, selectedWeekOption, selectedMonthOption, selectedYearOption]);

  const filterLabel = useMemo(() => {
    if (timeFilter === 'day') {
      return selectedDayOption === 'today' ? 'Hôm nay' :
             selectedDayOption === 'yesterday' ? 'Hôm qua' :
             selectedDayOption === '7days' ? '7 ngày qua' : '30 ngày qua';
    }
    if (timeFilter === 'week') {
      return `Tuần ${selectedWeekOption} (T${selectedMonthOption}/${selectedYearOption})`;
    }
    if (timeFilter === 'month') {
      return `Tháng ${selectedMonthOption}/${selectedYearOption}`;
    }
    if (timeFilter === 'quarter') {
      return `Quý ${selectedQuarterOption}/${selectedYearOption}`;
    }
    if (timeFilter === 'year') {
      return `Năm ${selectedYearOption}`;
    }
    return 'Tùy chọn';
  }, [timeFilter, selectedDayOption, selectedWeekOption, selectedMonthOption, selectedYearOption]);

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
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-mono text-xs font-semibold text-slate-600">
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
          <div className="flex bg-slate-50 p-1 border border-slate-100 rounded-xl">
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

          {timeFilter === 'day' && (
            <div className="flex bg-slate-50 p-1 border border-slate-100 rounded-xl animate-fade-in gap-0.5">
              {(['today', 'yesterday', '7days', '30days'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelectedDayOption(opt)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    selectedDayOption === opt ? 'bg-secondary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt === 'today' ? 'Hôm nay' :
                   opt === 'yesterday' ? 'Hôm qua' :
                   opt === '7days' ? '7 ngày qua' : '30 ngày qua'}
                </button>
              ))}
            </div>
          )}

          {timeFilter === 'week' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <select
                value={selectedWeekOption}
                onChange={e => setSelectedWeekOption(Number(e.target.value) as any)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                <option value={1}>Tuần 1</option>
                <option value={2}>Tuần 2</option>
                <option value={3}>Tuần 3</option>
                <option value={4}>Tuần 4</option>
              </select>
              <select
                value={selectedMonthOption}
                onChange={e => setSelectedMonthOption(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                value={selectedYearOption}
                onChange={e => setSelectedYearOption(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = 2026 + i;
                  return <option key={y} value={y}>Năm {y}</option>;
                })}
              </select>
            </div>
          )}

          {timeFilter === 'month' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <select
                value={selectedMonthOption}
                onChange={e => setSelectedMonthOption(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                value={selectedYearOption}
                onChange={e => setSelectedYearOption(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = 2026 + i;
                  return <option key={y} value={y}>Năm {y}</option>;
                })}
              </select>
            </div>
          )}

          {timeFilter === 'quarter' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <select
                value={selectedQuarterOption}
                onChange={e => setSelectedQuarterOption(Number(e.target.value) as any)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                <option value={1}>Quý 1</option>
                <option value={2}>Quý 2</option>
                <option value={3}>Quý 3</option>
                <option value={4}>Quý 4</option>
              </select>
              <select
                value={selectedYearOption}
                onChange={e => setSelectedYearOption(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = 2026 + i;
                  return <option key={y} value={y}>Năm {y}</option>;
                })}
              </select>
            </div>
          )}

          {timeFilter === 'year' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <select
                value={selectedYearOption}
                onChange={e => setSelectedYearOption(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = 2026 + i;
                  return <option key={y} value={y}>Năm {y}</option>;
                })}
              </select>
            </div>
          )}

          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-xs outline-none text-slate-700 font-sans"
              />
              <span className="text-slate-400 text-xs">đến</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-xs outline-none text-slate-700 font-sans"
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
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
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
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
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
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
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

        {/* Doanh thu theo bộ lọc */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_month_revenue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">DT ĐÃ THANH TOÁN ({filterLabel})</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold font-mono tracking-tight text-slate-800">
              {formatVND(filteredPaidRevenue)}
            </span>
            <p className="text-[10px] text-emerald-600 mt-1 font-sans">Tổng doanh thu đơn đã thanh toán</p>
          </div>
        </div>

        {/* Số khách mới */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="kpi_new_customers">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">KHÁCH MỚI ({filterLabel})</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {filteredCustomers.length}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Khách hàng đăng ký mới</p>
          </div>
        </div>

        {/* Số đơn hàng mới (spans 2 columns) */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between sm:col-span-2" id="kpi_new_orders">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">ĐƠN MỚI ({filterLabel})</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 divide-x divide-slate-100">
            {/* Left side: total */}
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
                {filteredOrders.length + filteredDesigns.filter(d => d.status !== 'Hoàn thành').length}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-sans font-semibold uppercase tracking-wider">Tổng số đơn</p>
            </div>
            
            {/* Right side: breakdown */}
            <div className="pl-4 flex flex-col justify-center gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span className="text-slate-500 font-sans font-medium truncate">Đơn khóa học:</span>
                </div>
                <span className="font-mono font-bold text-slate-800 ml-1 shrink-0">{filteredOrders.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                  <span className="text-slate-500 font-sans font-medium truncate">Đơn thiết kế:</span>
                </div>
                <span className="font-mono font-bold text-slate-800 ml-1 shrink-0">{filteredDesigns.filter(d => d.status !== 'Hoàn thành').length}</span>
              </div>
            </div>
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
              {chartInfo.title}
            </h3>
            <p className="text-xs text-slate-400 font-sans">{chartInfo.desc}</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={v => {
                    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1).replace('.0', '')}M`;
                    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`;
                    return String(v);
                  }} 
                />
                <Tooltip formatter={(value: any, name: string) => [formatVND(Number(value)), name]} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Doanh thu" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Chi phí" stroke="#EF4444" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Lợi nhuận" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doanh thu theo khóa học */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="chart_product_distribution">
          <div>
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Cơ Cấu Doanh Thu
            </h3>
            <p className="text-xs text-slate-400 font-sans">Doanh thu khóa học & thiết kế custom</p>
          </div>
          <div className="h-56 flex items-center justify-center mt-4">
            {revenueStructureData.innerRingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Vòng trong (Inner Ring) - sản phẩm & dịch vụ */}
                  <Pie
                    data={revenueStructureData.innerRingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueStructureData.innerRingData.map((entry, index) => (
                      <Cell key={`cell-inner-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Vòng ngoài (Outer Ring) - khoá học & thiết kế */}
                  <Pie
                    data={revenueStructureData.outerRingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueStructureData.outerRingData.map((entry, index) => (
                      <Cell key={`cell-outer-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => {
                      const entry = props.payload;
                      const displayName = entry.displayName || entry.name;
                      return [formatVND(value), displayName];
                    }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontFamily: 'sans-serif'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 font-mono">Chưa ghi nhận doanh thu phát sinh</p>
            )}
          </div>
          {revenueStructureData.innerRingData.length > 0 && (
            <div className="mt-4 space-y-3">
              {/* Category Summaries */}
              <div className="flex gap-2 justify-between border-b border-slate-100 pb-2 text-[10px] font-sans">
                {revenueStructureData.outerRingData.map(cat => (
                  <div key={cat.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-semibold text-slate-700">{cat.name}:</span>
                    <span className="font-mono text-slate-600">{formatVND(cat.value)}</span>
                  </div>
                ))}
              </div>
              
              {/* Detailed Breakdown */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {[...revenueStructureData.innerRingData]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 6)
                  .map((item) => (
                    <div key={item.displayName} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate text-slate-600 font-sans font-medium">{item.displayName}</span>
                      </div>
                      <span className="text-slate-800 font-mono font-semibold ml-2 shrink-0">{formatVND(item.value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
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

