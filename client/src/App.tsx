import React, { useState, useCallback, useEffect } from 'react';
import { useChat } from './context/ChatContext';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

interface LoginState {
  isLoading: boolean;
  error: string | null;
}

const App: React.FC = () => {
  const {
    currentUser,
    currentConversation,
    setCurrentConversation,
    login,
    signup,
    logout,
    authenticateWithToken,
    isAuthenticated,
  } = useChat();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    error: null,
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      authenticateWithToken(token).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, [authenticateWithToken, isAuthenticated]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        setLoginState({ isLoading: true, error: null });
        await login(email, password);
        setLoginState({ isLoading: false, error: null });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Login failed';
        setLoginState({ isLoading: false, error: errorMessage });
      }
    },
    [login]
  );

  const handleSignup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setLoginState({ isLoading: true, error: null });
        await signup(email, password, name);
        setLoginState({ isLoading: false, error: null });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Signup failed';
        setLoginState({ isLoading: false, error: errorMessage });
      }
    },
    [signup]
  );

  const handleLogout = useCallback(() => {
    logout();
    setIsLoginMode(true);
    setCurrentConversation(null);
    setLoginState({ isLoading: false, error: null });
  }, [logout, setCurrentConversation]);

  // Show login/signup forms if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-96 max-w-[90vw]">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            💬 RG
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Real-time messaging platform
          </p>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mb-8"></div>

          {isLoginMode ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => {
                setIsLoginMode(false);
                setLoginState({ isLoading: false, error: null });
              }}
              isLoading={loginState.isLoading}
              error={loginState.error}
            />
          ) : (
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => {
                setIsLoginMode(true);
                setLoginState({ isLoading: false, error: null });
              }}
              isLoading={loginState.isLoading}
              error={loginState.error}
            />
          )}

          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            Demo mode: Messages stored in memory, cleared on page refresh.
          </p>
        </div>
      </div>
    );
  }

  // Show main chat interface if authenticated
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar
        onSelectConversation={(id) => {
          const conversation = currentConversation?.id === id ? currentConversation : null;
          setCurrentConversation(conversation);
        }}
        onLogout={handleLogout}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          conversationName={currentConversation?.name || 'Chat'}
          recipientId={currentConversation?.participants[0]}
        />
        <MessageList />
        <MessageInput conversationId={currentConversation?.id} />
      </div>
    </div>
  );
};

export default App;
