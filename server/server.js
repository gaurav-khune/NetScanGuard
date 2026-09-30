const express = require("express");
const cors = require("cors");
const dns = require("dns").promises;
const net = require("net");

const { scanPorts } = require("./scanner");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some(
      (part) => !Number.isInteger(part) || part < 0 || part > 255
    )
  ) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127
  );
}

function isAllowedLiteralHost(host) {
  if (host === "localhost" || host === "::1") {
    return true;
  }

  if (net.isIPv4(host)) {
    return isPrivateIPv4(host);
  }

  if (net.isIPv6(host)) {
    const value = host.toLowerCase();

    return (
      value === "::1" ||
      value.startsWith("fc") ||
      value.startsWith("fd")
    );
  }

  return false;
}

async function validateTarget(host) {
  const normalized = String(host || "").trim();

  if (!normalized) {
    return {
      ok: false,
      message: "Host is required."
    };
  }

  if (isAllowedLiteralHost(normalized)) {
    return {
      ok: true,
      host: normalized
    };
  }

  try {
    const addresses = await dns.lookup(normalized, {
      all: true
    });

    const allowed = addresses.some((entry) => {
      if (entry.family === 4) {
        return isPrivateIPv4(entry.address);
      }

      if (entry.family === 6) {
        const value = entry.address.toLowerCase();

        return (
          value === "::1" ||
          value.startsWith("fc") ||
          value.startsWith("fd")
        );
      }

      return false;
    });

    if (!allowed) {
      return {
        ok: false,
        message:
          "For safety, target must resolve to localhost or a private/local network address."
      };
    }

    return {
      ok: true,
      host: normalized
    };
  } catch {
    return {
      ok: false,
      message: "Could not resolve the target host."
    };
  }
}

app.get("/", (req, res) => {
  res.json({
    name: "NetScanGuard API",
    status: "running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    server: true
  });
});

app.post("/api/scan", async (req, res) => {
  try {
    const host = String(req.body.host || "").trim();
    const startPort = Number(req.body.startPort);
    const endPort = Number(req.body.endPort);

    if (
      !Number.isInteger(startPort) ||
      !Number.isInteger(endPort)
    ) {
      return res.status(400).json({
        error: "Ports must be whole numbers."
      });
    }

    if (
      startPort < 1 ||
      startPort > 65535 ||
      endPort < 1 ||
      endPort > 65535
    ) {
      return res.status(400).json({
        error: "Ports must be between 1 and 65535."
      });
    }

    if (startPort > endPort) {
      return res.status(400).json({
        error: "Start port cannot be greater than end port."
      });
    }

    if (endPort - startPort > 500) {
      return res.status(400).json({
        error: "Demo scans are limited to 500 ports at a time."
      });
    }

    const target = await validateTarget(host);

    if (!target.ok) {
      return res.status(400).json({
        error: target.message
      });
    }

    const data = await scanPorts(
      target.host,
      startPort,
      endPort
    );

    res.json({
      ...data,
      openPorts: data.results.length
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Scan failed on the server."
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `NetScanGuard API running on http://localhost:${PORT}`
  );
});
