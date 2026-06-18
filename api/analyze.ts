/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set headers to support CORS on Vercel serverless function
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { message, crmData, history, apiKey } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
      return;
    }

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      res.status(400).json({ error: 'Không tìm thấy GEMINI_API_KEY trong cấu hình hệ thống hoặc yêu cầu.' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: key });

    const systemPrompt = `
Bạn là Trợ lý phân tích dữ liệu AI thông minh tích hợp trong hệ thống "MRE CRM 2026" quản lý trung tâm đào tạo, thiết kế slide hoạt ảnh Mario Slide.
Bạn là một chuyên gia phân tích kinh doanh, marketing và quản trị quan hệ khách hàng xuất sắc.

Dưới đây là TOÀN BỘ dữ liệu hiện tại của hệ thống CRM từ Google Sheets Database (quy đổi dưới dạng JSON):

--- DANH SÁCH KHÓA HỌC (KHOA_HOC) ---
${JSON.stringify(crmData.courses, null, 2)}

--- DANH SÁCH KHÁCH HÀNG (KHACH_HANG) ---
${JSON.stringify(crmData.customers, null, 2)}

--- DANH SÁCH ĐƠN HÀNG (DON_HANG) ---
${JSON.stringify(crmData.orders, null, 2)}

--- DỊCH VỤ THIẾT KẾ (THIET_KE) ---
${JSON.stringify(crmData.designs, null, 2)}

--- CỘNG TÁC VIÊN (CON_TAC_VIEN) ---
${JSON.stringify(crmData.collaborators, null, 2)}

--- CÁC CHIẾN DỊCH CAMPAIGN MARKETING ---
${JSON.stringify(crmData.campaigns, null, 2)}

--- DANH SÁCH CHI PHÍ (CHI_PHI) ---
${JSON.stringify(crmData.expenses || [], null, 2)}

HƯỚNG DẪN TRẢ LỜI:
1. Trả lời bằng tiếng Việt lịch sự, nhiệt tình, chuyên nghiệp và có định dạng Markdown đẹp, mạch lạc.
2. Thể hiện tư duy phân tích sâu sắc. Khi được hỏi về doanh thu, khách hàng, khóa học chạy tốt nhất, tỉnh thành, công nợ, hay CTV, hãy tìm kiếm, tính toán trực tiếp từ dữ liệu thực tế được cung cấp ở trên. Không bịa đặt số liệu.
3. Nếu người dùng hỏi các câu hỏi chung hay yêu cầu tư duy marketing, hãy kết hợp dữ liệu thực tế của họ và đưa ra giải pháp đề xuất thông minh (Ví dụ: đề xuất tặng khóa học Canva cho khách VIP, chăm sóc khách 'Ngủ quên' ở tỉnh nào...).
4. Định dạng tiền tệ bằng VND có dấu phân cách nghìn (Ví dụ: 1.250.000đ).
5. Phân nhóm khách hàng cụ thể theo yêu cầu: Khách VIP (đã mua số tiền > 2 triệu hoặc nhiều khóa), Khách tiềm năng (đã mua 1 khóa học hoặc hoàn thành tốt LMS), Khách ngủ quên (tiến độ học 0% hoặc lâu chưa tương tác).
`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('Vercel serverless function error:', error);
    res.status(500).json({
      error: error.message || 'Đã xảy ra lỗi khi trao đổi với Gemini AI.'
    });
  }
}
