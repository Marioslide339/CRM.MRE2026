import React, { useState, useMemo } from 'react';
import { Coins, Plus, Trash2, Edit2, Search, Filter, Calendar } from 'lucide-react';
import { Expense } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (newExpense: Partial<Expense>) => void;
  onUpdateExpense: (id: string, updated: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesView({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: ExpensesViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: get yesterday's local date string YYYY-MM-DD
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form states
  const [date, setDate] = useState(getYesterdayStr());
  const [category, setCategory] = useState<'Chi phí quảng cáo' | 'Văn phòng phẩm' | 'Trả lương' | 'Phần mềm dịch vụ' | 'Thuế VAT' | 'Thuế TNDN' | 'Khác'>('Chi phí quảng cáo');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [hasTax, setHasTax] = useState(true);
  const [taxRate, setTaxRate] = useState<number>(11);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setDate(getYesterdayStr());
    setCategory('Chi phí quảng cáo');
    setAmount(0);
    setDescription('');
    setHasTax(true);
    setTaxRate(11);
    setIsSubmitting(false);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setDate(exp.date);
    setCategory(exp.category);
    // Base amount is total amount minus tax amount, or calculated back if taxAmount is missing
    const baseAmount = exp.taxAmount !== undefined
      ? exp.amount - exp.taxAmount
      : (exp.hasTax && exp.taxRate ? Math.round(exp.amount / (1 + exp.taxRate / 100)) : exp.amount);
    setAmount(baseAmount);
    setDescription(exp.description);
    setHasTax(exp.hasTax ?? (exp.category === 'Chi phí quảng cáo'));
    setTaxRate(exp.taxRate ?? (exp.category === 'Chi phí quảng cáo' ? 11 : 0));
    setIsSubmitting(false);
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) return;
    // Guard against double-submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const taxAmount = hasTax && taxRate > 0 ? Math.round(amount * taxRate / 100) : 0;
      const totalAmount = amount + taxAmount;

      if (editingExpense) {
        onUpdateExpense(editingExpense.id, {
          date,
          category,
          amount: totalAmount,
          description,
          hasTax,
          taxRate: hasTax ? taxRate : 0,
          taxAmount
        });
      } else {
        onAddExpense({
          date,
          category,
          amount: totalAmount,
          description,
          hasTax,
          taxRate: hasTax ? taxRate : 0,
          taxAmount
        });
      }
      setIsAddOpen(false);
      // Reset submitting status after 1 second to prevent immediate double-click submits
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(exp => {
        const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              exp.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? exp.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Sort by date descending (newest first), then by id descending
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.id.localeCompare(a.id);
      });
  }, [expenses, searchTerm, selectedCategory]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleExportCSV = () => {
    const headers = ["Mã Chi Phí", "Ngày chi", "Danh mục", "Số tiền (VND)", "Mô tả"];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      e.category,
      e.amount,
      e.description
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mre_chi_phi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="expenses_view_container">
      {/* Title */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Chi Phí Vận Hành (CHI_PHI)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Theo dõi chi phí quảng cáo, văn phòng phẩm, trả lương, phần mềm dịch vụ, thuế VAT và thuế TNDN.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition"
            id="btn_export_expenses_csv"
          >
            Xuất CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
            id="btn_add_expense"
          >
            <Plus className="w-4 h-4" />
            Ghi Nhận Chi Phí Mới
          </button>
        </div>
      </div>

      {/* KPI Cards row */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between" id="expenses_summary_card">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">TỔNG CHI PHÍ HIỆN TẠI</span>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-primary">
            {formatVND(totalExpense)}
          </h3>
        </div>
        <div className="p-3 bg-red-50 text-primary rounded-2xl shadow-inner">
          <Coins className="w-6 h-6" />
        </div>
      </div>

      {/* Table & filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-18rem)]">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sticky top-0 z-10 bg-white">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm chi tiết, mã chi phí..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 transition"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs outline-none focus:border-slate-400 text-slate-600 font-sans appearance-none cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                <option value="Chi phí quảng cáo">Chi phí quảng cáo</option>
                <option value="Văn phòng phẩm">Văn phòng phẩm</option>
                <option value="Trả lương">Trả lương</option>
                <option value="Phần mềm dịch vụ">Phần mềm dịch vụ</option>
                <option value="Thuế VAT">Thuế VAT</option>
                <option value="Thuế TNDN">Thuế TNDN</option>
                <option value="Khác">Khác</option>
              </select>
              <Filter className="absolute right-2.5 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expenses List (Desktop only) */}
        <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left text-xs text-slate-600 font-sans">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3.5 px-6">Mã Chi Phí</th>
                <th className="py-3.5 px-4">Ngày</th>
                <th className="py-3.5 px-4">Danh Mục</th>
                <th className="py-3.5 px-4">Mô Tả Chi Tiết</th>
                <th className="py-3.5 px-4">Số Tiền</th>
                <th className="py-3.5 px-6 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{exp.id}</td>
                    <td className="py-4 px-4 font-mono text-slate-500">{exp.date}</td>
                    <td className="py-4 px-4 font-semibold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                        exp.category === 'Chi phí quảng cáo' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        exp.category === 'Trả lương' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                        exp.category === 'Phần mềm dịch vụ' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        exp.category === 'Thuế VAT' || exp.category === 'Thuế TNDN' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium max-w-xs truncate">{exp.description}</td>
                    <td className="py-4 px-4 font-mono font-bold text-red-600">{formatVND(exp.amount)}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg transition text-[10px] cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-lg transition text-[10px] cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    Không tìm thấy dữ liệu chi phí nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Expenses List (Mobile only) */}
        <div className="block md:hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(exp => (
              <div key={exp.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">{exp.id}</span>
                  <span className="font-mono text-[10px] text-slate-400">{exp.date}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                      exp.category === 'Chi phí quảng cáo' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      exp.category === 'Trả lương' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      exp.category === 'Phần mềm dịch vụ' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      exp.category === 'Thuế VAT' || exp.category === 'Thuế TNDN' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{exp.description}</p>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-slate-400">Số tiền:</span>
                  <span className="font-mono font-bold text-red-600 text-sm">{formatVND(exp.amount)}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg transition text-[10px] cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-lg transition text-[10px] cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 font-sans">
              Không tìm thấy dữ liệu chi phí nào.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Expense Modal Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-semibold text-slate-900 text-sm">
                {editingExpense ? 'Cập Nhật Khoản Chi Phí' : 'Ghi Nhận Chi Phí Vận Hành Mới'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition text-lg font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày Phát Sinh*</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-slate-700 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Danh Mục Chi Phí*</label>
                <select
                  value={category}
                  onChange={e => {
                    const val = e.target.value as any;
                    setCategory(val);
                    if (val === 'Chi phí quảng cáo') {
                      setHasTax(true);
                      setTaxRate(11);
                    }
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-slate-700 bg-white text-base md:text-xs"
                >
                  <option value="Chi phí quảng cáo">Chi phí quảng cáo (Google/FB Ads...)</option>
                  <option value="Văn phòng phẩm">Văn phòng phẩm</option>
                  <option value="Trả lương">Trả lương (CTV/Nhân sự)</option>
                  <option value="Phần mềm dịch vụ">Phần mềm dịch vụ (SaaS, Server, Hosting...)</option>
                  <option value="Thuế VAT">Thuế VAT</option>
                  <option value="Thuế TNDN">Thuế TNDN</option>
                  <option value="Khác">Khác / Chi phí không tên</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số Tiền (VNĐ)*</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Nhập số tiền thực chi"
                  value={amount === 0 ? '' : amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-slate-700 text-base md:text-xs"
                />
              </div>

              {/* Tax calculation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTax}
                    onChange={e => {
                      setHasTax(e.target.checked);
                      if (!e.target.checked) setTaxRate(0);
                      if (e.target.checked && category === 'Chi phí quảng cáo') setTaxRate(11);
                    }}
                    className="rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  <span className="text-xs font-semibold text-slate-700">Có tính thuế</span>
                </label>
                {hasTax && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Thuế suất (%):</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={taxRate}
                        onChange={e => setTaxRate(Number(e.target.value))}
                        className="w-20 p-1.5 border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-base md:text-xs text-center font-mono"
                      />
                    </div>
                    {amount > 0 && taxRate > 0 && (
                      <div className="text-[11px] text-slate-500 bg-white rounded-lg p-2 border border-slate-100 font-sans">
                        <div className="flex justify-between">
                          <span>Số tiền gốc:</span>
                          <span className="font-mono font-semibold text-slate-700">{formatVND(amount)}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Thuế ({taxRate}%):</span>
                          <span className="font-mono font-semibold">+ {formatVND(Math.round(amount * taxRate / 100))}</span>
                        </div>
                        <div className="flex justify-between font-bold text-red-600 border-t border-slate-200 pt-1 mt-1">
                          <span>Tổng chi phí:</span>
                          <span className="font-mono">{formatVND(amount + Math.round(amount * taxRate / 100))}</span>
                        </div>
                      </div>
                    )}
                    {category === 'Chi phí quảng cáo' && (
                      <p className="text-[10px] text-slate-400 italic font-sans">* Chi phí QC mặc định: 10% thuế VAT + 1% phí thanh toán = 11%</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô Tả Chi Tiết*</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mô tả cụ thể lý do chi, người thụ hưởng..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-slate-700 text-base md:text-xs"
                />
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
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow transition cursor-pointer"
                >
                  {editingExpense ? 'Lưu Thay Đổi' : 'Ghi Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

