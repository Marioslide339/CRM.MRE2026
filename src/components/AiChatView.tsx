/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Brain, Loader2, ArrowRightCircle, AlertOctagon } from 'lucide-react';
import { Customer, Order, Course, DesignService, Collaborator, MarketingCampaign, Expense } from '../types';

interface AiChatViewProps {
  customers: Customer[];
  orders: Order[];
  courses: Course[];
  designs: DesignService[];
  collaborators: Collaborator[];
  campaigns: MarketingCampaign[];
  geminiKeys: string[];
  expenses: Expense[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatView({
  customers,
  orders,
  courses,
  designs,
  collaborators,
  campaigns,
  geminiKeys,
  expenses
}: AiChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const prepDataset = () => {
    return {
      customers,
      orders,
      courses,
      designs,
      collaborators,
      campaigns,
      expenses
    };
  };

  const handleSendMessage = async (rawMessage: string) => {
    if (!rawMessage.trim() || isLoading) return;

    setErrorStatus(null);
    const textToSend = rawMessage.trim();
    setInputMessage('');

    // Add user bubble
    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const systemPrompt = `
Bạn là Trợ lý phân tích dữ liệu AI thông minh tích hợp trong hệ thống "MRE CRM 2026" quản lý trung tâm đào tạo, thiết kế slide hoạt ảnh Mario Slide.
Bạn là một chuyên gia phân tích kinh doanh, marketing và quản trị quan hệ khách hàng xuất sắc.

Dưới đây là TOÀN BỘ dữ liệu hiện tại của hệ thống CRM từ Google Sheets Database (quy đổi dưới dạng JSON):

--- DANH SÁCH KHÓA HỌC (KHOA_HOC) ---
${JSON.stringify(courses, null, 2)}

--- DANH SÁCH KHÁCH HÀNG (KHACH_HANG) ---
${JSON.stringify(customers, null, 2)}

--- DANH SÁCH ĐƠN HÀNG (DON_HANG) ---
${JSON.stringify(orders, null, 2)}

--- DỊCH VỤ THIẾT KẾ (THIET_KE) ---
${JSON.stringify(designs, null, 2)}

--- CỘNG TÁC VIÊN (CON_TAC_VIEN) ---
${JSON.stringify(collaborators, null, 2)}

--- CÁC CHIẾN DỊCH CAMPAIGN MARKETING ---
${JSON.stringify(campaigns, null, 2)}

--- DANH SÁCH CHI PHÍ (CHI_PHI) ---
${JSON.stringify(expenses || [], null, 2)}

HƯỚNG DẪN TRẢ LỜI:
1. Trả lời bằng tiếng Việt lịch sự, nhiệt tình, chuyên nghiệp và có định dạng Markdown đẹp, mạch lạc.
2. Thể hiện tư duy phân tích sâu sắc. Khi được hỏi về doanh thu, khách hàng, khóa học chạy tốt nhất, tỉnh thành, công nợ, hay CTV, hãy tìm kiếm, tính toán trực tiếp từ dữ liệu thực tế được cung cấp ở trên. Không bịa đặt số liệu.
3. Nếu người dùng hỏi các câu hỏi chung hay yêu cầu tư duy marketing, hãy kết hợp dữ liệu thực tế của họ và đưa ra giải pháp đề xuất thông minh (Ví dụ: đề xuất tặng khóa học Canva cho khách VIP, chăm sóc khách 'Ngủ quên' ở tỉnh nào...).
4. Định dạng tiền tệ bằng VND có dấu phân cách nghìn (Ví dụ: 1.250.000đ).
5. Phân nhóm khách hàng cụ thể theo yêu cầu: Khách VIP (đã mua số tiền > 2 triệu hoặc nhiều khóa), Khách tiềm năng (đã mua 1 khóa học hoặc hoàn thành tốt LMS), Khách ngủ quên (tiến độ học 0% hoặc lâu chưa tương tác).
`;

    let apiSuccess = false;
    let apiErrorMsg = '';

    // If no keys configured, try empty string to let the backend use environment default
    const keysToTry = geminiKeys && geminiKeys.length > 0 ? geminiKeys : [''];

    for (let i = 0; i < keysToTry.length; i++) {
      const currentKey = keysToTry[i];
      try {
        let textResult = '';

        if (currentKey) {
          // Call Gemini API directly from browser to bypass backend limitations/Vercel SPA hosting issues
          const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;
          const response = await fetch(directUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: systemPrompt }]
                },
                ...messages.map((h: any) => ({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.content }]
                })),
                {
                  role: 'user',
                  parts: [{ text: textToSend }]
                }
              ]
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `Google API trả về mã lỗi ${response.status}`);
          }

          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!candidateText) {
            throw new Error('Phản hồi từ Gemini API không đúng cấu trúc mong đợi.');
          }
          textResult = candidateText;
        } else {
          // Fallback to Express backend endpoint
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: textToSend,
              crmData: prepDataset(),
              history: messages,
              apiKey: currentKey
            })
          });

          // Check if response is valid JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server không phản hồi dạng JSON. Bạn đang chạy bản tĩnh (Vercel) mà không khởi tạo API Key? Hãy cấu hình mã API Key của bạn trong phần Cài đặt (Sheets Database) để trò chuyện trực tiếp từ trình duyệt.');
          }

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Yêu cầu phân tích thất bại từ Server.');
          }
          textResult = data.text;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: textResult }]);
        apiSuccess = true;
        break; // Stop rotating keys on success
      } catch (err: any) {
        console.warn(`Gemini API key rotation index ${i} failed:`, err);
        apiErrorMsg = err.message || 'Lỗi không xác định.';
      }
    }

    if (!apiSuccess) {
      setErrorStatus(`Tất cả API Keys được thử nghiệm đều thất bại. Chi tiết lỗi cuối cùng: ${apiErrorMsg}`);
    }
    setIsLoading(false);
  };

  const starterPrompts = [
    'Doanh thu tháng này là bao nhiêu?',
    'Khóa học nào bán chạy tốt nhất?',
    'Khách nào đã mua nhiều tiền nhất?',
    'Tỉnh nào đang quy tụ nhiều khách nhất?',
    'Phân tách giúp mình khách hàng thành 3 nhóm: VIP, Tiềm năng, Ngủ quên.'
  ];

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-12rem)] flex flex-col justify-between" id="ai_analysis_view">
      {/* Title */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Trợ Lý Phân Tích Gemini AI (Phục Vụ CRM MRE)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Hỏi Gemini trực tiếp dựa trên dữ liệu thực tế: Tính toán doanh thu, rà soát tiến độ học viên LMS và vẽ chiến lược marketing.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        {/* Prompts Side Rail */}
        <div className="xl:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 overflow-y-auto shrink-0 xl:shrink">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Gợi Ý Câu Hỏi Trợ Lý
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Chọn câu hỏi nhanh bên dưới để Gemini phân tích dữ liệu Sheets tức thì</p>
          </div>
          <div className="space-y-2">
            {starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-900 border border-slate-100 transition text-[11px] font-medium text-slate-700 leading-relaxed cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window panel */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-0 overflow-hidden">
          {/* Chat scrolling log area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="max-w-md space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 font-sans">Bảng Phân Tích Dữ Liệu Tức Thời</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Hệ thống đã truyền đạt toàn bộ cơ sở dữ liệu KHACH_HANG, DON_HANG, THIET_KE, CONG_TAC_VIEN vào ngữ cảnh an toàn trên máy chủ. Hãy đặt câu hỏi bất kỳ bằng tiếng Việt!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-sans text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 rounded-2xl max-w-xl leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'bg-slate-50 text-slate-800 border border-slate-100'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-500 font-sans flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Trí tuệ nhân tạo Gemini đang lục tìm dữ liệu và phân tích chỉ số...</span>
                    </div>
                  </div>
                )}
                {errorStatus && (
                  <div className="flex justify-start">
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-700 flex items-start gap-2.5 max-w-xl">
                      <AlertOctagon className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-bold">Lỗi không mong muốn</p>
                        <p className="text-[11px] leading-relaxed">{errorStatus}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            )}
          </div>

          {/* User Console Input field */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                disabled={isLoading}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Hỏi Gemini AI... (Ví dụ: Khóa học nào có phản hồi tốt nhất từ học viên?)"
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

