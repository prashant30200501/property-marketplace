const API_BASE_URL = "http://127.0.0.1:8000";

const TOKEN_KEY = "nestora_admin_token";

export async function loginAdmin(
  email: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Admin login response:", data);

    if (typeof data.detail === "string") {
      throw new Error(data.detail);
    }

    if (Array.isArray(data.detail)) {
      throw new Error(
        data.detail
          .map((item: { msg?: string }) => item.msg || "Validation error")
          .join(", "),
      );
    }

    throw new Error("Admin login failed.");
  }

  if (data.role !== "admin") {
    throw new Error("This account does not have admin access.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);

  return data.access_token;
}

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
}

export type BrokerVerification = {
  verification_id: string;
  broker_id: string;
  user_id: string;
  full_name: string;
  email: string;
  business_name: string | null;
  status: string;
  submitted_at: string | null;
};

export async function getAdminVerifications(): Promise<
  BrokerVerification[]
> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin session expired. Please sign in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/verifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail);
    }

    throw new Error("Unable to load KYC submissions.");
  }

  return data;
}


export type BrokerVerificationDetail = {
  verification_id: string;
  broker_id: string;
  user_id: string;
  full_name: string;
  email: string;
  business_name: string | null;
  firm_name: string | null;
  pan_number: string | null;
  rera_registration_number: string | null;
  latitude: string | null;
  longitude: string | null;
  status: string;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  verified_at: string | null;
};

export async function getAdminVerificationDetail(
  verificationId: string,
): Promise<BrokerVerificationDetail> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin session expired. Please sign in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/verifications/${verificationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail);
    }

    throw new Error("Unable to load verification details.");
  }

  return data;
}


export async function reviewAdminVerification(
  verificationId: string,
  status: "verified" | "rejected",
  rejectionReason?: string,
) {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin session expired. Please sign in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/verifications/${verificationId}/review`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        rejection_reason: rejectionReason || null,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail);
    }

    throw new Error("Unable to review verification.");
  }

  return data;
}