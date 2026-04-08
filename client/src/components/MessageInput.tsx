import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface MessageInputProps {
  conversationId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChat();

  const handleSend = () => {
    if (message.trim() && conversationId) {
      sendMessage(conversationId, message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-chat-dark border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-end gap-2">
        <button
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title="Emoji picker"
          aria-label="Emoji picker"
        >
          <Smile className="w-6 h-6" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-chat-green resize-none max-h-24"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2 text-chat-green hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
