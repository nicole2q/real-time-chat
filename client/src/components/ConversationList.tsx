import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation, selectedId }) => {
  const { conversations } = useChat();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-3 rounded-lg text-left transition-colors ${
            selectedId === conversation.id
              ? 'bg-chat-green bg-opacity-20'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {conversation.name || 'Unknown Conversation'}
              </h3>
              {conversation.lastMessage && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <span className="ml-2 w-5 h-5 bg-chat-green text-white text-xs rounded-full flex items-center justify-center font-bold">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationList;
