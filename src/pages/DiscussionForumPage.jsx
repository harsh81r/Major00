import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import initSocket from '../socket';
import ACTIONS, { MESSAGE_TYPES } from '../Actions';
import toast from 'react-hot-toast';

const DiscussionForumPage = () => {
    const socketRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState(MESSAGE_TYPES.GENERAL);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const username = location.state?.username;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username,
            });

            const handleNewMessage = (message) => {
                setMessages(prev => [...prev, message]);
                
                // Smart notifications based on message type
                if (message.type === MESSAGE_TYPES.FRONTEND_ISSUE) {
                    toast.success(`🔧 Frontend Issue: ${message.username} needs help!`, {
                        duration: 4000,
                        style: {
                            background: '#3b82f6',
                            color: 'white',
                            border: '1px solid #1d4ed8'
                        }
                    });
                } else if (message.type === MESSAGE_TYPES.BACKEND_ISSUE) {
                    toast.success(`⚙️ Backend Issue: ${message.username} needs help!`, {
                        duration: 4000,
                        style: {
                            background: '#10b981',
                            color: 'white',
                            border: '1px solid #059669'
                        }
                    });
                }
            };

            const handleMessageReplied = ({ messageId, reply }) => {
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, replies: [...(msg.replies || []), reply] }
                            : msg
                    )
                );
            };

            const handleTyping = (data) => {
                if (data.username !== username) {
                    setTypingUsers(prev => {
                        const filtered = prev.filter(user => user.username !== data.username);
                        return [...filtered, { username: data.username, isTyping: data.isTyping }];
                    });
                }
            };

            socketRef.current.on(ACTIONS.NEW_MESSAGE, handleNewMessage);
            socketRef.current.on(ACTIONS.MESSAGE_REPLIED, handleMessageReplied);
            socketRef.current.on('user-typing', handleTyping);

            return () => {
                if (socketRef.current) {
                    socketRef.current.off(ACTIONS.NEW_MESSAGE, handleNewMessage);
                    socketRef.current.off(ACTIONS.MESSAGE_REPLIED, handleMessageReplied);
                    socketRef.current.disconnect();
                }
            };
        };
        init();
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() && socketRef.current) {
            const message = {
                id: Date.now().toString(),
                message: newMessage.trim(),
                username,
                type: messageType,
                timestamp: new Date().toISOString(),
                replies: []
            };
            
            socketRef.current.emit(ACTIONS.SEND_MESSAGE, {
                roomId,
                message: newMessage.trim(),
                username,
                type: messageType
            });
            
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            
            // Stop typing indicator
            socketRef.current.emit('user-typing', { roomId, username, isTyping: false });
            setIsTyping(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (!isTyping) {
            setIsTyping(true);
            socketRef.current.emit('user-typing', { roomId, username, isTyping: true });
        }
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketRef.current.emit('user-typing', { roomId, username, isTyping: false });
        }, 1000);
    };

    const replyToMessage = (messageId) => {
        if (replyText.trim() && socketRef.current) {
            const reply = {
                id: Date.now().toString(),
                reply: replyText.trim(),
                username,
                timestamp: new Date().toISOString()
            };
            
            socketRef.current.emit(ACTIONS.REPLY_TO_MESSAGE, {
                roomId,
                messageId,
                reply: replyText.trim(),
                username
            });
            
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, replies: [...(msg.replies || []), reply] }
                        : msg
                )
            );
            
            setReplyText('');
            setReplyingTo(null);
        }
    };

    const getMessageTypeIcon = (type) => {
        switch (type) {
            case MESSAGE_TYPES.FRONTEND_ISSUE:
                return '🔧';
            case MESSAGE_TYPES.BACKEND_ISSUE:
                return '⚙️';
            default:
                return '💬';
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

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="forum-container">
            {/* Header */}
            <div className="forum-header">
                <div className="header-left">
                    <button
                        onClick={() => navigate(`/editor/${roomId}`, { state: { username } })}
                        className="back-btn"
                    >
                        <span className="back-icon">←</span>
                        Back to Editor
                    </button>
                    <div className="header-info">
                        <div className="forum-title">
                            <span className="title-icon">💬</span>
                            <h1>Discussion Forum</h1>
                        </div>
                        <div className="room-info">
                            <span className="room-label">Room:</span>
                            <span className="room-id">{roomId}</span>
                        </div>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="message-count">
                        <span className="count-number">{messages.length}</span>
                        <span className="count-label">messages</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>No messages yet</h3>
                        <p>Start the conversation with your team!</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map((message) => (
                            <div key={message.id} className={`message-item ${message.type}`}>
                                <div className="message-header">
                                    <div className="message-meta">
                                        <span className="message-icon">{getMessageTypeIcon(message.type)}</span>
                                        <span className="message-username">{message.username}</span>
                                        <span className="message-time">{formatTime(message.timestamp)}</span>
                                    </div>
                                    <div className="message-type-badge">
                                        {message.type === MESSAGE_TYPES.FRONTEND_ISSUE && '🔧 Frontend Issue'}
                                        {message.type === MESSAGE_TYPES.BACKEND_ISSUE && '⚙️ Backend Issue'}
                                        {message.type === MESSAGE_TYPES.GENERAL && '💬 General'}
                                    </div>
                                </div>
                                <div className="message-content">
                                    <p>{message.message}</p>
                                </div>
                                
                                {message.replies && message.replies.length > 0 && (
                                    <div className="replies-container">
                                        {message.replies.map((reply) => (
                                            <div key={reply.id} className="reply-item">
                                                <div className="reply-header">
                                                    <span className="reply-username">{reply.username}</span>
                                                    <span className="reply-time">{formatTime(reply.timestamp)}</span>
                                                </div>
                                                <div className="reply-content">
                                                    <p>{reply.reply}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="message-actions">
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                                        className="reply-btn"
                                    >
                                        <span className="reply-icon">↩️</span>
                                        <span>Reply</span>
                                    </button>
                                </div>

                                {replyingTo === message.id && (
                                    <div className="reply-input-container">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="reply-input"
                                        />
                                        <div className="reply-buttons">
                                            <button
                                                onClick={() => replyToMessage(message.id)}
                                                className="reply-send-btn"
                                            >
                                                Send
                                            </button>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="reply-cancel-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Typing Indicator */}
                {typingUsers.filter(user => user.isTyping).length > 0 && (
                    <div className="typing-indicator">
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span className="typing-text">
                            {typingUsers.filter(user => user.isTyping).map(user => user.username).join(', ')} typing...
                        </span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
                <div className="input-header">
                    <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                        className="message-type-selector"
                    >
                        <option value={MESSAGE_TYPES.GENERAL}>💬 General Discussion</option>
                        <option value={MESSAGE_TYPES.FRONTEND_ISSUE}>🔧 Frontend Issue</option>
                        <option value={MESSAGE_TYPES.BACKEND_ISSUE}>⚙️ Backend Issue</option>
                    </select>
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="message-input"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="send-button"
                    >
                        <span className="send-icon">📤</span>
                        <span>Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscussionForumPage;
