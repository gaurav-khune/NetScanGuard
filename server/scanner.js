const net = require("net");

const services = {
  20: "FTP Data",
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  443: "HTTPS",
  3306: "MySQL",
  5432: "PostgreSQL",
  6379: "Redis",
  8000: "HTTP",
  8080: "HTTP",
  8443: "HTTPS"
};

function getRisk(port) {
  if (port === 23) {
    return {
      level: "HIGH",
      reason: "Telnet sends remote-session data without encryption."
    };
  }

  if ([21, 20, 110, 143, 3306, 5432, 6379].includes(port)) {
    return {
      level: "MEDIUM",
      reason: "This service can expose a sensitive or legacy network interface."
    };
  }

  if ([22, 25, 53, 80, 443, 8000, 8080, 8443].includes(port)) {
    return {
      level: "LOW",
      reason: "A common network service is reachable on this port."
    };
  }

  return {
    level: "REVIEW",
    reason: "An open port was found, but no service profile is configured."
  };
}

function scanPort(host, port, timeoutMs = 700) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;

    const finish = (result) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      const service = services[port] || "Unknown";
      const risk = getRisk(port);

      finish({
        port,
        status: "OPEN",
        service,
        risk: risk.level,
        reason: risk.reason
      });
    });

    socket.once("timeout", () => {
      finish({ port, status: "CLOSED" });
    });

    socket.once("error", () => {
      finish({ port, status: "CLOSED" });
    });

    socket.connect({
      host,
      port
    });
  });
}

async function scanPorts(host, startPort, endPort) {
  const startTime = Date.now();
  const results = [];

  // Sequential scanning keeps the demo predictable and reduces local-network load.
  for (let port = startPort; port <= endPort; port += 1) {
    const result = await scanPort(host, port);

    if (result.status === "OPEN") {
      results.push(result);
    }
  }

  return {
    host,
    startPort,
    endPort,
    duration: Date.now() - startTime,
    results
  };
}

module.exports = {
  scanPorts
};
