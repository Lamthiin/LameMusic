import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.css';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Quản lý tin nhắn chưa đọc
  const scrollRef = useRef(null);

  const myId = user?.userId ? Number(user.userId) : null;
  const roomId = myId ? `user_${myId}` : null;

  // 1. Theo dõi tin nhắn chưa đọc khi đóng widget
  useEffect(() => {
    if (!myId || !roomId) return;

    socket.connect();

    // Lắng nghe tin nhắn mới từ Admin
    socket.on('receive_message', (newMsg) => {
      if (newMsg.roomId === roomId) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });

        // Nếu đang đóng hộp thoại VÀ người gửi không phải là mình -> Tăng unread
        if (!isOpen && Number(newMsg.senderId) !== myId) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [myId, roomId, isOpen]);

  // 2. Xử lý khi MỞ hộp thoại chat
  useEffect(() => {
    if (isOpen && myId && roomId) {
      // Khi mở hộp thoại:
      // a. Xóa badge thông báo
      setUnreadCount(0);

      // b. Join room
      socket.emit('join_room', { roomId, userId: myId });

      // c. Báo cho Admin là mình đã đọc tin (Gửi read_event)
      socket.emit('read_event', { roomId, userId: myId });

      // d. Lấy lịch sử chat
      fetch(`http://localhost:3000/chat/history/${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch(err => console.error("Lỗi history:", err));
    }
  }, [isOpen, myId, roomId]);

  const sendMessage = () => {
    if (!message.trim() || !myId || !roomId) return;
    const chatData = {
      senderId: myId,
      roomId: roomId,
      content: message,
    };
    socket.emit('send_message', chatData);
    setMessage('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!user) return null;

  return (
    <div className="chat-widget-wrapper">
      {isOpen && (
        <div className="chat-box-main">
          <div className="chat-box-header">
            <span>Hỗ trợ trực tuyến</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-box-body">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={`message-row ${Number(msg.senderId) === myId ? 'me' : 'them'}`}>
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
              placeholder="Nhập tin nhắn..."
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