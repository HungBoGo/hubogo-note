// Changelog data for What's New dialog
export const APP_VERSION = '1.0.5';

export const CHANGELOG = [
  {
    version: '1.0.5',
    date: '2026-01-08',
    title: 'Cập nhật thông minh & Phân loại công việc',
    highlights: [
      '🎯 Phân loại công việc: Kiếm tiền vs Đầu tư dài hạn',
      '📅 Điểm danh hàng ngày cho dự án dài hạn',
      '🔥 Theo dõi streak - đếm ngày liên tục làm việc',
      '🎉 Banner chúc mừng khi đạt mốc thu nhập',
      '💡 Lời khuyên thông minh dựa trên tình hình công việc',
      '🔄 Kiểm tra cập nhật tự động'
    ],
    changes: [
      'Thêm hệ thống phân loại: "Kiếm tiền nuôi gia đình" và "Đầu tư tương lai"',
      'Thêm tính năng điểm danh hàng ngày cho dự án dài hạn',
      'Hiển thị streak và kỷ lục streak',
      'Thêm banner chúc mừng khi đạt 5M, 10M, 20M, 50M, 100M/tháng',
      'Thêm smart advice - lời khuyên thông minh',
      'Thêm tính năng kiểm tra phiên bản mới',
      'Thêm What\'s New dialog khi update'
    ]
  },
  {
    version: '1.0.4',
    date: '2026-01-07',
    title: 'Hệ thống ưu tiên Eisenhower Matrix',
    highlights: [
      '📊 Ma trận Eisenhower - sắp xếp ưu tiên thông minh',
      '⚡ Đánh giá độ quan trọng và độ gấp',
      '💰 Tính điểm dựa trên giá trị công việc',
      '📈 Giao diện Priority View mới'
    ],
    changes: [
      'Thêm hệ thống Eisenhower Matrix (Q1-Q4)',
      'Thêm Priority Score dựa trên tiền và deadline',
      'Thêm Priority View với phân loại theo Quadrant',
      'Thêm Task Status View',
      'Cải thiện giao diện thống kê'
    ]
  },
  {
    version: '1.0.3',
    date: '2026-01-05',
    title: 'Autostart & Window State',
    highlights: [
      '🚀 Tự động khởi động cùng Windows',
      '📐 Nhớ vị trí và kích thước cửa sổ',
      '🎨 Cải thiện giao diện'
    ],
    changes: [
      'Thêm tùy chọn autostart',
      'Lưu và khôi phục vị trí cửa sổ',
      'Sửa lỗi giao diện trên Windows 11'
    ]
  },
  {
    version: '1.0.2',
    date: '2026-01-03',
    title: 'Thống kê & Backup',
    highlights: [
      '📊 Thống kê chi tiết theo ngày/tuần/tháng',
      '💾 Tự động backup dữ liệu',
      '🔔 Thông báo deadline'
    ],
    changes: [
      'Thêm trang Statistics với biểu đồ',
      'Thêm auto backup hàng ngày',
      'Thêm thông báo nhắc deadline',
      'Hỗ trợ VND và USD'
    ]
  },
  {
    version: '1.0.1',
    date: '2026-01-01',
    title: 'Cải tiến giao diện',
    highlights: [
      '🌙 Dark mode',
      '📱 Responsive design',
      '🎨 UI/UX improvements'
    ],
    changes: [
      'Thêm dark mode',
      'Cải thiện responsive cho màn hình nhỏ',
      'Sửa nhiều lỗi UI'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-12-28',
    title: 'Phiên bản đầu tiên',
    highlights: [
      '✅ Quản lý công việc cơ bản',
      '📁 Phân loại theo danh mục',
      '💵 Theo dõi thu nhập'
    ],
    changes: [
      'Tạo, sửa, xóa công việc',
      'Phân loại theo danh mục',
      'Đánh dấu hoàn thành và đã thanh toán',
      'Theo dõi số tiền từ công việc'
    ]
  }
];

// Get changelog for a specific version
export function getVersionChangelog(version) {
  return CHANGELOG.find(c => c.version === version);
}

// Get all changelogs since a specific version
export function getChangelogsSince(lastVersion) {
  const lastIndex = CHANGELOG.findIndex(c => c.version === lastVersion);
  if (lastIndex === -1) return CHANGELOG;
  return CHANGELOG.slice(0, lastIndex);
}

// Check if version is newer
export function isNewerVersion(newVer, oldVer) {
  const parseVersion = (v) => v.split('.').map(Number);
  const newParts = parseVersion(newVer);
  const oldParts = parseVersion(oldVer);

  for (let i = 0; i < 3; i++) {
    if (newParts[i] > oldParts[i]) return true;
    if (newParts[i] < oldParts[i]) return false;
  }
  return false;
}
