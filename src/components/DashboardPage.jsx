'use client';
import { useMemo, useState } from "react";
import TrendChart from "./TrendChart";

const metricDelta = (scans, key) => {
  if (scans.length < 2) return null;
  const prev = scans[scans.length - 2][key];
  const current = scans[scans.length - 1][key];
  return Number((current - prev).toFixed(2));
};

const prettyPersona = (persona) => {
  if (persona === "first") return "First Scan";
  if (persona === "second") return "Second Scan";
  return "Returning Member";
};

function DashboardPage({ member, scans, summary, onLogout, onUpload }) {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);

  const persona = useMemo(() => {
    if (scans.length <= 1) return "first";
    if (scans.length === 2) return "second";
    return "returning";
  }, [scans.length]);

  const bfDelta = metricDelta(scans, "bodyFatPercent");
  const leanDelta = metricDelta(scans, "leanMass");

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setStatus("Uploading scan...");
    try {
      await onUpload(file);
      setStatus("Upload complete. Dashboard refreshed.");
      setFile(null);
    } catch (error) {
      setStatus(error.message || "Upload failed.");
    }
  };

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">Kalos Member Portal</p>
        <h1>{member?.name}'s Dashboard</h1>
        <p className="subtle">Track body composition trends, upload scans, and review progress milestones.</p>
        <div className="heroMeta">
          <span className="pill">{prettyPersona(persona)}</span>
          <span className="pill ghost">{scans.length} scans</span>
          <button type="button" className="ghostBtn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </section>

      {summary && (
        <section className="card">
          <h2>Progress snapshot</h2>
          <p>
            Status: <strong>{summary.status}</strong>
          </p>
          {summary.bodyFatDelta != null && (
            <p>
              Body fat change since first scan: {summary.bodyFatDelta > 0 ? "+" : ""}
              {summary.bodyFatDelta}%
            </p>
          )}
          {summary.leanMassDelta != null && (
            <p>
              Lean mass change since first scan: {summary.leanMassDelta > 0 ? "+" : ""}
              {summary.leanMassDelta} lbs
            </p>
          )}
        </section>
      )}

      {persona === "first" && scans[0] && (
        <section className="card accent">
          <h2>Your baseline scan</h2>
          <p>This first scan gives your starting point for body composition tracking.</p>
          <div className="metricRow">
            <div className="metricTile">
              <span>Body fat</span>
              <strong>{scans[0].bodyFatPercent}%</strong>
            </div>
            <div className="metricTile">
              <span>Lean mass</span>
              <strong>{scans[0].leanMass} lbs</strong>
            </div>
          </div>
        </section>
      )}

      {persona === "second" && (
        <section className="card accent">
          <h2>What changed since scan 1</h2>
          <div className="metricRow">
            <div className="metricTile">
              <span>Body fat delta</span>
              <strong>
                {bfDelta > 0 ? "+" : ""}
                {bfDelta}%
              </strong>
            </div>
            <div className="metricTile">
              <span>Lean mass delta</span>
              <strong>
                {leanDelta > 0 ? "+" : ""}
                {leanDelta} lbs
              </strong>
            </div>
          </div>
        </section>
      )}

      <TrendChart scans={scans} />

      <section className="card form uploadCard">
        <h2>Upload a DEXA PDF</h2>
        <form onSubmit={submitUpload}>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="submit">Upload scan</button>
        </form>
      </section>
      <p className="status">{status}</p>
    </main>
  );
}

export default DashboardPage;
