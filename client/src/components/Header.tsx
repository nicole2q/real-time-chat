import React, { useState } from 'react';
import { Phone, Video, MoreVertical, Search, Plus } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import SearchBar from './SearchBar';
import AddContactModal from './AddContactModal';

interface HeaderProps {
  conversationName?: string;
  recipientId?: string;
}

const Header: React.FC<HeaderProps> = ({ conversationName, recipientId }) => {
  const { startAudioCall, startVideoCall } = useChat();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAudioCall = () => {
    if (recipientId) {
      startAudioCall(recipientId);
      alert('Audio call initiated to ' + conversationName);
    }
  };

  const handleVideoCall = () => {
    if (recipientId) {
      startVideoCall(recipientId);
      alert('Video call initiated to ' + conversationName);
    }
  };

  return (
    <header className="bg-white dark:bg-chat-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-16">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {conversationName || 'Chat'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {recipientId && (
            <>
              <button
                onClick={handleAudioCall}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Start audio call"
              >
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleVideoCall}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Start video call"
              >
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Add new contact"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Audio call"
            aria-label="Audio call"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {showAddModal && <AddContactModal onClose={() => setShowAddModal(false)} />}
      </div>
    </header>
  );
};

export default Header;
