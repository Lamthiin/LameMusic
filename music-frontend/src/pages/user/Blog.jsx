import React from "react";

const Blog = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0b0b",
      color: "#fff",
      padding: "60px 100px"
    }}>
      <h1 style={{
        fontSize: "44px",
        fontWeight: 900,
        marginBottom: "10px"
      }}>
        Blog – Nhật ký phát triển 📝
      </h1>

      <p style={{ color: "#aaa", marginBottom: "40px" }}>
        Những chia sẻ, cập nhật và câu chuyện phía sau Lame Music.
      </p>

      {/* Post 1 */}
      <div style={{
        background: "#111",
        padding: "30px",
        borderRadius: "14px",
        border: "1px solid #1ed76033",
        marginBottom: "25px"
      }}>
        <h2 style={{ fontSize: "26px" }}>🎧 Ra đời của Lame Music</h2>
        <p style={{ color: "#bbb", marginTop: "10px", lineHeight: "1.8" }}>
          Ý tưởng xây dựng Lame Music xuất phát từ mong muốn tạo ra một nền tảng âm nhạc cá nhân,
          nơi mọi thứ đều được tối ưu cho trải nghiệm riêng của người dùng.
        </p>
      </div>

      {/* Post 2 */}
      <div style={{
        background: "#111",
        padding: "30px",
        borderRadius: "14px",
        border: "1px solid #1ed76033"
      }}>
        <h2 style={{ fontSize: "26px" }}>🚀 Hành trình phát triển</h2>
        <p style={{ color: "#bbb", marginTop: "10px", lineHeight: "1.8" }}>
          Website được phát triển với định hướng hiện đại, sử dụng các công nghệ mới,
          tối ưu tốc độ, khả năng mở rộng và giao diện thân thiện.
          Trong thời gian tới, sẽ tiếp tục cập nhật thêm nhiều tính năng thú vị hơn.
        </p>
      </div>
    </div>
  );
};

export default Blog;
