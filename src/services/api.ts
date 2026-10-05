import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE_URL = "https://nestora-api-3xpy.onrender.com";

const TOKEN_KEY = "nestora_access_token";

export async function saveToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function loginUser(email: string, password: string) {
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Login failed: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  await saveToken(data.access_token);

  return data;
}

export async function getCurrentUser() {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get current user: ${response.status}`);
  }

  return response.json();
}

export async function getProperties() {
  const response = await fetch(`${API_BASE_URL}/properties`);

  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.status}`);
  }

  return response.json();
}

export async function getMyProperties() {
  const token = await getToken();

  if (!token) {
    throw new Error("You must be logged in.");
  }

  const response = await fetch(`${API_BASE_URL}/properties/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch your properties: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export async function updateProperty(
  propertyId: string,
  property: {
    title?: string;
    description?: string;
    property_type?: string;
    price?: number;
    address?: string;
    pincode?: string;
  }
) {
  const token = await getToken();

  if (!token) {
    throw new Error("You must be logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/properties/${propertyId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(property),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to update property: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export async function createProperty(property: {
  title: string;
  description?: string;
  property_type: string;
  price: number;
  address: string;
  pincode: string;
}) {
  const token = await getToken();

  if (!token) {
    throw new Error("You must be logged in to create a property.");
  }

  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to create property: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export type BrokerVerificationStatus = {
  status: "not_submitted" | "under_review" | "verified" | "rejected" | "suspended";
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  verified_at: string | null;
};

export async function getBrokerVerificationStatus(): Promise<BrokerVerificationStatus> {
  const token = await getToken();

  if (!token) {
    throw new Error("You must be logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/broker/verification/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to fetch verification status: ${response.status} ${errorText}`,
    );
  }

  return response.json();
}