import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          🎮 Retro Emulator
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Trang chủ</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;