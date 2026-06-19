/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, Course, Order, DesignService, Collaborator, AutomationLog, MarketingCampaign, YearlyGoal } from '../types';

export const INITIAL_COURSES: Course[] = [
  { id: 'KC0001', title: 'Khóa học AI Giáo dục', driveFolderId: '1aBc_AI_Edu_2026_xyz', price: 1250000, lessonsCount: 15 },
  { id: 'KC0002', title: 'Khóa học Canva Thiết kế đỉnh cao', driveFolderId: '2dEf_Canva_Master_2026', price: 850000, lessonsCount: 12 },
  { id: 'KC0003', title: 'Slide hoạt họa Mario Slide Premium', driveFolderId: '3gHi_Mario_Slide_Premium_val', price: 1397000, lessonsCount: 20 },
  { id: 'KC0004', title: 'Vận hành AI Automation Doanh nghiệp', driveFolderId: '4jKl_AI_Auto_CEO', price: 2990000, lessonsCount: 25 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'KH0001',
    name: 'Nguyễn Văn Anh',
    email: 'vananh.edu@gmail.com',
    phone: '0912345678',
    province: 'Hà Nội',
    tags: ['Khóa học AI', 'Khách VIP'],
    notes: 'Rất hứng thú với AI trong giảng dạy kỹ năng mềm.',
    createdAt: '2026-05-15T08:30:00Z',
    coursesPurchased: ['KC0001', 'KC0003'],
    lmsProgress: { 'KC0001': 85, 'KC0003': 40 },
    lmsGrades: { 'KC0001': 9 },
    aiAnalysis: {
      segment: 'Hạng Bạc',
      summary: 'Khách hàng cực kỳ trung thành, học tập tích cực và thường xuyên tương tác.',
      lastEvaluation: '2026-06-16T10:00:00Z'
    }
  },
  {
    id: 'KH0002',
    name: 'Trần Thị Bình',
    email: 'binhtran.work@gmail.com',
    phone: '0987654321',
    province: 'Hồ Chí Minh',
    tags: ['Khóa học Canva'],
    notes: 'Liên hệ thiết kế thêm slide cho phòng ban truyền thông.',
    createdAt: '2026-05-20T14:45:00Z',
    coursesPurchased: ['KC0002'],
    lmsProgress: { 'KC0002': 100 },
    lmsGrades: { 'KC0002': 10 },
    lmsCertificateEarned: { 'KC0002': true },
    aiAnalysis: {
      segment: 'Tiềm năng',
      summary: 'Đã hoàn thành khóa học Canva với điểm tối đa. Có khả năng cao sẽ mua thêm khóa Advanced.',
      lastEvaluation: '2026-06-15T15:30:00Z'
    }
  },
  {
    id: 'KH0003',
    name: 'Phạm Minh Cường',
    email: 'cuongpm@outlook.com',
    phone: '0905123987',
    province: 'Đà Nẵng',
    tags: ['Khóa học AI', 'Khóa học Canva'],
    notes: 'Chưa tham gia học nhiều kể từ khi mua combo.',
    createdAt: '2026-04-10T11:20:00Z',
    coursesPurchased: ['KC0001', 'KC0002'],
    lmsProgress: { 'KC0001': 5, 'KC0002': 0 },
    aiAnalysis: {
      segment: 'Hạng Bạc',
      summary: 'Đã mua 2 khóa học nhưng tiến độ gần như bằng 0. Cần chiến dịch marketing nhắc nhở và kích hoạt.',
      lastEvaluation: '2026-06-14T09:12:00Z'
    }
  },
  {
    id: 'KH0004',
    name: 'Lê Hoàng Dương',
    email: 'duonglh.design@gmail.com',
    phone: '0933445566',
    province: 'Cần Thơ',
    tags: ['Thiết kế slide'],
    notes: 'Chỉ sử dụng dịch vụ thiết kế landing slide cho sản phẩm sinh học.',
    createdAt: '2026-06-01T09:00:00Z',
    coursesPurchased: [],
    aiAnalysis: {
      segment: 'Tiềm năng',
      summary: 'Khách hàng doanh nghiệp nhỏ, giao dịch tốt qua dịch vụ thiết kế. Có thể upsell khóa Canva.',
      lastEvaluation: '2026-06-16T17:00:00Z'
    }
  },
  {
    id: 'KH0005',
    name: 'Hoàng Minh Ngọc',
    email: 'ngoc.hm@marioslide.com',
    phone: '0899887766',
    province: 'Hải Phòng',
    tags: ['Khách VIP', 'Mario Slide'],
    notes: 'Đăng ký học viên VIP cho hệ thống giáo dục liên cấp.',
    createdAt: '2026-06-10T16:00:00Z',
    coursesPurchased: ['KC0003'],
    lmsProgress: { 'KC0003': 10 },
    aiAnalysis: {
      segment: 'Hạng Bạc',
      summary: 'Đang bắt đầu lộ trình Mario Slide Premium, phản hồi ban đầu rất tốt.',
      lastEvaluation: '2026-06-16T11:30:00Z'
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'DH0001',
    customerId: 'KH0001',
    customerName: 'Nguyễn Văn Anh',
    customerEmail: 'vananh.edu@gmail.com',
    productId: 'KC0001',
    productName: 'Khóa học AI Giáo dục',
    price: 1250000,
    paymentStatus: 'Đã thanh toán',
    deliveryStatus: 'Đã cấp tài khoản',
    createdAt: '2026-06-17T09:00:00Z',
    activatedAt: '2026-06-17T09:02:00Z',
    driveFolderId: '1aBc_AI_Edu_2026_xyz'
  },
  {
    id: 'DH0002',
    customerId: 'KH0001',
    customerName: 'Nguyễn Văn Anh',
    customerEmail: 'vananh.edu@gmail.com',
    productId: 'KC0003',
    productName: 'Slide hoạt họa Mario Slide Premium',
    price: 1397000,
    paymentStatus: 'Đã thanh toán',
    deliveryStatus: 'Đã cấp tài khoản',
    createdAt: '2026-06-17T15:30:00Z',
    activatedAt: '2026-06-17T15:35:00Z',
    driveFolderId: '3gHi_Mario_Slide_Premium_val'
  },
  {
    id: 'DH0003',
    customerId: 'KH0002',
    customerName: 'Trần Thị Bình',
    customerEmail: 'binhtran.work@gmail.com',
    productId: 'KC0002',
    productName: 'Khóa học Canva Thiết kế đỉnh cao',
    price: 850000,
    paymentStatus: 'Đã thanh toán',
    deliveryStatus: 'Đã cấp tài khoản',
    createdAt: '2026-06-18T01:10:00Z',
    activatedAt: '2026-06-18T01:15:00Z',
    driveFolderId: '2dEf_Canva_Master_2026'
  },
  {
    id: 'DH0004',
    customerId: 'KH0003',
    customerName: 'Phạm Minh Cường',
    customerEmail: 'cuongpm@outlook.com',
    productId: 'KC0004',
    productName: 'Vận hành AI Automation Doanh nghiệp',
    price: 2990000,
    paymentStatus: 'Chưa thanh toán',
    deliveryStatus: 'Chưa kích hoạt',
    createdAt: '2026-06-18T03:45:00Z'
  },
  {
    id: 'DH0005',
    customerId: 'KH0005',
    customerName: 'Hoàng Minh Ngọc',
    customerEmail: 'ngoc.hm@marioslide.com',
    productId: 'KC0003',
    productName: 'Slide hoạt họa Mario Slide Premium',
    price: 1397000,
    paymentStatus: 'Đã thanh toán',
    deliveryStatus: 'Đã cấp tài khoản',
    createdAt: '2026-06-18T06:00:00Z',
    activatedAt: '2026-06-18T06:05:00Z',
    driveFolderId: '3gHi_Mario_Slide_Premium_val'
  }
];

export const INITIAL_DESIGNS: DesignService[] = [
  {
    id: 'TK0001',
    title: 'Thiết kế slide bài giảng STEM hóa học',
    customerId: 'KH0004',
    customerName: 'Lê Hoàng Dương',
    executor: 'Nguyễn Văn Hải (CTV)',
    deadline: '2026-06-20',
    deadlineDemo: '2026-06-18',
    status: 'Đang làm',
    amount: 1500000,
    createdAt: '2026-06-18'
  },
  {
    id: 'TK0002',
    title: 'Thiết kế landing page tuyển sinh khóa hè',
    customerId: 'KH0001',
    customerName: 'Nguyễn Văn Anh',
    executor: 'Trần Minh Quân (CTV)',
    deadline: '2026-06-19',
    deadlineDemo: '2026-06-17',
    status: 'Đang làm',
    amount: 2000000,
    createdAt: '2026-06-17'
  },
  {
    id: 'TK0003',
    title: 'Biên tập hoạt họa lồng tiếng trailer khóa học',
    customerId: 'KH0005',
    customerName: 'Hoàng Minh Ngọc',
    executor: 'Nguyễn Văn Hải (CTV)',
    deadline: '2026-06-25',
    deadlineDemo: '2026-06-22',
    status: 'Tiếp nhận',
    amount: 3500000,
    createdAt: '2026-06-16'
  },
  {
    id: 'TK0004',
    title: 'Thiết kế nhận diện thương hiệu Mario Slide mới',
    customerId: 'KH0002',
    customerName: 'Trần Thị Bình',
    executor: 'Lê Thị Thu Thủy (CTV)',
    deadline: '2026-06-15',
    deadlineDemo: '2026-06-12',
    status: 'Hoàn thành',
    amount: 3000000,
    createdAt: '2026-06-15'
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'CTV001',
    name: 'Nguyễn Văn Hải (CTV)',
    job: 'Thiết kế Slide hoạt hình',
    revenue: 4500000,
    salary: 1350000, // 30% doanh thu
    efficiency: 92
  },
  {
    id: 'CTV002',
    name: 'Trần Minh Quân (CTV)',
    job: 'Thiết kế Landing Page',
    revenue: 8200000,
    salary: 2460000,
    efficiency: 85
  },
  {
    id: 'CTV003',
    name: 'Lê Thị Thu Thủy (CTV)',
    job: 'Sáng tạo Nội dung / Graphic Design',
    revenue: 3000000,
    salary: 900000,
    efficiency: 100
  }
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'MC0001',
    title: 'Chiến dịch Giới thiệu Mario Slide - VIP Hà Nội',
    segmentDescription: 'Khách hàng ở khu vực Hà Nội đã mua khóa học AI',
    subject: 'Ưu đãi đặc quyền học viên cũ: Chinh phục lớp học cuốn hút cùng Mario Slide',
    content: 'Chào Anh/Chị,\n\nCảm ơn Anh/Chị đã tin tưởng khóa học AI Giáo dục của Mario Slide. Chúng tôi vừa ra mắt chương trình Mario Slide Premium hoàn toàn mới thiết kế hoạt ảnh xuất sắc.\n\nTặng riêng mã discount 20% cho thành viên VIP Hà Nội...\n\nTrân trọng!',
    sentAt: '2026-06-12T09:00:00Z',
    recipientCount: 15
  }
];

