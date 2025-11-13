'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/" className="nav-logo">
          <span className="logo">✓</span>
          <span>BTube</span>
        </Link>
      </div>
      <div className="nav-right">
        <Link href="/" className="nav-link">
          Trending
        </Link>
        {isLoggedIn ? (
          <>
            <Link href="/upload" className="nav-link">
              Upload
            </Link>
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}