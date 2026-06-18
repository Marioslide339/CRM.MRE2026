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
  DollarSign
} from 'lucide-react';
import { Customer, Order, Course, DesignService, Collaborator, AutomationLog, MarketingCampaign, Expense } from './types';
import {
  INITIAL_COURSES,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_DESIGNS,
  INITIAL_COLLABORATORS,
  INITIAL_CAMPAIGNS,
  INITIAL_LOGS,
  INITIAL_EXPENSES
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Unified State with localStorage persistence
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [designs, setDesigns] = useState<DesignService[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Google Sheets integration and Gemini rotation
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('https://script.google.com/macros/s/AKfycbzOyt6C_HPngthIrgpx91ieNB_osHyYcsfvQJ9WMVK5239806O-884JNpm2wfyrvefLAg/exec');
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
    return custs.map(c => ({
      ...c,
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
    }));
  };

  // Load from local storage on component mount
  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem('mre_customers');
      const storedOrders = localStorage.getItem('mre_orders');
      const storedCourses = localStorage.getItem('mre_courses');
      const storedDesigns = localStorage.getItem('mre_designs');
      const storedCollaborators = localStorage.getItem('mre_collaborators');
      const storedCampaigns = localStorage.getItem('mre_campaigns');
      const storedLogs = localStorage.getItem('mre_logs');
      const storedExpenses = localStorage.getItem('mre_expenses');
      const storedSheetUrl = localStorage.getItem('mre_sheet_url') || 'https://script.google.com/macros/s/AKfycbzOyt6C_HPngthIrgpx91ieNB_osHyYcsfvQJ9WMVK5239806O-884JNpm2wfyrvefLAg/exec';
      const storedKeys = localStorage.getItem('mre_gemini_keys');

      const rawCustomers = storedCustomers ? JSON.parse(storedCustomers) : INITIAL_CUSTOMERS;
      setCustomers(sanitizeCustomers(rawCustomers));
      setOrders(storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS);
      setCourses(storedCourses ? JSON.parse(storedCourses) : INITIAL_COURSES);
      setDesigns(storedDesigns ? JSON.parse(storedDesigns) : INITIAL_DESIGNS);
      setCollaborators(storedCollaborators ? JSON.parse(storedCollaborators) : INITIAL_COLLABORATORS);
      setCampaigns(storedCampaigns ? JSON.parse(storedCampaigns) : INITIAL_CAMPAIGNS);
      setLogs(storedLogs ? JSON.parse(storedLogs) : INITIAL_LOGS);
      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : INITIAL_EXPENSES);
      setGoogleSheetUrl(storedSheetUrl);
      setGeminiKeys(storedKeys ? JSON.parse(storedKeys) : []);
    } catch (e) {
      console.error('Failed to parse cached database:', e);
      setCustomers(sanitizeCustomers(INITIAL_CUSTOMERS));
      setOrders(INITIAL_ORDERS);
      setCourses(INITIAL_COURSES);
      setDesigns(INITIAL_DESIGNS);
      setCollaborators(INITIAL_COLLABORATORS);
      setCampaigns(INITIAL_CAMPAIGNS);
      setLogs(INITIAL_LOGS);
      setExpenses(INITIAL_EXPENSES);
    }
  }, []);

  // Update localStorage helper
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Live Sync to Google Sheet
  const syncToGoogleSheets = async (urlToUse?: string, forcedData?: any) => {
    const url = urlToUse || googleSheetUrl;
    if (!url) return;
    
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
        expenses
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
      showToast('success', 'Đồng bộ dữ liệu lên Google Sheets thành công!');
    } catch (err) {
      console.error('Google Sheets write error:', err);
      showToast('error', 'Không thể đồng bộ dữ liệu lên Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromGoogleSheets = async (urlToUse?: string) => {
    const url = urlToUse || googleSheetUrl;
    if (!url) return;
    
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
          setDesigns(data.designs);
          saveToStorage('mre_designs', data.designs);
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
          setExpenses(data.expenses);
          saveToStorage('mre_expenses', data.expenses);
        }
        showToast('success', 'Tải dữ liệu mới từ Google Sheets thành công!');
      }
    } catch (err) {
      console.error('Google Sheets read error:', err);
      showToast('error', 'Không thể đồng bộ dữ liệu từ Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveGoogleSheetUrl = (url: string) => {
    setGoogleSheetUrl(url);
    saveToStorage('mre_sheet_url', url);
    if (url) {
      syncToGoogleSheets(url);
    }
  };

  const handleSaveGeminiKeys = (keys: string[]) => {
    setGeminiKeys(keys);
    saveToStorage('mre_gemini_keys', keys);
  };

  const handleTriggerSync = async () => {
    await syncToGoogleSheets();
  };

  const handleTestConnection = async (email: string) => {
    if (!googleSheetUrl) {
      showToast('error', 'Vui lòng cấu hình URL Google Apps Script Web App trước!');
      throw new Error('Chưa cấu hình URL Web App');
    }
    try {
      const response = await fetch(googleSheetUrl, {
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
    if (!googleSheetUrl) return;
    try {
      const response = await fetch(googleSheetUrl, {
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
    syncToGoogleSheets(undefined, { customers: updated, orders, courses, designs, collaborators, campaigns, logs, expenses });
  };

  const handleUpdateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    setCustomers(updated);
    saveToStorage('mre_customers', updated);
    showToast('success', 'Đã cập nhật thông tin khách hàng.');
    syncToGoogleSheets(undefined, { customers: updated, orders, courses, designs, collaborators, campaigns, logs, expenses });
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveToStorage('mre_customers', updated);
    showToast('success', 'Đã xóa khách hàng khỏi hệ thống.');
    syncToGoogleSheets(undefined, { customers: updated, orders, courses, designs, collaborators, campaigns, logs, expenses });
  };

  const handleAddOrder = (newOrder: Partial<Order>) => {
    const id = `DH${String(orders.length + 1).padStart(4, '0')}`;
    const fullOrder: Order = {
      ...(newOrder as Omit<Order, 'id'>),
      id,
      createdAt: newOrder.createdAt || new Date().toISOString()
    } as Order;
    const updated = [fullOrder, ...orders];
    setOrders(updated);
    saveToStorage('mre_orders', updated);
    showToast('success', `Đã tạo đơn hàng ${id} thành công!`);

    if (fullOrder.paymentStatus === 'Đã thanh toán') {
      linkPurchasedCourseToClient(fullOrder.customerId, fullOrder.productId, fullOrder, updated);
    } else {
      syncToGoogleSheets(undefined, { customers, orders: updated, courses, designs, collaborators, campaigns, logs, expenses });
    }
  };

  const linkPurchasedCourseToClient = (customerId: string, productId: string, orderRef: Order, updatedOrdersList?: Order[], triggerAppsScript: boolean = true) => {
    let updatedCusts = customers;
    setCustomers(prevCustomers => {
      const updated = prevCustomers.map(c => {
        if (c.id === customerId) {
          const list = c.coursesPurchased || [];
          if (!list.includes(productId)) {
            const newList = [...list, productId];
            const newLmsProgress = { ...(c.lmsProgress || {}), [productId]: 10 };
            return {
              ...c,
              coursesPurchased: newList,
              lmsProgress: newLmsProgress
            };
          }
        }
        return c;
      });
      updatedCusts = updated;
      saveToStorage('mre_customers', updated);
      return updated;
    });

    let updatedCtvs = collaborators;
    const randomAssignee = collaborators[Math.floor(Math.random() * collaborators.length)];
    if (randomAssignee && orderRef.price > 1000000) {
      setCollaborators(prevCtvs => {
        const u = prevCtvs.map(ctv => {
          if (ctv.id === randomAssignee.id) {
            const addedRev = orderRef.price;
            const updatedRev = ctv.revenue + addedRev;
            const updatedSalary = (updatedRev * 30) / 100;
            
            // Auto add expense for CTV salary payout
            setTimeout(() => {
              handleAddExpense({
                date: new Date().toISOString().split('T')[0],
                category: 'Trả lương',
                amount: Math.round((orderRef.price * 30) / 100),
                description: `Trích xuất 30% hoa hồng CTV ${ctv.name} từ đơn hàng ${orderRef.id}`
              });
            }, 500);

            return {
              ...ctv,
              revenue: updatedRev,
              salary: updatedSalary
            };
          }
          return ctv;
        });
        updatedCtvs = u;
        saveToStorage('mre_collaborators', u);
        return u;
      });
    }

    setTimeout(() => {
      syncToGoogleSheets(undefined, {
        customers: updatedCusts,
        orders: updatedOrdersList || orders,
        courses,
        designs,
        collaborators: updatedCtvs,
        campaigns,
        logs,
        expenses
      });
      if (triggerAppsScript) {
        runAppsScriptActivation(orderRef);
      }
    }, 1000);
  };

  const handleUpdateOrder = (id: string, updatedFields: Partial<Order>, triggerAppsScript: boolean = true) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        const withUpdated = { ...o, ...updatedFields };
        if (updatedFields.paymentStatus === 'Đã thanh toán' && o.paymentStatus !== 'Đã thanh toán') {
          linkPurchasedCourseToClient(o.customerId, o.productId, withUpdated, updated, triggerAppsScript);
        }
        return withUpdated;
      }
      return o;
    });
    setOrders(updated);
    saveToStorage('mre_orders', updated);
    showToast('success', 'Đã cập nhật thông tin đơn hàng.');
    syncToGoogleSheets(undefined, { customers, orders: updated, courses, designs, collaborators, campaigns, logs, expenses });
  };

  const handleDeleteOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    saveToStorage('mre_orders', updated);
    showToast('success', 'Đã xóa đơn hàng.');
    syncToGoogleSheets(undefined, { customers, orders: updated, courses, designs, collaborators, campaigns, logs, expenses });
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
    if (googleSheetUrl) {
      try {
        const response = await fetch(googleSheetUrl, {
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
    syncToGoogleSheets(undefined, { customers, orders, courses: updated, designs, collaborators, campaigns, logs, expenses });
  };

  const handleUpdateCourse = (id: string, updatedFields: Partial<Course>) => {
    const updated = courses.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
    setCourses(updated);
    saveToStorage('mre_courses', updated);
    showToast('success', 'Đã cập nhật thông tin khóa học.');
    syncToGoogleSheets(undefined, { customers, orders, courses: updated, designs, collaborators, campaigns, logs, expenses });
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveToStorage('mre_courses', updated);
    showToast('success', 'Đã xóa khóa học khỏi kho.');
    syncToGoogleSheets(undefined, { customers, orders, courses: updated, designs, collaborators, campaigns, logs, expenses });
  };

  const handleAddDesign = (newDesign: Partial<DesignService>) => {
    const id = `TK${String(designs.length + 1).padStart(4, '0')}`;
    const fullDesign: DesignService = {
      ...(newDesign as Omit<DesignService, 'id'>),
      id,
      deadlineDemo: newDesign.deadlineDemo || newDesign.deadline || new Date().toISOString().split('T')[0],
      status: newDesign.status || 'Tiếp nhận'
    } as DesignService;
    const updated = [fullDesign, ...designs];
    setDesigns(updated);
    saveToStorage('mre_designs', updated);
    showToast('success', 'Đã giao dự án thiết kế mới cho CTV.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs: updated, collaborators, campaigns, logs, expenses });
  };

  const handleUpdateDesign = (id: string, updatedFields: Partial<DesignService>) => {
    const prevDesign = designs.find(d => d.id === id);
    const updated = designs.map(d => {
      if (d.id === id) {
        return { ...d, ...updatedFields };
      }
      return d;
    });
    setDesigns(updated);
    saveToStorage('mre_designs', updated);

    let updatedCtvs = collaborators;
    let updatedExpenses = expenses;

    if (updatedFields.status === 'Hoàn thành' && prevDesign && prevDesign.status !== 'Hoàn thành') {
      const ctvName = prevDesign.executor;
      const budget = 2000000; // Simulated custom design price
      const payout = Math.round(budget * 0.3); // 30% standard payout = 600k

      // Update collaborator stats
      const uCtvs = collaborators.map(c => {
        if (c.name === ctvName) {
          return {
            ...c,
            revenue: c.revenue + budget,
            salary: c.salary + payout
          };
        }
        return c;
      });
      setCollaborators(uCtvs);
      updatedCtvs = uCtvs;
      saveToStorage('mre_collaborators', uCtvs);

      // Add payout expense
      const expenseId = `CP${String(expenses.length + 1).padStart(4, '0')}`;
      const newExpense: Expense = {
        id: expenseId,
        date: new Date().toISOString().split('T')[0],
        category: 'Trả lương',
        amount: payout,
        description: `Quyết toán 30% hoa hồng CTV ${ctvName} - Thiết kế custom: ${prevDesign.title}`
      };
      const uExp = [newExpense, ...expenses];
      setExpenses(uExp);
      updatedExpenses = uExp;
      saveToStorage('mre_expenses', uExp);

      showToast('success', `Nghiệm thu thiết kế! Tự động quyết toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payout)} hoa hồng cho ${ctvName}.`);
    } else {
      showToast('success', 'Đã cập nhật thông tin thiết kế.');
    }

    setTimeout(() => {
      syncToGoogleSheets(undefined, { 
        customers, 
        orders, 
        courses, 
        designs: updated, 
        collaborators: updatedCtvs, 
        campaigns, 
        logs, 
        expenses: updatedExpenses 
      });
    }, 1000);
  };

  const handleDeleteDesign = (id: string) => {
    const updated = designs.filter(d => d.id !== id);
    setDesigns(updated);
    saveToStorage('mre_designs', updated);
    showToast('success', 'Đã xóa dự án thiết kế.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs: updated, collaborators, campaigns, logs, expenses });
  };

  const handleAddCollaborator = (newCtv: Collaborator) => {
    const updated = [...collaborators, newCtv];
    setCollaborators(updated);
    saveToStorage('mre_collaborators', updated);
    showToast('success', `Đã đăng ký CTV ${newCtv.name} thành công.`);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators: updated, campaigns, logs, expenses });
  };

  const handleUpdateCollaborator = (id: string, updatedFields: Partial<Collaborator>) => {
    const updated = collaborators.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
    setCollaborators(updated);
    saveToStorage('mre_collaborators', updated);
    showToast('success', 'Đã cập nhật thông tin cộng tác viên.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators: updated, campaigns, logs, expenses });
  };

  const handleDeleteCollaborator = (id: string) => {
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    saveToStorage('mre_collaborators', updated);
    showToast('success', 'Đã xóa cộng tác viên.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators: updated, campaigns, logs, expenses });
  };

  const handleAddCampaign = (newCampaign: MarketingCampaign) => {
    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    saveToStorage('mre_campaigns', updated);
    showToast('success', `Đã lưu chiến dịch marketing "${newCampaign.title}".`);
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns: updated, logs, expenses });
  };

  // Expense Handlers
  const handleAddExpense = (newExpense: Partial<Expense>) => {
    const id = `CP${String(expenses.length + 1).padStart(4, '0')}`;
    const fullExpense: Expense = {
      ...(newExpense as Omit<Expense, 'id'>),
      id
    } as Expense;
    const updated = [fullExpense, ...expenses];
    setExpenses(updated);
    saveToStorage('mre_expenses', updated);
    showToast('success', 'Đã ghi nhận chi phí vận hành mới.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs, expenses: updated });
  };

  const handleUpdateExpense = (id: string, updatedFields: Partial<Expense>) => {
    const updated = expenses.map(e => (e.id === id ? { ...e, ...updatedFields } : e));
    setExpenses(updated);
    saveToStorage('mre_expenses', updated);
    showToast('success', 'Đã cập nhật chi phí vận hành.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs, expenses: updated });
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveToStorage('mre_expenses', updated);
    showToast('success', 'Đã xóa chi phí vận hành.');
    syncToGoogleSheets(undefined, { customers, orders, courses, designs, collaborators, campaigns, logs, expenses: updated });
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

    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setCourses(INITIAL_COURSES);
    setDesigns(INITIAL_DESIGNS);
    setCollaborators(INITIAL_COLLABORATORS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setLogs(INITIAL_LOGS);
    setExpenses(INITIAL_EXPENSES);
    
    syncToGoogleSheets(undefined, {
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      courses: INITIAL_COURSES,
      designs: INITIAL_DESIGNS,
      collaborators: INITIAL_COLLABORATORS,
      campaigns: INITIAL_CAMPAIGNS,
      logs: INITIAL_LOGS,
      expenses: INITIAL_EXPENSES
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
        CHI_PHI: expenses
      }, null, 2)
    );
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `MRE_CRM_backup_2026.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="min-h-screen bg-bg-offwhite flex flex-col md:flex-row shadow-inner pb-12 sm:pb-0" id="main_app_wrapper">
      {/* Dynamic Left Sidebar menu */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl" id="sidebar_nav_aside">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow animate-pulse">
                MR
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-wide font-sans block">
                  MRE <span className="text-primary">CÔNG NGHỆ</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono font-bold">● Active Sandbox</span>
              </div>
            </div>
          </div>

          {/* Nav list links */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {/* Dashboard Link */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'dashboard' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bảng Tổng Quan</span>
            </button>

            {/* Customers Link */}
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'customers' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Khách Hàng</span>
            </button>

            {/* Orders Link */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'orders' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Đơn Hàng</span>
            </button>

            {/* Courses Link */}
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'courses' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kho Khóa Học</span>
            </button>

            {/* Designs Link */}
            <button
              onClick={() => setActiveTab('designs')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'designs' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Dịch Vụ Thiết Kế</span>
            </button>

            {/* Collaborators Link */}
            <button
              onClick={() => setActiveTab('collaborators')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'collaborators' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Cộng Tác Viên</span>
            </button>

            {/* Expenses Link */}
            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'expenses' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Quản Lý Chi Phí</span>
            </button>

            {/* Marketing Link */}
            <button
              onClick={() => setActiveTab('marketing')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'marketing' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Marketing Email</span>
            </button>

            {/* AI Phân tích */}
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed border-primary/20 transition ${
                activeTab === 'ai' ? 'bg-gradient-to-r from-primary to-accent-orange text-white shadow-lg font-bold' : 'hover:bg-slate-800/60 text-accent-orange'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Phân Tích (Gemini)</span>
            </button>

            {/* Settings Link */}
            <button
              onClick={() => setActiveTab('settings')}
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
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6" id="view_contents_main">
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
            onNavigate={(tab) => setActiveTab(tab)}
            googleSheetUrl={googleSheetUrl}
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
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            customers={customers}
            courses={courses}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {activeTab === 'designs' && (
          <DesignsView
            designs={designs}
            customers={customers}
            collaborators={collaborators}
            onAddDesign={handleAddDesign}
            onUpdateDesign={handleUpdateDesign}
            onDeleteDesign={handleDeleteDesign}
          />
        )}

        {activeTab === 'collaborators' && (
          <CollaboratorsView
            collaborators={collaborators}
            onAddCollaborator={handleAddCollaborator}
            onUpdateCollaborator={handleUpdateCollaborator}
            onDeleteCollaborator={handleDeleteCollaborator}
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
            googleSheetUrl={googleSheetUrl}
            onSaveGoogleSheetUrl={handleSaveGoogleSheetUrl}
            geminiKeys={geminiKeys}
            onSaveGeminiKeys={handleSaveGeminiKeys}
            onResetDatabase={handleResetDatabase}
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