export const INITIAL_LOGS: AutomationLog[] = [
  {
    id: 'L0001',
    timestamp: '2026-06-18T01:15:00Z',
    orderId: 'DH0003',
    step: 5,
    message: 'Hoàn tất kích hoạt gói học Canva cho binhtran.work@gmail.com',
    type: 'success'
  },
  {
    id: 'L0002',
    timestamp: '2026-06-18T01:14:50Z',
    orderId: 'DH0003',
    step: 4,
    message: 'Đã gửi email kích hoạt khóa học Canva Master 2026 thành công',
    type: 'info'
  },
  {
    id: 'L0003',
    timestamp: '2026-06-18T01:14:40Z',
    orderId: 'DH0003',
    step: 3,
    message: 'Đã thêm binhtran.work@gmail.com làm Viewer vào Drive Folder (2dEf_Canva_Master_2026)',
    type: 'info'
  }
];

export const INITIAL_EXPENSES = [
  { id: 'CP0001', date: '2026-06-15', category: 'Chi phí quảng cáo', amount: 3500000, description: 'Chạy ads quảng cáo Google/FB tháng 6 tuyển sinh Canva' },
  { id: 'CP0002', date: '2026-06-16', category: 'Phần mềm dịch vụ', amount: 450000, description: 'Gia hạn phần mềm Zoom Pro và hosting Web' },
  { id: 'CP0003', date: '2026-06-18', category: 'Văn phòng phẩm', amount: 280000, description: 'Mua giấy in hóa đơn và bút dạ viết bảng họp' },
  { id: 'CP0004', date: '2026-06-18', category: 'Thuế VAT', amount: 125000, description: 'Nộp thuế VAT tháng phát sinh hóa đơn đỏ' }
];

