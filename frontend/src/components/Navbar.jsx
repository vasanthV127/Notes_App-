import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ user }) {
  const { logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">📝</span>
        <span className="navbar-title">Notes App</span>
      </div>

      <div className="navbar-user">
        <span className="navbar-username">
          👤 {user?.first_name || user?.username}
        </span>
        <button className="btn btn-outline btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
