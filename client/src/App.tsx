import React, { useState, useCallback, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';

interface LoginState {
  isLoading: boolean;
  error: string | null;
}

const App: React.FC = () => {
  const { currentConversation, setCurrentConversation, registerUser } = useChat();
  const { theme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [customName, setCustomName] = useState('');
  const [loginState, setLoginState] = useState<LoginState>({ isLoading: false, error: null });

  // Demo users available only in development/demo mode
  const demoUsers = useMemo(() => {
    return process.env.REACT_APP_DEMO_MODE === 'true' ? ['Alice', 'Bob', 'Charlie'] : [];
  }, []);

  // Validate and login user
  const handleLogin = useCallback(
    (name: string) => {
      try {
        setLoginState({ isLoading: true, error: null });

        if (!name || name.trim().length === 0) {
          setLoginState({ isLoading: false, error: 'Please enter a name' });
          return;
        }

        if (name.trim().length > 50) {
          setLoginState({ isLoading: false, error: 'Name must be less than 50 characters' });
          return;
        }

        const trimmedName = name.trim();
        const sanitizedEmail = `${trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')}@example.com`;

        registerUser({
          name: trimmedName,
          email: sanitizedEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            trimmedName
          )}`,
        });

        setUserName(trimmedName);
        setIsLoggedIn(true);
        setCustomName('');
        setLoginState({ isLoading: false, error: null });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setLoginState({ isLoading: false, error: errorMessage });
      }
    },
    [registerUser]
  );

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
    setCustomName('');
    setCurrentConversation(null);
    setLoginState({ isLoading: false, error: null });
  }, [setCurrentConversation]);

  const handleCustomLogin = useCallback(() => {
    if (customName.trim()) {
      handleLogin(customName);
    } else {
      setLoginState({ isLoading: false, error: 'Please enter a name' });
    }
  }, [customName, handleLogin]);

  const onSelectConversation = useCallback((id: string) => {
    setSelectedConversation(id);
  }, []);

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="bg-white dark:bg-chat-dark rounded-lg shadow-2xl p-8 w-96 max-w-[90vw]">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            💬 RG
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Real-time messaging platform
          </p>

          {loginState.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {loginState.error}
            </div>
          )}

          {/* Demo users section */}
          {demoUsers.length > 0 && (
            <>
              <div className="space-y-3 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center uppercase tracking-wide">
                  Demo Users (Development)
                </p>
                {demoUsers.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLogin(name)}
                    disabled={loginState.isLoading}
                    className="w-full px-4 py-3 bg-chat-green text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loginState.isLoading ? 'Logging in...' : `Login as ${name}`}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-chat-dark text-gray-500">OR</span>
                </div>
              </div>
            </>
          )}

          {/* Custom login section */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Your Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  if (loginState.error) {
                    setLoginState({ ...loginState, error: null });
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loginState.isLoading) {
                    handleCustomLogin();
                  }
                }}
                placeholder="Your name"
                maxLength={50}
                disabled={loginState.isLoading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-chat-green focus:ring-2 focus:ring-chat-green focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {customName.length}/50
              </p>
            </div>
            <button
              onClick={handleCustomLogin}
              disabled={!customName.trim() || loginState.isLoading}
              className="w-full px-4 py-3 bg-chat-green text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loginState.isLoading ? 'Logging in...' : 'Start Chatting'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            This is a demo application. Your messages are stored in memory and will be lost
            when you refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar onSelectConversation={onSelectConversation} onLogout={handleLogout} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-full">
        <Header
          conversationName={currentConversation?.name || 'Select a conversation'}
          recipientId={currentConversation?.participants[0]}
        />
        <MessageList />
        <MessageInput conversationId={currentConversation?.id} />
      </div>
    </div>
  );
};

export default App;
