// src/components/Footer.jsx
import React from 'react';
import './Footer.css';
import { FaGithub, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h2 className="footer-logo">lame</h2>
          <p>
            Dự án web nghe nhạc cá nhân.<br />
            Nơi chia sẻ và khám phá âm nhạc không giới hạn.
          </p>
        </div>

        <div className="footer-col">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebook size={20} /></a>
            <a href="#" aria-label="Twitter"><FaTwitter size={20} /></a>
            <a href="#" aria-label="GitHub"><FaGithub size={20} /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} lame Music. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;