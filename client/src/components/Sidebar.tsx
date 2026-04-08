import React, { useState } from 'react';
import { Settings as SettingsIcon, LogOut, Menu } from 'lucide-react';
import SearchBar from './SearchBar';
import ConversationList from './ConversationList';
import ContactsList from './ContactsList';
import Settings from './Settings';

interface SidebarProps {
  onSelectConversation: (conversationId: string) => void;
  selectedId?: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectConversation, selectedId, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'contacts'>('conversations');

  const handleSearch = (query: string) => {
    // Handle search logic here
    console.log('Search:', query);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-chat-green text-white p-2 rounded-full"
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } lg:block fixed lg:relative w-full lg:w-80 h-screen lg:h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-30`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} placeholder="Search conversations..." />

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'conversations'
                  ? 'bg-chat-green bg-opacity-20 text-chat-green border-b-2 border-chat-green'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-chat-green bg-opacity-20 text-chat-green border-b-2 border-chat-green'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Contacts
            </button>
          </div>
        </div>

        {/* Conversations/Contacts List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'conversations' ? (
            <ConversationList onSelectConversation={onSelectConversation} selectedId={selectedId} />
          ) : (
            <ContactsList />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
