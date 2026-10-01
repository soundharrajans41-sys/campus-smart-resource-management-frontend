import { useState } from "react";
import api, { errMsg } from "./api";

export default function Register({ goLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setMsg("");
    setError("");
    try {
      await api.post("/auth/register", { username, password, role });
      setMsg("Registered! Wait for admin approval, then login.");
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">🎓</div>
          <h2>Create Account</h2>
          <p>Join the Campus Resource Management platform</p>
        </div>

        <div className="auth-form-group">
          <label>Username</label>
          <input
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="auth-form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="auth-form-group">
          <label>Campus Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
          </select>
        </div>

        <button className="auth-submit-btn" onClick={submit}>
          Create Account
        </button>

        {msg && <div className="msg">{msg}</div>}
        {error && <p className="err">{error}</p>}

        <div className="auth-footer">
          Already have an account?{" "}
          <button onClick={goLogin}>Sign in here</button>
        </div>
      </div>
    </div>
  );
}
