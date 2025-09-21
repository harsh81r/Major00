import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Reply, AlertCircle, Code, Settings, Users } from 'lucide-react';
import { MESSAGE_TYPES } from '../Actions';

const DiscussionForum = ({ socketRef, roomId, username, role }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.GENERAL);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socketRef.current) {
      const handleNewMessage = (message) => {
        setMessages(prev => [...prev, message]);
      };

      const handleMessageReplied = ({ messageId, reply }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, replies: [...msg.replies, reply] }
              : msg
          )
        );
      };

      socketRef.current.on(ACTIONS.NEW_MESSAGE, handleNewMessage);
      socketRef.current.on(ACTIONS.MESSAGE_REPLIED, handleMessageReplied);

      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.NEW_MESSAGE, handleNewMessage);
          socketRef.current.off(ACTIONS.MESSAGE_REPLIED, handleMessageReplied);
        }
      };
    }
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit(ACTIONS.SEND_MESSAGE, {
        roomId,
        message: newMessage.trim(),
        username,
        type: messageType
      });
      setNewMessage('');
    }
  };

  const replyToMessage = (messageId) => {
    if (replyText.trim() && socketRef.current) {
      socketRef.current.emit(ACTIONS.REPLY_TO_MESSAGE, {
        roomId,
        messageId,
        reply: replyText.trim(),
        username
      });
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case MESSAGE_TYPES.FRONTEND_ISSUE:
        return <Code className="w-4 h-4 text-blue-500" />;
      case MESSAGE_TYPES.BACKEND_ISSUE:
        return <Settings className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case MESSAGE_TYPES.FRONTEND_ISSUE:
        return 'border-l-blue-500 bg-blue-50';
      case MESSAGE_TYPES.BACKEND_ISSUE:
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Discussion Forum</h3>
        </div>
        <div className="text-sm text-gray-500">
          {messages.length} messages
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`border-l-4 p-3 rounded-r-lg ${getMessageTypeColor(message.type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getMessageTypeIcon(message.type)}
                <span className="font-medium text-gray-800">{message.username}</span>
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
            </div>
            <p className="mt-2 text-gray-700">{message.message}</p>
            
            {message.replies.length > 0 && (
              <div className="mt-3 ml-4 space-y-2">
                {message.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-100 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">{reply.username}</span>
                      <span className="text-xs text-gray-500">{formatTime(reply.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{reply.reply}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>

            {replyingTo === message.id && (
              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => replyToMessage(message.id)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-gray-50">
        <div className="flex space-x-2 mb-2">
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={MESSAGE_TYPES.GENERAL}>General Discussion</option>
            <option value={MESSAGE_TYPES.FRONTEND_ISSUE}>Frontend Issue</option>
            <option value={MESSAGE_TYPES.BACKEND_ISSUE}>Backend Issue</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
