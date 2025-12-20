import React, { useState, useEffect, useRef } from 'react'
import { socket } from '../../utils/socket'
import { useAuth } from '../../context/AuthContext'
import './AdminChat.css'

const AdminChat = () => {
  const { user } = useAuth()
  const adminId = user?.userId ? Number(user.userId) : null
  const token = localStorage.getItem('accessToken')

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef(null)
  const selectedUserRef = useRef(null)

  // Đồng bộ selectedUser vào Ref để Socket Listener luôn lấy được giá trị mới nhất
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  const fetchRooms = async () => {
    if (!token) return
    try {
      const res = await fetch('http://localhost:3000/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        // Sắp xếp: Ai có updatedAt mới hơn thì lên đầu
        const sorted = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        setUsers(sorted)
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách phòng:", err)
    }
  }

  useEffect(() => {
    fetchRooms()
    socket.connect()

    // LẮNG NGHE TIN NHẮN MỚI
    socket.on('receive_message', msg => {
      console.log("📩 Nhận tin nhắn mới:", msg)

      // 1. Cập nhật khung chat nếu đang mở đúng phòng
      if (selectedUserRef.current && msg.roomId === selectedUserRef.current.roomId) {
        setMessages(prev => {
          if (msg.id && prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        // Nếu đang mở phòng này thì coi như đã đọc luôn
        markAsRead(msg.roomId)
      }

      // 2. CẬP NHẬT SIDEBAR REAL-TIME
      setUsers(prevUsers => {
        const userExists = prevUsers.find(u => u.roomId === msg.roomId)

        if (userExists) {
          const updated = prevUsers.map(u => {
            if (u.roomId === msg.roomId) {
              // Nếu admin đang mở đúng phòng này thì unreadCount phải là 0
              const isCurrentlyOpening = selectedUserRef.current?.roomId === msg.roomId
              
              return {
                ...u,
                lastMessage: msg.content,
                unreadCount: isCurrentlyOpening ? 0 : (Number(u.unreadCount) || 0) + 1,
                updatedAt: new Date().toISOString() // Cập nhật để sort lên đầu
              }
            }
            return u
          })
          // Đẩy người vừa nhắn lên đầu danh sách
          return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        } else {
          // Khách hàng mới chưa có trong list -> Load lại toàn bộ danh sách
          fetchRooms()
          return prevUsers
        }
      })
    })

    // Lắng nghe tín hiệu thông báo chung (nếu có)
    socket.on('admin_new_notification', () => fetchRooms())

    return () => {
      socket.off('receive_message')
      socket.off('admin_new_notification')
    }
  }, [])

  const selectUser = async u => {
    setSelectedUser(u)
    setMessages([])

    // Cập nhật UI Sidebar ngay lập tức (xóa dấu đỏ Optimistic)
    setUsers(prevUsers => 
      prevUsers.map(userItem => 
        userItem.roomId === u.roomId ? { ...userItem, unreadCount: 0 } : userItem
      )
    )

    socket.emit('join_room', {
      roomId: u.roomId,
      userId: adminId
    })

    try {
      const res = await fetch(`http://localhost:3000/chat/history/${u.roomId}`)
      const data = await res.json()
      setMessages(data)
      
      // Báo cho server đã đọc
      markAsRead(u.roomId)
    } catch (err) {
      console.error("Lỗi:", err)
    }
  }

  const sendReply = () => {
    if (!inputValue.trim() || !selectedUser) return

    const data = {
      senderId: adminId,
      roomId: selectedUser.roomId,
      content: inputValue,
      createdAt: new Date().toISOString()
    }

    socket.emit('send_message', data)
    setInputValue('')
  }

  const markAsRead = async roomId => {
    if (!token) return
    try {
      await fetch(`http://localhost:3000/chat/read/${roomId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Đồng bộ lại state users một lần nữa cho chắc
      setUsers(prev =>
        prev.map(u => (u.roomId === roomId ? { ...u, unreadCount: 0 } : u))
      )
    } catch (err) {}
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="admin-chat-wrapper">
      {/* SIDEBAR */}
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">Tin nhắn hỗ trợ</div>

        <div className="admin-chat-user-list">
          {users.map(u => (
            <div
              key={u.roomId}
              className={`admin-chat-user-item ${selectedUser?.roomId === u.roomId ? 'active' : ''}`}
              onClick={() => selectUser(u)}
            >
              <div className="admin-chat-avatar">
                {u.username?.charAt(0).toUpperCase()}
              </div>

              <div className="admin-chat-user-info">
                <div className="admin-chat-user-name-row">
                  <strong>{u.username}</strong>
                </div>
                <div className={`admin-chat-last-msg ${Number(u.unreadCount) > 0 ? 'unread' : ''}`}>
                  {u.lastMessage || '...'}
                </div>
              </div>

              {Number(u.unreadCount) > 0 && (
                <div className="admin-chat-badge">{u.unreadCount}</div>
              )}
            </div>
          ))}
          {users.length === 0 && <div className="admin-chat-empty-sidebar">Không có hội thoại nào</div>}
        </div>
      </div>

      {/* CHAT MAIN */}
      <div className="admin-chat-main">
        {selectedUser ? (
          <>
            <div className="admin-chat-header">
              Đang chat với <strong>{selectedUser.username}</strong>
            </div>

            <div className="admin-chat-messages">
              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`admin-chat-msg-row ${Number(m.senderId) === adminId ? 'me' : 'them'}`}
                >
                  <div className="admin-chat-msg-bubble">{m.content}</div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="admin-chat-input-area">
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={sendReply}>Gửi</button>
            </div>
          </>
        ) : (
          <div className="admin-chat-empty">Chọn khách hàng để xem tin nhắn</div>
        )}
      </div>
    </div>
  )
}

export default AdminChat