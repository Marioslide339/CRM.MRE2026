/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Users, Coins, Sparkles, TrendingUp, ShieldCheck, Plus, X, Calendar, Filter } from 'lucide-react';
import { Collaborator, DesignService } from '../types';

interface CollaboratorsViewProps {
  collaborators: Collaborator[];
  designs?: DesignService[];
  onAddCollaborator: (newCtv: Collaborator) => void;
  onUpdateCollaborator: (id: string, updated: Partial<Collaborator>) => void;
  onDeleteCollaborator?: (id: string) => void;
}

export default function CollaboratorsView({
  collaborators,
  designs = [],
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator
}: CollaboratorsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newJob, setNewJob] = useState('Thiết kế Slide hoạt hình');
  const [initRev, setInitRev] = useState<number>(0);
  const [newSalary, setNewSalary] = useState<number>(0); // Manual salary input state

  // Edit collaborator states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCtv, setEditingCtv] = useState<Collaborator | null>(null);
  const [editName, setEditName] = useState('');
  const [editJob, setEditJob] = useState('Thiết kế Slide hoạt hình');
  const [editSalary, setEditSalary] = useState<number>(0);

  // Search & Date Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [selectedDayOption, setSelectedDayOption] = useState<'today' | 'yesterday' | '7days' | '30days'>('30days');
  const [selectedWeekOption, setSelectedWeekOption] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMonthOption, setSelectedMonthOption] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYearOption, setSelectedYearOption] = useState<number>(() => new Date().getFullYear());
  const [selectedQuarterOption, setSelectedQuarterOption] = useState<1 | 2 | 3 | 4>(1);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getTodayStrWithDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const activeRange = useMemo(() => {
    const today = new Date();
    
    if (timeFilter === 'day') {
      if (selectedDayOption === 'today') {
        const str = getTodayStrWithDate(today);
        return { start: str, end: str };
      } else if (selectedDayOption === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const str = getTodayStrWithDate(yesterday);
        return { start: str, end: str };
      } else if (selectedDayOption === '7days') {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        return { start: getTodayStrWithDate(start), end: getTodayStrWithDate(today) };
      } else if (selectedDayOption === '30days') {
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        return { start: getTodayStrWithDate(start), end: getTodayStrWithDate(today) };
      }
    }
    
    if (timeFilter === 'week') {
      const year = selectedYearOption;
      const month = selectedMonthOption - 1;
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
      const month = selectedMonthOption - 1;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        start: getTodayStrWithDate(firstDay),
        end: getTodayStrWithDate(lastDay)
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
    
    const todayS = getTodayStrWithDate(today);
    return { start: todayS, end: todayS };
  }, [timeFilter, selectedDayOption, selectedWeekOption, selectedMonthOption, selectedYearOption, selectedQuarterOption, customStart, customEnd]);

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
    if (customStart || customEnd) {
      return `${customStart || 'Đầu'} đến ${customEnd || 'Cuối'}`;
    }
    return 'Tất cả thời gian';
  }, [timeFilter, selectedDayOption, selectedWeekOption, selectedMonthOption, selectedYearOption, selectedQuarterOption, customStart, customEnd]);

  const getCleanName = (name: string) => name.replace(/\s*\(CTV\)\s*/i, '').trim().toLowerCase();
  
  const getDesignDate = (design: DesignService): string => {
    if (design.createdAt) {
      return design.createdAt.split('T')[0];
    }
    return design.deadline || '';
  };

  const processedCollaborators = useMemo(() => {
    return collaborators.map(ctv => {
      const ctvDesigns = designs.filter(d => {
        if (!d.executor) return false;
        const cleanExec = getCleanName(d.executor);
        const cleanCtv = getCleanName(ctv.name);
        return cleanExec === cleanCtv || cleanExec.includes(cleanCtv) || cleanCtv.includes(cleanExec);
      });
      
      const filteredCtvDesigns = ctvDesigns.filter(d => {
        const dDate = getDesignDate(d);
        return dDate >= activeRange.start && dDate <= activeRange.end;
      });
      
      const totalDesigns = filteredCtvDesigns.length;
      const completedDesigns = filteredCtvDesigns.filter(d => d.status === 'Hoàn thành').length;
      const computedEfficiency = totalDesigns > 0 ? Math.round((completedDesigns / totalDesigns) * 100) : 0;
      const computedRevenue = filteredCtvDesigns.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      return {
        ...ctv,
        revenue: computedRevenue,
        efficiency: computedEfficiency,
        totalDesigns,
        completedDesigns
      };
    });
  }, [collaborators, designs, activeRange]);

  const filteredCollaborators = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return processedCollaborators;
    return processedCollaborators.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.job.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  }, [processedCollaborators, searchTerm]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const code = `CTV${String(collaborators.length + 1).padStart(3, '0')}`;

    onAddCollaborator({
      id: code,
      name: `${newName} (CTV)`,
      job: newJob,
      revenue: initRev,
      salary: newSalary,
      efficiency: 95
    });

    setIsAddOpen(false);
    setNewName('');
    setNewJob('Thiết kế Slide hoạt hình');
    setInitRev(0);
    setNewSalary(0);
  };

  const handleStartEdit = (ctv: Collaborator) => {
    setEditingCtv(ctv);
    setEditName(ctv.name.replace(' (CTV)', ''));
    setEditJob(ctv.job);
    setEditSalary(ctv.salary);
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCtv) return;

    onUpdateCollaborator(editingCtv.id, {
      name: `${editName} (CTV)`,
      job: editJob,
      salary: editSalary
    });

    setIsEditOpen(false);
    setEditingCtv(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cộng tác viên này?')) {
      onDeleteCollaborator && onDeleteCollaborator(id);
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

      {/* Time Filter Row */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Summary Info */}
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">Thời Gian Đánh Giá</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="font-bold text-slate-700 uppercase font-sans tracking-wider text-xs whitespace-nowrap">
                Bộ lọc: <span className="text-primary normal-case font-semibold">{filterLabel}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Side: Time Filter controls */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 text-xs lg:px-6">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
              {(['day', 'week', 'month', 'quarter', 'year', 'custom'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTimeFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold cursor-pointer transition ${
                    timeFilter === f ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f === 'day' ? 'Ngày' :
                   f === 'week' ? 'Tuần' :
                   f === 'month' ? 'Tháng' :
                   f === 'quarter' ? 'Quý' :
                   f === 'year' ? 'Năm' : 'Tất cả'}
                </button>
              ))}
            </div>

            {timeFilter === 'day' && (
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 gap-0.5 animate-fade-in">
                {(['today', 'yesterday', '7days', '30days'] as const).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedDayOption(opt)}
                    className={`px-2 py-1 rounded-md text-[10px] md:text-xs font-bold cursor-pointer transition ${
                      selectedDayOption === opt ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {opt === 'today' ? 'Hôm nay' :
                     opt === 'yesterday' ? 'Hôm qua' :
                     opt === '7days' ? '7 ngày' : '30 ngày'}
                  </button>
                ))}
              </div>
            )}

            {timeFilter === 'week' && (
              <div className="flex items-center gap-1 animate-fade-in">
                <select
                  value={selectedWeekOption}
                  onChange={e => setSelectedWeekOption(Number(e.target.value) as any)}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  <option value={1}>Tuần 1</option>
                  <option value={2}>Tuần 2</option>
                  <option value={3}>Tuần 3</option>
                  <option value={4}>Tuần 4</option>
                </select>
                <select
                  value={selectedMonthOption}
                  onChange={e => setSelectedMonthOption(Number(e.target.value))}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
                <select
                  value={selectedYearOption}
                  onChange={e => setSelectedYearOption(Number(e.target.value))}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = 2026 + i;
                    return <option key={y} value={y}>Năm {y}</option>;
                  })}
                </select>
              </div>
            )}

            {timeFilter === 'month' && (
              <div className="flex items-center gap-1 animate-fade-in">
                <select
                  value={selectedMonthOption}
                  onChange={e => setSelectedMonthOption(Number(e.target.value))}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
                <select
                  value={selectedYearOption}
                  onChange={e => setSelectedYearOption(Number(e.target.value))}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = 2026 + i;
                    return <option key={y} value={y}>Năm {y}</option>;
                  })}
                </select>
              </div>
            )}

            {timeFilter === 'quarter' && (
              <div className="flex items-center gap-1 animate-fade-in">
                <select
                  value={selectedQuarterOption}
                  onChange={e => setSelectedQuarterOption(Number(e.target.value) as any)}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  <option value={1}>Quý 1</option>
                  <option value={2}>Quý 2</option>
                  <option value={3}>Quý 3</option>
                  <option value={4}>Quý 4</option>
                </select>
                <select
                  value={selectedYearOption}
                  onChange={e => setSelectedYearOption(Number(e.target.value))}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = 2026 + i;
                    return <option key={y} value={y}>Năm {y}</option>;
                  })}
                </select>
              </div>
            )}

            {timeFilter === 'year' && (
              <div className="flex items-center gap-1 animate-fade-in">
                <select
                  value={selectedYearOption}
                  onChange={e => setSelectedYearOption(Number(e.target.value))}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = 2026 + i;
                    return <option key={y} value={y}>Năm {y}</option>;
                  })}
                </select>
              </div>
            )}

            {timeFilter === 'custom' && (
              <div className="flex items-center gap-1 animate-fade-in">
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] md:text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] md:text-xs font-semibold outline-none text-slate-700 font-sans cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid statistics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaborators Table view */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between max-h-[calc(100vh-18rem)]">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-white sticky top-0 z-10">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm cộng tác viên, công việc..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 transition"
              />
            </div>
          </div>

          {/* Desktop version */}
          <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600 font-sans">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-6">Mã CTV</th>
                  <th className="py-3.5 px-4">Cộng tác viên</th>
                  <th className="py-3.5 px-4">Công việc phụ trách</th>
                  <th className="py-3.5 px-4">Doanh số đóng góp</th>
                  <th className="py-3.5 px-4">Lương quyết toán</th>
                  <th className="py-3.5 px-6 text-right">Hiệu suất công việc</th>
                  <th className="py-3.5 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCollaborators.map(ctv => (
                  <tr key={ctv.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{ctv.id}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{ctv.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{ctv.job}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-700">{formatVND(ctv.revenue)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-indigo-600 bg-indigo-50/20">{formatVND(ctv.salary)}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-800">
                      <div className="inline-flex flex-col items-end justify-center">
                        <div className="flex items-center gap-1.5 justify-end font-bold text-slate-800">
                          <span>{ctv.efficiency}%</span>
                          <span className="text-[10px] text-slate-400 font-normal">({ctv.completedDesigns}/{ctv.totalDesigns})</span>
                        </div>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              ctv.efficiency >= 80 ? 'bg-emerald-500' :
                              ctv.efficiency >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${ctv.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(ctv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        {onDeleteCollaborator && (
                          <button
                            onClick={() => handleDelete(ctv.id)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile version */}
          <div className="block md:hidden divide-y divide-slate-100 overflow-y-auto flex-1" id="collaborators_cards_mobile">
            {filteredCollaborators.length > 0 ? (
              filteredCollaborators.map(ctv => (
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
                      <span className="text-slate-400 block text-[10px]">Lương quyết toán:</span>
                      <span className="font-semibold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">{formatVND(ctv.salary)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex flex-col items-start gap-1 text-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Hiệu suất công việc:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-slate-800">{ctv.efficiency}%</span>
                        <span className="text-[10px] text-slate-400">({ctv.completedDesigns}/{ctv.totalDesigns})</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ctv.efficiency >= 80 ? 'bg-emerald-500' :
                              ctv.efficiency >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${ctv.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleStartEdit(ctv)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                      {onDeleteCollaborator && (
                        <button
                          onClick={() => handleDelete(ctv.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
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
              Quyết Toán Quỹ Lương CTV
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Lương quyết toán được Giám đốc xem xét và điền thủ công dựa trên đối soát thực tế doanh số đóng góp và chất lượng hoàn thành của thiết kế.
            </p>
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tổng doanh thu CTV đem lại:</span>
                <span className="font-mono font-bold text-slate-700">
                  {formatVND(filteredCollaborators.reduce((sum, c) => sum + c.revenue, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tổng chi phí lương CTV cần thanh toán:</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {formatVND(filteredCollaborators.reduce((sum, c) => sum + c.salary, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold font-sans">Đánh Giá Hiệu Suất</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Hiệu suất công việc đo tỷ lệ thiết kế đã ở trạng thái <b>Hoàn thành</b> trên tổng số thiết kế được giao cho CTV đó trong khoảng thời gian được lọc.
            </p>
            <div className="flex items-center gap-2 text-[10px] bg-slate-800 p-3 rounded-xl border border-slate-800 text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dữ liệu đo lường tự động dựa trên nhật ký thiết kế thực tế.</span>
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên môn phụ trách*</label>
                <select
                  value={newJob}
                  onChange={e => setNewJob(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="Thiết kế Slide hoạt hình">Thiết kế Slide hoạt hình</option>
                  <option value="Thiết kế Landing Page">Thiết kế Landing Page</option>
                  <option value="Sáng tạo nội dung / Kịch bản">Sáng tạo nội dung / Kịch bản</option>
                  <option value="Biên tập hoạt họa lồng âm">Biên tập hoạt họa lồng âm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lương quyết toán khởi tạo</label>
                <input
                  type="number"
                  value={newSalary}
                  onChange={e => setNewSalary(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono text-base md:text-xs"
                />
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên môn phụ trách*</label>
                <select
                  value={editJob}
                  onChange={e => setEditJob(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white text-base md:text-xs"
                >
                  <option value="Thiết kế Slide hoạt hình">Thiết kế Slide hoạt hình</option>
                  <option value="Thiết kế Landing Page">Thiết kế Landing Page</option>
                  <option value="Sáng tạo nội dung / Kịch bản">Sáng tạo nội dung / Kịch bản</option>
                  <option value="Biên tập hoạt họa lồng âm">Biên tập hoạt họa lồng âm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lương Quyết Toán* (Giám đốc có quyền điền)</label>
                <input
                  type="number"
                  required
                  value={editSalary}
                  onChange={e => setEditSalary(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono text-base md:text-xs"
                />
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
