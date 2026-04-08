import React, { useState, useRef } from 'react';
import { Send, Smile, Image, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface MessageInputProps {
  conversationId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessageWithMedia } = useChat();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image or video file');
    }
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if ((message.trim() || selectedFile) && conversationId) {
      sendMessageWithMedia(conversationId, message, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !selectedFile) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-chat-dark border-t border-gray-200 dark:border-gray-700">
      {/* Media Preview */}
      {preview && (
        <div className="px-4 pt-3">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {selectedFile?.type.startsWith('image/') ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <video src={preview} className="w-full h-full object-cover" />
            )}
            <button
              onClick={handleRemoveMedia}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              title="Remove media"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {selectedFile?.name}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 p-4">
        <button
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title="Emoji picker"
          aria-label="Emoji picker"
        >
          <Smile className="w-6 h-6" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title="Share image or video"
          aria-label="Share image or video"
        >
          <Image className="w-6 h-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select media file"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedFile ? 'Add caption (optional)...' : 'Type a message...'}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-chat-green resize-none max-h-24"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() && !selectedFile}
          className="p-2 text-chat-green hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
          aria-label="Send message"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
