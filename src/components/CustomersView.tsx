/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  BookOpen,
  RefreshCw,
  Award,
  CircleCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Inbox,
  X,
  FileText,
  ShoppingBag,
  PenTool
} from 'lucide-react';
import { Customer, Course, Order, DesignService } from '../types';

const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

interface CustomersViewProps {
  customers: Customer[];
  courses: Course[];
  orders: Order[];
  designs: DesignService[];
  onAddCustomer: (newCustomer: Partial<Customer>) => void;
  onUpdateCustomer: (id: string, updated: Partial<Customer>) => void;
  onDeleteCustomer?: (id: string) => void;
  isSyncing?: boolean;
  onScanCourseRegistration?: () => Promise<void>;
}

export default function CustomersView({
  customers,
  courses,
  orders,
  designs,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  isSyncing = false,
  onScanCourseRegistration
}: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      if (isoString.length <= 10) {
        return `${day}/${month}/${year}`;
      }
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'orders' | 'designs'>('orders');

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customerId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  const customerDesigns = useMemo(() => {
    if (!selectedCustomer) return [];
    return designs.filter(d => d.customerId === selectedCustomer.id);
  }, [designs, selectedCustomer]);

  // New customer form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustProvince, setNewCustProvince] = useState('');
  const [newCustWard, setNewCustWard] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustTags, setNewCustTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Edit customer form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustProvince, setEditCustProvince] = useState('Hà Nội');
  const [editCustWard, setEditCustWard] = useState('');
  const [editCustNotes, setEditCustNotes] = useState('');
  const [editCustTags, setEditCustTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');

  // Local state for editing currently selected customer notes
  const [notesEdit, setNotesEdit] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Provinces list for filter
  const provinces = useMemo(() => {
    return Array.from(new Set(customers.map(c => c.province)));
  }, [customers]);

  // Unique tags list
  const allTags = useMemo(() => {
    const list = new Set<string>();
    customers.forEach(c => (c.tags || []).forEach(t => list.add(t)));
    return Array.from(list);
  }, [customers]);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    const cleanSearch = removeAccents(searchTerm).toLowerCase().trim();
    return customers.filter(c => {
      const matchSearch =
        removeAccents(c.name || '').toLowerCase().includes(cleanSearch) ||
        removeAccents(c.email || '').toLowerCase().includes(cleanSearch) ||
        (c.phone || '').includes(cleanSearch) ||
        removeAccents(c.id || '').toLowerCase().includes(cleanSearch);
      const matchProvince = selectedProvince ? c.province === selectedProvince : true;
      const matchTag = selectedTag ? (c.tags || []).includes(selectedTag) : true;
      return matchSearch && matchProvince && matchTag;
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [customers, searchTerm, selectedProvince, selectedTag]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNotesEdit(customer.notes || '');
    setSidebarTab('orders');
  };

  const handleSaveNotes = () => {
    if (selectedCustomer) {
      onUpdateCustomer(selectedCustomer.id, { notes: notesEdit });
      setSelectedCustomer(prev => prev ? { ...prev, notes: notesEdit } : null);
    }
  };

  const handleStartEdit = (customer: Customer) => {
    setEditCustName(customer.name);
    setEditCustEmail(customer.email);
    setEditCustPhone(customer.phone);
    setEditCustProvince(customer.province);
    setEditCustWard(customer.ward || '');
    setEditCustNotes(customer.notes || '');
    setEditCustTags(customer.tags || []);
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const updated = {
      name: editCustName,
      email: editCustEmail,
      phone: editCustPhone,
      province: editCustProvince,
      ward: editCustWard,
      notes: editCustNotes,
      tags: editCustTags
    };
    onUpdateCustomer(selectedCustomer.id, updated);
    setSelectedCustomer(prev => prev ? { ...prev, ...updated } : null);
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      if (onDeleteCustomer) {
        onDeleteCustomer(id);
        setSelectedCustomer(null);
      }
    }
  };

  const handleAddEditTag = () => {
    if (editTagInput.trim() && !editCustTags.includes(editTagInput.trim())) {
      setEditCustTags([...editCustTags, editTagInput.trim()]);
      setEditTagInput('');
    }
  };

  const handleRemoveEditTag = (index: number) => {
    setEditCustTags(editCustTags.filter((_, i) => i !== index));
  };

  const getCustomerSegment = (customer: Customer) => {
    const courseRev = orders
      .filter(o => o.customerId === customer.id && o.paymentStatus === 'Đã thanh toán')
      .reduce((sum, o) => sum + o.price, 0);

    const designRev = designs
      .filter(d => d.customerId === customer.id)
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const totalRev = courseRev + designRev;

    const purchasedCount = (customer.coursesPurchased || []).length;
    const hasDesigns = designs.some(d => d.customerId === customer.id);

    if (purchasedCount === 0 && !hasDesigns) {
      return {
        segment: 'Tiềm năng' as const,
        colorClass: 'bg-slate-50 text-slate-500 border-slate-200',
        text: 'Tiềm năng'
      };
    }

    if (totalRev < 5000000) {
      return {
        segment: 'Hạng Bạc' as const,
        colorClass: 'bg-gradient-to-r from-slate-100 to-zinc-200 text-slate-800 border-slate-300 font-bold shadow-xs',
        text: 'Hạng Bạc'
      };
    }

    if (totalRev <= 10000000) {
      return {
        segment: 'Hạng Vàng' as const,
        colorClass: 'bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-900 border-amber-300 font-bold shadow-xs',
        text: 'Hạng Vàng'
      };
    }

    return {
      segment: 'Hạng Kim Cương' as const,
      colorClass: 'bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-900 border-sky-300 font-bold shadow-xs',
      text: 'Hạng Kim Cương'
    };
  };

  const handleAssessSegment = () => {
    if (!selectedCustomer) return;
    setIsEvaluating(true);

    setTimeout(() => {
      const courseRev = orders
        .filter(o => o.customerId === selectedCustomer.id && o.paymentStatus === 'Đã thanh toán')
        .reduce((sum, o) => sum + o.price, 0);

      const designRev = designs
        .filter(d => d.customerId === selectedCustomer.id)
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const totalRev = courseRev + designRev;

      const purchasedCount = (selectedCustomer.coursesPurchased || []).length;
      const hasDesigns = designs.some(d => d.customerId === selectedCustomer.id);

      let segment: 'Tiềm năng' | 'Hạng Bạc' | 'Hạng Vàng' | 'Hạng Kim Cương' = 'Tiềm năng';
      let summary = '';
      const formattedRev = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRev);

      if (purchasedCount === 0 && !hasDesigns) {
        segment = 'Tiềm năng';
        summary = 'Khách mới có thông tin nhưng chưa đăng ký bất kỳ khóa học hay dự án thiết kế nào.';
      } else if (totalRev < 5000000) {
        segment = 'Hạng Bạc';
        summary = `Hạng Bạc: Khách hàng đã đăng ký dịch vụ với tổng doanh thu tích lũy đạt ${formattedRev} (dưới 5 triệu VND).`;
      } else if (totalRev <= 10000000) {
        segment = 'Hạng Vàng';
        summary = `Hạng Vàng: Khách hàng thân thiết có tổng doanh thu tích lũy đạt ${formattedRev} (từ 5 đến 10 triệu VND).`;
      } else {
        segment = 'Hạng Kim Cương';
        summary = `Hạng Kim Cương: Khách hàng đặc biệt VIP có tổng doanh thu tích lũy đạt ${formattedRev} (trên 10 triệu VND).`;
      }

      const updatedAI = {
        segment,
        summary,
        lastEvaluation: new Date().toISOString()
      };

      onUpdateCustomer(selectedCustomer.id, { aiAnalysis: updatedAI });
      setSelectedCustomer(prev => prev ? { ...prev, aiAnalysis: updatedAI } : null);
      setIsEvaluating(false);
    }, 1200);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newCustTags.includes(tagInput.trim())) {
      setNewCustTags([...newCustTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setNewCustTags(newCustTags.filter((_, i) => i !== index));
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    onAddCustomer({
      name: newCustName,
      email: newCustEmail,
      phone: newCustPhone,
      province: newCustProvince,
      ward: newCustWard,
      tags: newCustTags,
      notes: newCustNotes,
      createdAt: new Date().toISOString(),
      coursesPurchased: [],
      lmsProgress: {},
      aiAnalysis: {
        segment: 'Tiềm năng',
        summary: 'Thành viên mới tạo trên hệ thống CRM.',
        lastEvaluation: new Date().toISOString()
      }
    });

    // Reset Form
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustProvince('');
    setNewCustWard('');
    setNewCustNotes('');
    setNewCustTags([]);
    setIsAddOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ["Mã KH", "Họ và Tên", "Email", "Điện thoại", "Khu vực", "Xã/Phường", "Ghi chú", "Ngày tạo", "Phân hạng"];
    const rows = filteredCustomers.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.province,
      c.ward || "",
      c.notes,
      c.createdAt.substring(0, 10),
      getCustomerSegment(c).text
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mre_khach_hang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="customers_view_container">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            CRM Khách Hàng (KHACH_HANG)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Tự động tạo mã KH, lưu vết lịch sử tương tác, quản lý tag và chia sẻ học tập.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onScanCourseRegistration && (
            <button
              onClick={onScanCourseRegistration}
              disabled={isSyncing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
              id="btn_scan_course_registration"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Quét Web Khóa Học
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition"
            id="btn_export_customers_csv"
          >
            Xuất CSV
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
            id="btn_add_customer"
          >
            <Plus className="w-4 h-4" />
            Thêm Khách Hàng
          </button>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main List Table */}
        <div className={`xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${selectedCustomer ? 'hidden xl:flex' : 'flex'} max-h-[calc(100vh-12rem)]`}>
          {/* Filtering row */}
          <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 sticky top-0 z-10 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên, SĐT, Email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Province selector */}
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 text-slate-600 font-sans"
            >
              <option value="">Tất cả tỉnh thành ({provinces.length})</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Tag selector */}
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 text-slate-600 font-sans"
            >
              <option value="">Lọc theo Tag ({allTags.length})</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Table display (desktop only) */}
          <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600 font-sans">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Mã KH</th>
                  <th className="py-3.5 px-4">Họ và Tên</th>
                  <th className="py-3.5 px-4">Thông tin liên lạc</th>
                  <th className="py-3.5 px-4">Khu vực</th>
                  <th className="py-3.5 px-4">Tags phân hạng</th>
                  <th className="py-3.5 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-indigo-50/40 hover:bg-indigo-50/50' : ''}`}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">{c.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          {(() => {
                            const seg = getCustomerSegment(c);
                            return (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${seg.colorClass}`}>
                                {seg.text}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <span>Tạo:</span>
                          <span>{c.createdAt ? formatDateTime(c.createdAt) : '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {c.ward && c.province ? `${c.ward}, ${c.province}` : (c.ward || c.province || '—')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).map(t => (
                            <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-slate-400 hover:text-indigo-600 transition">
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                      <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      Không tìm thấy khách hàng phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards display (mobile only) */}
          <div className="block md:hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className={`p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col gap-2 ${selectedCustomer?.id === c.id ? 'bg-indigo-50/40 hover:bg-indigo-50/50' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{c.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.createdAt ? formatDateTime(c.createdAt) : ''}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {(() => {
                        const seg = getCustomerSegment(c);
                        return (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${seg.colorClass}`}>
                            {seg.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.province}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(c.tags || []).map(t => (
                      <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 font-mono">
                <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                Không tìm thấy khách hàng phù hợp
              </div>
            )}
          </div>
        </div>

        {/* Customer Detail Side-Panel / Workspace */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col overflow-y-auto ${!selectedCustomer ? 'hidden xl:flex' : 'flex'} max-h-[calc(100vh-12rem)]`}>
          {selectedCustomer ? (
            <div className="space-y-6 animate-fade-in" id="customer_detail_sidebar">
              {/* Header profile */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  {/* On mobile, show a Back button */}
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="xl:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {selectedCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm font-sans">{selectedCustomer.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="text-indigo-600 font-bold">Mã KH: {selectedCustomer.id}</span>
                      <span>•</span>
                      <span>Tạo: {selectedCustomer.createdAt ? formatDateTime(selectedCustomer.createdAt) : '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {(() => {
                    const seg = getCustomerSegment(selectedCustomer);
                    return (
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold font-sans uppercase border ${seg.colorClass}`}>
                        {seg.text}
                      </span>
                    );
                  })()}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleStartEdit(selectedCustomer)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold transition"
                    >
                      Sửa
                    </button>
                    {onDeleteCustomer && (
                      <button
                        onClick={() => handleDelete(selectedCustomer.id)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-[10px] font-semibold transition"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CRM Contact Details list */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Địa chỉ:</span>
                  <span>{selectedCustomer.ward ? `${selectedCustomer.ward}, ${selectedCustomer.province}` : selectedCustomer.province}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Email:</span>
                  <span className="select-all">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Điện thoại:</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
              </div>

              {/* Tag Management */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 font-sans mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Phân Loại Thẻ & Tags
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(selectedCustomer.tags || []).map(t => (
                    <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-100 border border-slate-100 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profile Details Tab Panel */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex border-b border-slate-200 mb-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSidebarTab('orders')}
                    className={`flex-1 pb-2 text-center transition-all cursor-pointer border-b-2 font-bold ${
                      sidebarTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Đơn Hàng ({customerOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab('designs')}
                    className={`flex-1 pb-2 text-center transition-all cursor-pointer border-b-2 font-bold ${
                      sidebarTab === 'designs' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Thiết Kế ({customerDesigns.length})
                  </button>
                </div>

                {/* LMS tab content removed */}

                {sidebarTab === 'orders' && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-primary" />
                      Lịch sử giao dịch đơn hàng
                    </h5>
                    {customerOrders.length > 0 ? (
                      customerOrders.map(o => (
                        <div key={o.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">{o.productName}</span>
                            <span className="font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded font-bold">{o.id}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-mono font-semibold text-slate-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.price)}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{o.createdAt.substring(0, 10)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-200/30">
                            <span className="text-[10px] text-slate-400">Thanh toán:</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              o.paymentStatus === 'Đã thanh toán' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[11px] text-slate-400 font-sans">Chưa có đơn hàng nào.</p>
                      </div>
                    )}
                  </div>
                )}

                {sidebarTab === 'designs' && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <PenTool className="w-3 h-3 text-accent-orange" />
                      Lịch sử dự án thiết kế
                    </h5>
                    {customerDesigns.length > 0 ? (
                      customerDesigns.map(d => (
                        <div key={d.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">{d.title}</span>
                            <span className="font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded font-bold">{d.id}</span>
                          </div>
                          <div className="text-[11px] space-y-1 text-slate-500">
                            <div><span className="text-slate-400">Người thực hiện:</span> <span className="font-medium text-slate-700">{d.executor}</span></div>
                            <div className="flex justify-between font-mono text-[10px] text-slate-400">
                              <span>Demo: {d.deadlineDemo}</span>
                              <span>Hạn: {d.deadline}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-200/30">
                            <span className="text-[10px] text-slate-400">Trạng thái:</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              d.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              d.status === 'Chỉnh sửa' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' :
                              d.status === 'Gửi demo' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              d.status === 'Đang làm' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[11px] text-slate-400 font-sans">Chưa có dự án thiết kế custom.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Auto Classification Evaluator */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 font-sans flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Nhận định Khách hàng (AI Evaluate)
                    </span>
                    <button
                      onClick={handleAssessSegment}
                      disabled={isEvaluating}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isEvaluating ? 'Đang chấm...' : 'Chấm điểm khách'}
                    </button>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">Đánh giá hành vi tự động bằng thuật toán AI CRM</p>
                </div>
                {selectedCustomer.aiAnalysis ? (
                  <div className="mt-3 text-xs space-y-1">
                    <p className="text-slate-600 font-medium leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100">
                      "{selectedCustomer.aiAnalysis.summary}"
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono text-right pt-1">
                      Đánh giá gần nhất: {new Date(selectedCustomer.aiAnalysis.lastEvaluation).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic mt-2">Chưa có kết quả phân khúc hành vi học viên.</p>
                )}
              </div>

              {/* Notes saving section */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-slate-800 font-sans flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Ghi chú nội bộ
                </h4>
                <textarea
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 h-20 resize-none"
                  placeholder="Ghi chú sở thích, phản ứng..."
                  value={notesEdit}
                  onChange={e => setNotesEdit(e.target.value)}
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full text-center py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Lưu Ghi Chú
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400 font-mono">
              <User className="w-12 h-12 text-slate-200 mb-2" id="empty_customer_selection_icon" />
              Chọn khách hàng ở bảng danh sách để cập nhật tiến trình đào tạo LMS và đánh giá AI.
            </div>
          )}
        </div>
      </div>

      {/* Add New Customer Popup Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-900 text-sm">Thêm Khách Hàng CRM Mới</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs font-sans overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên*</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên đầy đủ"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="abc@gmail.com"
                    value={newCustEmail}
                    onChange={e => setNewCustEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập SĐT của khách"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Khu vực Tỉnh thành</label>
                  <input
                    type="text"
                    placeholder="Nhập tỉnh / thành phố"
                    value={newCustProvince}
                    onChange={e => setNewCustProvince(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Xã / Phường</label>
                  <input
                    type="text"
                    placeholder="Nhập Xã / Phường"
                    value={newCustWard}
                    onChange={e => setNewCustWard(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú nhanh</label>
                <input
                  type="text"
                  placeholder="Yêu cầu đặc biệt..."
                  value={newCustNotes}
                  onChange={e => setNewCustNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags phân nhóm (Ví dụ: Khách VIP)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tag mới rồi ấn Thêm"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {newCustTags.map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-50 border border-slate-100 text-slate-600">
                      {t}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow transition cursor-pointer"
                >
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Popup Form Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-semibold text-slate-900 text-sm">Chỉnh sửa thông tin khách hàng</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-sans overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên*</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên đầy đủ"
                  value={editCustName}
                  onChange={e => setEditCustName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="abc@gmail.com"
                    value={editCustEmail}
                    onChange={e => setEditCustEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập SĐT của khách"
                    value={editCustPhone}
                    onChange={e => setEditCustPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Khu vực Tỉnh thành</label>
                  <input
                    type="text"
                    placeholder="Nhập tỉnh / thành phố"
                    value={editCustProvince}
                    onChange={e => setEditCustProvince(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Xã / Phường</label>
                  <input
                    type="text"
                    placeholder="Nhập Xã / Phường"
                    value={editCustWard}
                    onChange={e => setEditCustWard(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú nhanh</label>
                <input
                  type="text"
                  placeholder="Yêu cầu đặc biệt..."
                  value={editCustNotes}
                  onChange={e => setEditCustNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags phân nhóm (Ví dụ: Khách VIP)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tag mới rồi ấn Thêm"
                    value={editTagInput}
                    onChange={e => setEditTagInput(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition text-base md:text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditTag}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editCustTags.map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-50 border border-slate-100 text-slate-600">
                      {t}
                      <button type="button" onClick={() => handleRemoveEditTag(idx)} className="hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow transition cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

