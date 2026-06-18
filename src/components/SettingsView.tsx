import { useState } from 'react';
import { Database, FileJson, Check, RotateCcw, ShieldAlert, Sparkles, LayoutGrid, FileSpreadsheet, Key, Link2, Copy, RefreshCw, Download } from 'lucide-react';

interface SettingsViewProps {
  googleSheetUrl: string;
  onSaveGoogleSheetUrl: (url: string) => void;
  geminiKeys: string[];
  onSaveGeminiKeys: (keys: string[]) => void;
  onResetDatabase: () => void;
  onExportJSON: () => void;
  isSyncing: boolean;
  onTriggerSync: () => Promise<void>;
  onFetchFromSheets: () => Promise<void>;
}

export default function SettingsView({
  googleSheetUrl,
  onSaveGoogleSheetUrl,
  geminiKeys,
  onSaveGeminiKeys,
  onResetDatabase,
  onExportJSON,
  isSyncing,
  onTriggerSync,
  onFetchFromSheets
}: SettingsViewProps) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [doneAction, setDoneAction] = useState<string | null>(null);

  // local states for inputs
  const [sheetUrl, setSheetUrl] = useState(googleSheetUrl);
  const [key1, setKey1] = useState(geminiKeys[0] || '');
  const [key2, setKey2] = useState(geminiKeys[1] || '');
  const [key3, setKey3] = useState(geminiKeys[2] || '');
  const [copied, setCopied] = useState(false);

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
    onSaveGoogleSheetUrl(sheetUrl);
    onSaveGeminiKeys([key1, key2, key3].filter(k => k.trim() !== ''));
    showNotice('Đã lưu cấu hình kết nối và API Keys thành công!');
  };

  const handleManualSync = async () => {
    if (!googleSheetUrl) {
      showNotice('Vui lòng lưu URL Web App Google Sheets trước khi đồng bộ!');
      return;
    }
    try {
      await onTriggerSync();
      showNotice('Đồng bộ dữ liệu từ App lên Google Sheets thành công!');
    } catch (err: any) {
      showNotice(`Đồng bộ thất bại: ${err.message || err}`);
    }
  };

  const handleDownloadFromSheets = async () => {
    if (!googleSheetUrl) {
      showNotice('Vui lòng lưu URL Web App Google Sheets trước khi tải dữ liệu!');
      return;
    }
    try {
      await onFetchFromSheets();
      showNotice('Tải dữ liệu từ Google Sheets về App thành công!');
    } catch (err: any) {
      showNotice(`Tải dữ liệu thất bại: ${err.message || err}`);
    }
  };

  const appsScriptCode = `function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify(readAllData()))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    if (params.action === 'sync') {
      writeAllData(params.data);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (params.action === 'getData') {
      return ContentService.createTextOutput(JSON.stringify(readAllData()))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (params.action === 'sendEmail') {
      var recipient = params.email;
      var subject = "Kích hoạt khóa học: " + params.courseName;
      var htmlBody = "<h3>Chào " + params.customerName + ",</h3>" +
                     "<p>Cảm ơn bạn đã đăng ký học tập tại Mario Slide. Khóa học <strong>" + params.courseName + "</strong> của bạn đã được kích hoạt thành công.</p>" +
                     "<p>Bạn có thể truy cập thư mục tài liệu học tập Google Drive theo liên kết dưới đây:</p>" +
                     "<p><a href='" + params.driveLink + "' style='display:inline-block;padding:10px 20px;background-color:#FF3B30;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-family:sans-serif;'>Truy Cập Drive Khóa Học</a></p>" +
                     "<p>Nếu bạn gặp bất kỳ khó khăn nào trong quá trình học tập, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.</p>" +
                     "<br/><p>Trân trọng,<br/><strong>Mario Slide CRM 2026</strong></p>";
      
      GmailApp.sendEmail(recipient, subject, "", {
        htmlBody: htmlBody
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function readAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = {
    customers: readSheet(ss, "KHACH_HANG"),
    courses: readSheet(ss, "KHOA_HOC"),
    designs: readSheet(ss, "THIET_KE"),
    collaborators: readSheet(ss, "CONG_TAC_VIEN"),
    campaigns: readSheet(ss, "MARKETING"),
    logs: readSheet(ss, "LOGS"),
    orders: [],
    expenses: []
  };
  
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf("DON_HANG_") === 0) {
      data.orders = data.orders.concat(readSheet(ss, name));
    } else if (name.indexOf("CHI_PHI_") === 0) {
      data.expenses = data.expenses.concat(readSheet(ss, name));
    }
  }
  return data;
}

function writeAllData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  writeSheet(ss, "KHACH_HANG", data.customers);
  writeSheet(ss, "KHOA_HOC", data.courses);
  writeSheet(ss, "THIET_KE", data.designs);
  writeSheet(ss, "CONG_TAC_VIEN", data.collaborators);
  writeSheet(ss, "MARKETING", data.campaigns);
  writeSheet(ss, "LOGS", data.logs);
  
  // Clear old monthly sheets to prevent leftovers
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf("DON_HANG_") === 0 || name.indexOf("CHI_PHI_") === 0) {
      sheets[i].clear();
    }
  }
  
  // Partition orders by month
  var ordersByMonth = {};
  if (data.orders) {
    data.orders.forEach(function(o) {
      var dateStr = o.createdAt || new Date().toISOString();
      var monthStr = dateStr.substring(0, 7).replace("-", "_");
      var sheetName = "DON_HANG_" + monthStr;
      if (!ordersByMonth[sheetName]) ordersByMonth[sheetName] = [];
      ordersByMonth[sheetName].push(o);
    });
  }
  for (var sheetName in ordersByMonth) {
    writeSheet(ss, sheetName, ordersByMonth[sheetName]);
  }
  
  // Partition expenses by month
  var expensesByMonth = {};
  if (data.expenses) {
    data.expenses.forEach(function(e) {
      var dateStr = e.date || new Date().toISOString().split('T')[0];
      var monthStr = dateStr.substring(0, 7).replace("-", "_");
      var sheetName = "CHI_PHI_" + monthStr;
      if (!expensesByMonth[sheetName]) expensesByMonth[sheetName] = [];
      expensesByMonth[sheetName].push(e);
    });
  }
  for (var sheetName in expensesByMonth) {
    writeSheet(ss, sheetName, expensesByMonth[sheetName]);
  }
}

function readSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var range = sheet.getDataRange();
  if (range.getNumRows() < 2) return [];
  var values = range.getValues();
  var headers = values[0];
  var list = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    var rowEmpty = true;
    for (var c = 0; c < headers.length; c++) {
      var val = values[r][c];
      if (val !== "") rowEmpty = false;
      if (headers[c] === "tags" || headers[c] === "coursesPurchased" || headers[c] === "lmsProgress" || headers[c] === "aiAnalysis" || headers[c] === "lmsGrades" || headers[c] === "lmsCertificateEarned") {
        try {
          obj[headers[c]] = JSON.parse(val);
        } catch(e) {
          obj[headers[c]] = val ? val.toString().split(",") : [];
        }
      } else {
        obj[headers[c]] = val;
      }
    }
    if (!rowEmpty) list.push(obj);
  }
  return list;
}

function writeSheet(ss, name, list) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  } else {
    sheet.clear();
  }
  if (!list || list.length === 0) return;
  var headers = [];
  list.forEach(function(item) {
    Object.keys(item).forEach(function(k) {
      if (headers.indexOf(k) === -1) headers.push(k);
    });
  });
  sheet.appendRow(headers);
  var rows = [];
  list.forEach(function(item) {
    var row = [];
    headers.forEach(function(h) {
      var val = item[h];
      if (typeof val === 'object' && val !== null) {
        row.push(JSON.stringify(val));
      } else {
        row.push(val === undefined ? "" : val);
      }
    });
    rows.push(row);
  });
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        
        {googleSheetUrl && (
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
        )}
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
          {/* Connection URL setting */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              Kết Nối Google Sheets Trực Tiếp
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Nhập liên kết Web App Apps Script được triển khai từ Google Sheet của bạn. Link Google Sheet gốc: 
              <a href="https://docs.google.com/spreadsheets/d/1sjuhc0WnuKQ42wVqFfUASAxKWY16wqjS9smdqBUM6Ho/edit" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1 font-semibold">
                [docs.google.com/spreadsheets/d/1sjuhc0Wnu...]
              </a>
            </p>
            
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Google Apps Script Web App URL*</label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-xs font-mono"
              />
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

          {/* Guide Deployment section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-secondary font-sans flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  Hướng Dẫn Cài Đặt Google Apps Script
                </h3>
                <p className="text-xs text-slate-400 font-sans">Triển khai code cầu nối lên Google Sheet để đồng bộ dữ liệu từ App sang Google Sheets</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Đã sao chép' : 'Sao chép mã'}
              </button>
            </div>

            <div className="text-xs text-slate-650 space-y-2 leading-relaxed list-decimal pl-4">
              <li>Bước 1: Mở File Google Sheet của bạn.</li>
              <li>Bước 2: Click vào <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Bước 3: Xóa mọi code mặc định, dán đoạn mã Apps Script bên dưới vào. Bấm Lưu (Save).</li>
              <li>Bước 4: Click <strong>Triển khai (Deploy)</strong> &gt; <strong>Triển khai mới (New deployment)</strong>.</li>
              <li>Bước 5: Click bánh răng cấu hình, chọn <strong>Ứng dụng web (Web app)</strong>.</li>
              <li>Bước 6: Thiết lập <strong>Execute as: Me</strong> và <strong>Who has access: Anyone</strong> (Mọi người).</li>
              <li>Bước 7: Click Deploy, cấp quyền truy cập của Google và copy link Web App dán vào ô cài đặt phía trên.</li>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl max-h-60 overflow-y-auto">
              <pre className="text-[10px] text-slate-300 font-mono select-all select-none leading-relaxed whitespace-pre-wrap">
                {appsScriptCode}
              </pre>
            </div>
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
