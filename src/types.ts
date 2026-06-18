/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string; // KH0001, KH0002...
  name: string;
  email: string;
  phone: string;
  province: string;
  ward?: string; // Xã/Phường
  tags: string[];
  notes: string;
  createdAt: string;
  // LMS Phase 2 fields
  coursesPurchased: string[]; // List of Course codes
  lmsProgress?: { [courseId: string]: number }; // Progress 0-100
  lmsGrades?: { [courseId: string]: number }; // Score 0-10
  lmsCertificateEarned?: { [courseId: string]: boolean };
  aiAnalysis?: {
    segment: 'VIP' | 'Tiềm năng' | 'Ngủ quên';
    summary: string;
    lastEvaluation: string;
  };
}

export interface Order {
  id: string; // DH0001...
  customerId: string; // Reference to customer.id
  customerName: string;
  customerEmail: string;
  productId: string; // Reference to KC0001, etc.
  productName: string;
  price: number;
  paymentStatus: 'Chưa thanh toán' | 'Đã thanh toán';
  paymentRecipient?: 'TK cá nhân' | 'TK công ty'; // Chuyển khoản tới TK cá nhân hay công ty
  deliveryStatus: 'Chưa kích hoạt' | 'Đã cấp tài khoản';
  createdAt: string;
  activatedAt?: string;
  driveFolderId?: string;
}

export interface Course {
  id: string; // KC0001...
  title: string;
  driveFolderId: string;
  price: number;
  lessonsCount: number;
}

export interface DesignService {
  id: string; // TK0001...
  title: string;
  customerId: string;
  customerName: string;
  executor: string; // Collaborator name
  deadline: string; // YYYY-MM-DD
  deadlineDemo: string; // YYYY-MM-DD
  status: 'Tiếp nhận' | 'Đang làm' | 'Gửi demo' | 'Chỉnh sửa' | 'Hoàn thành';
}

export interface Expense {
  id: string; // CP0001...
  date: string; // YYYY-MM-DD
  category: 'Chi phí quảng cáo' | 'Văn phòng phẩm' | 'Trả lương' | 'Phần mềm dịch vụ' | 'Thuế VAT' | 'Thuế TNDN' | 'Khác';
  amount: number;
  description: string;
}

export interface Collaborator {
  id: string; // CTV001...
  name: string;
  job: string;
  revenue: number; // Doanh thu đóng góp
  salary: number; // Lương thực nhận
  efficiency: number; // KPI completion rate %
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  orderId: string;
  step: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface MarketingCampaign {
  id: string;
  title: string;
  segmentDescription: string;
  subject: string;
  content: string;
  sentAt: string;
  recipientCount: number;
}
