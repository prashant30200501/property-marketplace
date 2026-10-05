import {
  getAdminToken,
  getAdminVerificationDetail,
  getAdminVerifications,
  loginAdmin,
  logoutAdmin,
  reviewAdminVerification
} from "./api";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { BrokerVerification, BrokerVerificationDetail, } from "./api";
import "./App.css";


function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">NESTORA</div>

        <h1>Admin Login</h1>

        <p className="login-subtitle">
          Sign in to manage Nestora operations.
        </p>

        <form onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@nestora.in"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<"dashboard" | "kyc">("dashboard");
  const [verifications, setVerifications] = useState<BrokerVerification[]>(
  [],
);
const [selectedVerification, setSelectedVerification] =
  useState<BrokerVerificationDetail | null>(null);
const [loading, setLoading] = useState(false);
const [detailLoading, setDetailLoading] = useState(false);
const [error, setError] = useState("");
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewError, setReviewError] = useState("");

  async function loadVerifications() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminVerifications();
      setVerifications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load KYC submissions.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function approveVerification() {
  if (!selectedVerification) {
    return;
  }

  const confirmed = window.confirm(
    `Approve ${selectedVerification.full_name} as a verified Nestora broker?`,
  );

  if (!confirmed) {
    return;
  }

  setReviewLoading(true);
  setReviewError("");

  try {
    await reviewAdminVerification(
      selectedVerification.verification_id,
      "verified",
    );

    setSelectedVerification({
      ...selectedVerification,
      status: "verified",
      verified_at: new Date().toISOString(),
    });

    await loadVerifications();
  } catch (err) {
    setReviewError(
      err instanceof Error
        ? err.message
        : "Unable to approve verification.",
    );
  } finally {
    setReviewLoading(false);
  }
}

  async function openVerification(verificationId: string) {
  setDetailLoading(true);
  setError("");

  try {
    const detail = await getAdminVerificationDetail(verificationId);
    setSelectedVerification(detail);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load verification details.",
    );
  } finally {
    setDetailLoading(false);
  }
}

  useEffect(() => {
    if (page === "kyc") {
      loadVerifications();
    }
  }, [page]);

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="brand">NESTORA</div>

        <nav>
          <button
            className={`nav-item ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${page === "kyc" ? "active" : ""}`}
            onClick={() => setPage("kyc")}
          >
            KYC Review
          </button>

          <button className="nav-item">Brokers</button>
          <button className="nav-item">Properties</button>
          <button className="nav-item">Enquiries</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{page === "kyc" ? "KYC Review" : "Dashboard"}</h1>

            <p>
              {page === "kyc"
                ? "Review broker verification submissions."
                : "Manage Nestora marketplace operations."}
            </p>
          </div>

          <div className="admin-user">
            <span className="avatar">A</span>

            <span>Nestora Admin</span>

            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {page === "dashboard" ? (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <span>Pending KYC</span>
                <strong>1</strong>
              </div>

              <div className="stat-card">
                <span>Verified Brokers</span>
                <strong>0</strong>
              </div>

              <div className="stat-card">
                <span>Properties</span>
                <strong>0</strong>
              </div>

              <div className="stat-card">
                <span>Enquiries</span>
                <strong>0</strong>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>KYC Review</h2>
                  <p>Brokers waiting for verification.</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setPage("kyc")}
                >
                  View all
                </button>
              </div>

              <div className="empty-state">
                <strong>1 broker awaiting review</strong>

                <p>
                  Open KYC Review to inspect the submitted verification
                  details.
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className="panel">
            {selectedVerification && (
  <div className="verification-detail">
    <button
      className="back-button"
      onClick={() => setSelectedVerification(null)}
    >
      ← Back to KYC Review
    </button>

    {detailLoading ? (
      <p>Loading verification details...</p>
    ) : (
      <>
        <div className="detail-header">
          <div>
            <h2>{selectedVerification.full_name}</h2>
            <p>{selectedVerification.email}</p>
          </div>

          <span className="kyc-status-badge">
            {selectedVerification.status}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <span>Business Name</span>
            <strong>
              {selectedVerification.business_name || "Not provided"}
            </strong>
          </div>

          <div className="detail-card">
            <span>Firm Name</span>
            <strong>
              {selectedVerification.firm_name || "Not provided"}
            </strong>
          </div>

          <div className="detail-card">
            <span>PAN Number</span>
            <strong>
              {selectedVerification.pan_number || "Not provided"}
            </strong>
          </div>

          <div className="detail-card">
            <span>RERA Registration</span>
            <strong>
              {selectedVerification.rera_registration_number ||
                "Not provided"}
            </strong>
          </div>

          <div className="detail-card">
            <span>Latitude</span>
            <strong>
              {selectedVerification.latitude || "Not provided"}
            </strong>
          </div>

          <div className="detail-card">
            <span>Longitude</span>
            <strong>
              {selectedVerification.longitude || "Not provided"}
            </strong>
          </div>
        </div>

        <div className="detail-card submission-card">
          <span>Submitted At</span>
          <strong>
            {selectedVerification.submitted_at
              ? new Date(
                  selectedVerification.submitted_at,
                ).toLocaleString()
              : "Not available"}
          </strong>
        </div>

        <div className="review-actions">
          <button className="reject-button">
            Reject
          </button>
          {reviewError && (
  <div className="login-error">
    {reviewError}
  </div>
)}

         <button
  className="approve-button"
  onClick={approveVerification}
  disabled={reviewLoading}
>
  {reviewLoading ? "Approving..." : "Approve"}
</button>
        </div>
      </>
    )}
  </div>
)}
            {loading && <p>Loading KYC submissions...</p>}

            {error && <div className="login-error">{error}</div>}

            {!loading && !error && verifications.length === 0 && (
              <div className="empty-state">
                <strong>No brokers awaiting review</strong>
                <p>There are currently no KYC submissions to review.</p>
              </div>
            )}

            {!loading &&
              !error &&
              verifications.map((verification) => (
  <div
    key={verification.verification_id}
    className="kyc-row"
    onClick={() => openVerification(verification.verification_id)}
  >
                  <div>
                    <strong>{verification.full_name}</strong>

                    <p>{verification.email}</p>

                    <p>
                      {verification.business_name ||
                        "Business name not provided"}
                    </p>
                  </div>

                  <div className="kyc-status">
                    <span>{verification.status}</span>

                    <small>
                      {verification.submitted_at
                        ? new Date(
                            verification.submitted_at,
                          ).toLocaleString()
                        : "Submission date unavailable"}
                    </small>
                  </div>
                </div>
              ))}
          </section>
        )}
      </main>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => getAdminToken() !== null,
  );

  function handleLogout() {
    logoutAdmin();
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;