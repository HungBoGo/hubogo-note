# HubogoNote - Tính năng phát triển sau

## 0. Autostart + Lưu vị trí cửa sổ (cần nghiên cứu thêm)
- Khởi động cùng Windows
- Nhớ vị trí cửa sổ khi mở lại
- **Lưu ý**: Đã thử implement với `tauri-plugin-autostart` nhưng gây crash app, cần tìm hiểu kỹ hơn

## 1. Auto-Update (Tự động cập nhật)
- Sử dụng `tauri-plugin-updater`
- Khi có phiên bản mới, app tự động tải và cài đặt
- Không cần gỡ ra cài lại thủ công
- Cần:
  - Thêm plugin updater vào Cargo.toml
  - Cấu hình endpoints trong tauri.conf.json
  - Tạo cặp key để ký bản update
  - Setup GitHub Releases để host updates

## 2. Đồng bộ Windows + Android (Real-time Sync)
- Sửa trên điện thoại → Windows cập nhật ngay (và ngược lại)
- Cần backend server để đồng bộ dữ liệu

### Giải pháp đề xuất:
1. **Supabase** (khuyên dùng)
   - Free tier tốt
   - Real-time sync built-in
   - Dễ setup

2. **Cho Android:**
   - PWA (Progressive Web App) - đơn giản nhất
   - Hoặc Capacitor để wrap React app

### Các bước cần làm:
1. Tạo tài khoản Supabase (miễn phí)
2. Thêm authentication (đăng nhập)
3. Chuyển từ localStorage sang Supabase database
4. Thêm real-time sync với Supabase Realtime
5. Deploy web version cho Android dùng như PWA

---
*Ghi chú: Để sau khi hoàn thiện các tính năng cơ bản của app*
