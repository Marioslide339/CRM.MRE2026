/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Coins, Sparkles, TrendingUp, ShieldCheck, Plus, X } from 'lucide-react';
import { Collaborator } from '../types';

interface CollaboratorsViewProps {
  collaborators: Collaborator[];
  onAddCollaborator: (newCtv: Collaborator) => void;
  onUpdateCollaborator: (id: string, updated: Partial<Collaborator>) => void;
  onDeleteCollaborator: (id: string) => void;
}

export default function CollaboratorsView({
  collaborators,
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator
}: CollaboratorsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newJob, setNewJob] = useState('Thiết kế Slide hoạt hình');
  const [initRev, setInitRev] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(30); // Default 30% commission

  // Edit collaborator states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCtv, setEditingCtv] = useState<Collaborator | null>(null);
  const [editName, setEditName] = useState('');
  const [editJob, setEditJob] = useState('Thiết kế Slide hoạt hình');
  const [editRevenue, setEditRevenue] = useState<number>(0);
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editEfficiency, setEditEfficiency] = useState<number>(95);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const code = `CTV${String(collaborators.length + 1).padStart(3, '0')}`;
    const calculatedSalary = (initRev * commissionRate) / 100;

    onAddCollaborator({
      id: code,
      name: `${newName} (CTV)`,
      job: newJob,
      revenue: initRev,
      salary: calculatedSalary,
      efficiency: 95
    });

    setIsAddOpen(false);
    setNewName('');
    setNewJob('Thiết kế Slide hoạt hình');
    setInitRev(0);
    setCommissionRate(30);
  };

  const handleStartEdit = (ctv: Collaborator) => {
    setEditingCtv(ctv);
    setEditName(ctv.name.replace(' (CTV)', ''));
    setEditJob(ctv.job);
    setEditRevenue(ctv.revenue);
    setEditSalary(ctv.salary);
    setEditEfficiency(ctv.efficiency);
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCtv) return;

    onUpdateCollaborator(editingCtv.id, {
      name: `${editName} (CTV)`,
      job: editJob,
      revenue: editRevenue,
      salary: editSalary,
      efficiency: editEfficiency
    });

    setIsEditOpen(false);
    setEditingCtv(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cộng tác viên này?')) {
      onDeleteCollaborator(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="collaborators_view_container">
      {/* Upper header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Cộng Tác Viên & Chia Sẻ Lợi Nhuận (CONG_TAC_VIEN)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Theo dõi hiệu suất làm việc, tính toán doanh số đóng góp và quyết toán đãi ngộ hoa hồng CTV tự động.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
          id="btn_add_ctv"
        >
          <Plus className="w-4 h-4" />
          Đăng Ký CTV Mới
        </button>
      </div>

      {/* Main Grid statistics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaborators Table view */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          {/* Desktop version */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 font-sans">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Mã CTV</th>
                  <th className="py-3.5 px-4">Cộng tác viên</th>
                  <th className="py-3.5 px-4">Công việc phụ trách</th>
                  <th className="py-3.5 px-4">Doanh số đóng góp</th>
                  <th className="py-3.5 px-4">Lương quyết toán (30%)</th>
                  <th className="py-3.5 px-6 text-right">KPI Hoàn thành</th>
                  <th className="py-3.5 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collaborators.map(ctv => (
                  <tr key={ctv.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{ctv.id}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{ctv.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{ctv.job}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-700">{formatVND(ctv.revenue)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-indigo-600 bg-indigo-50/20">{formatVND(ctv.salary)}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-800">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <span className="text-xs">{ctv.efficiency}%</span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full"
                            style={{ width: `${ctv.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(ctv)}
                          className="px-2 py-1 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(ctv.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-105 text-red-650 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile version */}
          <div className="block md:hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto" id="collaborators_cards_mobile">
            {collaborators.length > 0 ? (
              collaborators.map(ctv => (
                <div key={ctv.id} className="p-4 space-y-3 hover:bg-slate-50/40 transition">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">{ctv.id}</span>
                    <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider">{ctv.job}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{ctv.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Doanh số đóng góp:</span>
                      <span className="font-semibold text-slate-700 font-mono">{formatVND(ctv.revenue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Lương quyết toán (30%):</span>
                      <span className="font-semibold text-indigo-650 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">{formatVND(ctv.salary)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[10px]">KPI:</span>
                      <span className="font-bold font-mono text-slate-800">{ctv.efficiency}%</span>
                      <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${ctv.efficiency}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleStartEdit(ctv)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(ctv.id)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                Chưa đăng ký cộng tác viên nào
              </div>
            )}
          </div>
        </div>

        {/* Financial accounting explanation widget */}
        <div className="space-y-6">
          {/* Box 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Công Thức Quyết Toán Tự Động
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Hệ thống sử dụng Apps Script tự động cộng gộp doanh thu từ Sheet <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px] text-indigo-600">DON_HANG</span> và trích xuất tỷ lệ hoa hồng đại lý tiêu chuẩn là <span className="font-bold text-slate-800">30%</span> để tính quỹ lương cho từng CTV.
            </p>
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tổng doanh thu CTV đem lại:</span>
                <span className="font-mono font-bold text-slate-700">
                  {formatVND(collaborators.reduce((sum, c) => sum + c.revenue, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tổng chi phí lương CTV cần thanh toán:</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {formatVND(collaborators.reduce((sum, c) => sum + c.salary, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold font-sans">Đánh Giá Hiệu Suất KPI</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Mỗi dự án thiết kế slide được nghiệm thu thành công trước hạn (Deadline) sẽ gia tăng điểm chỉ số uy tín (Efficiency) của CTV đó. Điểm trung bình cao hơn 90% sẽ giúp CTV đủ điều kiện nhận gói thưởng quý Mario Slide.
            </p>
            <div className="flex items-center gap-2 text-[10px] bg-slate-800 p-3 rounded-xl border border-slate-800 text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Chế độ kiểm duyệt chi lương an toàn tự động hoạt động liên tục.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Adding dialog popup */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Đăng ký Cộng tác viên mới</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên CTV*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Văn Định"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên môn phụ trách*</label>
                <select
                  value={newJob}
                  onChange={e => setNewJob(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="Thiết kế Slide hoạt hình">Thiết kế Slide hoạt hình</option>
                  <option value="Thiết kế Landing Page">Thiết kế Landing Page</option>
                  <option value="Sáng tạo nội dung / Kịch bản">Sáng tạo nội dung / Kịch bản</option>
                  <option value="Biên tập hoạt họa lồng âm">Biên tập hoạt họa lồng âm</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mức doanh thu khởi tạo</label>
                  <input
                    type="number"
                    value={initRev}
                    onChange={e => setInitRev(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">% Hoa hồng thụ hưởng</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={e => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow transition"
                >
                  Lưu Cộng Tác Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collaborator Modal popup */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Chỉnh sửa thông tin Cộng tác viên</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên CTV*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Văn Định"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên môn phụ trách*</label>
                <select
                  value={editJob}
                  onChange={e => setEditJob(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="Thiết kế Slide hoạt hình">Thiết kế Slide hoạt hình</option>
                  <option value="Thiết kế Landing Page">Thiết kế Landing Page</option>
                  <option value="Sáng tạo nội dung / Kịch bản">Sáng tạo nội dung / Kịch bản</option>
                  <option value="Biên tập hoạt họa lồng âm">Biên tập hoạt họa lồng âm</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doanh số đóng góp</label>
                  <input
                    type="number"
                    value={editRevenue}
                    onChange={e => setEditRevenue(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lương thụ hưởng</label>
                  <input
                    type="number"
                    value={editSalary}
                    onChange={e => setEditSalary(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">KPI Hoàn thành %</label>
                  <input
                    type="number"
                    value={editEfficiency}
                    onChange={e => setEditEfficiency(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono"
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
