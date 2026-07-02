const sanitizeCustomers = (custs: Customer[]): Customer[] => {
  if (!Array.isArray(custs)) return [];
  return custs
    .filter(c => c && typeof c === 'object')
    .map(c => {
      const name = String(getValueByPossibleKeys(c, ['name', 'hovaten', 'hoten', 'ten', 'khachhang', 'studentName'], '') || c.name || '');
      const email = String(getValueByPossibleKeys(c, ['email', 'mail'], '') || c.email || '');
      const phone = String(getValueByPossibleKeys(c, ['phone', 'sdt', 'zalo', 'dienthoai', 'sozalo'], '') || c.phone || '');
      const province = getValueByPossibleKeys(c, ['province', 'tinh', 'thanhpho', 'city'], '');
      const ward = getValueByPossibleKeys(c, ['ward', 'xa', 'phuong', 'commune', 'district'], '');
      const notes = String(getValueByPossibleKeys(c, ['notes', 'ghichu'], '') || c.notes || '');
      const createdAt = getValueByPossibleKeys(c, ['createdAt', 'ngaytao', 'thoigiantao'], new Date().toISOString());

      return {
        id: String(c.id || ''),
        name: name,
        email: email,
        phone: phone,
        province: cleanLocationField(String(province || c.province || '')),
        ward: cleanLocationField(String(ward || c.ward || '')),
        notes: notes,
        createdAt: String(createdAt || c.createdAt || new Date().toISOString()),
        coursesPurchased: Array.isArray(c.coursesPurchased) ? c.coursesPurchased : [],
        lmsProgress: c.lmsProgress || {},
        lmsGrades: c.lmsGrades || {},
        lmsCertificateEarned: c.lmsCertificateEarned || {},
        tags: Array.isArray(c.tags) ? c.tags : [],
        aiAnalysis: c.aiAnalysis || null
      };
    });
};
