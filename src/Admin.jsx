import { useEffect, useState } from "react";
import api, { errMsg } from "./api";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState([]);
  const [error, setError] = useState("");

  const [newRes, setNewRes] = useState({ name: "", type: "LAB", location: "" });
  const [logUser, setLogUser] = useState("");
  const [logDate, setLogDate] = useState("");
  const [repDate, setRepDate] = useState(new Date().toISOString().slice(0, 10));

  const run = async (fn) => {
    setError("");
    try { await fn(); } catch (e) { setError(errMsg(e)); }
  };

  const loadAll = () => run(async () => {
    setUsers((await api.get("/admin/users")).data);
    setResources((await api.get("/resources")).data);
    setBookings((await api.get("/bookings")).data);
  });

  useEffect(() => { loadAll(); }, []);

  const setStatus = (id, status) => run(async () => {
    await api.put(`/admin/users/${id}?status=${status}`);
    loadAll();
  });

  const addResource = () => run(async () => {
    await api.post("/resources", newRes);
    setNewRes({ name: "", type: "LAB", location: "" });
    loadAll();
  });

  const deleteResource = (id) => run(async () => {
    await api.delete("/resources/" + id);
    loadAll();
  });

  const cancelBooking = (id) => run(async () => {
    await api.delete("/bookings/" + id);
    loadAll();
  });

  const loadLogs = () => run(async () => {
    const params = {};
    if (logUser) params.userId = logUser;
    if (logDate) params.date = logDate;
    setLogs((await api.get("/audit", { params })).data);
  });

  const loadReport = () => run(async () => {
    setReport((await api.get("/admin/report", { params: { date: repDate } })).data);
  });

  const pending = users.filter((u) => u.status === "PENDING").length;
  const active = bookings.filter((b) => b.status === "BOOKED").length;

  return (
    <div>
      {/* Metrics Dashboard */}
      <section className="section-card">
        <div className="section-header">
          <h3>📊 Administration Dashboard</h3>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon icon-blue">🏛️</div>
            <div className="stat-info">
              <div className="stat-value">{resources.length}</div>
              <div className="stat-label">Total Resources</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-amber">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{pending}</div>
              <div className="stat-label">Pending Approvals</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-emerald">📌</div>
            <div className="stat-info">
              <div className="stat-value">{active}</div>
              <div className="stat-label">Active Bookings</div>
            </div>
          </div>
        </div>

        {error && <p className="err">{error}</p>}
      </section>

      {/* User Management */}
      <section className="section-card">
        <div className="section-header">
          <h3>👥 User Approvals & Management</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>#{u.id}</td>
                  <td><b>{u.username}</b></td>
                  <td>
                    <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${u.status?.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {u.role !== "ADMIN" && (
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button className="btn-success" onClick={() => setStatus(u.id, "APPROVED")}>
                          Approve
                        </button>
                        <button className="btn-danger" onClick={() => setStatus(u.id, "REJECTED")}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Resource Management */}
      <section className="section-card">
        <div className="section-header">
          <h3>📦 Campus Resources</h3>
        </div>

        <div className="control-panel">
          <input
            placeholder="Resource Name (e.g. Lab 401)"
            value={newRes.name}
            onChange={(e) => setNewRes({ ...newRes, name: e.target.value })}
          />
          <select value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}>
            <option value="CLASSROOM">CLASSROOM</option>
            <option value="LAB">LAB</option>
            <option value="LOCKER">LOCKER</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>
          <input
            placeholder="Location (e.g. Science Block, 4th Fl)"
            value={newRes.location}
            onChange={(e) => setNewRes({ ...newRes, location: e.target.value })}
          />
          <button onClick={addResource}>
            + Add Resource
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource Name</th>
                <th>Facility Type</th>
                <th>Campus Location</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>#{r.id}</td>
                  <td><b>{r.name}</b></td>
                  <td>{r.type}</td>
                  <td>{r.location}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-danger" onClick={() => deleteResource(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bookings Management */}
      <section className="section-card">
        <div className="section-header">
          <h3>📑 All System Bookings</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Resource ID</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>#{b.id}</td>
                  <td>User #{b.userId}</td>
                  <td>Resource #{b.resourceId}</td>
                  <td>{b.startTime.replace("T", " ")}</td>
                  <td>{b.endTime.replace("T", " ")}</td>
                  <td>
                    <span className={`status-pill status-${b.status?.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {b.status === "BOOKED" && (
                      <button className="btn-danger" onClick={() => cancelBooking(b.id)}>
                        Cancel Booking
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Utilization Report */}
      <section className="section-card">
        <div className="section-header">
          <h3>📈 Daily Utilization Report</h3>
        </div>

        <div className="control-panel">
          <input type="date" value={repDate} onChange={(e) => setRepDate(e.target.value)} />
          <button onClick={loadReport}>
            Generate Report
          </button>
        </div>

        {report.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Total Reservations</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, i) => (
                  <tr key={i}>
                    <td><b>{r.resource}</b></td>
                    <td>{r.bookings} booking(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Audit Logs */}
      <section className="section-card">
        <div className="section-header">
          <h3>🛡️ Security & Audit Logs</h3>
        </div>

        <div className="control-panel">
          <input
            placeholder="Filter by User ID (optional)"
            value={logUser}
            onChange={(e) => setLogUser(e.target.value)}
          />
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
          <button onClick={loadLogs}>
            Search Logs
          </button>
        </div>

        {logs.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>User ID</th>
                  <th>Action Executed</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>#{l.id}</td>
                    <td>User #{l.userId}</td>
                    <td><code>{l.action}</code></td>
                    <td>{l.timestamp.replace("T", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
