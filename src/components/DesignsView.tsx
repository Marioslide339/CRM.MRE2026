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

  const todayStr = '2026-06-18'; // Mock current date

  const isOverdue = (dl: string, status: string) => {
    return status !== 'Hoàn thành' && dl < todayStr;
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
      status: 'Tiếp nhận'
    });

    setIsAddOpen(false);
    setNewTitle('');
    setNewServiceType('');
    setSelectedCustId('');
    setSelectedCtv('');
    setDeadline('');
    setDeadlineDemo('');
  };

  const handleStartEdit = (design: DesignService) => {
    setEditingDesign(design);
    setEditTitle(design.title);
    setEditServiceType((design as any).serviceType || '');
    setEditCustId(design.customerId);
    setEditCtv(design.executor);
    setEditDeadline(design.deadline);
    setEditDeadlineDemo(design.deadlineDemo || design.deadline);
    setEditStatus(design.status);
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
      status: editStatus
    });

    setIsEditOpen(false);
    setEditingDesign(null);
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 font-sans">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3.5 px-6">Mã dự án</th>
                <th className="py-3.5 px-4">Dịch vụ</th>
                <th className="py-3.5 px-4">Yêu cầu thiết kế</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Cộng tác viên</th>
                <th className="py-3.5 px-4">Hạn Demo</th>
                <th className="py-3.5 px-4">Hạn Nghiệm Thu</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {designs.map(design => {
                const overdue = isOverdue(design.deadline, design.status);
                return (
                  <tr key={design.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{design.id}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {(design as any).serviceType || 'Thiết kế PowerPoint'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{design.title}</td>
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-medium text-slate-700">{design.customerName}</p>
                      <p className="text-[10px] text-slate-400">Mã KH: {design.customerId}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{design.executor}</td>
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        design.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        design.status === 'Đang làm' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        design.status === 'Gửi demo' ? 'bg-purple-50 text-purple-750 border-purple-100' :
                        design.status === 'Chỉnh sửa' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-blue-50 text-blue-750 border-blue-100'
                      }`}>
                        {design.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(design)}
                          className="px-2 py-1 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        {onDeleteDesign && (
                          <button
                            onClick={() => handleDelete(design.id)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-105 text-red-650 rounded-lg text-[10px] font-bold transition cursor-pointer"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách hàng đặt hàng*</label>
                <select
                  required
                  value={selectedCustId}
                  onChange={e => setSelectedCustId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Phân bổ cộng tác viên...</option>
                  {collaborators.map(ctv => (
                    <option key={ctv.id} value={ctv.name}>{ctv.name} ({ctv.job})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Gửi Demo (Deadline Demo)*</label>
                  <input
                    type="date"
                    required
                    value={deadlineDemo}
                    onChange={e => setDeadlineDemo(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Nghiệm Thu (Deadline)*</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách hàng đặt hàng*</label>
                <select
                  required
                  value={editCustId}
                  onChange={e => setEditCustId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Phân bổ cộng tác viên...</option>
                  {collaborators.map(ctv => (
                    <option key={ctv.id} value={ctv.name}>{ctv.name} ({ctv.job})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Gửi Demo (Deadline Demo)*</label>
                  <input
                    type="date"
                    required
                    value={editDeadlineDemo}
                    onChange={e => setEditDeadlineDemo(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Nghiệm Thu (Deadline)*</label>
                  <input
                    type="date"
                    required
                    value={editDeadline}
                    onChange={e => setEditDeadline(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái công việc*</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white font-semibold"
                >
                  <option value="Tiếp nhận">Tiếp nhận</option>
                  <option value="Đang làm">Đang làm</option>
                  <option value="Gửi demo">Gửi demo</option>
                  <option value="Chỉnh sửa">Chỉnh sửa</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
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
