# NetScanGuard

NetScanGuard is a Computer Networks project that provides a web dashboard for scanning TCP ports on localhost/private-network targets.

## Features

- React dashboard
- Express REST API
- Real TCP connection-based port scanner using Node.js `net`
- Common service identification
- Risk classification
- Scan duration
- Open-port results
- Responsive dark UI
- Input validation
- Local/private-network target restriction
- No database required

## Project structure

```text
NetScanGuard-MERN/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/
│   ├── scanner.js
│   ├── server.js
│   └── package.json
├── package.json
└── README.md
```

## Requirements

- Node.js 18+
- npm

## Install

From the project root:

```powershell
npm run install-all
```

## Run

```powershell
npm run dev
```

Frontend:

http://localhost:5173

Backend:

http://localhost:5000

## Demo

Start a local HTTP server on port 3000 in another PowerShell window:

```powershell
npx http-server -p 3000
```

Then use NetScanGuard:

```text
Host: 127.0.0.1
Start Port: 2995
End Port: 3010
```

Port 3000 should appear as:

```text
OPEN
HTTP
LOW
```

You can also scan the NetScanGuard backend:

```text
Host: 127.0.0.1
Start Port: 4995
End Port: 5010
```

Port 5000 should appear as an open port.

## API

### GET /

Health check.

### POST /api/scan

Example:

```json
{
  "host": "127.0.0.1",
  "startPort": 2995,
  "endPort": 3010
}
```

## Important

NetScanGuard intentionally restricts scanning to localhost and private/local networks. Use it only on systems and networks you own or are authorized to test.


## Demo High-Risk Option

The dashboard includes a **Demo High-Risk** button. It displays a simulated open Telnet (TCP 23) result classified as HIGH risk for presentations. It does not start Telnet, open port 23, or change the computer/network.

For a real scan, use **Start Scan**. Real results are still based on TCP connectivity.
