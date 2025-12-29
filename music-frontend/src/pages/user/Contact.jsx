import React from "react";

const Contact = () => {
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
        Liên hệ với chúng tôi 📬
      </h1>

      <p style={{ color: "#aaa", marginBottom: "40px" }}>
        Nếu bạn có bất kỳ góp ý, phản hồi hoặc ý tưởng phát triển mới – hãy kết nối nhé!
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px"
      }}>
        <div style={{
          background: "#111",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid #1ed76033"
        }}>
          <h3 style={{ fontSize: "22px" }}>📧 Email</h3>
          <p style={{ color: "#ccc" }}>dotanhung0505@gmail.com</p>
        </div>

        <div style={{
          background: "#111",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid #1ed76033"
        }}>
          <h3 style={{ fontSize: "22px" }}>🌎 Facebook</h3>
          <p style={{ color: "#ccc" }}>facebook.com/Brian</p>
        </div>

        <div style={{
          background: "#111",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid #1ed76033"
        }}>
          <h3 style={{ fontSize: "22px" }}>📍 Mục đích dự án</h3>
          <p style={{ color: "#ccc" }}>
            Đây là dự án cá nhân phục vụ học tập, nghiên cứu và trải nghiệm công nghệ web.
          </p>
        </div>

        <div style={{
          background: "#111",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid #1ed76033"
        }}>
          <h3 style={{ fontSize: "22px" }}>❤️ Cảm ơn</h3>
          <p style={{ color: "#ccc" }}>
            Cảm ơn bạn đã ghé thăm và sử dụng Lame Music!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
