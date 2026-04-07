import React from 'react';
import { X, Moon, Palette, Bell, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light' as const, label: 'Light', icon: '☀️' },
    { name: 'dark' as const, label: 'Dark', icon: '🌙' },
    { name: 'blue' as const, label: 'Blue', icon: '🔵' },
    { name: 'green' as const, label: 'Green', icon: '💚' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-chat-dark rounded-lg shadow-lg w-full max-w-md max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-chat-dark">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-chat-green" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Theme</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    theme.name === t.name
                      ? 'ring-2 ring-chat-green bg-gray-100 dark:bg-gray-800'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">{t.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-chat-green" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable message notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable call notifications</span>
            </label>
          </div>

          {/* Privacy Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-chat-green" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Privacy</h3>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show online status</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Read receipts</span>
            </label>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-chat-green text-white rounded-lg hover:bg-green-500 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
