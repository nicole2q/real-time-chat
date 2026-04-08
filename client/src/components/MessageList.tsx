import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';

const MessageList: React.FC = () => {
  const { messages, currentUser, currentConversation } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current conversation
  const conversationMessages = messages.filter(
    (msg) => msg.conversationId === currentConversation?.id
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {conversationMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {conversationMessages.map((message) => {
            const isOwn = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-chat-green text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  {message.mediaUrl && message.mediaType === 'image' && (
                    <img src={message.mediaUrl} alt="message" className="max-w-xs rounded-md mb-2" />
                  )}
                  {message.mediaUrl && message.mediaType === 'video' && (
                    <video src={message.mediaUrl} className="max-w-xs rounded-md mb-2" controls />
                  )}
                  {message.content && <p className="text-sm">{message.content}</p>}
                  <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
