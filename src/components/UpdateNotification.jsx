import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiExternalLink } from 'react-icons/fi';
import { checkForUpdates, skipVersion } from '../utils/updateChecker';
import { useTranslation } from '../utils/i18n';

function UpdateNotification() {
  const { t, language } = useTranslation();
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      const info = await checkForUpdates();
      if (info) {
        setUpdateInfo(info);
        setIsVisible(true);
      }
    };

    // Check after 3 seconds to let app load first
    const timer = setTimeout(checkUpdate, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      // Use window.open as fallback - works in Tauri webview
      window.open(updateInfo.downloadUrl, '_blank');
    }
    setIsVisible(false);
  };

  const handleSkip = () => {
    if (updateInfo?.version) {
      skipVersion(updateInfo.version);
    }
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !updateInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9998] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <FiDownload className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">
                {language === 'vi' ? 'Có bản cập nhật mới!' : 'Update Available!'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                v{updateInfo.currentVersion} → v{updateInfo.version}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400" size={16} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {language === 'vi'
            ? 'Phiên bản mới đã sẵn sàng với nhiều cải tiến và sửa lỗi.'
            : 'A new version is available with improvements and bug fixes.'}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all"
          >
            <FiExternalLink size={14} />
            {language === 'vi' ? 'Tải về' : 'Download'}
          </button>
          <button
            onClick={handleSkip}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-xl transition-colors"
          >
            {language === 'vi' ? 'Bỏ qua' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateNotification;
