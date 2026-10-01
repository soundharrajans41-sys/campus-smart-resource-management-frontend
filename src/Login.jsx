import { useState } from "react";
import api, { errMsg } from "./api";

export default function Login({ onLogin, goRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      const user = { username: res.data.username, role: res.data.role };
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
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
          <div className="auth-icon-badge">🏛️</div>
          <h2>Welcome Back</h2>
          <p>Sign in to access campus resource booking</p>
        </div>

        <div className="auth-form-group">
          <label>Username</label>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="auth-form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button className="auth-submit-btn" onClick={submit}>
          Sign In
        </button>

        {error && <p className="err">{error}</p>}

        <div className="auth-footer">
          Don't have an account?{" "}
          <button onClick={goRegister}>Register here</button>
        </div>
      </div>
    </div>
  );
}
