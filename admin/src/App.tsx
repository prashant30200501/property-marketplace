
import {
  getAdminProperties,
  getAdminPropertyPhotoBlob,
  getAdminPropertyPhotos,
  getAdminToken,
  getAdminVerificationDetail,
  getAdminVerificationDocument,
  getAdminVerifications,
  loginAdmin,
  logoutAdmin,
  reviewAdminProperty,
  reviewAdminVerification,
} from "./api";


import {
  assignAdminEnquiryBroker,
  getAdminEnquiries,
  getBrokerRecommendations,
  type AdminEnquiry,
  type BrokerRecommendation,
  type BrokerRecommendationsResponse,
} from "./api";



import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type {
  AdminProperty,
  BrokerVerification,
  BrokerVerificationDetail,
  KycDocumentType,
} from "./api";
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





function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [recommendations, setRecommendations] = useState<
    Record<string, BrokerRecommendationsResponse>
  >({});
  const [recommendationLoading, setRecommendationLoading] = useState<
    Record<string, boolean>
  >({});
  const [recommendationErrors, setRecommendationErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadEnquiries() {
  setLoading(true);
  setError("");

  try {
    const enquiryData = await getAdminEnquiries();
    setEnquiries(enquiryData);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Unable to load enquiries.",
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    void loadEnquiries();
  }, []);

  async function loadRecommendations(enquiryId: string) {
    setRecommendationLoading((current) => ({
      ...current,
      [enquiryId]: true,
    }));
    setRecommendationErrors((current) => ({
      ...current,
      [enquiryId]: "",
    }));

    try {
      const result = await getBrokerRecommendations(enquiryId);
      setRecommendations((current) => ({
        ...current,
        [enquiryId]: result,
      }));
    } catch (err) {
      setRecommendationErrors((current) => ({
        ...current,
        [enquiryId]:
          err instanceof Error
            ? err.message
            : "Unable to load broker recommendations.",
      }));
    } finally {
      setRecommendationLoading((current) => ({
        ...current,
        [enquiryId]: false,
      }));
    }
  }

  async function assign(
    enquiry: AdminEnquiry,
    broker: Pick<BrokerRecommendation, "user_id" | "full_name" | "email">,
  ) {
    if (
      !window.confirm(
        `Assign this enquiry to ${broker.full_name || broker.email}?`,
      )
    ) {
      return;
    }

    setBusyId(enquiry.id);
    setError("");

    try {
      await assignAdminEnquiryBroker(enquiry.id, broker.user_id);
      setRecommendations((current) => {
        const next = { ...current };
        delete next[enquiry.id];
        return next;
      });
      await loadEnquiries();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign broker.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const unassignedCount = enquiries.filter(
    (item) => !item.assigned_broker_id,
  ).length;

  const assignedCount = enquiries.filter(
    (item) => Boolean(item.assigned_broker_id),
  ).length;

  const closedCount = enquiries.filter(
    (item) => item.status.toLowerCase() === "closed",
  ).length;

  const normalizedSearch = search.trim().toLowerCase();

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch = [
  item.id,
  item.customer_name || "",
  item.customer_email || "",
  item.customer_phone || "",
  item.property_title || "",
  item.property_type || "",
  item.property_address || "",
  item.property_pincode || "",
  item.customer_message || "",
  item.status,
  item.assigned_broker_name || "",
  item.assigned_broker_business_name || "",
].some((value) => value.toLowerCase().includes(normalizedSearch));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unassigned" && !item.assigned_broker_id) ||
      (statusFilter === "assigned" && Boolean(item.assigned_broker_id)) ||
      (statusFilter === "closed" &&
        item.status.toLowerCase() === "closed");

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="enquiries-page">
      <div className="enquiries-heading">
        <div>
          <span className="eyebrow">MARKETPLACE OPERATIONS</span>
          <h2>Enquiry management</h2>
          <p>
            Track customer requests and connect them with eligible,
            verified brokers.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => void loadEnquiries()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="enquiry-stats">
        <div className="enquiry-stat">
          <span>Total enquiries</span>
          <strong>{enquiries.length}</strong>
          <small>All customer requests</small>
        </div>
        <div className="enquiry-stat">
          <span>Awaiting assignment</span>
          <strong>{unassignedCount}</strong>
          <small>Needs broker selection</small>
        </div>
        <div className="enquiry-stat">
          <span>Assigned</span>
          <strong>{assignedCount}</strong>
          <small>Broker allocated</small>
        </div>
        <div className="enquiry-stat">
          <span>Closed</span>
          <strong>{closedCount}</strong>
          <small>Marked as closed</small>
        </div>
      </div>

      <div className="panel enquiries-panel">
        <div className="enquiries-toolbar">
          <div>
            <h3>Customer enquiries</h3>
            <p>
              {loading
                ? "Loading your latest enquiries..."
                : `${filteredEnquiries.length} of ${enquiries.length} enquiries`}
            </p>
          </div>
          <input
            className="enquiry-search"
            type="search"
            placeholder="Search IDs, message or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search enquiries"
          />
        </div>

        <div className="enquiry-filters" aria-label="Filter enquiries">
          {[
            ["all", "All"],
            ["unassigned", "Unassigned"],
            ["assigned", "Assigned"],
            ["closed", "Closed"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`enquiry-filter ${statusFilter === value ? "active" : ""}`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
              {value === "all"
                ? ` (${enquiries.length})`
                : value === "unassigned"
                  ? ` (${unassignedCount})`
                  : value === "assigned"
                    ? ` (${assignedCount})`
                    : ` (${closedCount})`}
            </button>
          ))}
        </div>

        {loading && <p className="enquiries-message">Loading enquiries...</p>}

        {!loading && enquiries.length === 0 && !error && (
          <div className="empty-state">
            <strong>No enquiries yet</strong>
            <p>Customer property enquiries will appear here.</p>
          </div>
        )}

        {!loading && enquiries.length > 0 && filteredEnquiries.length === 0 && (
          <div className="empty-state">
            <strong>No matching enquiries</strong>
            <p>Try a different search or status filter.</p>
            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading &&
          filteredEnquiries.map((enquiry) => {
            const result = recommendations[enquiry.id];
            const isLoading = recommendationLoading[enquiry.id] ?? false;
            const recommendationError =
              recommendationErrors[enquiry.id] || "";
            const isAssigned = Boolean(enquiry.assigned_broker_id);

            return (
              <article className="enquiry-card" key={enquiry.id}>
                <div className="enquiry-card-header">
                  <div>
                    <span className="eyebrow">PROPERTY ENQUIRY</span>
                    <h4>
                      {enquiry.customer_message?.trim() ||
                        "Property information request"}
                    </h4>
                  </div>
                  <span
                    className={`enquiry-status ${isAssigned ? "assigned" : "pending"}`}
                  >
                    {enquiry.status.replaceAll("_", " ")}
                  </span>
                </div>

               <div className="enquiry-details-grid">
  <div>
    <span>Customer</span>
    <strong>{enquiry.customer_name || "Name unavailable"}</strong>
    <small>{enquiry.customer_email || "Email unavailable"}</small>
    {enquiry.customer_phone && (
      <small>{enquiry.customer_phone}</small>
    )}
  </div>

  <div>
    <span>Property</span>
    <strong>
      {enquiry.property_title || "Property details unavailable"}
    </strong>
    <small>
      {[enquiry.property_type, enquiry.property_status]
        .filter(Boolean)
        .join(" · ") || "Type/status unavailable"}
    </small>
    {enquiry.property_price != null && (
      <small>
        Price: ₹{Number(enquiry.property_price).toLocaleString("en-IN")}
      </small>
    )}
    <small>
      {[enquiry.property_address, enquiry.property_pincode]
        .filter(Boolean)
        .join(", ") || "Address unavailable"}
    </small>
  </div>

  <div>
    <span>Enquiry details</span>
    <strong>
      {enquiry.created_at
        ? new Date(enquiry.created_at).toLocaleString()
        : "Date unavailable"}
    </strong>
    <small>
      Enquiry ID: {enquiry.id.slice(0, 8)}…
    </small>
  </div>
</div>

                {isAssigned ? (
                  <div className="assigned-summary">
  <span className="assigned-icon">✓</span>
  <div>
    <strong>
      {enquiry.assigned_broker_name || "Broker assigned"}
    </strong>
    <p>
      {enquiry.assigned_broker_business_name ||
        "Business name unavailable"}
    </p>
    <small>
      Assignment ID: {enquiry.assigned_broker_id?.slice(0, 8)}…
    </small>
  </div>
</div>
                ) : (
                  <div className="recommendation-section">
                    {!result && (
                      <div className="recommendation-intro">
                        <div>
                          <strong>Find the right broker</strong>
                          <p>
                            Rank eligible verified brokers by registered
                            pincode match.
                          </p>
                        </div>
                        <button
                          className="primary-button"
                          disabled={isLoading}
                          onClick={() =>
                            void loadRecommendations(enquiry.id)
                          }
                        >
                          {isLoading ? "Finding..." : "Find brokers"}
                        </button>
                      </div>
                    )}

                    {recommendationError && (
                      <div className="login-error">
                        {recommendationError}
                        <button
                          className="secondary-button"
                          onClick={() =>
                            void loadRecommendations(enquiry.id)
                          }
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {result && (
                      <>
                        <div className="recommendation-intro">
                          <div>
                            <strong>Recommended brokers</strong>
                            <p>
                              Property pincode:{" "}
                              {result.property_pincode || "Not provided"}
                            </p>
                          </div>
                          <button
                            className="secondary-button"
                            disabled={isLoading}
                            onClick={() =>
                              void loadRecommendations(enquiry.id)
                            }
                          >
                            {isLoading ? "Refreshing..." : "Refresh"}
                          </button>
                        </div>

                        <p className="matching-note">
                          Registered-pincode matches appear first. A match
                          does not confirm the broker's service area.
                        </p>

                        {result.recommendations.length === 0 ? (
                          <p className="enquiries-message">
                            No eligible verified brokers are available.
                          </p>
                        ) : (
                          result.recommendations.map((broker) => (
                            <div
                              className="recommended-broker"
                              key={broker.user_id}
                            >
                              <div className="broker-info">
                                <div className="broker-avatar">
                                  {(broker.full_name || broker.email)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <strong>
                                    {broker.full_name || broker.email}
                                  </strong>
                                  <p>
                                    {broker.business_name ||
                                      "Business name not provided"}
                                  </p>
                                  <p>{broker.email}</p>
                                  <small>
                                    Registered pincode:{" "}
                                    {broker.registered_pincode ||
                                      "Not provided"}
                                  </small>
                                </div>
                              </div>
                              <div className="broker-action">
                                <span
                                  className={`match-label ${broker.pincode_match ? "match" : "no-match"}`}
                                >
                                  {broker.pincode_match
                                    ? "Pincode match"
                                    : "Other eligible broker"}
                                </span>
                                <button
                                  className="primary-button"
                                  disabled={busyId === enquiry.id}
                                  onClick={() => void assign(enquiry, broker)}
                                >
                                  {busyId === enquiry.id
                                    ? "Assigning..."
                                    : "Assign broker"}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}


function PropertyPhotoGallery({ propertyId }: { propertyId: string }) {
  const [photos, setPhotos] = useState<Array<{ id: string; url: string }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];

    async function loadPhotos() {
      try {
        const photoList = await getAdminPropertyPhotos(propertyId);
        const loaded = await Promise.all(
          photoList.map(async (photo) => {
            const blob = await getAdminPropertyPhotoBlob(propertyId, photo.id);
            const objectUrl = URL.createObjectURL(blob);
            objectUrls.push(objectUrl);
            return { id: photo.id, url: objectUrl };
          }),
        );
        if (active) setPhotos(loaded);
      } catch (err) {
        if (active) {
          setPhotoError(err instanceof Error ? err.message : "Unable to load photos.");
        }
      } finally {
        if (active) setLoadingPhotos(false);
      }
    }

    void loadPhotos();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [propertyId]);

  if (loadingPhotos) return <p className="property-photos-note">Loading property photos…</p>;
  if (photoError) return <p className="property-photos-note">{photoError}</p>;
  if (photos.length === 0) return <p className="property-photos-note">No photos uploaded.</p>;

  return (
    <>
      <div className="property-photo-gallery">
        {photos.map((photo, index) => (
          <button
            className="property-photo-thumb"
            key={photo.id}
            type="button"
            onClick={() => setSelected(photo.url)}
            aria-label={`View property photo ${index + 1}`}
          >
            <img src={photo.url} alt={`Property ${index + 1}`} />
          </button>
        ))}
      </div>
      {selected && (
        <div className="property-photo-modal" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <button className="property-photo-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo preview">×</button>
          <img src={selected} alt="Property preview" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function PropertiesPanel() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadProperties() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminProperties();
      setProperties(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load properties.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProperties();
  }, []);

  async function reviewProperty(
    property: AdminProperty,
    status: "available" | "rejected",
  ) {
    if (status === "available") {
      if (!window.confirm(`Approve "${property.title}"?`)) return;
    }

    let reason: string | undefined;

    if (status === "rejected") {
      const answer = window.prompt(
        `Why are you rejecting "${property.title}"?`,
      );

      if (answer === null) return;

      if (!answer.trim()) {
        setError("Please provide a rejection reason.");
        return;
      }

      reason = answer.trim();

      if (!window.confirm(`Reject "${property.title}"?`)) return;
    }

    setBusyId(property.id);
    setError("");

    try {
      await reviewAdminProperty(property.id, status, reason);
      await loadProperties();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to review property.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = properties.filter(
    (p) => p.status === "pending_review",
  ).length;

  const approvedCount = properties.filter(
    (p) => p.status === "available",
  ).length;

  const rejectedCount = properties.filter(
    (p) => p.status === "rejected",
  ).length;

  const query = search.trim().toLowerCase();

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = [
      property.title,
      property.address,
      property.pincode,
      property.property_type,
    ].some((value) => (value || "").toLowerCase().includes(query));

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && property.status === "pending_review") ||
      (filter === "approved" && property.status === "available") ||
      (filter === "rejected" && property.status === "rejected");

    return matchesSearch && matchesFilter;
  });

  return (
    <section className="properties-page">
      <div className="enquiries-heading">
        <div>
          <span className="eyebrow">MARKETPLACE MODERATION</span>
          <h2>Property management</h2>
          <p>Review property submissions before they appear in the marketplace.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => void loadProperties()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="enquiry-stats">
        <div className="enquiry-stat">
          <span>Total properties</span>
          <strong>{properties.length}</strong>
        </div>
        <div className="enquiry-stat">
          <span>Pending review</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="enquiry-stat">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>
        <div className="enquiry-stat">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="enquiries-toolbar">
          <div>
            <h3>Submitted properties</h3>
            <p>{filteredProperties.length} properties found</p>
          </div>

          <input
            className="enquiry-search"
            type="search"
            placeholder="Search title, address, pincode..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="enquiry-filters">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`enquiry-filter ${filter === value ? "active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="enquiries-message">Loading properties...</p>}

        {!loading && properties.length === 0 && !error && (
          <div className="empty-state">
            <strong>No properties submitted yet</strong>
            <p>New property submissions will appear here.</p>
          </div>
        )}

        {!loading && properties.length > 0 && filteredProperties.length === 0 && (
          <div className="empty-state">
            <strong>No matching properties</strong>
            <p>Try another search or filter.</p>
          </div>
        )}

        {!loading &&
          filteredProperties.map((property) => {
            const pending = property.status === "pending_review";
            const busy = busyId === property.id;

            return (
              <article className="property-review-card" key={property.id}>
                <div className="enquiry-card-header">
                  <div>
                    <span className="eyebrow">
                      {property.property_type.replaceAll("_", " ")}
                    </span>
                    <h4>{property.title}</h4>
                  </div>

                  <span className={`enquiry-status ${pending ? "pending" : property.status === "available" ? "assigned" : ""}`}>
                    {property.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="enquiry-details-grid">
                  <div>
                    <span>Price</span>
                    <strong>
                      ₹{Number(property.price).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{property.address}</strong>
                    <small>PIN: {property.pincode}</small>
                  </div>

                  <div>
                    <span>Submitted</span>
                    <strong>
                      {property.created_at
                        ? new Date(property.created_at).toLocaleString()
                        : "Not available"}
                    </strong>
                  </div>
                </div>

                {property.description && (
                  <p className="property-description">
                    {property.description}
                  </p>
                )}

                <PropertyPhotoGallery propertyId={property.id} />

                {property.moderation_reason && (
                  <p className="property-rejection-reason">
                    Rejection reason: {property.moderation_reason}
                  </p>
                )}

                {pending && (
                  <div className="property-review-actions">
                    <button
                      className="reject-button"
                      disabled={busy}
                      onClick={() => void reviewProperty(property, "rejected")}
                    >
                      {busy ? "Processing..." : "Reject"}
                    </button>

                    <button
                      className="approve-button"
                      disabled={busy}
                      onClick={() => void reviewProperty(property, "available")}
                    >
                      {busy ? "Processing..." : "Approve property"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}




function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<
  "dashboard" | "kyc" | "enquiries" | "properties"
>("dashboard");
  const [kycFilter, setKycFilter] = useState<
  "under_review" | "verified" | "rejected"
>("under_review");
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

const [documentUrls, setDocumentUrls] = useState<
  Partial<Record<KycDocumentType, string>>
>({});
const [documentsLoading, setDocumentsLoading] = useState(false);
const [documentLoadError, setDocumentLoadError] = useState("");


useEffect(() => {
  const verificationId = selectedVerification?.verification_id;

  if (!verificationId) {
    setDocumentUrls({});
    setDocumentLoadError("");
    return;
  }
  const validVerificationId: string = verificationId;

  let cancelled = false;
  const createdUrls: string[] = [];

  setDocumentUrls({});
  setDocumentLoadError("");
  setDocumentsLoading(true);

  const documentTypes: KycDocumentType[] = [
    "pan",
    "aadhaar_front",
    "aadhaar_back",
    "selfie",
  ];

  async function loadDocuments() {
    const results = await Promise.all(
      documentTypes.map(async (type) => {
        try {
          const blob = await getAdminVerificationDocument(
            validVerificationId,
            type,
          );

          const url = URL.createObjectURL(blob);
          createdUrls.push(url);

          return [type, url] as const;
        } catch {
          return [type, null] as const;
        }
      }),
    );

    if (cancelled) {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
      return;
    }

    const urls: Partial<Record<KycDocumentType, string>> = {};

    results.forEach(([type, url]) => {
      if (url) {
        urls[type] = url;
      }
    });

    setDocumentUrls(urls);

    if (results.some(([, url]) => !url)) {
      setDocumentLoadError(
        "Some documents could not be loaded. Check that they were uploaded and try again.",
      );
    }

    setDocumentsLoading(false);
  }

  void loadDocuments();

  return () => {
    cancelled = true;
    createdUrls.forEach((url) => URL.revokeObjectURL(url));
  };
}, [selectedVerification?.verification_id]);

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


async function rejectVerification() {
  if (!selectedVerification) {
    return;
  }

  const rejectionReason = window.prompt(
    `Why are you rejecting ${selectedVerification.full_name}'s verification?`,
  );

  if (rejectionReason === null) {
    return;
  }

  if (!rejectionReason.trim()) {
    setReviewError("Please provide a rejection reason.");
    return;
  }

  const confirmed = window.confirm(
    `Reject ${selectedVerification.full_name}'s verification?`,
  );

  if (!confirmed) {
    return;
  }

  setReviewLoading(true);
  setReviewError("");

  try {
    await reviewAdminVerification(
      selectedVerification.verification_id,
      "rejected",
      rejectionReason.trim(),
    );

    setSelectedVerification({
      ...selectedVerification,
      status: "rejected",
      rejection_reason: rejectionReason.trim(),
      reviewed_at: new Date().toISOString(),
    });

    await loadVerifications();
  } catch (err) {
    setReviewError(
      err instanceof Error
        ? err.message
        : "Unable to reject verification.",
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
         <button
  className={`nav-item ${page === "properties" ? "active" : ""}`}
  onClick={() => setPage("properties")}
>
  Properties
</button>
          <button
  className={`nav-item ${page === "enquiries" ? "active" : ""}`}
  onClick={() => setPage("enquiries")}
>
  Enquiries
</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>
  {page === "kyc"
  ? "KYC Review"
  : page === "enquiries"
    ? "Enquiries"
    : page === "properties"
      ? "Properties"
      : "Dashboard"}
</h1>

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
        ) : page === "kyc" ? (
          <section className="panel">
            <div className="kyc-filter-tabs">
  <button
    className={kycFilter === "under_review" ? "active" : ""}
    onClick={() => setKycFilter("under_review")}
  >
    Pending
  </button>

  <button
    className={kycFilter === "verified" ? "active" : ""}
    onClick={() => setKycFilter("verified")}
  >
    Verified
  </button>

  <button
    className={kycFilter === "rejected" ? "active" : ""}
    onClick={() => setKycFilter("rejected")}
  >
    Rejected
  </button>
</div>
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


<div className="documents-section">
  <h3>Submitted KYC Documents</h3>

  {documentsLoading && <p>Loading documents...</p>}

  {documentLoadError && (
    <div className="login-error">{documentLoadError}</div>
  )}

  <div className="documents-grid">
    {(
      [
        ["pan", "PAN Card"],
        ["aadhaar_front", "Aadhaar Front"],
        ["aadhaar_back", "Aadhaar Back"],
        ["selfie", "Live Selfie"],
      ] as const
    ).map(([type, label]) => (
      <div className="document-card" key={type}>
        <h4>{label}</h4>

        {documentUrls[type] ? (
          <a
            href={documentUrls[type]}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={documentUrls[type]}
              alt={label}
              className="kyc-document-image"
            />
            <span>Open full image</span>
          </a>
        ) : (
          !documentsLoading && <p>Document unavailable</p>
        )}
      </div>
    ))}
  </div>
</div>


        <div className="review-actions">
         <button
  className="reject-button"
  onClick={rejectVerification}
  disabled={reviewLoading || selectedVerification.status === "rejected"}
>
  {reviewLoading ? "Processing..." : "Reject"}
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

           
{!loading &&
  !error &&
  verifications.filter((verification) => verification.status === kycFilter)
    .length === 0 && (
    <div className="empty-state">
      <strong>
        {kycFilter === "under_review"
          ? "No pending verifications"
          : kycFilter === "verified"
            ? "No verified brokers"
            : "No rejected applications"}
      </strong>

      <p>
        {kycFilter === "under_review"
          ? "There are currently no KYC submissions awaiting review."
          : kycFilter === "verified"
            ? "No brokers have been verified yet."
            : "No KYC applications have been rejected yet."}
      </p>
    </div>
  )}
```

            {!loading &&
              !error &&
              verifications
  .filter((verification) => verification.status === kycFilter)
  .map((verification) => (
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
          ) : page === "enquiries" ? (
  <EnquiriesPanel />
) : (
  <PropertiesPanel />
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