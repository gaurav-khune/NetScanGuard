import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  LockKeyhole,
  Network,
  Radar,
  RefreshCw,
  Server,
  ShieldCheck,
  FlaskConical
} from "lucide-react";

const API_URL = "http://localhost:5000";

function RiskBadge({ risk }) {
  return (
    <span className={`risk-badge risk-${String(risk).toLowerCase()}`}>
      {risk}
    </span>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-hint">{hint}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [host, setHost] = useState("127.0.0.1");
  const [startPort, setStartPort] = useState("2995");
  const [endPort, setEndPort] = useState("3010");

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openResults = scan?.results || [];

  const counts = useMemo(
    () => ({
      high: openResults.filter((item) => item.risk === "HIGH").length,
      medium: openResults.filter((item) => item.risk === "MEDIUM").length,
      low: openResults.filter((item) => item.risk === "LOW").length,
      review: openResults.filter((item) => item.risk === "REVIEW").length
    }),
    [openResults]
  );

  function runDemoHighRisk() {
    setError("");
    setLoading(false);
    setScan({
      host: "127.0.0.1 (Demo)",
      startPort: 23,
      endPort: 23,
      duration: 0,
      openPorts: 1,
      demo: true,
      results: [
        {
          port: 23,
          status: "OPEN",
          service: "Telnet",
          risk: "HIGH",
          reason: "Telnet is an unencrypted remote-access protocol."
        }
      ]
    });
  }

  async function runScan(event) {
    event.preventDefault();

    setError("");
    setScan(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          host,
          startPort: Number(startPort),
          endPort: Number(endPort)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scan failed.");
      }

      setScan(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Make sure the server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h1>NetScanGuard</h1>
            <p>Network Security Scanner</p>
          </div>
        </div>

        <div className="status-pill">
          <span className="status-dot" />
          Scanner Online
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">
              <Radar size={16} />
              NETWORK VISIBILITY
            </div>
            <h2>Inspect your local network services.</h2>
            <p>
              Scan TCP ports, identify common services, and review basic
              service-risk information from one dashboard.
            </p>
          </div>

          <div className="hero-icon">
            <Network size={70} strokeWidth={1.2} />
          </div>
        </section>

        <section className="scan-panel">
          <div className="section-heading">
            <div>
              <h3>New Port Scan</h3>
              <p>
                Targets are restricted to localhost and private/local networks.
              </p>
            </div>
          </div>

          <form onSubmit={runScan}>
            <div className="form-grid">
              <label>
                Target Host
                <input
                  value={host}
                  onChange={(event) => setHost(event.target.value)}
                  placeholder="127.0.0.1"
                />
              </label>

              <label>
                Start Port
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={startPort}
                  onChange={(event) => setStartPort(event.target.value)}
                />
              </label>

              <label>
                End Port
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={endPort}
                  onChange={(event) => setEndPort(event.target.value)}
                />
              </label>

              <button className="scan-button" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="spin" size={18} />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Radar size={18} />
                    Start Scan
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="quick-targets">
            <span>Quick targets:</span>
            <button type="button" onClick={() => setHost("127.0.0.1")}>
              Localhost
            </button>
            <button type="button" onClick={() => setHost("::1")}>
              IPv6 Localhost
            </button>
            <button type="button" className="demo-button" onClick={runDemoHighRisk}>
              <FlaskConical size={15} />
              Demo High-Risk
            </button>
          </div>

          <p className="demo-note">
            Demo mode shows a simulated open Telnet port for presentation. It does not start Telnet or change your system.
          </p>
        </section>

        {error && (
          <div className="error-box">
            <AlertTriangle size={19} />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <section className="scan-progress">
            <div className="progress-head">
              <div>
                <strong>Scanning {host}</strong>
                <span>
                  Checking ports {startPort}–{endPort}
                </span>
              </div>
              <Activity className="pulse" size={22} />
            </div>
            <div className="progress-track">
              <div className="progress-bar" />
            </div>
          </section>
        )}

        {scan && !loading && (
          <>
            {scan.demo && (
              <div className="demo-banner">
                <FlaskConical size={18} />
                <span>Demo result — simulated HIGH-risk Telnet detection for presentation.</span>
              </div>
            )}

            <section className="stats-grid">
              <StatCard
                icon={<Server size={20} />}
                label="Target"
                value={scan.host}
                hint={`${scan.startPort}–${scan.endPort}`}
              />
              <StatCard
                icon={<Gauge size={20} />}
                label="Open Ports"
                value={scan.openPorts ?? openResults.length}
                hint="TCP reachable"
              />
              <StatCard
                icon={<Clock3 size={20} />}
                label="Duration"
                value={`${scan.duration} ms`}
                hint="Sequential scan"
              />
              <StatCard
                icon={<AlertTriangle size={20} />}
                label="High Risk"
                value={counts.high}
                hint={`${counts.medium} medium`}
              />
            </section>

            <section className="results-panel">
              <div className="section-heading">
                <div>
                  <h3>Scan Results</h3>
                  <p>
                    {openResults.length
                      ? `${openResults.length} open port(s) detected.`
                      : "No open ports were found in this range."}
                  </p>
                </div>

                <div className="result-summary">
                  <span className="summary-high">{counts.high} high</span>
                  <span className="summary-medium">
                    {counts.medium} medium
                  </span>
                  <span className="summary-low">{counts.low} low</span>
                  <span className="summary-review">
                    {counts.review} review
                  </span>
                </div>
              </div>

              {openResults.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Port</th>
                        <th>Status</th>
                        <th>Service</th>
                        <th>Risk</th>
                        <th>Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openResults.map((item) => (
                        <tr key={item.port}>
                          <td className="port-number">{item.port}</td>
                          <td>
                            <span className="open-status">
                              <CheckCircle2 size={15} />
                              OPEN
                            </span>
                          </td>
                          <td>{item.service}</td>
                          <td>
                            <RiskBadge risk={item.risk} />
                          </td>
                          <td className="reason">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-results">
                  <LockKeyhole size={35} />
                  <strong>No open TCP ports detected</strong>
                  <span>
                    Try another authorized local/private target or port range.
                  </span>
                </div>
              )}
            </section>
          </>
        )}

        <footer>
          <span>NetScanGuard · Computer Networks Project</span>
          <span>
            Use only on systems and networks you are authorized to test.
          </span>
        </footer>
      </main>
    </div>
  );
}
