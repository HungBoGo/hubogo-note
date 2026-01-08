# Sticky Task Manager

Ứng dụng quản lý công việc cho Windows 11 với giao diện đẹp như Apple Reminders.

## Tính năng

### 1. Quản lý công việc
- ✅ Thêm/sửa/xóa công việc
- ✅ Phân loại theo danh mục (Kiến trúc, Poster, Trading, tự thêm mới...)
- ✅ Mức độ ưu tiên: Bình thường / Gấp / Rất gấp
- ✅ Theo dõi số tiền và trạng thái thanh toán
- ✅ Đặt deadline và nhắc nhở
- ✅ Bật/tắt cảnh báo cho từng công việc

### 2. Thống kê
- 📊 Thống kê theo ngày/tuần/tháng hoặc tùy chọn
- 📈 Tỷ lệ hoàn thành công việc
- 💰 Tổng tiền đã nhận / chưa nhận
- 📂 Thống kê theo từng danh mục

### 3. Tính năng hệ thống
- 🌙 Dark/Light mode
- 📌 Ghim cửa sổ luôn hiện trên cùng
- 🚀 Khởi động cùng Windows
- 📍 Hiện ở góc phải màn hình
- 💾 Backup tự động
- 📤 Export CSV/JSON

---

## Cài đặt

### Yêu cầu
- Node.js 18+ (https://nodejs.org/)
- npm hoặc yarn

### Bước 1: Cài đặt dependencies

```bash
cd "d:/App Sticky note windown"
npm install
```

### Bước 2: Chạy ở chế độ development

```bash
npm run dev
```

### Bước 3: Build ứng dụng

```bash
npm run build:win
```

File cài đặt sẽ nằm trong thư mục `dist/`.

---

## Cấu trúc thư mục

```
📁 sticky-task-manager/
├── 📁 assets/           # Icon và hình ảnh
├── 📁 src/
│   ├── 📁 components/   # React components
│   │   ├── TitleBar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TaskList.jsx
│   │   ├── TaskItem.jsx
│   │   ├── TaskForm.jsx
│   │   └── CategoryForm.jsx
│   ├── 📁 pages/        # Các trang
│   │   └── Statistics.jsx
│   ├── 📁 store/        # State management (Zustand)
│   │   └── useStore.js
│   ├── 📁 database/     # LocalStorage database
│   │   └── db.js
│   ├── 📁 utils/        # Utilities
│   │   ├── notifications.js
│   │   └── backup.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── main.js              # Electron main process
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Hướng dẫn sử dụng

### Thêm công việc mới
1. Click nút "Thêm công việc" ở sidebar hoặc nút + ở header
2. Điền thông tin: tên, mô tả, danh mục, mức độ ưu tiên, số tiền, deadline
3. Bật/tắt nhắc nhở
4. Click "Thêm mới"

### Đánh dấu hoàn thành
- Click vào checkbox tròn bên trái công việc

### Đánh dấu đã thanh toán
- Click vào số tiền (màu vàng = chưa, màu xanh = đã)

### Xem thống kê
- Click "Thống kê" ở sidebar
- Chọn khoảng thời gian: Hôm nay / Tuần này / Tháng này / Tùy chọn

### Export dữ liệu
- Vào trang Thống kê
- Click "CSV" để xuất file Excel
- Click "Backup" để xuất file JSON

### Cài đặt
- Click icon mặt trời/trăng để đổi Dark/Light mode
- Click icon ghim để luôn hiện trên cùng

---

## Tự động khởi động cùng Windows

Ứng dụng sẽ tự động đăng ký khởi động cùng Windows khi chạy lần đầu.

Nếu muốn tắt, có thể vào:
- Windows Settings > Apps > Startup
- Tắt "Sticky Task Manager"

---

## Backup & Restore

### Backup tự động
- Ứng dụng tự động backup mỗi giờ
- Lưu tối đa 10 bản backup gần nhất trong localStorage

### Backup thủ công
1. Vào Thống kê
2. Click "Backup"
3. File JSON sẽ được tải về

### Restore từ backup
1. Import file JSON đã backup
2. Dữ liệu sẽ được khôi phục

---

## Keyboard Shortcuts (Coming soon)
- `Ctrl + N` - Thêm công việc mới
- `Ctrl + F` - Tìm kiếm
- `Ctrl + 1-4` - Chuyển view
- `Escape` - Đóng popup

---

## Troubleshooting

### Lỗi "better-sqlite3" không compile được
```bash
npm install --global windows-build-tools
npm rebuild better-sqlite3
```

### Ứng dụng không hiện lên
- Check System Tray (góc phải taskbar)
- Click icon để hiện ứng dụng

### Dark mode không hoạt động
- Refresh ứng dụng (Ctrl + R)

---

## License

MIT License - Tự do sử dụng và chỉnh sửa.
