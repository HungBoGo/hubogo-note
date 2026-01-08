import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import useStore from '../store/useStore';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6b7280', // Gray
];

const PRESET_ICONS = ['📋', '🏛️', '🎨', '📈', '💼', '🎯', '📚', '💻', '🎮', '🏠', '🛒', '✈️'];

function CategoryForm() {
  const { closeCategoryForm, editingCategory, addCategory, updateCategory, deleteCategory } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        color: editingCategory.color || PRESET_COLORS[0],
        icon: editingCategory.icon || PRESET_ICONS[0]
      });
    }
  }, [editingCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên danh mục';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }

    closeCategoryForm();
  };

  const handleDelete = () => {
    if (editingCategory && window.confirm('Bạn có chắc muốn xóa danh mục này? Các công việc trong danh mục sẽ không bị xóa.')) {
      deleteCategory(editingCategory.id);
      closeCategoryForm();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeCategoryForm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm mx-4 shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h2>
          <button
            onClick={closeCategoryForm}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex items-center justify-center py-4">
            <div
              className="px-4 py-2 rounded-full flex items-center gap-2"
              style={{ backgroundColor: formData.color + '20', color: formData.color }}
            >
              <span className="text-xl">{formData.icon}</span>
              <span className="font-medium">{formData.name || 'Tên danh mục'}</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên danh mục..."
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biểu tượng
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all ${
                    formData.icon === icon
                      ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            {editingCategory && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium"
              >
                Xóa
              </button>
            )}
            <button
              type="button"
              onClick={closeCategoryForm}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              {editingCategory ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;
