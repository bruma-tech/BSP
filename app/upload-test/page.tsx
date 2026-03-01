"use client";

import { useState, useRef } from "react";

type FileCategory = {
  label: string;
  color: string;
  bg: string;
};

const FILE_CATEGORIES: Record<string, FileCategory> = {
  image: { label: "Image", color: "#49cc90", bg: "rgba(73,204,144,0.1)" },
  video: { label: "Video", color: "#61affe", bg: "rgba(97,175,254,0.1)" },
  audio: { label: "Audio", color: "#fca130", bg: "rgba(252,161,48,0.1)" },
  pdf: { label: "PDF", color: "#f93e3e", bg: "rgba(249,62,62,0.1)" },
  application: { label: "Document", color: "#e27a3f", bg: "rgba(226,122,63,0.1)" },
  text: { label: "Text", color: "#50e3c2", bg: "rgba(80,227,194,0.1)" },
  unknown: { label: "File", color: "#9012fe", bg: "rgba(144,18,254,0.1)" },
};

function detectCategory(file: File): FileCategory {
  if (file.type === "application/pdf") return FILE_CATEGORIES.pdf;
  const category = file.type.split("/")[0];
  return FILE_CATEGORIES[category] || FILE_CATEGORIES.unknown;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

type UploadResponse = {
  success: boolean;
  data?: {
    url: string;
    public_id: string;
    resource_type: string;
    format: string;
    bytes: number;
    original_filename: string;
    created_at: string;
  };
  error?: string;
};

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [tryItOpen, setTryItOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Download state
  const [dlExpanded, setDlExpanded] = useState(true);
  const [dlTryItOpen, setDlTryItOpen] = useState(false);
  const [dlUrl, setDlUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);

  const category = file ? detectCategory(file) : null;

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json: UploadResponse = await res.json();
      setResponse(json);
    } catch {
      setResponse({ success: false, error: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload() {
    if (!dlUrl) return;
    setDownloading(true);
    setDlError(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: dlUrl }),
      });

      if (!res.ok) {
        const json = await res.json();
        setDlError(json.error || "Download failed");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match ? match[1] : "download";

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setDlError("Network error");
    } finally {
      setDownloading(false);
    }
  }

  function handleClear() {
    setFile(null);
    setResponse(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ background: "#1b1b1b", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
          Bruma Upload API
        </span>
        <span style={{ color: "#8a8a8a", fontSize: 13 }}>v1.0</span>
        <span style={{ marginLeft: "auto", color: "#49cc90", fontSize: 13, fontWeight: 600 }}>
          /api/upload &middot; /api/download
        </span>
      </div>

      {/* Info Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e2e2", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ background: "#49cc90", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 3 }}>
          OAS 3.0
        </span>
        <span style={{ color: "#555", fontSize: 13 }}>
          Cloudinary File Upload &amp; Download - Upload any file type (image, video, audio, PDF, document) and download via URL
        </span>
      </div>

      <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
        {/* Endpoint Card */}
        <div style={{ border: "1px solid #49cc90", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
          {/* Endpoint Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              background: "rgba(73,204,144,0.1)",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{
              background: "#49cc90",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              padding: "6px 16px",
              borderRadius: 3,
              minWidth: 60,
              textAlign: "center",
            }}>
              POST
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 600, color: "#333" }}>
              /api/upload
            </span>
            <span style={{ color: "#666", fontSize: 13, marginLeft: 8 }}>
              Upload a file to Cloudinary
            </span>
            <span style={{ marginLeft: "auto", color: "#888", fontSize: 18 }}>
              {expanded ? "▾" : "▸"}
            </span>
          </button>

          {expanded && (
            <div style={{ background: "#fff", padding: 0 }}>
              {/* Parameters Section */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Parameters</h3>
                <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "10px 0" }}>
                        <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>file</code>
                        <span style={{ color: "#e2513d", fontSize: 11, marginLeft: 6 }}>* required</span>
                      </td>
                      <td style={{ padding: "10px 0", color: "#666" }}>
                        <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>multipart/form-data</code>
                      </td>
                      <td style={{ padding: "10px 0", color: "#666" }}>
                        Any file (image, video, audio, document, etc.)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Request Body Section */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Request body</h3>
                <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                  Content type: <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>multipart/form-data</code>
                </div>
              </div>

              {/* Responses Section */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Responses</h3>
                <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500, width: 80 }}>Code</th>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#49cc90", fontWeight: 700 }}>200</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>File uploaded successfully</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#fca130", fontWeight: 700 }}>400</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>No file provided</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#f93e3e", fontWeight: 700 }}>500</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>Upload failed (server error)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Try It Out Section */}
              <div style={{ padding: "16px 20px" }}>
                {!tryItOpen ? (
                  <button
                    onClick={() => setTryItOpen(true)}
                    style={{
                      background: "#4990e2",
                      color: "#fff",
                      border: "none",
                      padding: "8px 24px",
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Try it out
                  </button>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Try it out</h3>
                      <button
                        onClick={() => { setTryItOpen(false); handleClear(); }}
                        style={{
                          background: "none",
                          color: "#888",
                          border: "1px solid #ccc",
                          padding: "4px 16px",
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {/* File Picker */}
                    <div style={{
                      border: "2px dashed #ccc",
                      borderRadius: 8,
                      padding: 24,
                      textAlign: "center",
                      background: "#fafafa",
                      marginBottom: 16,
                      transition: "border-color 0.2s",
                      ...(file ? { borderColor: category!.color } : {}),
                    }}>
                      <input
                        ref={fileRef}
                        type="file"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          setResponse(null);
                        }}
                        style={{ display: "none" }}
                        id="file-input"
                      />
                      <label
                        htmlFor="file-input"
                        style={{
                          display: "inline-block",
                          padding: "8px 24px",
                          background: "#4990e2",
                          color: "#fff",
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Choose File
                      </label>

                      {file && category && (
                        <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                          <span style={{
                            background: category.bg,
                            color: category.color,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 3,
                            textTransform: "uppercase",
                          }}>
                            {category.label}
                          </span>
                          <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>{file.name}</span>
                          <span style={{ fontSize: 12, color: "#888" }}>({formatBytes(file.size)})</span>
                          <span style={{ fontSize: 12, color: "#aaa", fontFamily: "monospace" }}>{file.type || "unknown"}</span>
                        </div>
                      )}
                    </div>

                    {/* Execute Button */}
                    <button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      style={{
                        background: !file || uploading ? "#93c5fd" : "#4990e2",
                        color: "#fff",
                        border: "none",
                        padding: "10px 40px",
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: !file || uploading ? "not-allowed" : "pointer",
                        width: "100%",
                      }}
                    >
                      {uploading ? "Uploading..." : "Execute"}
                    </button>

                    {/* Response Section */}
                    {response && (
                      <div style={{ marginTop: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Server response</h4>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color: "#888" }}>Code</span>
                          <span style={{
                            fontWeight: 700,
                            color: response.success ? "#49cc90" : "#f93e3e",
                          }}>
                            {response.success ? "200" : "Error"}
                          </span>
                        </div>

                        <div style={{
                          background: "#1b1b1b",
                          borderRadius: 4,
                          padding: 16,
                          overflow: "auto",
                          maxHeight: 400,
                        }}>
                          <pre style={{
                            margin: 0,
                            color: "#fff",
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}>
                            {JSON.stringify(response, null, 2)}
                          </pre>
                        </div>

                        {response.success && response.data?.url && (
                          <div style={{ marginTop: 12, fontSize: 13 }}>
                            <span style={{ color: "#888", fontWeight: 500 }}>Direct URL: </span>
                            <a
                              href={response.data.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#4990e2", wordBreak: "break-all" }}
                            >
                              {response.data.url}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Download Endpoint Card */}
        <div style={{ border: "1px solid #61affe", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
          <button
            onClick={() => setDlExpanded(!dlExpanded)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              background: "rgba(97,175,254,0.1)",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{
              background: "#61affe",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              padding: "6px 16px",
              borderRadius: 3,
              minWidth: 60,
              textAlign: "center",
            }}>
              POST
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 600, color: "#333" }}>
              /api/download
            </span>
            <span style={{ color: "#666", fontSize: 13, marginLeft: 8 }}>
              Download a file by Cloudinary URL
            </span>
            <span style={{ marginLeft: "auto", color: "#888", fontSize: 18 }}>
              {dlExpanded ? "▾" : "▸"}
            </span>
          </button>

          {dlExpanded && (
            <div style={{ background: "#fff", padding: 0 }}>
              {/* Parameters */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Parameters</h3>
                <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "10px 0" }}>
                        <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>url</code>
                        <span style={{ color: "#e2513d", fontSize: 11, marginLeft: 6 }}>* required</span>
                      </td>
                      <td style={{ padding: "10px 0", color: "#666" }}>
                        <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>string</code>
                      </td>
                      <td style={{ padding: "10px 0", color: "#666" }}>
                        Cloudinary secure URL of the uploaded file
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Request Body */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Request body</h3>
                <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                  Content type: <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>application/json</code>
                </div>
                <div style={{ background: "#1b1b1b", borderRadius: 4, padding: 12, marginTop: 8 }}>
                  <pre style={{ margin: 0, color: "#ccc", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
{`{ "url": "https://res.cloudinary.com/..." }`}
                  </pre>
                </div>
              </div>

              {/* Responses */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Responses</h3>
                <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500, width: 80 }}>Code</th>
                      <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#49cc90", fontWeight: 700 }}>200</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>File binary stream (triggers browser download)</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#fca130", fontWeight: 700 }}>400</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>No URL provided</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#f93e3e", fontWeight: 700 }}>502</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>Failed to fetch from Cloudinary</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0" }}><code style={{ color: "#f93e3e", fontWeight: 700 }}>500</code></td>
                      <td style={{ padding: "8px 0", color: "#666" }}>Download failed (server error)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Try It Out */}
              <div style={{ padding: "16px 20px" }}>
                {!dlTryItOpen ? (
                  <button
                    onClick={() => setDlTryItOpen(true)}
                    style={{
                      background: "#4990e2",
                      color: "#fff",
                      border: "none",
                      padding: "8px 24px",
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Try it out
                  </button>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Try it out</h3>
                      <button
                        onClick={() => { setDlTryItOpen(false); setDlUrl(""); setDlError(null); }}
                        style={{
                          background: "none",
                          color: "#888",
                          border: "1px solid #ccc",
                          padding: "4px 16px",
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 13, color: "#333", fontWeight: 600, display: "block", marginBottom: 6 }}>
                        url <span style={{ color: "#e2513d", fontSize: 11 }}>* required</span>
                      </label>
                      <input
                        type="text"
                        value={dlUrl}
                        onChange={(e) => { setDlUrl(e.target.value); setDlError(null); }}
                        placeholder="https://res.cloudinary.com/..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          fontSize: 13,
                          fontFamily: "monospace",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <button
                      onClick={handleDownload}
                      disabled={!dlUrl || downloading}
                      style={{
                        background: !dlUrl || downloading ? "#93c5fd" : "#4990e2",
                        color: "#fff",
                        border: "none",
                        padding: "10px 40px",
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: !dlUrl || downloading ? "not-allowed" : "pointer",
                        width: "100%",
                      }}
                    >
                      {downloading ? "Downloading..." : "Execute"}
                    </button>

                    {dlError && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color: "#888" }}>Code</span>
                          <span style={{ fontWeight: 700, color: "#f93e3e" }}>Error</span>
                        </div>
                        <div style={{ background: "#1b1b1b", borderRadius: 4, padding: 16 }}>
                          <pre style={{ margin: 0, color: "#f93e3e", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                            {JSON.stringify({ success: false, error: dlError }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {!dlError && downloading === false && dlUrl && (
                      <div style={{ marginTop: 12, fontSize: 13, color: "#49cc90", fontWeight: 500 }}>
                        File download triggered successfully.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Schema Section */}
        <div style={{ border: "1px solid #e2e2e2", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ background: "#f5f5f5", padding: "10px 16px", borderBottom: "1px solid #e2e2e2" }}>
            <h3 style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 600 }}>Schemas</h3>
          </div>
          <div style={{ background: "#fff", padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>UploadResponse</span>
            </div>
            <div style={{
              background: "#1b1b1b",
              borderRadius: 4,
              padding: 16,
              overflow: "auto",
            }}>
              <pre style={{
                margin: 0,
                color: "#ccc",
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}>
{`{
  "success": true,
  "data": {
    "url": "string (secure URL)",
    "public_id": "string",
    "resource_type": "image | video | raw",
    "format": "string (e.g. png, mp4, pdf)",
    "bytes": "number",
    "original_filename": "string",
    "created_at": "string (ISO date)"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
