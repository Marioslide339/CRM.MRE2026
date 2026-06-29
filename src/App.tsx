/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  ShoppingBag,
  BookOpen,
  PenTool,
  Coins,
  Share2,
  Database,
  Brain,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  DollarSign,
  Target,
  Menu,
  X
} from 'lucide-react';
import { Customer, Order, Course, DesignService, Collaborator, AutomationLog, MarketingCampaign, Expense, YearlyGoal } from './types';
import {
  INITIAL_COURSES,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_DESIGNS,
  INITIAL_COLLABORATORS,
  INITIAL_CAMPAIGNS,
  INITIAL_LOGS,
  INITIAL_EXPENSES,
  INITIAL_GOALS
} from './data/mockData';

// Modular Component imports
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import CoursesView from './components/CoursesView';
import DesignsView from './components/DesignsView';
import CollaboratorsView from './components/CollaboratorsView';
import MarketingView from './components/MarketingView';
import AiChatView from './components/AiChatView';
import SettingsView from './components/SettingsView';
import ExpensesView from './components/ExpensesView';
import GoalsViewComponent from './components/GoalsViewComponent';

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzghqXE0ot3OE0nobmXuswHBUpu6iJDowhxLO1nLa8_SphGljQUbvm6HBbvERQGEy901w/exec';
const REGISTRATION_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxJSWT6ZpXJhP9rFQoBMTDxQBMWUYg4XcffhvqFy_RCd7lwuWrBrTdu3dBzdcFRX_c7/exec';

const cleanLocationField = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  const lower = str.toLowerCase();
  if (lower === '' || lower === 'undefined' || lower === 'null') {
    return '';
  }
  return str;
};

const sanitizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const lower = dateStr.toLowerCase();
  if (lower.includes('invalid') || lower === 'null' || lower === 'undefined') return '';
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr.substring(0, 10);
};

const sanitizeExpenses = (exps: Expense[]): Expense[] => {
  return (exps || []).map(e => ({
    ...e,
    date: sanitizeDate(e.date)
  }));
};

const sanitizeDesigns = (ds: DesignService[]): DesignService[] => {
  return (ds || []).map(d => ({
    ...d,
    deadline: sanitizeDate(d.deadline),
    deadlineDemo: d.deadlineDemo ? sanitizeDate(d.deadlineDemo) : ''
  }));
};

