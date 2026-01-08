import React, { useState, useEffect } from 'react';
import { APP_VERSION, getChangelogsSince, getVersionChangelog } from '../utils/changelog';
import { shouldShowWhatsNew, markVersionAsSeen, getLastKnownVersion } from '../utils/updateChecker';

function WhatsNewDialog({ onClose }) {
  const lastVersion = getLastKnownVersion();
  const changelogs = getChangelogsSince(lastVersion);
  const currentChangelog = getVersionChangelog(APP_VERSION);

  const handleClose = () => {
    markVersionAsSeen();
    onClose();
  };

  if (!currentChangelog) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🎉</span>
            <div>
              <h2 className="text-2xl font-bold">Có gì mới!</h2>
              <p className="text-white/80">HubogoNote v{APP_VERSION}</p>
            </div>
          </div>
          <p className="text-white/90 mt-2">{currentChangelog.title}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Highlights */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span>Điểm nổi bật</span>
            </h3>
            <div className="space-y-2">
              {currentChangelog.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl"
                >
                  <span className="text-xl">{highlight.split(' ')[0]}</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {highlight.split(' ').slice(1).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Changes */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Chi tiết thay đổi
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {currentChangelog.changes.map((change, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Previous versions (if any) */}
          {changelogs.length > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Xem các phiên bản trước ({changelogs.length - 1} bản cập nhật)
                </summary>
                <div className="mt-4 space-y-4">
                  {changelogs.slice(1).map((log) => (
                    <div key={log.version} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          v{log.version}
                        </span>
                        <span className="text-xs text-gray-500">{log.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{log.title}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Bắt đầu sử dụng
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage What's New dialog
export function useWhatsNew() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Check if we should show What's New
    if (shouldShowWhatsNew()) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeDialog = () => {
    setShowDialog(false);
  };

  return { showDialog, closeDialog };
}

export default WhatsNewDialog;
