/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Folder, Currency, Trash2, Edit2, Link2 } from 'lucide-react';
import { Course } from '../types';

interface CoursesViewProps {
  courses: Course[];
  onAddCourse: (newCourse: Course) => void;
  onUpdateCourse: (id: string, updated: Partial<Course>) => void;
  onDeleteCourse?: (id: string) => void;
}

export default function CoursesView({ courses, onAddCourse, onUpdateCourse, onDeleteCourse }: CoursesViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newFolderId, setNewFolderId] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [lessons, setLessons] = useState<number>(10);

  // Edit course state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editLessons, setEditLessons] = useState<number>(10);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newTitle || !newFolderId) return;

    onAddCourse({
      id: newId,
      title: newTitle,
      driveFolderId: newFolderId,
      price: newPrice,
      lessonsCount: lessons
    });

    setIsAddOpen(false);
    setNewId('');
    setNewTitle('');
    setNewFolderId('');
    setNewPrice(0);
    setLessons(10);
  };

  const handleStartEdit = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditFolderId(course.driveFolderId);
    setEditPrice(course.price);
    setEditLessons(course.lessonsCount);
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    onUpdateCourse(editingCourse.id, {
      title: editTitle,
      driveFolderId: editFolderId,
      price: editPrice,
      lessonsCount: editLessons
    });

    setIsEditOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="courses_view_container">
      {/* Title */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-secondary font-sans flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Hệ Khoá Học & Tài Nguyên (KHOA_HOC)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Quản lý mã khóa học, thiết lập đơn giá bán lẻ và định cấu hình Folder Google Drive làm kho lưu trữ học liệu.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition"
          id="btn_add_course"
        >
          <Plus className="w-4 h-4" />
          Thêm Khóa Học Mới
        </button>
      </div>

      {/* Grid of Courses cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" id="courses_grid">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id={`course_card_${course.id}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] bg-slate-100 border border-slate-100 font-bold px-2.5 py-1 rounded-lg text-slate-700 font-mono">
                  {course.id}
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleStartEdit(course)}
                    className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer text-xs font-semibold"
                  >
                    Sửa
                  </button>
                  {onDeleteCourse && (
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
                          onDeleteCourse(course.id);
                        }
                      }}
                      className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer text-xs font-semibold"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-sm font-sans line-clamp-1">{course.title}</h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{course.lessonsCount} chương mục trực tuyến</p>
              </div>

              {/* Drive mapping */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                  <Folder className="w-3 h-3 text-amber-500" />
                  Môn học Drive Folder
                </p>
                <p className="text-[10px] font-mono text-slate-600 truncate bg-white p-1.5 rounded border border-slate-100 flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate select-all select-none pr-1 cursor-pointer hover:underline text-indigo-600">
                    {course.driveFolderId}
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">Giá chuẩn</span>
              <span className="text-sm font-bold font-mono text-slate-800">
                {formatVND(course.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form add Course dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Thêm Khóa Học Mới</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <span>×</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Khóa Học (Viết liền, ví dụ KC0005)*</label>
                <input
                  type="text"
                  required
                  placeholder="KC000X"
                  value={newId}
                  onChange={e => setNewId(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 uppercase font-mono text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Khóa Học/Tài nguyên*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khóa học biên tập video chuyên nghiệp"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Folder Google Drive lưu trữ học liệu*</label>
                <input
                  type="text"
                  required
                  placeholder="ID chuỗi ký tự trên đường dẫn Drive"
                  value={newFolderId}
                  onChange={e => setNewFolderId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn Giá VNĐ*</label>
                  <input
                    type="number"
                    required
                    placeholder="Mức thu"
                    value={newPrice}
                    onChange={e => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng bài học</label>
                  <input
                    type="number"
                    value={lessons}
                    onChange={e => setLessons(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
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
                  Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal dialog popup */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Chỉnh Sửa Khóa Học</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <span>×</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Khóa Học (Không được thay đổi)</label>
                <input
                  type="text"
                  disabled
                  value={editingCourse?.id || ''}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-500 font-mono text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Khóa Học/Tài nguyên*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khóa học biên tập video chuyên nghiệp"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Folder Google Drive lưu trữ học liệu*</label>
                <input
                  type="text"
                  required
                  placeholder="ID chuỗi ký tự trên đường dẫn Drive"
                  value={editFolderId}
                  onChange={e => setEditFolderId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn Giá VNĐ*</label>
                  <input
                    type="number"
                    required
                    placeholder="Mức thu"
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng bài học</label>
                  <input
                    type="number"
                    value={editLessons}
                    onChange={e => setEditLessons(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-base md:text-xs"
                  />
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

