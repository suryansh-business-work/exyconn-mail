import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Exyconn Mail Dashboard</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>Welcome to Exyconn Mail Service</p>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link
          to="/inbox"
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
          }}
        >
          Go to Inbox
        </Link>
        <Link
          to="/compose"
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#22c55e',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
          }}
        >
          Compose Email
        </Link>
      </div>
    </div>
  );
}
