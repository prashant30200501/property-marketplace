import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    getBrokerVerificationStatus,
    type BrokerVerificationStatus,
} from "../services/api";

export default function BrokerProfileScreen() {
  const router = useRouter();

  const [verification, setVerification] =
    useState<BrokerVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVerification = async () => {
    try {
      setError("");
      const data = await getBrokerVerificationStatus();
      setVerification(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load verification status.",
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVerification();
    }, []),
  );

  const getStatusTitle = () => {
    switch (verification?.status) {
      case "verified":
        return "Verified";
      case "under_review":
        return "Under review";
      case "rejected":
        return "Verification rejected";
      case "suspended":
        return "Verification suspended";
      default:
        return "Verification required";
    }
  };

  const getStatusDescription = () => {
    switch (verification?.status) {
      case "verified":
        return "Your broker account has been verified. You can manage your Nestora business.";
      case "under_review":
        return "Your KYC submission is being reviewed by the Nestora team.";
      case "rejected":
        return (
          verification.rejection_reason ||
          "Your verification was rejected. Please review your information and submit again."
        );
      case "suspended":
        return "Your broker verification is currently suspended. Please contact Nestora support.";
      default:
        return "Complete your KYC verification before publishing properties or accessing customer leads.";
    }
  };

  const statusIcon =
    verification?.status === "verified"
      ? "✓"
      : verification?.status === "under_review"
        ? "⏳"
        : verification?.status === "rejected"
          ? "!"
          : "🔐";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#173F35" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Broker Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your business verification
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to load profile</Text>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={loadVerification} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.statusCard,
              verification?.status === "verified" && styles.verifiedCard,
              verification?.status === "under_review" &&
                styles.reviewCard,
              verification?.status === "rejected" && styles.rejectedCard,
            ]}
          >
            <View style={styles.statusIconContainer}>
              <Text style={styles.statusIcon}>{statusIcon}</Text>
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>VERIFICATION STATUS</Text>

              <Text style={styles.statusTitle}>
                {getStatusTitle()}
              </Text>

              <Text style={styles.statusDescription}>
                {getStatusDescription()}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Business verification</Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="🪪"
              title="PAN verification"
              value={
                verification?.status === "verified"
                  ? "Completed"
                  : "Required"
              }
            />

            <InfoRow
              icon="🏢"
              title="Business details"
              value={
                verification?.status === "verified"
                  ? "Completed"
                  : "Required"
              }
            />

            <InfoRow
              icon="📄"
              title="RERA / firm information"
              value="Part of KYC review"
            />

            <InfoRow
              icon="📍"
              title="Location verification"
              value="Part of KYC review"
            />

            <InfoRow
              icon="🤳"
              title="Face verification"
              value="Part of KYC review"
            />
          </View>

          {verification?.status !== "verified" && (
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/broker-kyc")}
            >
              <Text style={styles.primaryButtonText}>
                {verification?.status === "under_review"
                  ? "View verification"
                  : "Complete KYC verification"}
              </Text>
            </Pressable>
          )}

          {verification?.status === "verified" && (
            <View style={styles.verifiedNotice}>
              <Text style={styles.verifiedNoticeIcon}>✓</Text>
              <View style={styles.verifiedNoticeContent}>
                <Text style={styles.verifiedNoticeTitle}>
                  Your account is verified
                </Text>
                <Text style={styles.verifiedNoticeText}>
                  You can now publish properties and access eligible customer
                  enquiries.
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Verification timeline</Text>

          <View style={styles.timelineCard}>
            <TimelineRow
              title="KYC submitted"
              completed={Boolean(verification?.submitted_at)}
              date={verification?.submitted_at}
            />

            <TimelineRow
              title="Admin review"
              completed={Boolean(verification?.reviewed_at)}
              date={verification?.reviewed_at}
            />

            <TimelineRow
              title="Verification completed"
              completed={Boolean(verification?.verified_at)}
              date={verification?.verified_at}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Text>{icon}</Text>
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineRow({
  title,
  completed,
  date,
}: {
  title: string;
  completed: boolean;
  date: string | null;
}) {
  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineDot,
          completed && styles.timelineDotCompleted,
        ]}
      >
        {completed && <Text style={styles.timelineCheck}>✓</Text>}
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>

        <Text style={styles.timelineDate}>
          {completed && date
            ? new Date(date).toLocaleDateString()
            : "Pending"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F5",
  },

  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8F8F5",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5EDE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    color: "#173F35",
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#173F35",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  statusCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8E8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#F0E1B8",
  },

  verifiedCard: {
    backgroundColor: "#EAF5ED",
    borderColor: "#C9E2CF",
  },

  reviewCard: {
    backgroundColor: "#EEF4FA",
    borderColor: "#CFDDEA",
  },

  rejectedCard: {
    backgroundColor: "#FFF0EF",
    borderColor: "#EBCAC7",
  },

  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  statusIcon: {
    fontSize: 23,
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#777",
  },

  statusTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#173F35",
    marginTop: 4,
  },

  statusDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202A25",
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EAECE8",
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1EE",
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EAF1EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#25312B",
  },

  infoValue: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  primaryButton: {
    backgroundColor: "#173F35",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 28,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  verifiedNotice: {
    flexDirection: "row",
    backgroundColor: "#EAF5ED",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },

  verifiedNoticeIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  verifiedNoticeContent: {
    flex: 1,
  },

  verifiedNoticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#173F35",
  },

  verifiedNoticeText: {
    fontSize: 12,
    color: "#5F7167",
    lineHeight: 18,
    marginTop: 4,
  },

  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECE8",
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
  },

  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E7E9E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  timelineDotCompleted: {
    backgroundColor: "#173F35",
  },

  timelineCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  timelineContent: {
    flex: 1,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#25312B",
  },

  timelineDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
  },

  errorCard: {
    backgroundColor: "#FFF0EF",
    borderRadius: 18,
    padding: 20,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8A3029",
  },

  errorText: {
    color: "#8A3029",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  retryButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#173F35",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});