const getValueByPossibleKeys = (obj: any, possibleKeys: string[], defaultValue: any = ''): any => {
  if (!obj) return defaultValue;
  
  for (const pk of possibleKeys) {
    if (obj[pk] !== undefined && obj[pk] !== null) {
      return obj[pk];
    }
  }

  const keys = Object.keys(obj);
  const normalize = (str: string) => 
    str.toLowerCase()
       .trim()
       .replace(/\s+/g, '')
       .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
       .replace(/[èéẹẻẽêềếệểễ]/g, "e")
       .replace(/[ìíịỉĩ]/g, "i")
       .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
       .replace(/[ùúụủũưừứựửữ]/g, "u")
       .replace(/[ỳýỵỷỹ]/g, "y")
       .replace(/đ/g, "d")
       .replace(/[^a-z0-9]/g, "");

  const normalizedPossible = possibleKeys.map(normalize);

  for (const key of keys) {
    const normKey = normalize(key);
    for (const np of normalizedPossible) {
      if (normKey.includes(np) || np.includes(normKey)) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key];
        }
      }
    }
  }

  return defaultValue;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectTab = (tabName: string) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
  };

  // Unified State with localStorage persistence
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [designs, setDesigns] = useState<DesignService[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState<boolean>(false);

  // Google Sheets integration and Gemini rotation
  const [geminiKeys, setGeminiKeys] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Toast notifications state
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'info' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const sanitizeCustomers = (custs: Customer[]): Customer[] => {
    return custs.map(c => {
      const name = getValueByPossibleKeys(c, ['name', 'hovaten', 'hoten', 'ten', 'khachhang', 'studentName'], '');
      const email = getValueByPossibleKeys(c, ['email', 'mail'], '');
      const phone = getValueByPossibleKeys(c, ['phone', 'sdt', 'zalo', 'dienthoai', 'sozalo'], '');
      const province = getValueByPossibleKeys(c, ['province', 'tinh', 'thanhpho', 'city'], '');
      const ward = getValueByPossibleKeys(c, ['ward', 'xa', 'phuong', 'commune', 'district'], '');
      const notes = getValueByPossibleKeys(c, ['notes', 'ghichu'], '');
      const createdAt = getValueByPossibleKeys(c, ['createdAt', 'ngaytao', 'thoigiantao'], new Date().toISOString());

      return {
        id: c.id,
        name: name || c.name || '',
        email: email || c.email || '',
        phone: phone || c.phone || '',
        province: cleanLocationField(province || c.province),
        ward: cleanLocationField(ward || c.ward),
        notes: notes || c.notes || '',
        createdAt: createdAt || c.createdAt || new Date().toISOString(),
        coursesPurchased: c.coursesPurchased || [],
        lmsProgress: c.lmsProgress || {},
        lmsGrades: c.lmsGrades || {},
        lmsCertificateEarned: c.lmsCertificateEarned || {},
        tags: c.tags || [],
        aiAnalysis: c.aiAnalysis || {
          segment: 'Tiềm năng',
          summary: 'Thành viên mới tạo trên hệ thống CRM.',
          lastEvaluation: new Date().toISOString()
        }
      };
    });
  };

  // Load from local storage on component mount, then auto-sync from Google Sheets
  useEffect(() => {
    // Bước 1: Tải nhanh từ localStorage (bộ nhớ đệm thiết bị) — KHÔNG dùng dữ liệu demo
    try {
      const storedCustomers = localStorage.getItem('mre_customers');
      const storedOrders = localStorage.getItem('mre_orders');
      const storedCourses = localStorage.getItem('mre_courses');
      const storedDesigns = localStorage.getItem('mre_designs');
      const storedCollaborators = localStorage.getItem('mre_collaborators');
      const storedCampaigns = localStorage.getItem('mre_campaigns');
      const storedLogs = localStorage.getItem('mre_logs');
      const storedExpenses = localStorage.getItem('mre_expenses');
      const storedKeys = localStorage.getItem('mre_gemini_keys');
      const storedGoals = localStorage.getItem('mre_goals');

      setCustomers(storedCustomers ? sanitizeCustomers(JSON.parse(storedCustomers)) : []);
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
      setCourses(storedCourses ? JSON.parse(storedCourses) : []);
      setDesigns(storedDesigns ? sanitizeDesigns(JSON.parse(storedDesigns)) : []);
      setCollaborators(storedCollaborators ? JSON.parse(storedCollaborators) : []);
      setCampaigns(storedCampaigns ? JSON.parse(storedCampaigns) : []);
      setLogs(storedLogs ? JSON.parse(storedLogs) : []);
      setExpenses(storedExpenses ? sanitizeExpenses(JSON.parse(storedExpenses)) : []);
      setGeminiKeys(storedKeys ? JSON.parse(storedKeys) : []);
      if (storedGoals) {
        try {
          const parsed = JSON.parse(storedGoals) as YearlyGoal[];
          const aligned = parsed.map(g => {
            const initialGoalForYear = INITIAL_GOALS.find(ig => ig.year === g.year);
            if (!initialGoalForYear) return g;
            return {
              ...g,
              months: g.months.map(m => {
                const initialMonth = initialGoalForYear.months.find(im => im.month === m.month);
                if (!initialMonth) return m;
                return {
                  ...m,
                  revenueTarget: initialMonth.revenueTarget,
                  revenueCourseTarget: initialMonth.revenueCourseTarget,
                  revenueDesignTarget: initialMonth.revenueDesignTarget,
                  expenseAdsTarget: initialMonth.expenseAdsTarget,
                  expenseStaffTarget: initialMonth.expenseStaffTarget,
                  profitTarget: initialMonth.profitTarget
                };
              })
            };
          });
          setGoals(aligned);
        } catch (e) {
          setGoals(INITIAL_GOALS);
        }
      } else {
        setGoals(INITIAL_GOALS);
      }
    } catch (e) {
      console.error('Failed to parse cached database:', e);
    }

    // Bước 2: Tự động tải dữ liệu từ Google Sheets — nguồn dữ liệu chính duy nhất
    const autoSyncFromCloud = async () => {
      try {
        setIsSyncing(true);
        const response = await fetch(`${GOOGLE_SHEET_URL}?action=getData`);
        const data = await response.json();
        if (data && !data.error) {
          // Ghi đè TOÀN BỘ dữ liệu từ Google Sheets (kể cả mảng rỗng)
          const cloudCustomers = sanitizeCustomers(data.customers || []);
          setCustomers(cloudCustomers);
          localStorage.setItem('mre_customers', JSON.stringify(cloudCustomers));

          const cloudOrders = data.orders || [];
          setOrders(cloudOrders);
          localStorage.setItem('mre_orders', JSON.stringify(cloudOrders));

          const cloudCourses = data.courses || [];
          setCourses(cloudCourses);
          localStorage.setItem('mre_courses', JSON.stringify(cloudCourses));

          const cloudDesigns = sanitizeDesigns(data.designs || []);
          setDesigns(cloudDesigns);
          localStorage.setItem('mre_designs', JSON.stringify(cloudDesigns));

          const cloudCollaborators = data.collaborators || [];
          setCollaborators(cloudCollaborators);
          localStorage.setItem('mre_collaborators', JSON.stringify(cloudCollaborators));

          const cloudCampaigns = data.campaigns || [];
          setCampaigns(cloudCampaigns);
          localStorage.setItem('mre_campaigns', JSON.stringify(cloudCampaigns));

          const cloudLogs = data.logs || [];
          setLogs(cloudLogs);
          localStorage.setItem('mre_logs', JSON.stringify(cloudLogs));

          const cloudExpenses = sanitizeExpenses(data.expenses || []);
          setExpenses(cloudExpenses);
          localStorage.setItem('mre_expenses', JSON.stringify(cloudExpenses));

          let cloudGoals = data.goals;
          let shouldForceSyncGoals = false;
          if (!cloudGoals || !Array.isArray(cloudGoals) || cloudGoals.length === 0) {
            cloudGoals = INITIAL_GOALS;
            shouldForceSyncGoals = true;
          }
          const finalGoals = computeGoalsWithActuals(cloudGoals, cloudOrders, cloudDesigns, cloudExpenses);
          setGoals(finalGoals);
          localStorage.setItem('mre_goals', JSON.stringify(finalGoals));

          setHasLoadedFromCloud(true);
          console.log('Auto-sync from Google Sheets completed — all devices synchronized.');

          if (shouldForceSyncGoals) {
            console.log('Forcing sync of initial goals back to Google Sheet database...');
            // Wait slightly for state flag to register, then sync
            setTimeout(() => {
              const payload = {
                customers: cloudCustomers,
                orders: cloudOrders,
                courses: cloudCourses,
                designs: cloudDesigns,
                collaborators: cloudCollaborators,
                campaigns: cloudCampaigns,
                logs: cloudLogs,
                expenses: cloudExpenses,
                goals: finalGoals
              };
              
              // We call the POST sync API directly to avoid using the state which hasn't updated yet
              fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                  action: 'sync',
                  data: payload
                })
              })
              .then(res => res.json())
              .then(resData => {
                if (resData && resData.success) {
                  console.log('Successfully restored and synchronized initial goals to Google Sheets database!');
                  showToast('success', 'Đã tự động khôi phục và đồng bộ số liệu mục tiêu lên Database!');
                } else {
                  console.warn('Failed to auto-sync restored goals:', resData.error);
                }
              })
              .catch(syncErr => {
                console.error('Error auto-syncing restored goals:', syncErr);
              });
            }, 1000);
          }
        }
      } catch (err) {
        console.log('Auto-sync skipped (offline or error):', err);
      } finally {
        setIsSyncing(false);
      }
    };
    autoSyncFromCloud();
  }, []);

  // Update localStorage helper
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Live Sync to Google Sheet
  const syncToGoogleSheets = async (urlToUse?: string, forcedData?: any) => {
    // Chỉ chặn đồng bộ nếu chưa tải từ cloud VÀ không có dữ liệu cache local (tránh đè database trống lên sheet)
    if (!hasLoadedFromCloud) {
      const hasLocalCache = localStorage.getItem('mre_customers') || localStorage.getItem('mre_orders') || localStorage.getItem('mre_expenses');
      if (!hasLocalCache) {
        console.warn('Sync to Google Sheets blocked: Cloud data has not been loaded and no local cache exists.');
        showToast('error', 'Chưa hoàn thành tải dữ liệu từ Google Sheets. Vui lòng đợi trong giây lát!');
        return;
      }
    }
    const url = urlToUse || GOOGLE_SHEET_URL;
    setIsSyncing(true);
    try {
      const payload = forcedData || {
        customers,
        orders,
        courses,
        designs,
        collaborators,
        campaigns,
        logs,
        expenses,
        goals
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'sync',
          data: payload
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to sync data');
      }
      if (result.updatedCustomers) {
        const sanitized = sanitizeCustomers(result.updatedCustomers);
        setCustomers(sanitized);
        saveToStorage('mre_customers', sanitized);
      }
      showToast('success', 'Đồng bộ dữ liệu lên Google Sheets thành công!');
    } catch (err) {
      console.error('Google Sheets write error:', err);
      showToast('error', 'Không thể đồng bộ dữ liệu lên Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromGoogleSheets = async (urlToUse?: string) => {
    const url = urlToUse || GOOGLE_SHEET_URL;
    setIsSyncing(true);
    try {
      const response = await fetch(`${url}?action=getData`);
      const data = await response.json();
      if (data) {
        if (data.customers) {
          const sanitized = sanitizeCustomers(data.customers);
          setCustomers(sanitized);
          saveToStorage('mre_customers', sanitized);
        }
        if (data.orders) {
          setOrders(data.orders);
          saveToStorage('mre_orders', data.orders);
        }
        if (data.courses) {
          setCourses(data.courses);
          saveToStorage('mre_courses', data.courses);
        }
        if (data.designs) {
          const cloudDesigns = sanitizeDesigns(data.designs);
          setDesigns(cloudDesigns);
          saveToStorage('mre_designs', cloudDesigns);
        }
        if (data.collaborators) {
          setCollaborators(data.collaborators);
          saveToStorage('mre_collaborators', data.collaborators);
        }
        if (data.campaigns) {
          setCampaigns(data.campaigns);
          saveToStorage('mre_campaigns', data.campaigns);
        }
        if (data.logs) {
          setLogs(data.logs);
          saveToStorage('mre_logs', data.logs);
        }
        if (data.expenses) {
          const cloudExpenses = sanitizeExpenses(data.expenses);
          setExpenses(cloudExpenses);
          saveToStorage('mre_expenses', cloudExpenses);
        }

        const cloudGoals = (data.goals && Array.isArray(data.goals) && data.goals.length > 0) ? data.goals : INITIAL_GOALS;
        const finalGoals = computeGoalsWithActuals(
          cloudGoals,
          data.orders || orders,
          data.designs || designs,
          data.expenses || data.expenses
        );
        setGoals(finalGoals);
        saveToStorage('mre_goals', finalGoals);

        setHasLoadedFromCloud(true);
        showToast('success', 'Tải dữ liệu mới từ Google Sheets thành công!');
      }
    } catch (err) {
      console.error('Google Sheets read error:', err);
      showToast('error', 'Không thể đồng bộ dữ liệu từ Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveGeminiKeys = (keys: string[]) => {
    setGeminiKeys(keys);
    saveToStorage('mre_gemini_keys', keys);
  };

  const addActivityLog = (message: string, type: 'info' | 'success' | 'error' = 'info', targetId: string = '-') => {
    const newLog: AutomationLog = {
      id: `L${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      orderId: targetId,
      step: 5,
      message,
      type
    };
    const currentLogs = localStorage.getItem('mre_logs');
    let parsed: AutomationLog[] = [];
    if (currentLogs) {
      try { parsed = JSON.parse(currentLogs); } catch(e) {}
    }
    const updatedLogs = [newLog, ...parsed].slice(0, 100);
    localStorage.setItem('mre_logs', JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    return updatedLogs;
  };

  const computeGoalsWithActuals = (
    currentGoals: YearlyGoal[],
    currentOrders: Order[],
    currentDesigns: DesignService[],
    currentExpenses: Expense[]
  ): YearlyGoal[] => {
    const toLocalDateStr = (dateStr: string): string => {
      if (!dateStr) return '';
      if (dateStr.length === 10 && !dateStr.includes('T')) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 10);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    return currentGoals.map(g => {
      const initialGoalForYear = INITIAL_GOALS.find(ig => ig.year === g.year);

      const updatedMonths = g.months.map(m => {
        const initialMonth = initialGoalForYear?.months.find(im => im.month === m.month);

        // Always align target values with INITIAL_GOALS to correct any wrong/stale targets from DB
        const revenueTarget = initialMonth?.revenueTarget ?? m.revenueTarget;
        const revenueCourseTarget = initialMonth?.revenueCourseTarget ?? m.revenueCourseTarget;
        const revenueDesignTarget = initialMonth?.revenueDesignTarget ?? m.revenueDesignTarget;
        const expenseAdsTarget = initialMonth?.expenseAdsTarget ?? m.expenseAdsTarget;
        const expenseStaffTarget = initialMonth?.expenseStaffTarget ?? m.expenseStaffTarget;
        const profitTarget = initialMonth?.profitTarget ?? m.profitTarget;

        // For historical months T1-T5 of year 2026, keep the exact static actuals from INITIAL_GOALS
        if (g.year === 2026 && m.month < 6) {
          return {
            ...m,
            revenueTarget,
            revenueCourseTarget,
            revenueDesignTarget,
            expenseAdsTarget,
            expenseStaffTarget,
            profitTarget,
            actualRevenue: initialMonth?.actualRevenue ?? m.actualRevenue,
            actualRevenueCourse: initialMonth?.actualRevenueCourse ?? m.actualRevenueCourse,
            actualRevenueDesign: initialMonth?.actualRevenueDesign ?? m.actualRevenueDesign,
            actualExpenseAds: initialMonth?.actualExpenseAds ?? m.actualExpenseAds,
            actualExpenseOther: initialMonth?.actualExpenseOther ?? m.actualExpenseOther,
            actualProfit: initialMonth?.actualProfit ?? m.actualProfit
          };
        }

        // For month 6 and later, calculate dynamically from live data up to current time (no yesterday limit)
        const monthOrders = currentOrders.filter(o => {
          if (o.paymentStatus !== 'Đã thanh toán') return false;
          const d = toLocalDateStr(o.createdAt);
          if (!d) return false;
          const parts = d.split('-');
          return parseInt(parts[0], 10) === g.year && parseInt(parts[1], 10) === m.month;
        });

        const monthDesigns = currentDesigns.filter(d => {
          const dateStr = toLocalDateStr(d.createdAt || d.deadline || '');
          if (!dateStr) return false;
          const parts = dateStr.split('-');
          return parseInt(parts[0], 10) === g.year && parseInt(parts[1], 10) === m.month;
        });

        const monthExpenses = currentExpenses.filter(e => {
          const d = e.date; // YYYY-MM-DD
          if (!d) return false;
          const parts = d.split('-');
          return parseInt(parts[0], 10) === g.year && parseInt(parts[1], 10) === m.month;
        });

        const dynamicCourseActual = monthOrders.reduce((sum, o) => sum + o.price, 0);
        const dynamicDesignActual = monthDesigns.reduce((sum, d) => sum + (d.amount || 0), 0);
        const dynamicRevenueActual = dynamicCourseActual + dynamicDesignActual;
        const dynamicExpenseAds = monthExpenses.filter(e => e.category === 'Chi phí quảng cáo').reduce((sum, e) => sum + e.amount, 0);
        const dynamicTotalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const dynamicProfitActual = dynamicRevenueActual - dynamicTotalExpense;

        return {
          ...m,
          revenueTarget,
          revenueCourseTarget,
          revenueDesignTarget,
          expenseAdsTarget,
          expenseStaffTarget,
          profitTarget,
          actualRevenue: dynamicRevenueActual,
          actualRevenueCourse: dynamicCourseActual,
          actualRevenueDesign: dynamicDesignActual,
          actualExpenseAds: dynamicExpenseAds,
          actualExpenseOther: dynamicTotalExpense - dynamicExpenseAds,
          actualProfit: dynamicProfitActual
        };
      });

      return { ...g, months: updatedMonths };
    });
  };

  const updateGoalsWithLiveActuals = (
    currentGoals: YearlyGoal[],
    currentOrders: Order[],
    currentDesigns: DesignService[],
    currentExpenses: Expense[]
  ): YearlyGoal[] => {
    const recalculated = computeGoalsWithActuals(currentGoals, currentOrders, currentDesigns, currentExpenses);
    setGoals(recalculated);
    saveToStorage('mre_goals', recalculated);
    return recalculated;
  };

  const handleTriggerSync = async () => {
    await syncToGoogleSheets();
  };

  const handleTestConnection = async (email: string) => {
    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'activateCourse',
          email: email,
          customerName: 'Học viên Thử nghiệm',
          courseName: 'Khóa học Thử nghiệm kết nối CRM',
          driveFolderId: '1sjuhc0WnuKQ42wVqFfUASAxKWY16wqjS9smdqBUM6Ho' // standard test ID
        })
      });
      const resData = await response.json();
      if (resData && resData.success) {
        if (resData.shareSuccess) {
          showToast('success', `Kiểm tra thành công! Đã chia sẻ Drive và gửi email đến ${email}.`);
        } else {
          showToast('info', `Kết nối Apps Script thành công! Đã gửi mail, nhưng share Drive thất bại (Lỗi: ${resData.error || 'Thư mục thử nghiệm không hợp lệ'}).`);
        }
      } else {
        throw new Error(resData.error || 'Apps Script báo lỗi không xác định.');
      }
    } catch (err: any) {
      console.error('Test connection error:', err);
      showToast('error', `Không thể kết nối đến Apps Script: ${err.message || err}`);
      throw err;
    }
  };

  const runAppsScriptActivation = async (order: Order) => {
    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'activateCourse',
          email: order.customerEmail,
          customerName: order.customerName,
          courseName: order.productName,
          driveFolderId: order.driveFolderId
        })
      });
      const resData = await response.json();
      
      const newLogs: AutomationLog[] = [];
      if (resData && resData.success) {
        newLogs.push({
          id: `L${Date.now()}_bg1`,
          timestamp: new Date().toISOString(),
          orderId: order.id,
          step: 3,
          message: `[Auto-Background] Kích hoạt và cấp quyền thành công cho ${order.customerEmail}`,
          type: 'success'
        });
        if (resData.shareSuccess) {
          showToast('success', `Đã tự động kích hoạt: Cấp quyền Drive và gửi email đến ${order.customerEmail}!`);
        } else {
          newLogs.push({
            id: `L${Date.now()}_bg2`,
            timestamp: new Date().toISOString(),
            orderId: order.id,
            step: 3,
            message: `[Auto-Background] Gửi email thành công, lỗi cấp quyền Drive: ${resData.error || 'N/A'}`,
            type: 'error'
          });
          showToast('info', `Đã gửi mail kích hoạt cho ${order.customerEmail}, nhưng không thể tự động share Drive (Lỗi: ${resData.error || 'File ID không hợp lệ'}).`);
        }
      } else {
        newLogs.push({
          id: `L${Date.now()}_bg3`,
          timestamp: new Date().toISOString(),
          orderId: order.id,
          step: 3,
          message: `[Auto-Background] Thất bại khi kết nối Apps Script: ${resData.error || 'Unknown'}`,
          type: 'error'
        });
        showToast('error', `Lỗi Apps Script khi kích hoạt cho ${order.customerEmail}: ${resData.error || 'Unknown'}`);
      }
      
      setLogs(prev => {
        const u = [...newLogs, ...prev];
        saveToStorage('mre_logs', u);
        return u;
      });
      
    } catch (err: any) {
      console.error('Auto activation error:', err);
      showToast('error', `Không thể kết nối Apps Script để kích hoạt và gửi email thực tế cho ${order.customerEmail}.`);
      
      const errLog: AutomationLog = {
        id: `L${Date.now()}_bg_err`,
        timestamp: new Date().toISOString(),
        orderId: order.id,
        step: 3,
        message: `[Auto-Background] Lỗi mạng khi kết nối Apps Script: ${err.message || err}`,
        type: 'error'
      };
      setLogs(prev => {
        const u = [errLog, ...prev];
        saveToStorage('mre_logs', u);
        return u;
      });
    }
  };

  const handleScanCourseRegistration = async () => {
    if (!REGISTRATION_SHEET_URL) {
      showToast('error', 'Chưa cấu hình URL quét khách hàng đăng ký!');
      return;
    }
    setIsSyncing(true);
    try {
      // Step 1: Fetch pending customers from registration sheet
      const response = await fetch(`${REGISTRATION_SHEET_URL}?action=getPending`);
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Lỗi không xác định từ Script Đăng ký.');
      }
      
      const pendingCustomers = resData.customers || [];
      if (pendingCustomers.length === 0) {
        showToast('info', 'Không có đăng ký mới nào cần quét.');
        return;
      }

      let updatedCustomers = [...customers];
      const rowNumsToConfirm: number[] = [];
      let newCount = 0;
      let updateCount = 0;
      
      pendingCustomers.forEach((c: any) => {
        // Check if customer already exists by phone or email
        const dup = updatedCustomers.find(existing => 
          (c.phone && existing.phone === c.phone) || 
          (c.email && existing.email === c.email)
        );
        
        if (!dup) {
          const nextIdNum = updatedCustomers.length + 1;
          const nextIdStr = `KH${String(nextIdNum).padStart(4, '0')}`;
          const newCust: Customer = {
            id: nextIdStr,
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            province: cleanLocationField(c.province),
            ward: cleanLocationField(c.ward),
            tags: ['Sheet Import'],
            notes: `Tự động nhập từ Google Sheet Đăng ký học viên vào ${new Date().toLocaleString('vi-VN')}`,
            createdAt: new Date().toISOString(),
            coursesPurchased: [],
            lmsProgress: {},
            lmsGrades: {},
            lmsCertificateEarned: {},
            aiAnalysis: {
              segment: 'Tiềm năng',
              summary: 'Khách hàng tự động quét từ Web Khóa học.',
              lastEvaluation: new Date().toISOString()
            }
          };
          updatedCustomers.push(newCust);
          newCount++;
        } else {
          // If customer already exists, let's update their province/ward fields if they have new content
          let changed = false;
          const cleanProv = cleanLocationField(c.province);
          const cleanWrd = cleanLocationField(c.ward);
          
          if (cleanProv && dup.province !== cleanProv) {
            dup.province = cleanProv;
            changed = true;
          }
          if (cleanWrd && dup.ward !== cleanWrd) {
            dup.ward = cleanWrd;
            changed = true;
          }
          if (changed) {
            updatedCustomers = updatedCustomers.map(existing => 
              existing.id === dup.id ? { ...existing, province: dup.province, ward: dup.ward } : existing
            );
            updateCount++;
          }
        }
        rowNumsToConfirm.push(c.rowNum);
      });
      
      if (newCount === 0 && updateCount === 0) {
        // All registrations are already in CRM, but we should still confirm them on registration sheet to clean up
        const confirmRes = await fetch(REGISTRATION_SHEET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'confirmRows',
            rows: rowNumsToConfirm
          })
        });
        const confirmData = await confirmRes.json();
        if (!confirmData.success) {
          throw new Error(confirmData.error || 'Không thể chuyển trạng thái Đã xác nhận trên Sheet Đăng ký.');
        }
        showToast('info', 'Các học viên đăng ký đã tồn tại trong hệ thống. Đã đánh dấu xác nhận trên Sheet đăng ký.');
        return;
      }
      
      // Step 3: Call Script 1 to confirm rows as "Đã xác nhận"
      const confirmRes = await fetch(REGISTRATION_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'confirmRows',
          rows: rowNumsToConfirm
        })
      });
      const confirmData = await confirmRes.json();
      if (!confirmData.success) {
        throw new Error(confirmData.error || 'Không thể chuyển trạng thái Đã xác nhận trên Sheet Đăng ký.');
      }
      
      // Step 4: Save to local storage and state
      setCustomers(updatedCustomers);
      saveToStorage('mre_customers', updatedCustomers);
      
      const message = `[Quét Web] Quét và nhập thành công: ${newCount} khách mới, cập nhật thông tin tỉnh/thành cho ${updateCount} khách cũ.`;
      const updatedLogs = addActivityLog(message, 'success', 'QUET_WEB');
 
      // Step 5: Sync to CRM Database (Script 2)
      await syncToGoogleSheets(undefined, {
        customers: updatedCustomers,
        orders,
        courses,
        designs,
        collaborators,
        campaigns,
        logs: updatedLogs,
        expenses,
        goals
      });
      
      showToast('success', `Đã quét và thêm thành công ${newCount} khách hàng mới, cập nhật vị trí cho ${updateCount} khách hàng!`);
    } catch (err: any) {
      console.error('Scan registration error:', err);
      showToast('error', `Lỗi khi quét khách hàng mới: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // State modifiers and sync
  

  const handleAddCustomer = (newCustomer: Partial<Customer>) => {
    const id = `KH${String(customers.length + 1).padStart(4, '0')}`;
    const fullCustomer: Customer = {
      ...(newCustomer as Omit<Customer, 'id'>),
      id,
      createdAt: newCustomer.createdAt || new Date().toISOString(),
      coursesPurchased: newCustomer.coursesPurchased || [],
      lmsProgress: newCustomer.lmsProgress || {},
      aiAnalysis: newCustomer.aiAnalysis || {
        segment: 'Tiềm năng',
        summary: 'Thành viên mới tạo trên hệ thống CRM.',
        lastEvaluation: new Date().toISOString()
      }
    };
    const updated = [fullCustomer, ...customers];
    setCustomers(updated);
    saveToStorage('mre_customers', updated);
    showToast('success', `Đã thêm khách hàng ${fullCustomer.name} thành công!`);
    const updatedLogs = addActivityLog(`[Hồ sơ] Thêm khách hàng mới: ${fullCustomer.name} (${id})`, 'success', id);
    syncToGoogleSheets(undefined, { customers: updated, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleUpdateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    const name = customers.find(c => c.id === id)?.name || '';
    setCustomers(updated);
    saveToStorage('mre_customers', updated);
    showToast('success', 'Đã cập nhật thông tin khách hàng.');
    const updatedLogs = addActivityLog(`[Hồ sơ] Cập nhật thông tin khách hàng: ${name} (${id})`, 'info', id);
    syncToGoogleSheets(undefined, { customers: updated, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleDeleteCustomer = (id: string) => {
    const name = customers.find(c => c.id === id)?.name || '';
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveToStorage('mre_customers', updated);
    showToast('success', 'Đã xóa khách hàng khỏi hệ thống.');
    const updatedLogs = addActivityLog(`[Hồ sơ] Xóa khách hàng khỏi CRM: ${name} (${id})`, 'error', id);
    syncToGoogleSheets(undefined, { customers: updated, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals });
  };

  const activateOrderPayoutsAndLinks = (
    orderRef: Order,
    currentCustomers: Customer[],
    currentCollaborators: Collaborator[],
    currentExpenses: Expense[]
  ) => {
    // 1. Update Customers
    const updatedCusts = currentCustomers.map(c => {
      if (c.id === orderRef.customerId) {
        const list = c.coursesPurchased || [];
        if (!list.includes(orderRef.productId)) {
          return {
            ...c,
            coursesPurchased: [...list, orderRef.productId],
            lmsProgress: { ...(c.lmsProgress || {}), [orderRef.productId]: 10 }
          };
        }
      }
      return c;
    });

    // 2. Update Collaborators (add revenue, keep salary manual)
    let updatedCtvs = currentCollaborators;
    const updatedExpenses = currentExpenses;

    const randomAssignee = currentCollaborators[Math.floor(Math.random() * currentCollaborators.length)];
    if (randomAssignee && orderRef.price > 1000000) {
      updatedCtvs = currentCollaborators.map(ctv => {
        if (ctv.id === randomAssignee.id) {
          const addedRev = orderRef.price;
          const updatedRev = ctv.revenue + addedRev;
          return {
            ...ctv,
            revenue: updatedRev
          };
        }
        return ctv;
      });
    }

    return {
      updatedCusts,
      updatedCtvs,
      updatedExpenses
    };
  };

  const handleAddOrder = (newOrder: Partial<Order>) => {
    const id = `DH${String(orders.length + 1).padStart(4, '0')}`;
    const fullOrder: Order = {
      ...(newOrder as Omit<Order, 'id'>),
      id,
      createdAt: newOrder.createdAt || new Date().toISOString()
    } as Order;
    const updatedOrders = [fullOrder, ...orders];

    if (fullOrder.paymentStatus === 'Đã thanh toán') {
      const { updatedCusts, updatedCtvs, updatedExpenses } = activateOrderPayoutsAndLinks(
        fullOrder,
        customers,
        collaborators,
        expenses
      );

      setCustomers(updatedCusts);
      saveToStorage('mre_customers', updatedCusts);

      setCollaborators(updatedCtvs);
      saveToStorage('mre_collaborators', updatedCtvs);

      setExpenses(updatedExpenses);
      saveToStorage('mre_expenses', updatedExpenses);

      setOrders(updatedOrders);
      saveToStorage('mre_orders', updatedOrders);

      showToast('success', `Đã tạo đơn hàng ${id} và kích hoạt khóa học thành công!`);
      const updatedLogs = addActivityLog(`[Đơn hàng] Thêm đơn hàng mới & tự động kích hoạt: ${fullOrder.productName} (${id})`, 'success', id);
      const finalGoals = updateGoalsWithLiveActuals(goals, updatedOrders, designs, updatedExpenses);

      syncToGoogleSheets(undefined, {
        customers: updatedCusts,
        orders: updatedOrders,
        courses,
        designs,
        collaborators: updatedCtvs,
        campaigns,
        logs: updatedLogs,
        expenses: updatedExpenses,
        goals: finalGoals
      });

      runAppsScriptActivation(fullOrder);
    } else {
      setOrders(updatedOrders);
      saveToStorage('mre_orders', updatedOrders);
      showToast('success', `Đã tạo đơn hàng ${id} thành công!`);
      const updatedLogs = addActivityLog(`[Đơn hàng] Tạo đơn hàng mới (Chưa thanh toán): ${fullOrder.productName} (${id})`, 'info', id);
      const finalGoals = updateGoalsWithLiveActuals(goals, updatedOrders, designs, expenses);
      syncToGoogleSheets(undefined, {
        customers,
        orders: updatedOrders,
        courses,
        designs,
        collaborators,
        campaigns,
        logs: updatedLogs,
        expenses,
        goals: finalGoals
      });
    }
  };

  const handleUpdateOrder = (id: string, updatedFields: Partial<Order>, triggerAppsScript: boolean = true) => {
    let isTransitioningToPaid = false;
    let activatedOrder: Order | null = null;

    const updatedOrders = orders.map(o => {
      if (o.id === id) {
        const withUpdated = { ...o, ...updatedFields };
        if (updatedFields.paymentStatus === 'Đã thanh toán' && o.paymentStatus !== 'Đã thanh toán') {
          isTransitioningToPaid = true;
          activatedOrder = withUpdated;
        }
        return withUpdated;
      }
      return o;
    });

    if (isTransitioningToPaid && activatedOrder) {
      const { updatedCusts, updatedCtvs, updatedExpenses } = activateOrderPayoutsAndLinks(
        activatedOrder,
        customers,
        collaborators,
        expenses
      );

      setCustomers(updatedCusts);
      saveToStorage('mre_customers', updatedCusts);

      setCollaborators(updatedCtvs);
      saveToStorage('mre_collaborators', updatedCtvs);

      setExpenses(updatedExpenses);
      saveToStorage('mre_expenses', updatedExpenses);

      setOrders(updatedOrders);
      saveToStorage('mre_orders', updatedOrders);

      showToast('success', 'Đã cập nhật đơn hàng và kích hoạt khóa học thành công!');
      const updatedLogs = addActivityLog(`[Đơn hàng] Kích hoạt khóa học thành công: ${(activatedOrder as Order).productName} (${id})`, 'success', id);
      const finalGoals = updateGoalsWithLiveActuals(goals, updatedOrders, designs, updatedExpenses);

      syncToGoogleSheets(undefined, {
        customers: updatedCusts,
        orders: updatedOrders,
        courses,
        designs,
        collaborators: updatedCtvs,
        campaigns,
        logs: updatedLogs,
        expenses: updatedExpenses,
        goals: finalGoals
      });

      if (triggerAppsScript) {
        runAppsScriptActivation(activatedOrder);
      }
    } else {
      setOrders(updatedOrders);
      saveToStorage('mre_orders', updatedOrders);
      showToast('success', 'Đã cập nhật thông tin đơn hàng.');
      const updatedLogs = addActivityLog(`[Đơn hàng] Cập nhật đơn hàng: (${id})`, 'info', id);
      const finalGoals = updateGoalsWithLiveActuals(goals, updatedOrders, designs, expenses);
      syncToGoogleSheets(undefined, {
        customers: customers,
        orders: updatedOrders,
        courses,
        designs,
        collaborators,
        campaigns,
        logs: updatedLogs,
        expenses,
        goals: finalGoals
      });
    }
  };

  const handleDeleteOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    saveToStorage('mre_orders', updated);
    showToast('success', 'Đã xóa đơn hàng.');
    const updatedLogs = addActivityLog(`[Đơn hàng] Xóa đơn hàng: (${id})`, 'error', id);
    const finalGoals = updateGoalsWithLiveActuals(goals, updated, designs, expenses);
    syncToGoogleSheets(undefined, { customers, orders: updated, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals: finalGoals });
  };

  const handleTriggerAutomation = async (order: Order, steps: string[]) => {
    const newLogs: AutomationLog[] = [
      {
        id: `L${Date.now()}_3`,
        timestamp: new Date(Date.now() - 5000).toISOString(),
        orderId: order.id,
        step: 3,
        message: `Đã phân quyền chia sẻ Google Drive thành công cho: ${order.customerEmail}`,
        type: 'info'
      },
      {
        id: `L${Date.now()}_4`,
        timestamp: new Date(Date.now() - 2000).toISOString(),
        orderId: order.id,
        step: 4,
        message: `Đã gửi tài liệu đính kèm email khóa học "${order.productName}"`,
        type: 'info'
      },
      {
        id: `L${Date.now()}_5`,
        timestamp: new Date().toISOString(),
        orderId: order.id,
        step: 5,
        message: `Tuyệt vời! Hoàn thành kích hoạt gói học tập cho ${order.customerName}`,
        type: 'success'
      }
    ];

    const updatedLogs = [...newLogs, ...logs];
    setLogs(updatedLogs);
    saveToStorage('mre_logs', updatedLogs);
    showToast('success', 'Chạy mô phỏng tự động cấp học thành công!');

    // Actual email & Drive share trigger via Apps Script
    if (GOOGLE_SHEET_URL) {
      try {
        const response = await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'activateCourse',
            email: order.customerEmail,
            customerName: order.customerName,
            courseName: order.productName,
            driveFolderId: order.driveFolderId
          })
        });
        
        const resData = await response.json();
        if (resData && resData.success) {
          if (resData.shareSuccess) {
            showToast('success', `Đã cấp quyền Drive và gửi email kích hoạt thực tế đến ${order.customerEmail}!`);
          } else {
            showToast('info', `Đã gửi mail kích hoạt, nhưng không thể tự động share Drive (Vui lòng xem lỗi trong console).`);
            console.warn('Google Drive share warning:', resData.error);
          }
        } else {
          showToast('error', `Lỗi Apps Script khi kích hoạt: ${resData.error || 'Unknown'}`);
        }
      } catch (err) {
        console.error('Apps Script Activation Error:', err);
        showToast('error', 'Không thể kết nối Apps Script để kích hoạt và gửi email thực tế.');
      }
    }

    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses });
  };

  const handleAddCourse = (newCourse: Course) => {
    const updated = [newCourse, ...courses];
    setCourses(updated);
    saveToStorage('mre_courses', updated);
    showToast('success', `Đã thêm khóa học "${newCourse.title}" thành công!`);
    const updatedLogs = addActivityLog(`[Khóa học] Thêm khóa học mới: ${newCourse.title} (${newCourse.id})`, 'success', newCourse.id);
    syncToGoogleSheets(undefined, { customers, orders, courses: updated, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleUpdateCourse = (id: string, updatedFields: Partial<Course>) => {
    const updated = courses.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
    setCourses(updated);
    saveToStorage('mre_courses', updated);
    showToast('success', 'Đã cập nhật thông tin khóa học.');
    const updatedLogs = addActivityLog(`[Khóa học] Cập nhật thông tin: (${id})`, 'info', id);
    syncToGoogleSheets(undefined, { customers, orders, courses: updated, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveToStorage('mre_courses', updated);
    showToast('success', 'Đã xóa khóa học khỏi kho.');
    const updatedLogs = addActivityLog(`[Khóa học] Xóa khóa học: (${id})`, 'error', id);
    syncToGoogleSheets(undefined, { customers, orders, courses: updated, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleAddDesign = (newDesign: Partial<DesignService>) => {
    const id = `TK${String(designs.length + 1).padStart(4, '0')}`;
    const fullDesign: DesignService = {
      ...(newDesign as Omit<DesignService, 'id'>),
      id,
      createdAt: newDesign.createdAt || new Date().toISOString(),
      deadline: sanitizeDate(newDesign.deadline || ''),
      deadlineDemo: sanitizeDate(newDesign.deadlineDemo || newDesign.deadline || ''),
      status: newDesign.status || 'Tiếp nhận'
    } as DesignService;
    const updated = [fullDesign, ...designs];
    setDesigns(updated);
    saveToStorage('mre_designs', updated);
    showToast('success', 'Đã giao dự án thiết kế mới cho CTV.');
    const updatedLogs = addActivityLog(`[Thiết kế] Giao dự án thiết kế mới: ${fullDesign.title} (${id})`, 'success', id);
    const finalGoals = updateGoalsWithLiveActuals(goals, orders, updated, expenses);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs: updated, collaborators, campaigns, logs: updatedLogs, expenses, goals: finalGoals });
  };

  const handleUpdateDesign = (id: string, updatedFields: Partial<DesignService>) => {
    const prevDesign = designs.find(d => d.id === id);
    const updatedFieldsSanitized: Partial<DesignService> = { ...updatedFields };
    if (updatedFields.deadline !== undefined) {
      updatedFieldsSanitized.deadline = sanitizeDate(updatedFields.deadline);
    }
    if (updatedFields.deadlineDemo !== undefined) {
      updatedFieldsSanitized.deadlineDemo = sanitizeDate(updatedFields.deadlineDemo);
    }
    const updated = designs.map(d => {
      if (d.id === id) {
        return { ...d, ...updatedFieldsSanitized };
      }
      return d;
    });
    setDesigns(updated);
    saveToStorage('mre_designs', updated);

    showToast('success', 'Đã cập nhật thông tin thiết kế.');
    const updatedLogs = addActivityLog(`[Thiết kế] Cập nhật dự án: ${prevDesign?.title || ''} (${id})`, 'info', id);
    const finalGoals = updateGoalsWithLiveActuals(goals, orders, updated, expenses);

    setTimeout(() => {
      syncToGoogleSheets(undefined, { 
        customers, 
        orders, 
        courses, 
        designs: updated, 
        collaborators, 
        campaigns, 
        logs: updatedLogs, 
        expenses, 
        goals: finalGoals
      });
    }, 1000);
  };

  const handleDeleteDesign = (id: string) => {
    const prevDesign = designs.find(d => d.id === id);
    const updated = designs.filter(d => d.id !== id);
    setDesigns(updated);
    saveToStorage('mre_designs', updated);
    showToast('success', 'Đã xóa dự án thiết kế.');
    const updatedLogs = addActivityLog(`[Thiết kế] Xóa dự án: ${prevDesign?.title || ''} (${id})`, 'error', id);
    const finalGoals = updateGoalsWithLiveActuals(goals, orders, updated, expenses);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs: updated, collaborators, campaigns, logs: updatedLogs, expenses, goals: finalGoals });
  };

  const handleAddCollaborator = (newCtv: Collaborator) => {
    const updated = [...collaborators, newCtv];
    setCollaborators(updated);
    saveToStorage('mre_collaborators', updated);
    showToast('success', `Đã đăng ký CTV ${newCtv.name} thành công.`);
    const updatedLogs = addActivityLog(`[CTV] Đăng ký cộng tác viên mới: ${newCtv.name} (${newCtv.id})`, 'success', newCtv.id);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators: updated, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleUpdateCollaborator = (id: string, updatedFields: Partial<Collaborator>) => {
    const prevCtv = collaborators.find(c => c.id === id);
    const updated = collaborators.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
    setCollaborators(updated);
    saveToStorage('mre_collaborators', updated);
    showToast('success', 'Đã cập nhật thông tin cộng tác viên.');
    const updatedLogs = addActivityLog(`[CTV] Cập nhật thông tin CTV: ${prevCtv?.name || ''} (${id})`, 'info', id);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators: updated, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleDeleteCollaborator = (id: string) => {
    const prevCtv = collaborators.find(c => c.id === id);
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    saveToStorage('mre_collaborators', updated);
    showToast('success', 'Đã xóa cộng tác viên.');
    const updatedLogs = addActivityLog(`[CTV] Xóa CTV khỏi hệ thống: ${prevCtv?.name || ''} (${id})`, 'error', id);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators: updated, campaigns, logs: updatedLogs, expenses, goals });
  };

  const handleAddCampaign = (newCampaign: MarketingCampaign) => {
    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    saveToStorage('mre_campaigns', updated);
    showToast('success', `Đã lưu chiến dịch marketing "${newCampaign.title}".`);
    const updatedLogs = addActivityLog(`[Marketing] Soạn và lưu chiến dịch email: ${newCampaign.title} (${newCampaign.id})`, 'success', newCampaign.id);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns: updated, logs: updatedLogs, expenses, goals });
  };

  // Expense Handlers
  const handleAddExpense = (newExpense: Partial<Expense>) => {
    setExpenses(prevExpenses => {
      // Find the max numeric suffix for CPxxxxx
      let maxNum = 0;
      prevExpenses.forEach(e => {
        if (e.id && e.id.startsWith('CP')) {
          const numPart = e.id.substring(2);
          if (/^\d+$/.test(numPart)) {
            const num = parseInt(numPart, 10);
            if (num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
      const nextNum = maxNum + 1;
      const id = `CP${String(nextNum).padStart(5, '0')}`;

      const fullExpense: Expense = {
        ...(newExpense as Omit<Expense, 'id'>),
        date: sanitizeDate(newExpense.date || ''),
        id
      } as Expense;
      const updated = [fullExpense, ...prevExpenses];
      saveToStorage('mre_expenses', updated);
      showToast('success', 'Đã ghi nhận chi phí vận hành mới.');
      const updatedLogs = addActivityLog(`[Chi phí] Ghi nhận chi phí vận hành mới: ${fullExpense.description} (${id})`, 'success', id);
      const finalGoals = updateGoalsWithLiveActuals(goals, orders, designs, updated);
      syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses: updated, goals: finalGoals });
      return updated;
    });
  };

  const handleUpdateExpense = (id: string, updatedFields: Partial<Expense>) => {
    setExpenses(prevExpenses => {
      const prevExpense = prevExpenses.find(e => e.id === id);
      const updatedFieldsSanitized: Partial<Expense> = { ...updatedFields };
      if (updatedFields.date !== undefined) {
        updatedFieldsSanitized.date = sanitizeDate(updatedFields.date);
      }
      const updated = prevExpenses.map(e => (e.id === id ? { ...e, ...updatedFieldsSanitized } : e));
      saveToStorage('mre_expenses', updated);
      showToast('success', 'Đã cập nhật chi phí vận hành.');
      const updatedLogs = addActivityLog(`[Chi phí] Cập nhật chi phí: ${prevExpense?.description || ''} (${id})`, 'info', id);
      const finalGoals = updateGoalsWithLiveActuals(goals, orders, designs, updated);
      syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses: updated, goals: finalGoals });
      return updated;
    });
  };

  // Goals Handlers
  const handleUpdateGoals = (updatedGoals: YearlyGoal[]) => {
    const finalGoals = computeGoalsWithActuals(updatedGoals, orders, designs, expenses);
    setGoals(finalGoals);
    saveToStorage('mre_goals', finalGoals);
    showToast('success', 'Đã cập nhật mục tiêu thành công.');
    const updatedLogs = addActivityLog(`[Mục tiêu] Cập nhật số liệu mục tiêu kinh doanh năm`, 'info', 'MUC_TIEU');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs: updatedLogs, expenses, goals: finalGoals });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prevExpenses => {
      const prevExpense = prevExpenses.find(e => e.id === id);
      const updated = prevExpenses.filter(e => e.id !== id);
      saveToStorage('mre_expenses', updated);
      showToast('success', 'Đã xóa chi phí vận hành.');
      addActivityLog(`[Chi phí] Xóa chi phí vận hành: ${prevExpense?.description || ''} (${id})`, 'error', id);
      updateGoalsWithLiveActuals(goals, orders, designs, updated);
      return updated;
    });
  };

  // Systems controls
  const handleResetDatabase = () => {
    localStorage.removeItem('mre_customers');
    localStorage.removeItem('mre_orders');
    localStorage.removeItem('mre_courses');
    localStorage.removeItem('mre_designs');
    localStorage.removeItem('mre_collaborators');
    localStorage.removeItem('mre_campaigns');
    localStorage.removeItem('mre_logs');
    localStorage.removeItem('mre_expenses');
    localStorage.removeItem('mre_goals');

    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setCourses(INITIAL_COURSES);
    setDesigns(INITIAL_DESIGNS);
    setCollaborators(INITIAL_COLLABORATORS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setLogs(INITIAL_LOGS);
    setExpenses(INITIAL_EXPENSES);
    setGoals(INITIAL_GOALS);
    
    setHasLoadedFromCloud(true);
    syncToGoogleSheets(undefined, {
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      courses: INITIAL_COURSES,
      designs: INITIAL_DESIGNS,
      collaborators: INITIAL_COLLABORATORS,
      campaigns: INITIAL_CAMPAIGNS,
      logs: INITIAL_LOGS,
      expenses: INITIAL_EXPENSES,
      goals: INITIAL_GOALS
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        KHACH_HANG: customers,
        DON_HANG: orders,
        KHOA_HOC: courses,
        THIET_KE: designs,
        CONG_TAC_VIEN: collaborators,
        KPI: campaigns,
        logs: logs,
        CHI_PHI: expenses,
        MUC_TIEU: goals
      }, null, 2)
    );
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `MRE_CRM_backup_2026.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="h-screen bg-bg-offwhite flex flex-col md:flex-row overflow-hidden" id="main_app_wrapper">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-slate-300 h-16 flex items-center justify-between px-6 border-b border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm">
            MR
          </div>
          <span className="font-extrabold text-white text-sm tracking-wide font-sans">
            CRM <span className="text-primary">MRE EDU</span>
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Dynamic Left Sidebar menu — truting/slide-out on mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl z-40 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} id="sidebar_nav_aside">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow animate-pulse">
                MR
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-wide font-sans block">
                  CRM <span className="text-primary">MRE EDU</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono font-bold">{currentTime}</span>
              </div>
            </div>
            {/* Close button on Mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Nav list links */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {/* Dashboard Link */}
            <button
              onClick={() => selectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'dashboard' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bảng Tổng Quan</span>
            </button>

            {/* Customers Link */}
            <button
              onClick={() => selectTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'customers' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Khách Hàng</span>
            </button>

            {/* Orders Link */}
            <button
              onClick={() => selectTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'orders' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Đơn Hàng</span>
            </button>

            {/* Courses Link */}
            <button
              onClick={() => selectTab('courses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'courses' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kho Khóa Học</span>
            </button>

            {/* Designs Link */}
            <button
              onClick={() => selectTab('designs')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'designs' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Dịch Vụ Thiết Kế</span>
            </button>

            {/* Collaborators Link */}
            <button
              onClick={() => selectTab('collaborators')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'collaborators' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Cộng Tác Viên</span>
            </button>

            {/* Expenses Link */}
            <button
              onClick={() => selectTab('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'expenses' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Quản Lý Chi Phí</span>
            </button>

            {/* Goals Link */}
            <button
              onClick={() => selectTab('goals')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'goals' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Mục Tiêu</span>
            </button>

            {/* Marketing Link */}
            <button
              onClick={() => selectTab('marketing')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'marketing' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Marketing Email</span>
            </button>

            {/* AI Phân tích */}
            <button
              onClick={() => selectTab('ai')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed border-primary/20 transition ${
                activeTab === 'ai' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-accent-orange'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Phân Tích (Gemini)</span>
            </button>

            {/* Settings Link */}
            <button
              onClick={() => selectTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'settings' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Sheets Database</span>
            </button>
          </nav>
        </div>

        {/* Footer info lock badge */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex gap-2 items-center text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono">Local-first data backup</span>
          </div>
          <p className="text-[9px] text-slate-600 font-sans">© 2026 Mario Slide. All rights reserved.</p>
        </div>
      </aside>

      {/* Main Container contents */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full space-y-6" id="view_contents_main">
        {/* Render separate views natively inside active states */}
        {activeTab === 'dashboard' && (
          <DashboardView
            customers={customers}
            orders={orders}
            courses={courses}
            designs={designs}
            collaborators={collaborators}
            logs={logs}
            expenses={expenses}
            goals={goals}
            onNavigate={(tab) => setActiveTab(tab)}
            googleSheetUrl={GOOGLE_SHEET_URL}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            courses={courses}
            orders={orders}
            designs={designs}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            isSyncing={isSyncing}
            onScanCourseRegistration={handleScanCourseRegistration}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            customers={customers}
            courses={courses}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
          />
        )}

        {activeTab === 'designs' && (
          <DesignsView
            designs={designs}
            customers={customers}
            collaborators={collaborators}
            onAddDesign={handleAddDesign}
            onUpdateDesign={handleUpdateDesign}
          />
        )}

        {activeTab === 'collaborators' && (
          <CollaboratorsView
            collaborators={collaborators}
            onAddCollaborator={handleAddCollaborator}
            onUpdateCollaborator={handleUpdateCollaborator}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsViewComponent
            goals={goals}
            onUpdateGoals={handleUpdateGoals}
            orders={orders}
            designs={designs}
            expenses={expenses}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingView
            customers={customers}
            courses={courses}
            campaigns={campaigns}
            onAddCampaign={handleAddCampaign}
          />
        )}

        {activeTab === 'ai' && (
          <AiChatView
            customers={customers}
            orders={orders}
            courses={courses}
            designs={designs}
            collaborators={collaborators}
            campaigns={campaigns}
            geminiKeys={geminiKeys}
            expenses={expenses}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            geminiKeys={geminiKeys}
            onSaveGeminiKeys={handleSaveGeminiKeys}
            onExportJSON={handleExportJSON}
            isSyncing={isSyncing}
            onTriggerSync={handleTriggerSync}
            onFetchFromSheets={fetchFromGoogleSheets}
            onTestConnection={handleTestConnection}
          />
        )}
      </main>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm transform transition-all duration-300 ease-out translate-y-0 opacity-100">
          <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border text-white font-sans text-xs font-semibold ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500/30' :
            toast.type === 'error' ? 'bg-red-600 border-red-500/30' : 'bg-slate-800 border-slate-700'
          }`}>
            <div className="relative flex h-2 w-2 items-center justify-center shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                toast.type === 'success' ? 'bg-emerald-400' :
                toast.type === 'error' ? 'bg-red-400' : 'bg-slate-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'error' ? 'bg-red-500' : 'bg-slate-400'
              }`}></span>
            </div>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white transition text-sm font-bold ml-2">×</button>
          </div>
        </div>
      )}
    </div>
  );
}

