import React, { useEffect, useState } from 'react';
import { Users, Mail, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const ContactsList: React.FC = () => {
  const {
    contacts,
    getContacts,
    deleteContact,
    startConversationWithContact,
  } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      await getContacts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load contacts';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async (contactEmail: string, contactName: string) => {
    try {
      await startConversationWithContact(contactEmail, contactName);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(message);
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContact(contactId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete contact';
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <Users className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No contacts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <button
            onClick={() => handleStartConversation(contact.email, contact.name)}
            className="flex-1 text-left min-w-0"
          >
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {contact.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
            {contact.phone && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {contact.phone}
              </p>
            )}
          </button>
          <button
            onClick={() => handleDelete(contact.id)}
            className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded transition-opacity"
            title="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ContactsList;
