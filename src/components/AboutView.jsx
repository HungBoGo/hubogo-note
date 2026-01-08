import React, { useState, useEffect } from 'react';
import { FiFacebook, FiPhone, FiHeart, FiCode, FiCoffee, FiZap, FiSettings, FiPower } from 'react-icons/fi';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import logoImg from '../../assets/icon.png';
import techcombankLogo from '../../assets/techcombank-logo.png';
import qrTechcombank from '../../assets/qr-techcombank.jpg';

function AboutView() {
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(true);

  // Check autostart status on mount
  useEffect(() => {
    const checkAutostart = async () => {
      try {
        const enabled = await isEnabled();
        setAutostartEnabled(enabled);
      } catch (err) {
        console.error('Failed to check autostart status:', err);
      } finally {
        setAutostartLoading(false);
      }
    };
    checkAutostart();
  }, []);

  // Toggle autostart
  const handleToggleAutostart = async () => {
    setAutostartLoading(true);
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
      } else {
        await enable();
        setAutostartEnabled(true);
      }
    } catch (err) {
      console.error('Failed to toggle autostart:', err);
      alert('Không thể thay đổi cài đặt khởi động. Vui lòng thử lại.');
    } finally {
      setAutostartLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="HubogoNote" className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-primary-500 mb-2">HubogoNote</h1>
          <p className="text-gray-500 dark:text-gray-400">Phiên bản 1.0.4</p>
        </div>

        {/* Settings Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiSettings className="text-gray-500" />
            Cài đặt
          </h2>

          <div className="space-y-4">
            {/* Autostart toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FiPower className="text-blue-500" size={18} />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Khởi động cùng Windows
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tự động mở app khi bật máy tính
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleAutostart}
                disabled={autostartLoading}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  autostartEnabled
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${autostartLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                    autostartEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCoffee className="text-orange-500" />
            Câu chuyện ra đời
          </h2>

          <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              Xin chào! Mình là <strong className="text-primary-500">Nguyễn Huy Hùng</strong>, hay còn gọi là <strong className="text-primary-500">Hubogo</strong>.
            </p>

            <p>
              Mình chỉ là một người bình thường thôi. Nhưng có một thứ khiến mình... <span className="text-red-500 font-semibold">điên đầu</span>.
              Đó là <span className="italic">deadline</span>.
            </p>

            <p>
              Bạn biết cảm giác đó không? Khi khách hàng gọi điện hỏi tiến độ, còn bạn thì...
              <span className="text-orange-500"> "Ơ, em nhận việc này lúc nào nhỉ?"</span>
            </p>

            <p>
              Hay tệ hơn: <span className="text-red-500">"Anh ơi, sao hôm qua hẹn giao mà chưa thấy?"</span>
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg my-4">
              <p className="text-red-700 dark:text-red-400 font-medium m-0">
                💀 Mình đã trải qua cảm giác đó không biết bao nhiêu lần. Quên việc, nhầm deadline,
                lẫn lộn giữa đống công việc chồng chất...
              </p>
            </div>

            <p>
              Mình thử đủ app quản lý công việc. Notion thì quá phức tạp. Todoist thì không hợp.
              Sticky Notes của Windows thì... chỉ là giấy note thôi.
            </p>

            <p className="font-medium text-gray-800 dark:text-white">
              Thế là mình quyết định: <span className="text-primary-500">"Tự làm một cái cho mình dùng!"</span>
            </p>

            <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-4 rounded-r-lg my-4">
              <p className="text-primary-700 dark:text-primary-400 m-0">
                <FiZap className="inline mr-2" />
                Và với sự trợ giúp của <strong>Claude AI</strong>, sau nhiều đêm thức trắng (okay, Claude không ngủ,
                chỉ có mình thức thôi 😅), <strong>HubogoNote</strong> đã ra đời!
              </p>
            </div>

            <p>
              Một ứng dụng đơn giản, dễ dùng, giúp mình:
            </p>

            <ul className="list-none space-y-2 pl-0">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                Không bao giờ quên việc nữa
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                Biết việc nào gấp, việc nào có thể từ từ
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                Theo dõi tiền công - ai đã trả, ai còn nợ
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                Và quan trọng nhất: <strong>không còn bị khách mắng vì quên deadline!</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Features highlight */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCode className="text-blue-500" />
            Được xây dựng với
          </h2>

          <div className="flex flex-wrap gap-2">
            {['React', 'Tauri', 'TailwindCSS', 'Claude AI', 'Tình yêu ❤️', 'Cà phê ☕'].map(tech => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiHeart className="text-red-500" />
            Liên hệ tác giả
          </h2>

          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-300">
              Nếu bạn có góp ý, phản hồi, hoặc chỉ đơn giản là muốn nói chuyện về công việc,
              cuộc sống, hay bất cứ điều gì - hãy liên hệ mình nhé!
            </p>

            <a
              href="https://facebook.com/hubogo.arch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <FiFacebook className="text-white" size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Facebook
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  facebook.com/hubogo.arch
                </div>
              </div>
            </a>

            <a
              href="tel:0915377575"
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <FiPhone className="text-white" size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                  Điện thoại
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  0915 377 575
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Buy me a coffee Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 shadow-lg mb-6 border border-amber-200 dark:border-amber-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCoffee className="text-amber-600" />
            Mời tác giả ly cà phê ☕
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Nếu bạn thích ứng dụng này và muốn ủng hộ tác giả, bạn có thể mời mình một ly cà phê nhé!
            Mỗi đóng góp đều là động lực để mình tiếp tục phát triển app tốt hơn. 🙏
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-amber-300 dark:border-amber-700">
            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 rounded-xl shadow-md">
                <img
                  src={qrTechcombank}
                  alt="QR Techcombank"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Bank info */}
            <div className="flex items-center gap-4">
              {/* Techcombank Logo */}
              <img
                src={techcombankLogo}
                alt="Techcombank"
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">Techcombank</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white font-mono tracking-wider">
                  8084666889
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  NGUYEN HUY HUNG
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('8084666889');
                  alert('Đã copy số tài khoản!');
                }}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors"
              >
                Copy STK
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                💡 Quét mã QR hoặc chuyển khoản với nội dung: <span className="font-medium text-amber-600 dark:text-amber-400">"Moi cafe Hubogo"</span>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Cảm ơn bạn rất nhiều! 🧡
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm">
          <p>Made with ❤️ by Hubogo</p>
          <p className="mt-1">© 2024 HubogoNote. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AboutView;
