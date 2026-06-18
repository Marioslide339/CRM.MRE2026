/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Use JSON body parser with generous limit
app.use(express.json({ limit: '10mb' }));

// Lazy-loaded Gemini AI client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Không tìm thấy GEMINI_API_KEY trong cấu hình hệ thống (Secrets).');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// REST API for intelligent CRM Analysis using Gemini API
app.post('/api/analyze', async (req, res) => {
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

    // Prepare systemic prompt with current database context for the LLM
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

    // Format chat history for Gemini API
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

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error analyzing CRM with Gemini:', error);
    res.status(500).json({
      error: error.message || 'Đã xảy ra lỗi khi trao đổi với Gemini AI. Vui lòng kiểm tra lại cấu hình API Key.'
    });
  }
});

// Start function to handle Vite
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MRE CRM Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CRM server:', err);
});
