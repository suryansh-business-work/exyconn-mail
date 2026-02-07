import { Link } from "react-router-dom";

export default function Inbox() {
  const emails = [
    {
      id: 1,
      from: "john@example.com",
      subject: "Meeting Tomorrow",
      date: "2026-02-02",
    },
    {
      id: 2,
      from: "jane@example.com",
      subject: "Project Update",
      date: "2026-02-01",
    },
    {
      id: 3,
      from: "support@exyconn.com",
      subject: "Welcome to Exyconn",
      date: "2026-01-31",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Inbox</h1>
        <Link to="/" style={{ color: "#3b82f6", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ marginTop: "2rem" }}>
        {emails.map((email) => (
          <div
            key={email.id}
            style={{
              padding: "1rem",
              backgroundColor: "white",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 600 }}>{email.from}</div>
            <div style={{ color: "#666" }}>{email.subject}</div>
            <div style={{ fontSize: "0.875rem", color: "#999" }}>
              {email.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
