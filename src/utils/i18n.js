// Internationalization (i18n) system for HubogoNote
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Translations
export const translations = {
  vi: {
    // Common
    app_name: 'HubogoNote',
    search: 'Tìm kiếm...',
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',
    close: 'Đóng',
    confirm: 'Xác nhận',
    yes: 'Có',
    no: 'Không',

    // Menu tooltips
    menu_calendar: 'Lịch công việc',
    menu_priority: 'Ưu tiên (Eisenhower Matrix)',
    menu_status: 'Trạng thái công việc',
    menu_statistics: 'Thống kê & Sao lưu',
    menu_about: 'Giới thiệu & Cài đặt',

    // Sidebar
    category: 'Danh mục',
    all_categories: 'Tất cả',

    // Task list
    task_history: 'Lịch công việc',
    tasks_count: 'công việc',
    days_7: '7 ngày',
    days_30: '30 ngày',
    days_90: '90 ngày',
    year_1: '1 năm',
    all: 'Tất cả',
    completed: 'xong',
    in_progress: 'đang làm',
    paid: 'đã TT',
    unpaid: 'chưa TT',
    today: 'Hôm nay',

    // Task form
    new_task: 'Công việc mới',
    task_title: 'Tiêu đề',
    task_description: 'Mô tả',
    task_amount: 'Số tiền',
    task_deadline: 'Deadline',
    task_category: 'Danh mục',
    task_priority: 'Độ ưu tiên',

    // Priority
    priority_high: 'Cao',
    priority_medium: 'Trung bình',
    priority_low: 'Thấp',

    // Statistics page
    statistics: 'Thống kê',
    data_backup: 'Sao lưu dữ liệu',
    backup_description: 'Xuất dữ liệu để backup ra ổ D: hoặc USB. Khi cài lại Windows, chỉ cần nhập file backup là khôi phục toàn bộ công việc.',
    export_data: 'Xuất dữ liệu',
    import_data: 'Nhập dữ liệu',
    save_backup: 'Lưu file backup',
    restore_backup: 'Khôi phục từ backup',
    backup_tip: 'Lưu file backup vào ổ D: hoặc Google Drive. Khi cài lại Windows, dữ liệu ổ D: không bị mất!',
    exporting: 'Đang xuất...',
    importing: 'Đang nhập...',
    export_success: 'Xuất dữ liệu thành công!',
    export_failed: 'Xuất dữ liệu thất bại',
    import_success: 'Nhập dữ liệu thành công!',
    import_failed: 'Nhập dữ liệu thất bại',
    import_warning: 'CẢNH BÁO',
    import_confirm: 'Nhập dữ liệu này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại!\n\nBạn có chắc chắn muốn tiếp tục?',
    restart_required: 'Vui lòng khởi động lại ứng dụng để thấy thay đổi.',
    invalid_backup: 'File không đúng định dạng backup của HubogoNote',

    // Statistics
    total_tasks: 'Tổng công việc',
    completed_tasks: 'Hoàn thành',
    pending_tasks: 'Đang chờ',
    total_income: 'Tổng thu nhập',
    paid_amount: 'Đã thanh toán',
    unpaid_amount: 'Chưa thanh toán',
    completion_rate: 'Tỷ lệ hoàn thành',
    this_week: 'Tuần này',
    this_month: 'Tháng này',

    // About page
    about: 'Giới thiệu',
    settings: 'Cài đặt',
    version: 'Phiên bản',
    autostart: 'Khởi động cùng Windows',
    autostart_desc: 'Tự động mở app khi bật máy tính',
    story: 'Câu chuyện ra đời',
    built_with: 'Được xây dựng với',
    contact: 'Liên hệ tác giả',
    buy_coffee: 'Mời tác giả ly cà phê',
    copy_account: 'Copy STK',
    copied: 'Đã copy số tài khoản!',

    // Story content
    story_intro: 'Xin chào! Mình là',
    story_author: 'Nguyễn Huy Hùng',
    story_aka: 'hay còn gọi là',
    story_p1: 'Mình chỉ là một người bình thường thôi. Nhưng có một thứ khiến mình...',
    story_crazy: 'điên đầu',
    story_p2: 'Đó là',
    story_deadline: 'deadline',
    story_p3: 'Bạn biết cảm giác đó không? Khi khách hàng gọi điện hỏi tiến độ, còn bạn thì...',
    story_quote1: '"Ơ, em nhận việc này lúc nào nhỉ?"',
    story_worse: 'Hay tệ hơn:',
    story_quote2: '"Anh ơi, sao hôm qua hẹn giao mà chưa thấy?"',
    story_struggle: 'Mình đã trải qua cảm giác đó không biết bao nhiêu lần. Quên việc, nhầm deadline, lẫn lộn giữa đống công việc chồng chất...',
    story_tried: 'Mình thử đủ app quản lý công việc. Notion thì quá phức tạp. Todoist thì không hợp. Sticky Notes của Windows thì... chỉ là giấy note thôi.',
    story_decided: 'Thế là mình quyết định:',
    story_make_own: '"Tự làm một cái cho mình dùng!"',
    story_claude: 'Và với sự trợ giúp của',
    story_nights: 'sau nhiều đêm thức trắng (okay, Claude không ngủ, chỉ có mình thức thôi 😅),',
    story_born: 'đã ra đời!',
    story_helps: 'Một ứng dụng đơn giản, dễ dùng, giúp mình:',
    story_benefit1: 'Không bao giờ quên việc nữa',
    story_benefit2: 'Biết việc nào gấp, việc nào có thể từ từ',
    story_benefit3: 'Theo dõi tiền công - ai đã trả, ai còn nợ',
    story_benefit4: 'Và quan trọng nhất: không còn bị khách mắng vì quên deadline!',

    // Contact
    contact_desc: 'Nếu bạn có góp ý, phản hồi, hoặc chỉ đơn giản là muốn nói chuyện về công việc, cuộc sống, hay bất cứ điều gì - hãy liên hệ mình nhé!',
    phone: 'Điện thoại',

    // Buy coffee
    coffee_desc: 'Nếu bạn thích ứng dụng này và muốn ủng hộ tác giả, bạn có thể mời mình một ly cà phê nhé! Mỗi đóng góp đều là động lực để mình tiếp tục phát triển app tốt hơn. 🙏',
    coffee_qr_hint: 'Quét mã QR hoặc chuyển khoản với nội dung:',
    coffee_message: '"Moi cafe Hubogo"',
    coffee_thanks: 'Cảm ơn bạn rất nhiều! 🧡',

    // Footer
    made_with: 'Made with ❤️ by Hubogo',
    copyright: '© 2024 HubogoNote. All rights reserved.',

    // Statistics page extras
    trend_chart: 'Biểu đồ xu hướng',
    total: 'Tổng',
    done: 'Xong',
    money: 'Tiền',
    total_tasks_label: 'Tổng việc',
    completed_label: 'Hoàn thành',
    in_progress_label: 'Đang làm',
    rate_label: 'Tỷ lệ',
    completed_analysis: 'Phân tích việc đã hoàn thành',
    done_normal: 'Xong lúc bình thường',
    done_urgent: 'Xong lúc gấp',
    done_very_urgent: 'Xong lúc rất gấp',
    avg_days: 'Ngày TB hoàn thành',
    upgraded_tasks: 'Việc bị nâng cấp',
    finance: 'Tài chính',
    total_money: 'Tổng tiền',
    received: 'Đã nhận',
    not_received: 'Chưa nhận',
    by_category: 'Theo danh mục',
    no_data: 'Chưa có dữ liệu',
    tasks_label: 'việc',

    // Statistics period selectors
    period_today: 'Hôm nay',
    period_week: 'Tuần này',
    period_month: 'Tháng này',
    period_custom: 'Tùy chọn',
    date_to: 'đến',
    week_label: 'Tuần',

    // Chart tooltip
    chart_jobs: 'việc',
    chart_done: 'đã xong',

    // Category stats
    cat_done: 'xong',
    cat_in_progress: 'đang làm',

    // Language
    language: 'Ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',

    // Sidebar extras
    categories: 'Danh mục',
    all_categories_dropdown: 'Tất cả danh mục',
    add_category: 'Thêm danh mục',
    add_task: 'Thêm công việc',
    currency: 'Tiền tệ',

    // Calendar View
    task_calendar: 'Lịch công việc',
    no_tasks_period: 'Chưa có công việc trong khoảng thời gian này',
    add_first_task: 'Thêm công việc đầu tiên',

    // Task Status View
    task_status: 'Trạng thái công việc',
    no_completed_tasks: 'Chưa có việc hoàn thành',
    no_tasks: 'Không có công việc',
    add_new_task_start: 'Thêm công việc mới để bắt đầu!',
    showing_tasks: 'Hiển thị',

    // Task Form
    edit_task: 'Sửa công việc',
    add_new_task: 'Thêm công việc mới',
    task_name: 'Tên công việc',
    task_name_placeholder: 'Nhập tên công việc...',
    task_name_required: 'Vui lòng nhập tên công việc',
    description_placeholder: 'Mô tả chi tiết công việc...',
    task_type: 'Loại công việc',
    update: 'Cập nhật',
    add_new: 'Thêm mới',

    // Category Form
    edit_category: 'Sửa danh mục',
    delete_category_confirm: 'Bạn có chắc muốn xóa danh mục này? Các công việc trong danh mục sẽ không bị xóa.',

    // Task List
    no_tasks_yet: 'Chưa có công việc nào',

    // Task Detail Modal
    delete_task_confirm: 'Bạn có chắc muốn xóa công việc này?',
    add_item_placeholder: 'Thêm mục mới...',

    // Priority View
    all_done: 'Bạn đã hoàn thành tất cả công việc. Nghỉ ngơi đi! 🎉',

    // Task Item
    due_today: 'Hôm nay',

    // Priority View
    priority_evaluation: 'Đánh giá & Ưu tiên',
    long_term_waiting: 'Dự án dài hạn chờ điểm danh!',
    projects_unchecked: 'dự án chưa được điểm danh hôm nay',
    streak_days: 'ngày',
    streak_record: 'Kỷ lục',
    checkin: 'Điểm danh',
    other_projects: 'dự án khác',
    income_family: 'KIẾM TIỀN NUÔI GIA ĐÌNH',
    priority_income_desc: 'Ưu tiên làm trước để có thu nhập',
    urgent_tasks: 'việc gấp',
    other_income_tasks: 'Việc kiếm tiền quan trọng khác:',
    invest_future: 'ĐẦU TƯ TƯƠNG LAI',
    invest_desc: 'Dự án dài hạn, xây dựng giá trị',
    projects: 'dự án',
    invest_tip: 'Gợi ý: Block 1-2 tiếng mỗi ngày cho dự án đầu tư. Dù không tạo tiền ngay, đây là nền tảng cho tương lai!',
    consider_delegate: 'CÂN NHẮC ỦY QUYỀN',
    delegate_desc: 'Gấp nhưng không quan trọng - Làm nhanh hoặc nhờ người khác',
    no_tasks_todo: 'Không có việc nào cần làm!',
    work_tips: 'Gợi ý làm việc hiệu quả',
    q1_tip: 'Làm ngay, không trì hoãn',
    q2_tip: 'Block lịch 90 phút để tập trung',
    q3_tip: 'Làm nhanh hoặc nhờ người khác',
    q4_tip: 'Loại bỏ hoặc làm khi rảnh',
    in_progress_stat: 'Đang làm',
    completed_stat: 'Hoàn thành',
    rate_stat: 'Tỷ lệ',
    not_collected: 'Chưa thu',

    // Task Form
    task_type_income: 'Kiếm tiền',
    task_type_income_desc: 'Nuôi gia đình',
    task_type_invest: 'Đầu tư',
    task_type_invest_desc: 'Tương lai',
    category_label: 'Danh mục',
    select_category: 'Chọn danh mục',
    importance_label: 'Quan trọng',
    importance_0: 'Không quan trọng',
    importance_1: 'Bình thường',
    importance_2: 'Quan trọng',
    importance_3: 'Rất quan trọng',
    urgency_label: 'Độ gấp',
    urgency_normal: 'Bình thường',
    urgency_urgent: 'Gấp',
    urgency_very_urgent: 'Rất gấp',
    received_date: 'Ngày giờ nhận việc',
    amount_vnd: 'Số tiền (VNĐ)',
    deadline_label: 'Hạn chót',
    long_term_project: 'Dự án dài hạn',
    long_term_desc: 'Điểm danh hàng ngày, theo dõi streak',
    reminder_toggle: 'Bật nhắc nhở deadline',
    category_required: 'Vui lòng chọn danh mục',
    received_required: 'Vui lòng chọn ngày nhận việc',

    // Task Detail Modal
    priority_very_urgent: 'Rất gấp',
    priority_urgent: 'Gấp',
    priority_normal: 'Bình thường',
    auto_upgraded: 'Tự động nâng cấp',
    received_label: 'Nhận',
    deadline_at: 'Hạn',
    overdue: 'Quá hạn',
    due_today_label: 'Hôm nay',
    done_at: 'Xong',
    days_not_done: 'ngày chưa xong',
    paid_full: 'Đã thanh toán đủ',
    not_paid_full: 'Chưa thanh toán đủ',
    received_amount: 'Đã nhận',
    remaining_amount: 'Còn lại',
    payment_history: 'Lịch sử thanh toán',
    payment_note: 'Ghi chú (tùy chọn)...',
    amount_placeholder: 'Số tiền...',
    fill_remaining: 'Điền số còn lại',
    pay_full: 'Thanh toán đủ',
    checklist_label: 'Checklist',
    add_new_item: 'Thêm mục mới...',
    delete_task_confirm_msg: 'Bạn có chắc muốn xóa công việc này?',
    mark_incomplete: 'Đánh dấu chưa xong',
    mark_complete: 'Hoàn thành',
    turn_off_reminder: 'Tắt nhắc nhở',
    turn_on_reminder: 'Bật nhắc nhở',

    // Statistics achievements
    achievement_5_tasks: 'Hoàn thành 5 công việc',
    achievement_20_tasks: 'Hoàn thành 20 công việc',
    achievement_50_tasks: 'Hoàn thành 50 công việc',
    great_completion_rate: 'Tỷ lệ hoàn thành {rate}%! Bạn đang quản lý công việc rất tốt!',
    start_journey: 'Tạo công việc mới và bắt đầu hành trình của bạn!',

    // Task Status View
    task_status_title: 'Trạng thái công việc',
    status_all: 'Tất cả',
    status_pending: 'Đang làm',
    status_completed: 'Hoàn thành',
    sort_priority: 'Theo ưu tiên',
    sort_date: 'Theo ngày tạo',
    sort_deadline: 'Theo deadline',
    no_completed_tasks: 'Chưa có việc hoàn thành',
    no_tasks: 'Không có công việc',
    complete_first_task: 'Hoàn thành việc đầu tiên để thấy ở đây!',
    no_search_results: 'Không tìm thấy kết quả phù hợp',
    add_task_to_start: 'Thêm công việc mới để bắt đầu!',
    showing: 'Hiển thị',
    tasks_count: 'công việc',
    in_progress_short: 'đang làm',
    completed_short: 'hoàn thành',

    // Priority Engine Banners
    banner_congrats_earned: 'Chúc mừng! Đã kiếm được',
    banner_this_month: 'tháng này!',
    banner_total_income: 'Tổng thu nhập',
    banner_awesome: 'Tuyệt vời!',
    banner_streak_amazing: 'ngày! Kinh ngạc!',
    banner_building_habit: 'Bạn đang xây dựng thói quen tuyệt vời!',
    banner_streak_days: 'ngày liên tục!',
    banner_keep_going: 'Tiếp tục duy trì nhé!',
    banner_overdue: 'việc trễ deadline!',
    banner_handle_now: 'Cần xử lý ngay để tránh ảnh hưởng!',
    banner_today_deadline: 'việc deadline hôm nay!',
    banner_focus_finish: 'Tập trung hoàn thành trước khi hết ngày.',
    banner_unpaid: 'việc chưa nhận tiền',
    banner_total: 'Tổng:',
    banner_collect_money: 'Nhớ đòi tiền nhé!',
    banner_excellent: 'Xuất sắc!',
    banner_rate_good: 'Tỷ lệ hoàn thành',
    banner_doing_great: 'Bạn đang làm rất tốt!',
    banner_need_focus: 'Cần tập trung!',
    banner_many_incomplete: 'Còn nhiều việc chưa hoàn thành. Hãy bắt đầu với việc nhỏ nhất!',

    // Quadrant names
    quadrant_q1: 'Quan trọng & Gấp',
    quadrant_q2: 'Quan trọng & Không gấp',
    quadrant_q3: 'Không quan trọng & Gấp',
    quadrant_q4: 'Không quan trọng & Không gấp',

    // Smart Advice
    advice_income_title: 'Ưu tiên việc kiếm tiền',
    advice_income_msg: '{count} việc có thể mang về {amount}đ. Làm trước để có thu nhập!',
    advice_income_action: 'Xem việc kiếm tiền',
    advice_invest_good_time: 'Thời điểm tốt để đầu tư',
    advice_invest_no_urgent: 'Không có việc gấp. Hãy dành thời gian cho dự án dài hạn!',
    advice_invest_dont_forget: 'Đừng quên dự án tương lai',
    advice_invest_block_time: '{count} dự án đầu tư. Block 1-2 tiếng/ngày để tiến bộ!',
    advice_invest_action: 'Xem dự án đầu tư',
    advice_checkin_title: 'Điểm danh dự án dài hạn',
    advice_checkin_msg: '{count} dự án chờ điểm danh. Giữ streak để xây thói quen!',
    advice_checkin_action: 'Điểm danh ngay',

    // TaskItem extras
    checked_in_today: 'Đã điểm danh hôm nay!',
    checkin_today: 'Điểm danh hôm nay',

    // Priority reasons
    reason_overdue: 'ĐÃ TRỄ DEADLINE! Cần xử lý ngay!',
    reason_24h: 'Deadline trong 24h - Ưu tiên cao nhất!',
    reason_days_left: 'Còn {days} ngày - Quan trọng & Gấp',
    reason_q1: 'Q1: Quan trọng + Gấp → Làm ngay!',
    reason_q2: 'Q2: Quan trọng nhưng chưa gấp → Lên lịch làm',
    reason_q3: 'Q3: Gấp nhưng không quan trọng → Cân nhắc ủy quyền',
    reason_q4: 'Q4: Không gấp, không quan trọng → Làm khi rảnh',
    reason_cash: 'Tiền có thể về trong 7 ngày',
    reason_easy: 'Việc dễ làm nhanh - Quick win!',
    reason_risk: 'Có rủi ro - Cần chuẩn bị kỹ',

    // Autostart
    autostart_on: 'BẬT',
    autostart_off: 'TẮT',
  },

  en: {
    // Common
    app_name: 'HubogoNote',
    search: 'Search...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',

    // Menu tooltips
    menu_calendar: 'Task Calendar',
    menu_priority: 'Priority (Eisenhower Matrix)',
    menu_status: 'Task Status',
    menu_statistics: 'Statistics & Backup',
    menu_about: 'About & Settings',

    // Sidebar
    category: 'Category',
    all_categories: 'All',

    // Task list
    task_history: 'Task History',
    tasks_count: 'tasks',
    days_7: '7 days',
    days_30: '30 days',
    days_90: '90 days',
    year_1: '1 year',
    all: 'All',
    completed: 'done',
    in_progress: 'in progress',
    paid: 'paid',
    unpaid: 'unpaid',
    today: 'Today',

    // Task form
    new_task: 'New Task',
    task_title: 'Title',
    task_description: 'Description',
    task_amount: 'Amount',
    task_deadline: 'Deadline',
    task_category: 'Category',
    task_priority: 'Priority',

    // Priority
    priority_high: 'High',
    priority_medium: 'Medium',
    priority_low: 'Low',

    // Statistics page
    statistics: 'Statistics',
    data_backup: 'Data Backup',
    backup_description: 'Export data to backup to D: drive or USB. When reinstalling Windows, just import the backup file to restore all tasks.',
    export_data: 'Export Data',
    import_data: 'Import Data',
    save_backup: 'Save backup file',
    restore_backup: 'Restore from backup',
    backup_tip: 'Save backup file to D: drive or Google Drive. When reinstalling Windows, D: drive data is preserved!',
    exporting: 'Exporting...',
    importing: 'Importing...',
    export_success: 'Export successful!',
    export_failed: 'Export failed',
    import_success: 'Import successful!',
    import_failed: 'Import failed',
    import_warning: 'WARNING',
    import_confirm: 'Importing this data will OVERWRITE all current data!\n\nAre you sure you want to continue?',
    restart_required: 'Please restart the app to see the changes.',
    invalid_backup: 'Invalid HubogoNote backup file format',

    // Statistics
    total_tasks: 'Total Tasks',
    completed_tasks: 'Completed',
    pending_tasks: 'Pending',
    total_income: 'Total Income',
    paid_amount: 'Paid',
    unpaid_amount: 'Unpaid',
    completion_rate: 'Completion Rate',
    this_week: 'This Week',
    this_month: 'This Month',

    // About page
    about: 'About',
    settings: 'Settings',
    version: 'Version',
    autostart: 'Start with Windows',
    autostart_desc: 'Automatically open app when computer starts',
    story: 'Our Story',
    built_with: 'Built with',
    contact: 'Contact Author',
    buy_coffee: 'Buy me a coffee',
    copy_account: 'Copy Account',
    copied: 'Account number copied!',

    // Story content
    story_intro: 'Hello! I am',
    story_author: 'Nguyen Huy Hung',
    story_aka: 'also known as',
    story_p1: "I'm just an ordinary person. But there's one thing that drives me...",
    story_crazy: 'crazy',
    story_p2: "It's the",
    story_deadline: 'deadline',
    story_p3: "Do you know that feeling? When a client calls to check progress, and you're like...",
    story_quote1: '"Wait, when did I accept this job?"',
    story_worse: 'Or worse:',
    story_quote2: '"Hey, you promised to deliver yesterday, where is it?"',
    story_struggle: "I've been through that countless times. Forgetting tasks, missing deadlines, getting lost in piles of work...",
    story_tried: "I tried many task management apps. Notion was too complex. Todoist didn't fit. Windows Sticky Notes... well, it's just sticky notes.",
    story_decided: 'So I decided:',
    story_make_own: '"Let me build my own!"',
    story_claude: 'And with the help of',
    story_nights: "after many sleepless nights (okay, Claude doesn't sleep, only I do 😅),",
    story_born: 'was born!',
    story_helps: 'A simple, easy-to-use app that helps me:',
    story_benefit1: 'Never forget a task again',
    story_benefit2: 'Know which tasks are urgent and which can wait',
    story_benefit3: 'Track payments - who paid, who still owes',
    story_benefit4: "And most importantly: no more getting scolded by clients for missing deadlines!",

    // Contact
    contact_desc: "If you have suggestions, feedback, or just want to chat about work, life, or anything - feel free to reach out!",
    phone: 'Phone',

    // Buy coffee
    coffee_desc: "If you like this app and want to support the author, you can buy me a coffee! Every contribution motivates me to keep improving the app. 🙏",
    coffee_qr_hint: 'Scan QR code or transfer with message:',
    coffee_message: '"Coffee for Hubogo"',
    coffee_thanks: 'Thank you so much! 🧡',

    // Footer
    made_with: 'Made with ❤️ by Hubogo',
    copyright: '© 2024 HubogoNote. All rights reserved.',

    // Statistics page extras
    trend_chart: 'Trend Chart',
    total: 'Total',
    done: 'Done',
    money: 'Money',
    total_tasks_label: 'Total Tasks',
    completed_label: 'Completed',
    in_progress_label: 'In Progress',
    rate_label: 'Rate',
    completed_analysis: 'Completed Tasks Analysis',
    done_normal: 'Done on time',
    done_urgent: 'Done when urgent',
    done_very_urgent: 'Done when very urgent',
    avg_days: 'Avg days to complete',
    upgraded_tasks: 'Auto-upgraded tasks',
    finance: 'Finance',
    total_money: 'Total',
    received: 'Received',
    not_received: 'Pending',
    by_category: 'By Category',
    no_data: 'No data yet',
    tasks_label: 'tasks',

    // Statistics period selectors
    period_today: 'Today',
    period_week: 'This Week',
    period_month: 'This Month',
    period_custom: 'Custom',
    date_to: 'to',
    week_label: 'Week',

    // Chart tooltip
    chart_jobs: 'tasks',
    chart_done: 'done',

    // Category stats
    cat_done: 'done',
    cat_in_progress: 'in progress',

    // Language
    language: 'Language',
    vietnamese: 'Tiếng Việt',
    english: 'English',

    // Sidebar extras
    categories: 'Categories',
    all_categories_dropdown: 'All categories',
    add_category: 'Add category',
    add_task: 'Add Task',
    currency: 'Currency',

    // Calendar View
    task_calendar: 'Task Calendar',
    no_tasks_period: 'No tasks in this period',
    add_first_task: 'Add your first task',

    // Task Status View
    task_status: 'Task Status',
    no_completed_tasks: 'No completed tasks',
    no_tasks: 'No tasks',
    add_new_task_start: 'Add a new task to get started!',
    showing_tasks: 'Showing',

    // Task Form
    edit_task: 'Edit Task',
    add_new_task: 'Add New Task',
    task_name: 'Task Name',
    task_name_placeholder: 'Enter task name...',
    task_name_required: 'Please enter task name',
    description_placeholder: 'Detailed description...',
    task_type: 'Task Type',
    update: 'Update',
    add_new: 'Add New',

    // Category Form
    edit_category: 'Edit Category',
    delete_category_confirm: 'Are you sure you want to delete this category? Tasks in this category will not be deleted.',

    // Task List
    no_tasks_yet: 'No tasks yet',

    // Task Detail Modal
    delete_task_confirm: 'Are you sure you want to delete this task?',
    add_item_placeholder: 'Add new item...',

    // Priority View
    all_done: 'You have completed all tasks. Take a break! 🎉',

    // Task Item
    due_today: 'Today',

    // Priority View
    priority_evaluation: 'Priority & Evaluation',
    long_term_waiting: 'Long-term projects waiting for check-in!',
    projects_unchecked: 'projects not checked in today',
    streak_days: 'days',
    streak_record: 'Record',
    checkin: 'Check-in',
    other_projects: 'other projects',
    income_family: 'EARN MONEY FOR FAMILY',
    priority_income_desc: 'Prioritize for income',
    urgent_tasks: 'urgent tasks',
    other_income_tasks: 'Other important income tasks:',
    invest_future: 'INVEST IN FUTURE',
    invest_desc: 'Long-term projects, building value',
    projects: 'projects',
    invest_tip: 'Tip: Block 1-2 hours daily for investment projects. Even without immediate income, this is the foundation for the future!',
    consider_delegate: 'CONSIDER DELEGATING',
    delegate_desc: 'Urgent but not important - Do quickly or delegate',
    no_tasks_todo: 'No tasks to do!',
    work_tips: 'Productivity Tips',
    q1_tip: 'Do it now, no delay',
    q2_tip: 'Block 90 minutes to focus',
    q3_tip: 'Do quickly or delegate',
    q4_tip: 'Eliminate or do when free',
    in_progress_stat: 'In Progress',
    completed_stat: 'Completed',
    rate_stat: 'Rate',
    not_collected: 'Uncollected',

    // Task Form
    task_type_income: 'Income',
    task_type_income_desc: 'For family',
    task_type_invest: 'Investment',
    task_type_invest_desc: 'For future',
    category_label: 'Category',
    select_category: 'Select category',
    importance_label: 'Importance',
    importance_0: 'Not important',
    importance_1: 'Normal',
    importance_2: 'Important',
    importance_3: 'Very important',
    urgency_label: 'Urgency',
    urgency_normal: 'Normal',
    urgency_urgent: 'Urgent',
    urgency_very_urgent: 'Very urgent',
    received_date: 'Received Date',
    amount_vnd: 'Amount (VND)',
    deadline_label: 'Deadline',
    long_term_project: 'Long-term Project',
    long_term_desc: 'Daily check-in, track streak',
    reminder_toggle: 'Enable deadline reminder',
    category_required: 'Please select a category',
    received_required: 'Please select received date',

    // Task Detail Modal
    priority_very_urgent: 'Very Urgent',
    priority_urgent: 'Urgent',
    priority_normal: 'Normal',
    auto_upgraded: 'Auto-upgraded',
    received_label: 'Received',
    deadline_at: 'Due',
    overdue: 'Overdue',
    due_today_label: 'Today',
    done_at: 'Done',
    days_not_done: 'days pending',
    paid_full: 'Fully Paid',
    not_paid_full: 'Not Fully Paid',
    received_amount: 'Received',
    remaining_amount: 'Remaining',
    payment_history: 'Payment History',
    payment_note: 'Note (optional)...',
    amount_placeholder: 'Amount...',
    fill_remaining: 'Fill remaining',
    pay_full: 'Pay in full',
    checklist_label: 'Checklist',
    add_new_item: 'Add new item...',
    delete_task_confirm_msg: 'Are you sure you want to delete this task?',
    mark_incomplete: 'Mark incomplete',
    mark_complete: 'Complete',
    turn_off_reminder: 'Turn off reminder',
    turn_on_reminder: 'Turn on reminder',

    // Statistics achievements
    achievement_5_tasks: 'Complete 5 tasks',
    achievement_20_tasks: 'Complete 20 tasks',
    achievement_50_tasks: 'Complete 50 tasks',
    great_completion_rate: 'Completion rate {rate}%! You are managing tasks very well!',
    start_journey: 'Create a new task and start your journey!',

    // Task Status View
    task_status_title: 'Task Status',
    status_all: 'All',
    status_pending: 'In Progress',
    status_completed: 'Completed',
    sort_priority: 'By Priority',
    sort_date: 'By Date',
    sort_deadline: 'By Deadline',
    no_completed_tasks: 'No completed tasks',
    no_tasks: 'No tasks',
    complete_first_task: 'Complete your first task to see it here!',
    no_search_results: 'No matching results found',
    add_task_to_start: 'Add a new task to get started!',
    showing: 'Showing',
    tasks_count: 'tasks',
    in_progress_short: 'in progress',
    completed_short: 'completed',

    // Priority Engine Banners
    banner_congrats_earned: 'Congratulations! Earned',
    banner_this_month: 'this month!',
    banner_total_income: 'Total income',
    banner_awesome: 'Awesome!',
    banner_streak_amazing: 'days! Amazing!',
    banner_building_habit: 'You are building great habits!',
    banner_streak_days: 'days in a row!',
    banner_keep_going: 'Keep it up!',
    banner_overdue: 'overdue tasks!',
    banner_handle_now: 'Handle immediately to avoid impact!',
    banner_today_deadline: 'tasks due today!',
    banner_focus_finish: 'Focus on completing before end of day.',
    banner_unpaid: 'unpaid tasks',
    banner_total: 'Total:',
    banner_collect_money: 'Remember to collect payment!',
    banner_excellent: 'Excellent!',
    banner_rate_good: 'Completion rate',
    banner_doing_great: 'You are doing great!',
    banner_need_focus: 'Need to focus!',
    banner_many_incomplete: 'Many tasks incomplete. Start with the smallest one!',

    // Quadrant names
    quadrant_q1: 'Important & Urgent',
    quadrant_q2: 'Important & Not Urgent',
    quadrant_q3: 'Not Important & Urgent',
    quadrant_q4: 'Not Important & Not Urgent',

    // Smart Advice
    advice_income_title: 'Prioritize earning money',
    advice_income_msg: '{count} tasks can bring {amount}. Do them first for income!',
    advice_income_action: 'View income tasks',
    advice_invest_good_time: 'Good time to invest',
    advice_invest_no_urgent: 'No urgent tasks. Spend time on long-term projects!',
    advice_invest_dont_forget: "Don't forget future projects",
    advice_invest_block_time: '{count} investment projects. Block 1-2 hours/day for progress!',
    advice_invest_action: 'View investment projects',
    advice_checkin_title: 'Check-in long-term projects',
    advice_checkin_msg: '{count} projects waiting for check-in. Keep streak to build habits!',
    advice_checkin_action: 'Check-in now',

    // TaskItem extras
    checked_in_today: 'Checked in today!',
    checkin_today: 'Check-in today',

    // Priority reasons
    reason_overdue: 'OVERDUE! Handle immediately!',
    reason_24h: 'Deadline in 24h - Top priority!',
    reason_days_left: '{days} days left - Important & Urgent',
    reason_q1: 'Q1: Important + Urgent → Do now!',
    reason_q2: 'Q2: Important but not urgent → Schedule it',
    reason_q3: 'Q3: Urgent but not important → Consider delegating',
    reason_q4: 'Q4: Not urgent, not important → Do when free',
    reason_cash: 'Money can come in 7 days',
    reason_easy: 'Easy task - Quick win!',
    reason_risk: 'Has risk - Prepare carefully',

    // Autostart
    autostart_on: 'ON',
    autostart_off: 'OFF',
  }
};

// Auto-detect language from browser
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || 'vi';
  // If browser language starts with 'vi', use Vietnamese, otherwise English
  return browserLang.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

// Language store with persistence
export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: detectBrowserLanguage(), // Auto-detect from browser

      setLanguage: (lang) => set({ language: lang }),

      toggleLanguage: () => {
        const current = get().language;
        set({ language: current === 'vi' ? 'en' : 'vi' });
      },

      t: (key) => {
        const lang = get().language;
        return translations[lang][key] || translations['vi'][key] || key;
      }
    }),
    {
      name: 'hubogo-language',
    }
  )
);

// Hook for easy translation access
export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();

  const t = (key) => {
    return translations[language][key] || translations['vi'][key] || key;
  };

  return { t, language, setLanguage, toggleLanguage };
}
