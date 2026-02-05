# Exyconn Mail

A complete custom email hosting platform with SMTP server, domain management, and mailbox administration.

## 🎯 Features

- **Custom SMTP Server** - Run your own mail server to send and receive emails
- **Domain Management** - Add domains with DKIM, SPF, and DMARC configuration
- **Mailbox Management** - Create email accounts with quotas, forwarding, and auto-reply
- **MX Record Support** - Configure DNS MX records to point to your mail server
- **Email Storage** - Store and organize emails with folder support

## 🏗️ Project Structure

```
exyconn-mail/
├── ui/                           # React TypeScript frontend (Port: 4031)
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx     # Overview and stats
│       │   ├── Domains/          # Domain management
│       │   ├── Mailboxes/        # Mailbox management
│       │   ├── Inbox.tsx         # Email inbox
│       │   └── Compose.tsx       # Compose email
│       └── services/             # API services
├── server/                       # Node.js TypeScript backend (Port: 4032)
│   └── src/
│       ├── features/
│       │   ├── domains/          # Domain CRUD, DKIM, DNS verification
│       │   ├── mailboxes/        # Mailbox CRUD, authentication
│       │   └── emails/           # Email management
│       └── services/
│           └── smtp.service.ts   # Custom SMTP server
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
npm run dev:server  # Server on port 4032 + SMTP on port 2525
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
MONGO_URI=mongodb://localhost:27017/exyconn-mail
SMTP_PORT=2525
SMTP_HOST=0.0.0.0
```

## 🌐 DNS Configuration

To receive emails on your domain, configure these DNS records:

### MX Record
```
Type: MX
Host: @
Value: mail.yourdomain.com
Priority: 10
```

### SPF Record
```
Type: TXT
Host: @
Value: v=spf1 mx a ~all
```

### DKIM Record (generated per domain)
```
Type: TXT
Host: default._domainkey
Value: (Generated in Domain settings)
```

### DMARC Record
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@yourdomain.com
```

## 🔗 Links

- **UI**: https://mail.exyconn.com (Port: 4031)
- **API**: https://mail-api.exyconn.com (Port: 4032)
- **SMTP**: Port 2525 (configurable)
- **GitHub**: https://github.com/suryansh-business-work/exyconn-mail

## 📄 License

MIT
