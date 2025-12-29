import React from "react";

const About = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0b0b",
      color: "#fff",
      padding: "60px 100px"
    }}>
      <h1 style={{
        fontSize: "48px",
        fontWeight: 900,
        marginBottom: "10px",
        letterSpacing: "-1px"
      }}>
        Lame Music – Dự án nghe nhạc cá nhân 🎧
      </h1>

      <p style={{ color: "#aaa", fontSize: "18px", marginBottom: "40px" }}>
        Một không gian âm nhạc dành cho sự sáng tạo, cảm xúc và trải nghiệm cá nhân.
      </p>

      {/* Section 1 */}
      <div style={{
        background: "#111",
        padding: "30px",
        borderRadius: "14px",
        border: "1px solid #1ed76033",
        marginBottom: "30px"
      }}>
        <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>🌟 Lame Music là gì?</h2>
        <p style={{ color: "#ccc", lineHeight: "1.8" }}>
          Đây là dự án website nghe nhạc cá nhân được xây dựng với mục tiêu mang đến trải nghiệm
          giống các nền tảng âm nhạc chuyên nghiệp nhưng đơn giản, thân thiện và mang dấu ấn riêng.
          Bạn có thể nghe nhạc, quản lý bài hát, khám phá playlist và tận hưởng âm nhạc theo cách của mình.
        </p>
      </div>

      {/* Section 2 */}
      <div style={{
        background: "#111",
        padding: "30px",
        borderRadius: "14px",
        border: "1px solid #1ed76033",
        marginBottom: "30px"
      }}>
        <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>🚀 Mục tiêu & Định hướng</h2>
        <ul style={{ color: "#ccc", lineHeight: "2" }}>
          <li>🎵 Trải nghiệm nghe nhạc mượt mà, ổn định</li>
          <li>🎧 Giao diện hiện đại, cảm giác giống Spotify</li>
          <li>📀 Hỗ trợ playlist, quản lý bài hát</li>
          <li>🔥 Hướng đến nền tảng âm nhạc cá nhân hóa</li>
        </ul>
      </div>

      {/* Section 3 */}
      <div style={{
        background: "#111",
        padding: "30px",
        borderRadius: "14px",
        border: "1px solid #1ed76033"
      }}>
        <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>❤️ Lời cảm ơn</h2>
        <p style={{ color: "#ccc", lineHeight: "1.8" }}>
          Cảm ơn bạn đã sử dụng Lame Music. Hy vọng website sẽ mang lại cho bạn
          những phút giây thư giãn, cảm hứng và thật nhiều cảm xúc cùng âm nhạc.
        </p>
      </div>
    </div>
  );
};

export default About;
