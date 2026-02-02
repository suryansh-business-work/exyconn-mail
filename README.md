# Exyconn Mail

Email service and management application for Exyconn ecosystem.

## 🏗️ Project Structure

```
exyconn-mail/
├── ui/          # React TypeScript frontend (Port: 4031)
├── server/      # Node.js TypeScript backend (Port: 4032)
├── docker-compose.yml
└── package.json
```

## 🚀 Quick Start

### Development

```bash
# Install all dependencies
npm run install:all

# Start both UI and Server
npm run dev

# Or start individually
npm run dev:ui      # UI on port 4031
npm run dev:server  # Server on port 4032
```

### Docker

```bash
docker-compose up -d
```

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both UI and Server |
| `npm run build` | Build both projects |
| `npm run typecheck` | Type check both projects |
| `npm run lint` | Lint both projects |
| `npm run format` | Format code |

## 🔧 Environment Variables

### UI (.env)
```env
VITE_API_URL=http://localhost:4032
```

### Server (.env)
```env
NODE_ENV=development
PORT=4032
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## 🔗 Links

- **UI**: https://mail.exyconn.com (Port: 4031)
- **API**: https://mail-api.exyconn.com (Port: 4032)
- **GitHub**: https://github.com/suryansh-business-work/exyconn-mail

## 📄 License

MIT
