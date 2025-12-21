import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.css';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef(null);

  // --- LOGIC ĐỊNH DANH (GUEST HOẶC USER) ---
  const [chatIdentity, setChatIdentity] = useState({ id: null, roomId: null });

  useEffect(() => {
    let finalId;
    let usernamePrefix;

    if (user?.userId) {
      // Nếu là thành viên
      finalId = Number(user.userId);
      usernamePrefix = `user_${finalId}`;
    } else {
      // Nếu là khách (Guest)
      let guestId = localStorage.getItem('guestChatId');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('guestChatId', guestId);
      }
      finalId = guestId;
      usernamePrefix = guestId;
    }
    setChatIdentity({ id: finalId, roomId: usernamePrefix });
  }, [user]);

  const { id: myId, roomId } = chatIdentity;

  // --- SOCKET & TIN NHẮN ---
  useEffect(() => {
    if (!roomId) return;
    socket.connect();

    socket.on('receive_message', (newMsg) => {
      if (newMsg.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (!isOpen && newMsg.senderId !== myId) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    return () => socket.off('receive_message');
  }, [roomId, isOpen, myId]);

  // --- KHI MỞ HỘP THOẠI ---
  useEffect(() => {
    if (isOpen && roomId) {
      setUnreadCount(0);
      socket.emit('join_room', { roomId, userId: myId });
      socket.emit('read_event', { roomId, userId: myId });

      fetch(`http://localhost:3000/chat/history/${roomId}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setMessages(data); })
        .catch(err => console.error("Lỗi history:", err));
    }
  }, [isOpen, roomId, myId]);

  const sendMessage = () => {
    if (!message.trim() || !roomId) return;
    const chatData = {
      senderId: myId,
      roomId: roomId,
      content: message,
      // Có thể gửi thêm field này để Admin biết đây là Khách Vô Danh
      isGuest: !user 
    };
    socket.emit('send_message', chatData);
    setMessage('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-widget-wrapper">
      {isOpen && (
        <div className="chat-box-main">
          <div className="chat-box-header">
            <span>Hỗ trợ trực tuyến {!user && "(Khách)"}</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-box-body">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={`message-row ${msg.senderId == myId ? 'me' : 'them'}`}>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <div className="chat-box-footer">
            <input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Hỏi chúng tôi bất cứ điều gì..."
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button className="chat-floating-button" onClick={() => setIsOpen(true)}>
          💬
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      )}
    </div>
  );
};

export default ChatWidget;