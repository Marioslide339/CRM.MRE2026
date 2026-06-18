/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Coins,
  Sparkles,
  Inbox,
  User,
  Compass,
  Link2,
  Calendar,
  X,
  CheckCircle2,
  Eye,
  ChevronRight,
  Loader2,
  Mail
} from 'lucide-react';
import { Order, Customer, Course, AutomationLog } from '../types';

interface OrdersViewProps {
  orders: Order[];
  customers: Customer[];
  courses: Course[];
  onAddOrder: (newOrder: Partial<Order>) => void;
  onUpdateOrder: (id: string, updated: Partial<Order>, triggerAppsScript?: boolean) => void;
  onDeleteOrder?: (id: string) => void;
  onTriggerAutomation: (order: Order, steps: string[]) => void;
}

export default function OrdersView({
  orders,
  customers,
  courses,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onTriggerAutomation
}: OrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals status
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [orderPrice, setOrderPrice] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Chưa thanh toán' | 'Đã thanh toán'>('Chưa thanh toán');
  const [paymentRecipient, setPaymentRecipient] = useState<'Tiền mặt' | 'TK công ty'>('TK công ty');
  const [orderType, setOrderType] = useState<'Đăng ký mới' | 'Gửi lại'>('Đăng ký mới');

  // Edit order status
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerId, setEditCustomerId] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editOrderPrice, setEditOrderPrice] = useState<number>(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState<'Chưa thanh toán' | 'Đã thanh toán'>('Chưa thanh toán');
  const [editPaymentRecipient, setEditPaymentRecipient] = useState<'Tiền mặt' | 'TK công ty'>('TK công ty');
  const [editOrderType, setEditOrderType] = useState<'Đăng ký mới' | 'Gửi lại'>('Đăng ký mới');
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<'Chưa kích hoạt' | 'Đã cấp tài khoản'>('Chưa kích hoạt');

  // Automation Simulator modal state
  const [activeAutomationOrder, setActiveAutomationOrder] = useState<Order | null>(null);
  const [automationStep, setAutomationStep] = useState(0);
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);
  const [isDoneAutomation, setIsDoneAutomation] = useState(false);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Pre-fill prices based on course selection
  const handleCourseSelection = (courseId: string) => {
    setSelectedCourseId(courseId);
    const chosen = courses.find(c => c.id === courseId);
    if (chosen) {
      setOrderPrice(chosen.price);
    }
  };

  // Create order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedCourseId) return;

    const cust = customers.find(c => c.id === selectedCustomerId);
    const course = courses.find(cr => cr.id === selectedCourseId);
    if (!cust || !course) return;

    onAddOrder({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      productId: course.id,
      productName: course.title,
      price: orderType === 'Gửi lại' ? 0 : orderPrice,
      paymentStatus: paymentStatus,
      paymentRecipient: paymentRecipient,
      orderType: orderType,
      deliveryStatus: paymentStatus === 'Đã thanh toán' ? 'Đã cấp tài khoản' : 'Chưa kích hoạt',
      createdAt: new Date().toISOString(),
      driveFolderId: course.driveFolderId
    });

    // Reset Form
    setIsAddOpen(false);
    setSelectedCustomerId('');
    setSelectedCourseId('');
    setOrderPrice(0);
    setPaymentStatus('Chưa thanh toán');
    setPaymentRecipient('TK công ty');
    setOrderType('Đăng ký mới');
  };

  const handleMarkAsPaid = (order: Order) => {
    // 1. Open the Apps Script simulation modal
    setActiveAutomationOrder(order);
    setAutomationStep(1);
    setIsDoneAutomation(false);
    setAutomationLogs([`[09:02:11] Kích hoạt tiến trình cập nhật Đã thanh toán cho Đơn hàng ${order.id}...`]);

    // Play visual simulation steps with standard delays
    // Step 1: Lấy email
    setTimeout(() => {
      setAutomationStep(2);
      setAutomationLogs(prev => [
        ...prev,
        `[Bước 1] Lấy Email học viên từ KHACH_HANG: "${order.customerEmail}" thành công.`
      ]);
    }, 1000);

    // Step 2: Tìm Thư mục Drive
    setTimeout(() => {
      setAutomationStep(3);
      setAutomationLogs(prev => [
        ...prev,
        `[Bước 2] Tra cứu Thư mục Google Drive tương ứng với khóa học "${order.productName}". Tìm thấy ID: ${order.driveFolderId || 'No_Drive_Set_Default'}.`
      ]);
    }, 2000);

    // Step 3: Apps Script API trigger
    setTimeout(() => {
      setAutomationStep(4);
      setAutomationLogs(prev => [
        ...prev,
        `[Bước 3] Thực thi Google Apps Script trigger: folder.addViewer("${order.customerEmail}"). Đã phân quyền đọc (Viewer) thành công!`
      ]);
    }, 3500);

    // Step 4: Gửi Email bằng Gmail API
    setTimeout(() => {
      setAutomationStep(5);
      setAutomationLogs(prev => [
        ...prev,
        `[Bước 4] Gửi mail tự động bằng Gmail: Tiêu đề "Thông tin kích hoạt khóa học", người gửi đại diện "Mario Slide Premium". Mail đã rời máy chủ hệ thống.`
      ]);
    }, 5000);

    // Step 5: Cập nhật Database trạng thái
    setTimeout(() => {
      setAutomationStep(6);
      setIsDoneAutomation(true);
      setAutomationLogs(prev => [
        ...prev,
        `[Bước 5] Cập nhật Trạng thái sang "Đã cấp tài khoản", kích hoạt khóa học trong LMS học viên và hoàn tất đồng bộ Google Sheets DB.`
      ]);

      // Trigger standard parents updates
      onUpdateOrder(order.id, {
        paymentStatus: 'Đã thanh toán',
        deliveryStatus: 'Đã cấp tài khoản',
        activatedAt: new Date().toISOString()
      }, false);

      // Save persistent logs
      onTriggerAutomation(order, [
        `Phân quyền Gmail thành công cho ${order.customerEmail}`,
        `Cấp Drive folder: ${order.driveFolderId}`
      ]);
    }, 6500);
  };

  const handleStartEdit = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerId(order.customerId);
    setEditCourseId(order.productId);
    setEditOrderPrice(order.price);
    setEditPaymentStatus(order.paymentStatus);
    setEditPaymentRecipient(order.paymentRecipient || 'TK công ty');
    setEditOrderType(order.orderType || 'Đăng ký mới');
    setEditDeliveryStatus(order.deliveryStatus);
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    const cust = customers.find(c => c.id === editCustomerId);
    const course = courses.find(cr => cr.id === editCourseId);
    if (!cust || !course) return;

    onUpdateOrder(editingOrder.id, {
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      productId: course.id,
      productName: course.title,
      price: editOrderType === 'Gửi lại' ? 0 : editOrderPrice,
      paymentStatus: editPaymentStatus,
      paymentRecipient: editPaymentRecipient,
      orderType: editOrderType,
      deliveryStatus: editDeliveryStatus,
      driveFolderId: course.driveFolderId
    });

    setIsEditOpen(false);
    setEditingOrder(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      if (onDeleteOrder) {
        onDeleteOrder(id);
      }
    }
  };

  const handleEditCourseSelection = (courseId: string) => {
    setEditCourseId(courseId);
    const chosen = courses.find(c => c.id === courseId);
    if (chosen) {
      setEditOrderPrice(chosen.price);
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? o.paymentStatus === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    const headers = ["Mã Đơn", "Học viên", "Email", "Khóa học / Gói", "Thanh toán (VND)", "Phương thức", "Ngày tạo", "Trạng thái thanh toán", "Kích hoạt LMS"];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.productName,
      o.price,
      o.paymentRecipient || "",
      o.createdAt.substring(0, 10),
      o.paymentStatus,
      o.deliveryStatus
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mre_don_hang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="orders_view_container">
      {/* Upper Panel */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Đơn Hàng Đào Tạo (DON_HANG)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Tích hợp cơ chế tự động hóa Google Apps Script tự động cấp quyền Drive học tập và thông báo qua Gmail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition"
            id="btn_export_orders_csv"
          >
            Xuất CSV
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
            id="btn_create_order"
          >
            <Plus className="w-4 h-4" />
            Tạo Đơn Hàng Mới
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm mã đơn, khách hàng, tên khóa học..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 transition"
            />
            {/* Simple icon inside input */}
            <span className="absolute left-3 top-2 text-slate-400 text-xs">🔍</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 text-slate-600 font-sans"
          >
            <option value="">Tất cả thanh toán ({orders.length})</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
          </select>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 font-sans">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3.5 px-6">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Sản phẩm mua</th>
                <th className="py-3.5 px-4">Giá tiền</th>
                <th className="py-3.5 px-4">Thanh toán</th>
                <th className="py-3.5 px-4">Trạng thái cấp quyền</th>
                <th className="py-3.5 px-6 text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{order.id}</td>
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-semibold text-slate-800">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-700">{order.productName}</span>
                        {order.driveFolderId && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <Link2 className="w-2.5 h-2.5" />
                            <span className="font-mono truncate max-w-[120px]">{order.driveFolderId}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-700">
                      {formatVND(order.price)}
                    </td>
                    {/* Payment status badge */}
                    <td className="py-4 px-4 space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        order.paymentStatus === 'Đã thanh toán'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentRecipient && (
                        <div className="text-[10px] text-slate-500 font-medium pl-1 font-sans">
                          Thụ hưởng: <span className="underline decoration-slate-300">{order.paymentRecipient}</span>
                        </div>
                      )}
                    </td>
                    {/* Delivery Status */}
                    <td className="py-4 px-4 space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        order.deliveryStatus === 'Đã cấp tài khoản'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {order.deliveryStatus}
                      </span>
                      {order.activatedAt && (
                        <p className="text-[9px] text-slate-400 block font-mono">
                          {new Date(order.activatedAt).toLocaleDateString('vi-VN')} {new Date(order.activatedAt).toLocaleTimeString('vi-VN')}
                        </p>
                      )}
                    </td>
                    {/* Trigger flow buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.paymentStatus === 'Chưa thanh toán' ? (
                          <button
                            onClick={() => handleMarkAsPaid(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-sm transition cursor-pointer"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            Kích hoạt
                          </button>
                        ) : (
                          <div className="inline-flex gap-1.5 items-center text-emerald-600 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã cấp học
                          </div>
                        )}
                        <button
                          onClick={() => handleStartEdit(order)}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        {onDeleteOrder && (
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Không tìm thấy dữ liệu đơn hàng nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal dialog popup */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Tạo Đơn Hàng Mới (Don_Hang)</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách Hàng đăng ký*</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Chọn khách hàng...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sản phẩm / Gói Khóa Học*</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={e => handleCourseSelection(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Chọn kho khóa học...</option>
                  {courses.map(co => (
                    <option key={co.id} value={co.id}>{co.title} ({formatVND(co.price)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giá trị đơn hàng (VNĐ)</label>
                <input
                  type="number"
                  value={orderPrice}
                  onChange={e => setOrderPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition"
                  placeholder="Tiền thu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái thanh toán ban đầu</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="initPayment"
                      value="Chưa thanh toán"
                      checked={paymentStatus === 'Chưa thanh toán'}
                      onChange={() => setPaymentStatus('Chưa thanh toán')}
                    />
                    <span>Chưa thanh toán</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="initPayment"
                      value="Đã thanh toán"
                      checked={paymentStatus === 'Đã thanh toán'}
                      onChange={() => setPaymentStatus('Đã thanh toán')}
                    />
                    <span>Đã thanh toán (Sẽ tự động chạy Apps Script)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loại đơn hàng*</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value="Đăng ký mới"
                      checked={orderType === 'Đăng ký mới'}
                      onChange={() => setOrderType('Đăng ký mới')}
                    />
                    <span>Đăng ký mới</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value="Gửi lại"
                      checked={orderType === 'Gửi lại'}
                      onChange={() => setOrderType('Gửi lại')}
                    />
                    <span>Gửi lại <span className="text-[10px] text-slate-400">(không tính doanh thu)</span></span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hình thức thanh toán*</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="payAccountRecipient"
                      value="Tiền mặt"
                      checked={paymentRecipient === 'Tiền mặt'}
                      onChange={() => setPaymentRecipient('Tiền mặt')}
                    />
                    <span>Tiền mặt</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="payAccountRecipient"
                      value="TK công ty"
                      checked={paymentRecipient === 'TK công ty'}
                      onChange={() => setPaymentRecipient('TK công ty')}
                    />
                    <span>Chuyển khoản vào TK công ty</span>
                  </label>
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
                  Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Apps Script Automation Execution Step Simulator Modal */}
      {activeAutomationOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-xl mx-4 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Google Apps Script Serverless Studio
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">ID: {activeAutomationOrder.id}</span>
            </div>

            {/* Content Visual steps */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-sans flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Kích Hoạt Tài Khoản Cho Học Viên
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Thu phát tín hiệu Google Workspace, chia sẻ Folder Google Drive và lập lịch gửi Gmail tự động hóa.
                </p>
              </div>

              {/* Steps indicators */}
              <div className="space-y-4">
                {/* Step 1: Lấy Email */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    automationStep >= 2 ? 'bg-accent-orange text-slate-950 shadow-md shadow-accent-orange/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    1
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${automationStep >= 2 ? 'text-accent-orange' : 'text-slate-500'}`}>
                      Trích xuất Email Người Nhận
                    </p>
                    <p className="text-[10px] text-slate-400">Tìm kiếm email trong KHACH_HANG: {activeAutomationOrder.customerEmail}</p>
                  </div>
                </div>

                {/* Step 2: Lấy Folder khóa học */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    automationStep >= 3 ? 'bg-accent-purple text-white shadow-md shadow-accent-purple/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    2
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${automationStep >= 3 ? 'text-accent-purple' : 'text-slate-500'}`}>
                      Truy vết Folder ID Khóa Học Google Drive
                    </p>
                    <p className="text-[10px] text-slate-400">Khai thác mã khóa: ID "{activeAutomationOrder.productId}"</p>
                  </div>
                </div>

                {/* Step 3: Apps Script sharing trigger */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    automationStep >= 4 ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    3
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${automationStep >= 4 ? 'text-accent-indigo' : 'text-slate-500'}`}>
                      Thực thi `folder.addViewer(email)`
                    </p>
                    <p className="text-[10px] text-slate-400">API phân quyền Google Drive, chặn gửi thông báo mặc định của Drive</p>
                  </div>
                </div>

                {/* Step 4: Gửi email */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    automationStep >= 5 ? 'bg-accent-orange text-slate-950 shadow-md shadow-accent-orange/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    4
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${automationStep >= 5 ? 'text-accent-orange' : 'text-slate-500'}`}>
                      Biên dịch và Gửi Mail kích hoạt (Gmail API)
                    </p>
                    <p className="text-[10px] text-slate-400">Chèn tên học viên, Thư mục liên kết Drive và tiêu đề tự động</p>
                  </div>
                </div>

                {/* Step 5: Cập nhật trạng thái */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    automationStep >= 6 ? 'bg-accent-purple text-white shadow-md shadow-accent-purple/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    5
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${automationStep >= 6 ? 'text-accent-purple' : 'text-slate-500'}`}>
                      Đồng bộ Database & Ghi nhận lịch sử
                    </p>
                    <p className="text-[10px] text-slate-400">Đánh dấu trạng thái "Đã cấp tài khoản" trên Google Sheets</p>
                  </div>
                </div>
              </div>

              {/* Code Console logs terminal style */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl h-36 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1 select-text">
                {automationLogs.map((lg, i) => (
                  <p key={i} className="leading-relaxed">{lg}</p>
                ))}
                {!isDoneAutomation && (
                  <div className="flex items-center gap-1.5 pt-1 text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    <span>Đang giao dịch dữ liệu với Cloud Apps Script...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer containing closing button */}
            <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex justify-end">
              <button
                disabled={!isDoneAutomation}
                onClick={() => setActiveAutomationOrder(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
              >
                {isDoneAutomation ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Xác nhận Hoàn tất
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang tự động xử lý...
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal dialog popup */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Chỉnh Sửa Đơn Hàng</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách Hàng đăng ký*</label>
                <select
                  required
                  value={editCustomerId}
                  onChange={e => setEditCustomerId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Chọn khách hàng...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sản phẩm / Gói Khóa Học*</label>
                <select
                  required
                  value={editCourseId}
                  onChange={e => handleEditCourseSelection(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Chọn kho khóa học...</option>
                  {courses.map(co => (
                    <option key={co.id} value={co.id}>{co.title} ({formatVND(co.price)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giá trị đơn hàng (VNĐ)</label>
                <input
                  type="number"
                  value={editOrderPrice}
                  onChange={e => setEditOrderPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition"
                  placeholder="Tiền thu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái thanh toán</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editPayment"
                      value="Chưa thanh toán"
                      checked={editPaymentStatus === 'Chưa thanh toán'}
                      onChange={() => setEditPaymentStatus('Chưa thanh toán')}
                    />
                    <span>Chưa thanh toán</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editPayment"
                      value="Đã thanh toán"
                      checked={editPaymentStatus === 'Đã thanh toán'}
                      onChange={() => setEditPaymentStatus('Đã thanh toán')}
                    />
                    <span>Đã thanh toán</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái cấp quyền</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editDelivery"
                      value="Chưa kích hoạt"
                      checked={editDeliveryStatus === 'Chưa kích hoạt'}
                      onChange={() => setEditDeliveryStatus('Chưa kích hoạt')}
                    />
                    <span>Chưa kích hoạt</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editDelivery"
                      value="Đã cấp tài khoản"
                      checked={editDeliveryStatus === 'Đã cấp tài khoản'}
                      onChange={() => setEditDeliveryStatus('Đã cấp tài khoản')}
                    />
                    <span>Đã cấp tài khoản</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loại đơn hàng*</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editOrderType"
                      value="Đăng ký mới"
                      checked={editOrderType === 'Đăng ký mới'}
                      onChange={() => setEditOrderType('Đăng ký mới')}
                    />
                    <span>Đăng ký mới</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editOrderType"
                      value="Gửi lại"
                      checked={editOrderType === 'Gửi lại'}
                      onChange={() => setEditOrderType('Gửi lại')}
                    />
                    <span>Gửi lại <span className="text-[10px] text-slate-400">(không tính doanh thu)</span></span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hình thức thanh toán*</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editPayAccountRecipient"
                      value="Tiền mặt"
                      checked={editPaymentRecipient === 'Tiền mặt'}
                      onChange={() => setEditPaymentRecipient('Tiền mặt')}
                    />
                    <span>Tiền mặt</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editPayAccountRecipient"
                      value="TK công ty"
                      checked={editPaymentRecipient === 'TK công ty'}
                      onChange={() => setEditPaymentRecipient('TK công ty')}
                    />
                    <span>Chuyển khoản vào TK công ty</span>
                  </label>
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
