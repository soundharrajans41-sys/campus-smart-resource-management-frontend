import { useState } from "react";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Booking from "./Booking.jsx";
import Admin from "./Admin.jsx";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("login");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  if (!user) {
    return page === "login"
      ? <Login onLogin={setUser} goRegister={() => setPage("register")} />
      : <Register goLogin={() => setPage("login")} />;
  }

  return (
    <div className="app-container">
      <header className="app-navbar">
        <div className="app-brand">
          <div className="app-logo">🏛️</div>
          <div>
            <div className="app-title">Campus Resource Management</div>
            <div className="app-subtitle">Centralized University Facility Portal</div>
          </div>
        </div>
        <div className="user-profile-bar">
          <div className="user-chip">
            <span>👤</span>
            <b>{user.username}</b>
            <span className={`role-badge role-${user.role?.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-content">
        {user.role === "ADMIN" ? <Admin /> : <Booking user={user} />}
      </main>
    </div>
  );
}
