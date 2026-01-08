import React, { useState, useEffect, useRef } from 'react';
import { FiMinus, FiX, FiSun, FiMoon, FiSquare, FiMaximize2 } from 'react-icons/fi';
import { BsPin, BsPinFill } from 'react-icons/bs';
import useStore from '../store/useStore';
import logoImg from '../../assets/icon.png';

// Tauri API detection
const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__;

function TitleBar() {
  const { theme, toggleTheme } = useStore();
  const [isPinned, setIsPinned] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const tauriWindowRef = useRef(null);

  // Load Tauri window API
  useEffect(() => {
    if (isTauri) {
      import('@tauri-apps/api/window').then(mod => {
        tauriWindowRef.current = mod;
        // Check maximized state after loading
        const win = mod.getCurrentWindow();
        win.isMaximized().then(setIsMaximized);
      });
    }
  }, []);

  const handleMinimize = async () => {
    if (isTauri && tauriWindowRef.current) {
      const win = tauriWindowRef.current.getCurrentWindow();
      await win.minimize();
    }
  };

  const handleMaximize = async () => {
    if (isTauri && tauriWindowRef.current) {
      const win = tauriWindowRef.current.getCurrentWindow();
      await win.toggleMaximize();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (isTauri && tauriWindowRef.current) {
      const win = tauriWindowRef.current.getCurrentWindow();
      await win.close();
    }
  };

  const handleTogglePin = async () => {
    if (isTauri && tauriWindowRef.current) {
      const win = tauriWindowRef.current.getCurrentWindow();
      const newState = !isPinned;
      await win.setAlwaysOnTop(newState);
      setIsPinned(newState);
    } else {
      setIsPinned(!isPinned);
    }
  };

  // Handle drag window - only if not pinned
  const handleMouseDown = async (e) => {
    // Don't drag if clicking on buttons
    if (e.target.closest('button')) return;
    
    // Don't drag if pinned (locked position)
    if (isPinned) return;

    if (isTauri && tauriWindowRef.current) {
      const win = tauriWindowRef.current.getCurrentWindow();
      await win.startDragging();
    }
  };

  const handleDoubleClick = async () => {
    // Don't allow maximize when pinned
    if (isPinned) return;
    
    if (isTauri && tauriWindowRef.current) {
      const win = tauriWindowRef.current.getCurrentWindow();
      await win.toggleMaximize();
      const maximized = await win.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const pinClass = isPinned ? 'text-green-500' : 'text-gray-500 dark:text-gray-400';

  return (
    <div
      className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 select-none"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: isPinned ? 'default' : 'move' }}
    >
      <div className="flex items-center gap-2">
        <img src={logoImg} alt="HubogoNote" className="w-5 h-5 pointer-events-none" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 pointer-events-none">
          HubogoNote
        </span>
        {isPinned && (
          <span className="text-xs text-green-500 pointer-events-none">(Đã ghim)</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleTogglePin}
          className={'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ' + pinClass}
          title={isPinned ? 'Bỏ ghim (mở khóa vị trí)' : 'Ghim (khóa vị trí + trên cùng)'}
        >
          {isPinned ? <BsPinFill size={14} /> : <BsPin size={14} />}
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {theme === 'dark' ? <FiSun size={14} /> : <FiMoon size={14} />}
        </button>

        <button
          onClick={handleMinimize}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="Thu nhỏ"
        >
          <FiMinus size={14} />
        </button>

        <button
          onClick={handleMaximize}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title={isMaximized ? 'Thu nhỏ cửa sổ' : 'Phóng to'}
          disabled={isPinned}
          style={{ opacity: isPinned ? 0.5 : 1 }}
        >
          {isMaximized ? <FiSquare size={12} /> : <FiMaximize2 size={14} />}
        </button>

        <button
          onClick={handleClose}
          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 dark:text-gray-400 transition-colors"
          title="Đóng"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  );
}

export default TitleBar;