export const INITIAL_GOALS: YearlyGoal[] = [
  {
    id: 'GOAL2026',
    year: 2026,
    months: [
      {
        month: 1,
        revenueTarget: 80000000, revenueCourseTarget: 32000000, revenueDesignTarget: 48000000,
        expenseAdsTarget: 24000000, expenseStaffTarget: 4000000, profitTarget: 52000000,
        actualRevenue: 74700000, actualRevenueCourse: 47400000, actualRevenueDesign: 27300000,
        actualExpenseOther: 19760000, actualExpenseAds: 30174716, actualProfit: 24765284
      },
      {
        month: 2,
        revenueTarget: 50000000, revenueCourseTarget: 20000000, revenueDesignTarget: 30000000,
        expenseAdsTarget: 15000000, expenseStaffTarget: 4000000, profitTarget: 31000000,
        actualRevenue: 80150000, actualRevenueCourse: 41400000, actualRevenueDesign: 38750000,
        actualExpenseOther: 2786000, actualExpenseAds: 23478365, actualProfit: 53885635
      },
      {
        month: 3,
        revenueTarget: 150000000, revenueCourseTarget: 90000000, revenueDesignTarget: 60000000,
        expenseAdsTarget: 45000000, expenseStaffTarget: 4000000, profitTarget: 101000000,
        actualRevenue: 96250000, actualRevenueCourse: 36850000, actualRevenueDesign: 59400000,
        actualExpenseOther: 0, actualExpenseAds: 35091382, actualProfit: 61158618
      },
      {
        month: 4,
        revenueTarget: 80000000, revenueCourseTarget: 48000000, revenueDesignTarget: 32000000,
        expenseAdsTarget: 24000000, expenseStaffTarget: 4000000, profitTarget: 52000000,
        actualRevenue: 81650000, actualRevenueCourse: 36750000, actualRevenueDesign: 44900000,
        actualExpenseOther: 2300000, actualExpenseAds: 19337952, actualProfit: 60012048
      },
      {
        month: 5,
        revenueTarget: 50000000, revenueCourseTarget: 40000000, revenueDesignTarget: 10000000,
        expenseAdsTarget: 15000000, expenseStaffTarget: 4000000, profitTarget: 31000000,
        actualRevenue: 50200000, actualRevenueCourse: 26600000, actualRevenueDesign: 23600000,
        actualExpenseOther: 0, actualExpenseAds: 22114264, actualProfit: 28085736
      },
      {
        month: 6,
        revenueTarget: 150000000, revenueCourseTarget: 105000000, revenueDesignTarget: 45000000,
        expenseAdsTarget: 45000000, expenseStaffTarget: 4000000, profitTarget: 101000000
      },
      {
        month: 7,
        revenueTarget: 150000000, revenueCourseTarget: 105000000, revenueDesignTarget: 45000000,
        expenseAdsTarget: 45000000, expenseStaffTarget: 4000000, profitTarget: 101000000
      },
      {
        month: 8,
        revenueTarget: 180000000, revenueCourseTarget: 126000000, revenueDesignTarget: 54000000,
        expenseAdsTarget: 45000000, expenseStaffTarget: 4000000, profitTarget: 131000000
      },
      {
        month: 9,
        revenueTarget: 200000000, revenueCourseTarget: 140000000, revenueDesignTarget: 60000000,
        expenseAdsTarget: 45000000, expenseStaffTarget: 4000000, profitTarget: 151000000
      },
      {
        month: 10,
        revenueTarget: 250000000, revenueCourseTarget: 175000000, revenueDesignTarget: 75000000,
        expenseAdsTarget: 80000000, expenseStaffTarget: 4000000, profitTarget: 166000000
      },
      {
        month: 11,
        revenueTarget: 250000000, revenueCourseTarget: 175000000, revenueDesignTarget: 75000000,
        expenseAdsTarget: 75000000, expenseStaffTarget: 4000000, profitTarget: 171000000
      },
      {
        month: 12,
        revenueTarget: 120000000, revenueCourseTarget: 84000000, revenueDesignTarget: 36000000,
        expenseAdsTarget: 36000000, expenseStaffTarget: 4000000, profitTarget: 80000000
      }
    ]
  }
];

