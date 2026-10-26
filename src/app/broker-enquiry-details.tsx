
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    getBrokerEnquiry,
    type BrokerEnquiryResponse,
} from "../services/api";

export default function BrokerEnquiryDetailsScreen() {
  const { enquiryId } = useLocalSearchParams<{
    enquiryId: string;
  }>();

  const [enquiry, setEnquiry] =
    useState<BrokerEnquiryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnquiry = useCallback(async () => {
    if (!enquiryId || Array.isArray(enquiryId)) {
      setError("Invalid enquiry ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getBrokerEnquiry(enquiryId);
      setEnquiry(data);
    } catch (err) {
      setEnquiry(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load enquiry."
      );
    } finally {
      setLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
  loadEnquiry();
}, [loadEnquiry]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#173F35" />
        <Text style={styles.muted}>Loading enquiry details...</Text>
      </View>
    );
  }

  if (error || !enquiry) {
    return (
      <View style={[styles.container, styles.content]}>
        <Text style={styles.heading}>
          {error.includes("404")
            ? "Enquiry not found"
            : "Unable to load enquiry"}
        </Text>
        <Text style={styles.muted}>
          {error || "This enquiry could not be found."}
        </Text>

        <Pressable style={styles.button} onPress={loadEnquiry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to enquiries</Text>
      </Pressable>

      <Text style={styles.heading}>Enquiry Details</Text>
      <Text style={styles.reference}>
        Reference: {enquiry.id}
      </Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          {enquiry.status}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PROPERTY</Text>
        <Text style={styles.detailLabel}>Property ID</Text>
        <Text style={styles.value}>
          {enquiry.property_id || "Not available"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CUSTOMER</Text>
        <Text style={styles.detailLabel}>Customer ID</Text>
        <Text style={styles.value}>
          {enquiry.customer_id || "Not available"}
        </Text>

        <Text style={[styles.detailLabel, styles.messageLabel]}>
          Customer message
        </Text>
        <Text style={styles.message}>
          {enquiry.customer_message?.trim() ||
            "No message was provided."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ASSIGNMENT</Text>
        <Text style={styles.detailLabel}>Assigned broker ID</Text>
        <Text style={styles.value}>
          {enquiry.assigned_broker_id || "Not assigned"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ENQUIRY STATUS</Text>
        <Text style={styles.value}>
          Current status: {enquiry.status}
        </Text>
        <Text style={styles.disclaimer}>
          Status changes are not connected yet. This screen
          displays the status saved by the server.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F5",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  backText: {
    color: "#47765E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 24,
  },
  heading: {
    fontSize: 27,
    fontWeight: "700",
    color: "#173F35",
    marginBottom: 8,
  },
  reference: {
    fontSize: 13,
    color: "#888",
    marginBottom: 14,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0D5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 22,
  },
  statusText: {
    color: "#946000",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EAECE8",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 1,
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263B30",
    lineHeight: 21,
  },
  messageLabel: {
    marginTop: 18,
  },
  message: {
    fontSize: 14,
    color: "#526057",
    lineHeight: 22,
  },
  muted: {
    color: "#777",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#173F35",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#47765E",
    fontWeight: "700",
  },
  disclaimer: {
    color: "#999",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
