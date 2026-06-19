/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PenTool, Calendar, User, CheckCircle2, AlertTriangle, PlayCircle, Plus, Trash2, X } from 'lucide-react';
import { DesignService, Customer, Collaborator } from '../types';

interface DesignsViewProps {
  designs: DesignService[];
  customers: Customer[];
  collaborators: Collaborator[];
  onAddDesign: (newDesign: Partial<DesignService>) => void;
  onUpdateDesign: (id: string, updated: Partial<DesignService>) => void;
  onDeleteDesign?: (id: string) => void;
}

export default function DesignsView({
  designs,
  customers,
  collaborators,
  onAddDesign,
  onUpdateDesign,
  onDeleteDesign
}: DesignsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newServiceType, setNewServiceType] = useState('');
  const [selectedCustId, setSelectedCustId] = useState('');
  const [selectedCtv, setSelectedCtv] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineDemo, setDeadlineDemo] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('created-desc');

  const SERVICE_TYPES = [
    'Thiết kế PowerPoint',
    'Thiết kế E-Learning',
    'Sáng kiến kinh nghiệm',
    'Biện pháp giáo viên giỏi',
    'Thiết kế App giáo dục',
    'Dựng video hoạt hình AI'
  ];

  // Edit design form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignService | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editServiceType, setEditServiceType] = useState('');
  const [editCustId, setEditCustId] = useState('');
  const [editCtv, setEditCtv] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDeadlineDemo, setEditDeadlineDemo] = useState('');
  const [editStatus, setEditStatus] = useState<'Tiếp nhận' | 'Đang làm' | 'Gửi demo' | 'Chỉnh sửa' | 'Hoàn thành'>('Tiếp nhận');
  const [editAmount, setEditAmount] = useState<number | ''>('');

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Filter and Sort designs
  const filteredDesigns = useMemo(() => {
    // 1. Filter
    const filtered = designs.filter(d => {
      const matchSearch =
        !searchTerm ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.executor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchService = !serviceTypeFilter || d.serviceType === serviceTypeFilter;
      const matchCustomer = !customerFilter || d.customerId === customerFilter;

      return matchSearch && matchStatus && matchService && matchCustomer;
    });

    // 2. Sort based on sortBy
    return [...filtered].sort((a, b) => {
      // Completed ('Hoàn thành') status always goes to the bottom
      if (a.status === 'Hoàn thành' && b.status !== 'Hoàn thành') return 1;
      if (a.status !== 'Hoàn thành' && b.status === 'Hoàn thành') return -1;

      if (sortBy === 'created-desc') {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        if (!dateA && !dateB) return b.id.localeCompare(a.id);
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA); // Gần nhất -> Xa nhất
      }

      if (sortBy === 'created-asc') {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        if (!dateA && !dateB) return a.id.localeCompare(b.id);
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB); // Xa nhất -> Gần nhất
      }

      if (sortBy === 'demo-asc') {
        const dateA = a.deadlineDemo || a.deadline || '';
        const dateB = b.deadlineDemo || b.deadline || '';
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB); // Gần nhất -> Xa nhất
      }

      if (sortBy === 'demo-desc') {
        const dateA = a.deadlineDemo || a.deadline || '';
        const dateB = b.deadlineDemo || b.deadline || '';
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA); // Xa nhất -> Gần nhất
      }

      if (sortBy === 'deadline-asc') {
        const dateA = a.deadline || '';
        const dateB = b.deadline || '';
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB); // Gần nhất -> Xa nhất
      }

      if (sortBy === 'deadline-desc') {
        const dateA = a.deadline || '';
        const dateB = b.deadline || '';
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA); // Xa nhất -> Gần nhất
      }

      // Fallback
      return b.id.localeCompare(a.id);
    });
  }, [
    designs,
    searchTerm,
    statusFilter,
    serviceTypeFilter,
    customerFilter,
    sortBy
  ]);

  const isOverdue = (dl: string, status: string) => {
    return status !== 'Hoàn thành' && dl < todayStr;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const date = d.toLocaleDateString('vi-VN');
      const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      return `${date} ${time}`;
    } catch {
      return dateStr;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newServiceType || !selectedCustId || !selectedCtv || !deadline) return;

    const cust = customers.find(c => c.id === selectedCustId);
    if (!cust) return;

    onAddDesign({
      title: newTitle,
      serviceType: newServiceType,
      customerId: cust.id,
      customerName: cust.name,
      executor: selectedCtv,
      deadline,
      deadlineDemo: deadlineDemo || deadline,
      status: 'Tiếp nhận',
      amount: newAmount === '' ? 0 : Number(newAmount),
      createdAt: new Date().toISOString()
    });

    setIsAddOpen(false);
    setNewTitle('');
    setNewServiceType('');
    setSelectedCustId('');
    setSelectedCtv('');
    setDeadline('');
    setDeadlineDemo('');
    setNewAmount('');
  };

  const handleStartEdit = (design: DesignService) => {
    setEditingDesign(design);
    setEditTitle(design.title);
    setEditServiceType(design.serviceType || '');
    setEditCustId(design.customerId);
    setEditCtv(design.executor);
    
    // Clean date strings to ensure strict YYYY-MM-DD format for HTML date inputs
    const cleanDeadline = design.deadline ? design.deadline.substring(0, 10) : '';
    const cleanDeadlineDemo = design.deadlineDemo ? design.deadlineDemo.substring(0, 10) : '';
    
    setEditDeadline(cleanDeadline);
    setEditDeadlineDemo(cleanDeadlineDemo || cleanDeadline);
    setEditStatus(design.status);
    setEditAmount(design.amount !== undefined ? design.amount : '');
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;

    const cust = customers.find(c => c.id === editCustId);
    if (!cust) return;

    onUpdateDesign(editingDesign.id, {
      title: editTitle,
      serviceType: editServiceType,
      customerId: cust.id,
      customerName: cust.name,
      executor: editCtv,
      deadline: editDeadline,
      deadlineDemo: editDeadlineDemo,
      status: editStatus,
      amount: editAmount === '' ? 0 : Number(editAmount)
    });

    setIsEditOpen(false);
    setEditingDesign(null);
    setEditAmount('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu thiết kế này?')) {
      if (onDeleteDesign) {
        onDeleteDesign(id);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="designs_view_container">
      {/* Title */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            Dịch Vụ Thiết Kế Custom (THIET_KE)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Bảng điều phối công việc thiết kế slide hoạt họa, giao deadline và đo lường hiệu quả cộng tác viên (CTV).
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
          id="btn_add_design"
        >
          <Plus className="w-4 h-4" />
          Giao Việc Thiết Kế Mới
        </button>
      </div>

      {/* Grid of designs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <input
                type="text"
                placeholder="Tìm kiếm dự án, khách hàng, CTV..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 transition font-sans"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 text-slate-600 font-sans cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Tiếp nhận">Tiếp nhận</option>
              <option value="Đang làm">Đang làm</option>
              <option value="Gửi demo">Gửi demo</option>
              <option value="Chỉnh sửa">Chỉnh sửa</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>

            {/* Service Type Filter */}
            <select
              value={serviceTypeFilter}
              onChange={e => setServiceTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 text-slate-600 font-sans cursor-pointer truncate"
            >
              <option value="">Tất cả dịch vụ</option>
              {SERVICE_TYPES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Customer Filter */}
            <select
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 text-slate-600 font-sans cursor-pointer truncate"
            >
              <option value="">Tất cả khách hàng</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 text-slate-600 font-sans cursor-pointer"
            >
              <option value="created-desc">Ngày đăng ký: A-z (Gần nhất → Xa nhất)</option>
              <option value="created-asc">Ngày đăng ký: z-a (Xa nhất → Gần nhất)</option>
              <option value="demo-asc">Hạn Demo: a-z (Gần nhất → Xa nhất)</option>
              <option value="demo-desc">Hạn Demo: z-a (Xa nhất → Gần nhất)</option>
              <option value="deadline-asc">Hạn Nghiệm thu: a-z (Gần nhất → Xa nhất)</option>
              <option value="deadline-desc">Hạn Nghiệm thu: z-a (Xa nhất → Gần nhất)</option>
            </select>
          </div>
        </div>
        {/* Desktop version (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 font-sans">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                 <th className="py-3.5 px-6">Mã dự án</th>
                 <th className="py-3.5 px-4">Dịch vụ</th>
                 <th className="py-3.5 px-4">Yêu cầu thiết kế</th>
                 <th className="py-3.5 px-4">Khách hàng</th>
                 <th className="py-3.5 px-4">Cộng tác viên</th>
                 <th className="py-3.5 px-4">Thành tiền</th>
                 <th className="py-3.5 px-4">Hạn Demo</th>
                 <th className="py-3.5 px-4">Hạn Nghiệm Thu</th>
                 <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDesigns.map(design => {
                const overdue = isOverdue(design.deadline, design.status);
                return (
                  <tr key={design.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-4 px-6 space-y-0.5">
                      <p className="font-mono font-bold text-slate-800">{design.id}</p>
                      <p className="text-[9px] text-slate-400 font-mono font-medium block">
                        {design.createdAt ? formatDateTime(design.createdAt) : '-'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {design.serviceType || 'Thiết kế PowerPoint'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{design.title}</td>
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-medium text-slate-700">{design.customerName}</p>
                      <p className="text-[10px] text-slate-400">Mã KH: {design.customerId}</p>
                    </td>
                     <td className="py-4 px-4 font-semibold text-slate-700">{design.executor}</td>
                     <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                       {design.amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(design.amount) : '0 ₫'}
                     </td>
                     <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                       {design.deadlineDemo ? new Date(design.deadlineDemo).toLocaleDateString('vi-VN') : '-'}
                     </td>
                    <td className="py-4 px-4 font-mono">
                      <div className="space-y-0.5">
                        <span className={`text-xs font-semibold ${overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {new Date(design.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        {overdue && (
                          <span className="flex items-center gap-1 text-[9px] text-rose-500 font-bold font-sans">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Quá hạn!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={design.status}
                        onChange={e => onUpdateDesign(design.id, { status: e.target.value as any })}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border outline-none cursor-pointer transition ${
                          design.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          design.status === 'Đang làm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          design.status === 'Gửi demo' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          design.status === 'Chỉnh sửa' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <option value="Tiếp nhận">Tiếp nhận</option>
                        <option value="Đang làm">Đang làm</option>
                        <option value="Gửi demo">Gửi demo</option>
                        <option value="Chỉnh sửa">Chỉnh sửa</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(design)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        {onDeleteDesign && (
                          <button
                            onClick={() => handleDelete(design.id)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile version (Cards) */}
        <div className="block md:hidden divide-y divide-slate-100 max-h-[600px] overflow-y-auto" id="designs_cards_mobile">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map(design => {
              const overdue = isOverdue(design.deadline, design.status);
              return (
                <div key={design.id} className="p-4 space-y-3 hover:bg-slate-50/40 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">{design.id}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {design.createdAt ? formatDateTime(design.createdAt) : ''}
                      </span>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {design.serviceType || 'Thiết kế PowerPoint'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs">{design.title}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">{design.customerName}</span>
                      <span>•</span>
                      <span className="text-slate-400">KH: {design.customerId}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Thành tiền:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {design.amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(design.amount) : '0 ₫'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-slate-400">CTV Phụ trách:</span>
                      <span className="font-semibold text-slate-700">{design.executor}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400">Hạn nghiệm thu:</span>
                      <span className={`font-semibold font-mono ${overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(design.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <select
                      value={design.status}
                      onChange={e => onUpdateDesign(design.id, { status: e.target.value as any })}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border outline-none cursor-pointer transition ${
                        design.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        design.status === 'Đang làm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        design.status === 'Gửi demo' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        design.status === 'Chỉnh sửa' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <option value="Tiếp nhận">Tiếp nhận</option>
                      <option value="Đang làm">Đang làm</option>
                      <option value="Gửi demo">Gửi demo</option>
                      <option value="Chỉnh sửa">Chỉnh sửa</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                    </select>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleStartEdit(design)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                      {onDeleteDesign && (
                        <button
                          onClick={() => handleDelete(design.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Chưa có yêu cầu thiết kế nào
            </div>
          )}
        </div>
      </div>

      {/* Dialog Creation */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Giao Việc Thiết Kế Slide</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dịch vụ thiết kế*</label>
                <select
                  required
                  value={newServiceType}
                  onChange={e => setNewServiceType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="">Chọn dịch vụ thiết kế...</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả Yêu cầu Thiết kế custom*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết kế Slide khóa học y học hạt nhân"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách hàng đặt hàng*</label>
                <select
                  required
                  value={selectedCustId}
                  onChange={e => setSelectedCustId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="">Chọn khách hàng đặt mua...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cộng Tác Viên (CTV) Phụ Trách*</label>
                <select
                  required
                  value={selectedCtv}
                  onChange={e => setSelectedCtv(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="">Phân bổ cộng tác viên...</option>
                  {collaborators.map(ctv => (
                    <option key={ctv.id} value={ctv.name}>{ctv.name} ({ctv.job})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thành tiền (VND)</label>
                <input
                  type="number"
                  placeholder="Nhập số tiền thiết kế..."
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn gửi bản Demo*</label>
                  <input
                    type="date"
                    required
                    value={deadlineDemo}
                    onChange={e => setDeadlineDemo(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Nghiệm Thu*</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition animate-fade-in"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow transition"
                >
                  Phân bổ dự án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Design Modal dialog popup */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Chỉnh Sửa Việc Thiết Kế Custom</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dịch vụ thiết kế*</label>
                <select
                  required
                  value={editServiceType}
                  onChange={e => setEditServiceType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="">Chọn dịch vụ thiết kế...</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả Yêu cầu Thiết kế custom*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết kế Slide khóa học y học hạt nhân"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách hàng đặt hàng*</label>
                <select
                  required
                  value={editCustId}
                  onChange={e => setEditCustId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="">Chọn khách hàng đặt mua...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cộng Tác Viên (CTV) Phụ Trách*</label>
                <select
                  required
                  value={editCtv}
                  onChange={e => setEditCtv(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="">Phân bổ cộng tác viên...</option>
                  {collaborators.map(ctv => (
                    <option key={ctv.id} value={ctv.name}>{ctv.name} ({ctv.job})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thành tiền (VND)</label>
                <input
                  type="number"
                  placeholder="Nhập số tiền thiết kế..."
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn gửi bản Demo*</label>
                  <input
                    type="date"
                    required
                    value={editDeadlineDemo}
                    onChange={e => setEditDeadlineDemo(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Nghiệm Thu*</label>
                  <input
                    type="date"
                    required
                    value={editDeadline}
                    onChange={e => setEditDeadline(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
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
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

