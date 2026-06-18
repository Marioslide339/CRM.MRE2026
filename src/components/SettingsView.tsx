import { useState } from 'react';
import { Database, FileJson, Check, RotateCcw, ShieldAlert, Sparkles, LayoutGrid, FileSpreadsheet, Key, Link2, Copy, RefreshCw, Download } from 'lucide-react';

interface SettingsViewProps {
  geminiKeys: string[];
  onSaveGeminiKeys: (keys: string[]) => void;
  onResetDatabase: () => void;
  onExportJSON: () => void;
  isSyncing: boolean;
  onTriggerSync: () => Promise<void>;
  onFetchFromSheets: () => Promise<void>;
  onTestConnection: (email: string) => Promise<void>;
}

export default function SettingsView({
  geminiKeys,
  onSaveGeminiKeys,
  onResetDatabase,
  onExportJSON,
  isSyncing,
  onTriggerSync,
  onFetchFromSheets,
  onTestConnection
}: SettingsViewProps) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [doneAction, setDoneAction] = useState<string | null>(null);

  // local states for inputs
  const [key1, setKey1] = useState(geminiKeys[0] || '');
  const [key2, setKey2] = useState(geminiKeys[1] || '');
  const [key3, setKey3] = useState(geminiKeys[2] || '');
  const [copied, setCopied] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTestEmailSend = async () => {
    if (!testEmail.trim()) {
      showNotice('Vui lòng nhập địa chỉ email người nhận thử nghiệm!');
      return;
    }
    setIsTesting(true);
    try {
      await onTestConnection(testEmail.trim());
      showNotice(`Đã gửi yêu cầu kích hoạt thử nghiệm đến ${testEmail}!`);
    } catch(err: any) {
      showNotice(`Lỗi thử nghiệm: ${err.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    onResetDatabase();
    setResetConfirm(false);
    showNotice('Đã khôi phục cơ sở dữ liệu mô phỏng thành công!');
  };

  const handleExport = () => {
    onExportJSON();
    showNotice('Xuất tệp tin sao lưu JSON thành công!');
  };

  const showNotice = (msg: string) => {
    setDoneAction(msg);
    setTimeout(() => {
      setDoneAction(null);
    }, 3050);
  };

  const handleSaveSettings = () => {
    onSaveGeminiKeys([key1, key2, key3].filter(k => k.trim() !== ''));
    showNotice('Đã lưu cấu hình API Keys thành công!');
  };

  const handleManualSync = async () => {
    try {
      await onTriggerSync();
      showNotice('Đồng bộ dữ liệu từ App lên Google Sheets thành công!');
    } catch (err: any) {
      showNotice(`Đồng bộ thất bại: ${err.message || err}`);
    }
  };

  const handleDownloadFromSheets = async () => {
    try {
      await onFetchFromSheets();
      showNotice('Tải dữ liệu từ Google Sheets về App thành công!');
    } catch (err: any) {
      showNotice(`Tải dữ liệu thất bại: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings_view_container">
      {/* Upper Title */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Cấu Hình Hệ Thống & Google Sheets Database
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Tích hợp cơ sở dữ liệu Google Sheets đồng bộ thời gian thực và cấu hình bảo mật Google AI Studio.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadFromSheets}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm"
            id="btn_download_from_sheets"
          >
            <Download className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Tải dữ liệu về App
          </button>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
            id="btn_upload_to_sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang gửi...' : 'Đồng bộ lên Sheets'}
          </button>
        </div>
      </div>

      {/* Success alert notice */}
      {doneAction && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-pulse">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{doneAction}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* API & Sheet Configuration Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Test Connection & Email section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Kiểm Tra Kết Nối & Gửi Email Thử Nghiệm
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Nhập email học viên thử nghiệm để gửi một yêu cầu kích hoạt khóa học mẫu qua Apps Script. Hệ thống sẽ kiểm tra xem tài khoản có nhận được email chia sẻ Drive học liệu và email thông báo HTML thực tế từ hệ thống hay không.
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="block text-[10px] font-semibold text-slate-600">Email người nhận thử nghiệm</label>
                <input
                  type="email"
                  placeholder="vi-du@gmail.com"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-xs font-sans"
                />
              </div>
              <button
                type="button"
                onClick={handleTestEmailSend}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer shrink-0 h-[38px] flex items-center justify-center gap-1.5"
              >
                {isTesting ? 'Đang gửi...' : 'Gửi Thử Nghiệm'}
              </button>
            </div>
          </div>

          {/* Gemini AI Key Rotation Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Xoay Vòng API Keys Google AI Studio (Gemini AI)
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Cấu hình tối đa 3 API Keys từ Google AI Studio. CRM sẽ tự động xoay vòng sử dụng khi một mã API bị hết hạn hoặc đạt hạn mức (Rate Limit).
            </p>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-750">Mã API Gemini #1 (Hoạt động chính)*</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={key1}
                  onChange={e => setKey1(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-750">Mã API Gemini #2 (Dự phòng)*</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={key2}
                  onChange={e => setKey2(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-750">Mã API Gemini #3 (Dự phòng)*</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={key3}
                  onChange={e => setKey3(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
            >
              Lưu Cấu Hình CRM
            </button>
          </div>
        </div>

        {/* Controls Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                Vận Hành Dữ Liệu Ngoại Ngoại
              </h3>
              <p className="text-xs text-slate-400 font-sans">Công cụ sao lưu và đặt lại dữ liệu CRM</p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Export JSON backup button */}
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 transition text-xs font-semibold text-slate-700 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-primary" />
                  Xuất dữ liệu dự phòng (JSON)
                </span>
                <span>⟶</span>
              </button>

              {/* Reset simulator system database button */}
              {resetConfirm ? (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-3 text-xs">
                  <p className="font-bold text-rose-800 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" />
                    Xác nhận xóa trắng toàn bộ dữ liệu tự tạo?
                  </p>
                  <p className="text-rose-600 leading-relaxed text-[11px]">
                    Hành động này sẽ khôi phục dữ liệu ban đầu gồm các học viên mẫu cực kỳ lý tưởng để thuyết trình.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition cursor-pointer text-[10px]"
                    >
                      Đồng ý đặt lại
                    </button>
                    <button
                      onClick={() => setResetConfirm(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition cursor-pointer text-[10px]"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-100 transition text-xs font-semibold text-slate-700 text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-500" />
                    Cài đặt lại Mock Database
                  </span>
                  <span>⟶</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              MRE CRM 2026 Edition v2.0
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              Hệ quản trị hỗ trợ live-sync Google Sheets, tích hợp cơ chế xoay vòng 3 API Keys, phân rã đơn hàng và chi phí theo từng sheet tháng, tăng tính bảo mật, ổn định và năng lực hoạt động ngoại tuyến.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
