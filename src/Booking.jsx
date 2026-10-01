import { useEffect, useState } from "react";
import api, { errMsg } from "./api";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const pad = (n) => String(n).padStart(2, "0");
const today = () => new Date().toISOString().slice(0, 10);

export default function Booking({ user }) {
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [mine, setMine] = useState([]);
  const [notes, setNotes] = useState([]);   // notifications
  const [error, setError] = useState("");

  const notify = (text) => setNotes((old) => [text, ...old]);

  const loadResources = async () => {
    const res = await api.get("/resources");
    // students cannot book classrooms
    const list = res.data.filter((r) => r.availability && !(user.role === "STUDENT" && r.type === "CLASSROOM"));
    setResources(list);
    if (list.length > 0 && !resourceId) setResourceId(list[0].id);
  };

  const loadSlots = async () => {
    if (!resourceId) return;
    const res = await api.get("/bookings/slots", { params: { resourceId, date } });
    setSlots(res.data);
  };

  const loadMine = async () => {
    const res = await api.get("/bookings");
    setMine(res.data);
  };

  useEffect(() => { loadResources(); loadMine(); }, []);
  useEffect(() => { loadSlots(); }, [resourceId, date]);

  const isTaken = (h) => {
    const s = new Date(`${date}T${pad(h)}:00:00`);
    const e = new Date(`${date}T${pad(h + 1)}:00:00`);
    return slots.some((b) => new Date(b.startTime) < e && new Date(b.endTime) > s);
  };

  const book = async (h) => {
    setError("");
    try {
      await api.post("/bookings", {
        resourceId,
        startTime: `${date}T${pad(h)}:00`,
        endTime: `${date}T${pad(h + 1)}:00`,
      });
      notify(`Booking confirmed for ${date} ${pad(h)}:00 (email/SMS sent)`);
      loadSlots();
      loadMine();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const cancel = async (id) => {
    try {
      await api.delete("/bookings/" + id);
      notify(`Booking #${id} cancelled (email/SMS sent)`);
      loadSlots();
      loadMine();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const modify = async (id) => {
    const startTime = prompt("New start (format 2026-10-05T10:00)");
    const endTime = prompt("New end (format 2026-10-05T11:00)");
    if (!startTime || !endTime) return;
    try {
      await api.put("/bookings/" + id, { startTime, endTime });
      notify(`Booking #${id} modified (email/SMS sent)`);
      loadSlots();
      loadMine();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const statusOf = (b) => {
    if (b.status === "CANCELLED") return "CANCELLED";
    const now = new Date();
    if (new Date(b.endTime) < now) return "PAST";
    if (new Date(b.startTime) <= now) return "ONGOING";
    return "UPCOMING";
  };

  const nameOf = (id) => resources.find((r) => r.id === id)?.name || "Resource #" + id;

  return (
    <div>
      <section className="section-card">
        <div className="section-header">
          <h3>📅 Book a Campus Resource</h3>
        </div>

        <div className="control-panel">
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Resource</span>
            <select value={resourceId} onChange={(e) => setResourceId(Number(e.target.value))}>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.type} ({r.location})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Select Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {error && <p className="err">{error}</p>}

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Availability</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h) => {
                const taken = isTaken(h);
                return (
                  <tr key={h} className={taken ? "taken" : "free"}>
                    <td style={{ fontWeight: 600 }}>
                      🕒 {pad(h)}:00 – {pad(h + 1)}:00
                    </td>
                    <td>
                      <span className={`status-pill ${taken ? "status-taken" : "status-free"}`}>
                        <span className="status-dot"></span>
                        {taken ? "Booked" : "Available"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!taken && (
                        <button className="btn-success" onClick={() => book(h)}>
                          ⚡ Book Slot
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <h3>📋 My Reservations</h3>
        </div>

        {mine.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: "12px 0" }}>
            You haven't made any bookings yet. Select a slot above to reserve a resource.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Resource</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((b) => {
                  const status = statusOf(b);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>#{b.id}</td>
                      <td><b>{nameOf(b.resourceId)}</b></td>
                      <td>{b.startTime.replace("T", " ")}</td>
                      <td>{b.endTime.replace("T", " ")}</td>
                      <td>
                        <span className={`status-pill status-${status.toLowerCase()}`}>
                          <span className="status-dot"></span>
                          {status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {b.status === "BOOKED" && (
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button className="btn-outline" onClick={() => modify(b.id)}>
                              Modify
                            </button>
                            <button className="btn-danger" onClick={() => cancel(b.id)}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-header">
          <h3>🔔 Notifications & Activity</h3>
        </div>
        {notes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", margin: "8px 0" }}>No notifications yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {notes.map((n, i) => (
              <div key={i} className="msg">
                {n}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
