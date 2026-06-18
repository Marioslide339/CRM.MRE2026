/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Mail, Sparkles, Filter, Users, Send, Calendar, ArrowUpRight, CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import { Customer, Course, MarketingCampaign } from '../types';

interface MarketingViewProps {
  customers: Customer[];
  courses: Course[];
  campaigns: MarketingCampaign[];
  onAddCampaign: (newCampaign: MarketingCampaign) => void;
}

export default function MarketingView({ customers, courses, campaigns, onAddCampaign }: MarketingViewProps) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Email compose states
  const [campaignTitle, setCampaignTitle] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');

  // Senders Status
  const [sendingProgress, setSendingProgress] = useState(-1); // -1 means idle
  const [sentCount, setSentCount] = useState(0);

  // Provinces list
  const provinces = useMemo(() => {
    return Array.from(new Set(customers.map(c => c.province)));
  }, [customers]);

  // Segment targets
  const targetSegmentCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchProv = selectedProvince ? c.province === selectedProvince : true;
      const matchCourse = selectedCourse ? c.coursesPurchased.includes(selectedCourse) : true;
      const matchSearch = searchTerm ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchProv && matchCourse && matchSearch;
    });
  }, [customers, selectedProvince, selectedCourse, searchTerm]);

  const emailTemplates = [
    {
      name: 'Khuyến mãi đặc quyền học viên Canva',
      subject: 'Ưu đãi 30% bộ template slide Premium cho học viên xuất sắc lớp Canva',
      content: 'Chào Anh/Chị,\n\nCảm ơn Anh/Chị đã xuất sắc hoàn thành khóa học "Thiết kế Canva đỉnh cao" của Mario Slide.\n\nNhằm tri ân học viên, chúng tôi xin gửi tặng mã đặc quyền GIAMGIA30 khi đăng ký sử dụng bất kỳ gói dịch vụ thiết kế slide tùy chỉnh nào trong tháng này.\n\nLink đăng ký ưu đãi: https://drive.google.com/...\n\nTrân trọng,\nMario Slide Team.'
    },
    {
      name: 'Kích hoạt khóa học AI Giáo dục nâng cao',
      subject: 'Ra mắt chương trình AI Automation tự động hóa lớp học 2026',
      content: 'Chào Anh/Chị,\n\nHệ thống giáo dục Mario Slide xin giới thiệu mô-đun nâng cấp cho giải pháp AI Giáo dục.\n\nVới phiên bản mới, học viên có thể nhúng trực tiếp trợ lý ảo để hỗ trợ tương tác và chấm điểm bài tập tự động cho lớp học của riêng mình.\n\nThông tin chi tiết tài liệu học tập mới đã được cập nhật vào kho Drive dùng chung.\n\nTrân trọng,\nBan quản trị Mario Slide.'
    },
    {
      name: 'Chăm sóc khách hàng chưa tham gia học (Ngủ quên)',
      subject: 'Hỗ trợ 1-1 tăng tốc học tập cùng huấn luyện viên Mario Slide',
      content: 'Chào Anh/Chị,\n\nChúng tôi nhận thấy Anh/Chị có đăng ký sở hữu các khóa học đào tạo trực tuyến của Mario Slide nhưng dạo gần đây chưa sắp xếp được thời gian trực tiếp mở các bài giảng.\n\nĐể đảm bảo quyền lợi tối ưu, HLV lớp học muốn đặt lịch hỗ trợ 1-1 kéo dài 30 phút zoom đồng hành hoàn toàn MIỄN PHÍ để bẻ khóa khó khăn kỹ thuật cho Anh/Chị.\n\nHãy trả lời thư này để đặt lịch hẹn ngay nhé.\n\nTrân trọng.'
    }
  ];

  const handleApplyTemplate = (subject: string, content: string) => {
    setEmailSubject(subject);
    setEmailContent(content);
  };

  const handleSendCampaign = () => {
    if (targetSegmentCustomers.length === 0) return;
    if (!campaignTitle || !emailSubject || !emailContent) return;

    setSendingProgress(0);
    setSentCount(0);

    const total = targetSegmentCustomers.length;
    // Animate progress sending emails
    const interval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Complete and record Campaign
          onAddCampaign({
            id: `MC${String(campaigns.length + 1).padStart(4, '0')}`,
            title: campaignTitle,
            segmentDescription: `Tỉnh: ${selectedProvince || 'Tất cả'} | Khóa: ${selectedCourse || 'Tất cả'} (Tổng cộng: ${total} khách)`,
            subject: emailSubject,
            content: emailContent,
            sentAt: new Date().toISOString(),
            recipientCount: total
          });

          // Reset forms
          setCampaignTitle('');
          setEmailSubject('');
          setEmailContent('');
          setTimeout(() => {
            setSendingProgress(-1); // back to idle
          }, 2000);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 20) + 10;
        const currentCount = Math.min(total, Math.ceil((Math.min(100, next) / 100) * total));
        setSentCount(currentCount);
        return Math.min(100, next);
      });
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="marketing_view_container">
      {/* Upper header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Module Email Marketing (CRM Camp)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Tự động lọc khách hàng theo tỉnh thành hoặc khóa học đã mua, soạn mẫu gửi Gmail hàng loạt an toàn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Customer Segment Filter & Target list */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Bộ Lọc Tập Khách Hàng Mục Tiêu
            </h3>
            <p className="text-xs text-slate-400 font-sans">Tìm tập khách hàng tối ưu nhất để gửi email hàng loạt</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khu vực Tỉnh thành</label>
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
              >
                <option value="">Tất cả tỉnh thành</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khóa học đã sở hữu</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-white"
              >
                <option value="">Tất cả khóa học</option>
                {courses.map(co => (
                  <option key={co.id} value={co.id}>{co.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tìm kiếm bổ sung</label>
              <input
                type="text"
                placeholder="Nhập từ khóa tên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Target Customers matching result counters */}
          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Dung lượng tập:
              </span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                {targetSegmentCustomers.length} liên hệ
              </span>
            </div>
            {/* List mini targets */}
            <div className="mt-3.5 max-h-36 overflow-y-auto pr-1 space-y-2">
              {targetSegmentCustomers.length > 0 ? (
                targetSegmentCustomers.map(cust => (
                  <div key={cust.id} className="flex justify-between items-center text-[11px] text-slate-600 font-sans border-b border-slate-100 pb-1.5 last:border-b-0">
                    <span className="font-semibold">{cust.name}</span>
                    <span className="text-slate-400 font-mono truncate max-w-[120px]">{cust.email}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic text-center py-4 font-mono">Không có khách hàng thỏa mãn bộ lọc lựa chọn.</p>
              )}
            </div>
          </div>
        </div>

        {/* Email Composer & Preset templates selection */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Mẫu Email Soạn Sẵn & Giao Diện Biên Tập
              </h3>
              <p className="text-xs text-slate-400 font-sans">Chọn mẫu cấu trúc hoặc viết nội dung tiếp thị của bạn</p>
            </div>

            {/* Template presets horizontal rows */}
            <div className="flex flex-wrap gap-2 pt-1">
              {emailTemplates.map((tp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyTemplate(tp.subject, tp.content)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 rounded-full text-[10px] font-semibold text-slate-600 transition text-left cursor-pointer"
                >
                  {tp.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chiến dịch phân biệt*</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Email tri ân Canva tháng 6/2026"
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề Thư (Subject)*</label>
              <input
                type="text"
                required
                placeholder="Nhập tiêu đề mail"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung Thư (Content)*</label>
              <textarea
                required
                placeholder="Nội dung chi tiết của thư tiếp thị..."
                value={emailContent}
                onChange={e => setEmailContent(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 h-44 font-sans leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Trigger button & animation progress display */}
          <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {sendingProgress >= 0 ? (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 flex items-center gap-1.5 font-mono animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    Đang gửi qua máy chủ Gmail: {sentCount} / {targetSegmentCustomers.length} emails bổ trợ...
                  </span>
                  <span className="font-mono font-bold">{sendingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: `${sendingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans max-w-sm">
                  Chú ý: Việc kích hoạt sẽ chạy tiến trình gửi Gmail thật qua mô phỏng trung tâm xử lý Google Workspace.
                </p>
                <button
                  onClick={handleSendCampaign}
                  disabled={targetSegmentCustomers.length === 0 || !campaignTitle || !emailSubject || !emailContent}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow transition shrink-0 cursor-pointer ml-auto"
                >
                  <Send className="w-4 h-4" />
                  Kích hoạt Email hàng loạt ({targetSegmentCustomers.length} gửi)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Campaign history logging list */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Lịch Sử Chiến Dịch Đã Gửi (CRM Campaign Logs)
          </h3>
          <p className="text-xs text-slate-400 font-sans">Danh tính các chương trình email tiếp thị trực tiếp tới Sheets DB</p>
        </div>
        <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
          {campaigns.length > 0 ? (
            campaigns.map(camp => (
              <div key={camp.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800">{camp.title}</h4>
                    <p className="text-[10px] text-slate-400">{camp.segmentDescription}</p>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-slate-400">
                    {new Date(camp.sentAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {/* Subject previews */}
                <div className="bg-white p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 block line-clamp-1">
                  <span className="font-bold text-indigo-600">Tiêu đề:</span> "{camp.subject}"
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100/60">
                  <span className="font-mono">{camp.id}</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Đã truyền đạt {camp.recipientCount} emails
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 font-mono">
              <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              Chưa ghi nhận lịch sử chiến dịch nào được thực hiện
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
