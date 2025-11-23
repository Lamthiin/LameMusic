// music-frontend/src/components/Footer.jsx
import React from 'react';
import './Footer.css'; // File CSS riêng
import { FaGithub, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section about">
          <h2 className="footer-logo">lame 🎵</h2>
          <p>
            Dự án web nghe nhạc cá nhân. 
            Nơi chia sẻ và khám phá âm nhạc không giới hạn.
          </p>
        </div>
        <div className="footer-section links">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/careers">Cơ hội</a></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h4>Kết nối</h4>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaGithub /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} lame Music. Đã đăng ký bản quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;