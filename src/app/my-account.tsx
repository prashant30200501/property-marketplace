import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    getCurrentUser,
    removeToken,
} from "../services/api";

type Account = {
  id?: number | string;
  user_id?: number | string;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
  auth_provider?: string;
};

export default function MyAccountScreen() {
  const router = useRouter();

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const user = await getCurrentUser();
      setAccount(user as Account);
    } catch (err) {
      console.error("Unable to load account details:", err);
      setError("We couldn't load your account details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccount();
    }, [loadAccount])
  );

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of Nestora?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOut(true);
              await removeToken();
              router.replace("/(tabs)");
            } catch {
              Alert.alert(
                "Sign-out failed",
                "Please try again."
              );
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const displayName =
    account?.full_name || account?.name || "Nestora Customer";

  const accountId =
    account?.id ?? account?.user_id;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.heading}>My Account</Text>
          <Text style={styles.subtitle}>
            Your Nestora profile and preferences
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#173F35" />
          <Text style={styles.loadingText}>
            Loading your account...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Unable to load profile
          </Text>
          <Text style={styles.muted}>{error}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={loadAccount}
          >
            <Text style={styles.primaryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>
              {account?.email || "Email not available"}
            </Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {(account?.role || "customer").toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Account information
          </Text>

          <View style={styles.card}>
            <InfoRow
              label="Full name"
              value={displayName}
            />

            <InfoRow
              label="Email address"
              value={account?.email}
            />

            <InfoRow
              label="Customer ID"
              value={accountId}
            />

            <InfoRow
              label="Account type"
              value={account?.role || "Customer"}
            />

            <InfoRow
              label="Member since"
              value={
                account?.created_at
                  ? new Date(account.created_at).toLocaleDateString()
                  : undefined
              }
            />
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              🔒 Your account security
            </Text>
            <Text style={styles.noticeText}>
              Your account details are retrieved securely
              from Nestora. Never share your password or
              sign-in credentials with anyone.
            </Text>
          </View>
        </>
      )}

      <Pressable
        style={[
          styles.signOutButton,
          signingOut && styles.disabledButton,
        ]}
        disabled={signingOut}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>
          {signingOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        NESTORA · FIND YOUR PERFECT HOME
      </Text>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E5EDE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backText: {
    fontSize: 25,
    color: "#173F35",
  },
  headerText: {
    flex: 1,
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#173F35",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },
  profileCard: {
    backgroundColor: "#173F35",
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#D9E8D7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#173F35",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "#D5E2DA",
    marginTop: 7,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#D9E8D7",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 16,
  },
  roleText: {
    color: "#173F35",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#202A25",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECE8",
    marginBottom: 22,
  },

    cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#173F35",
    marginBottom: 8,
  },
  
  infoRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0EC",
  },
  infoLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263B30",
  },
  muted: {
    color: "#777",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  loading: {
    paddingVertical: 70,
    alignItems: "center",
  },
  loadingText: {
    color: "#777",
    marginTop: 14,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#173F35",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  notice: {
    backgroundColor: "#E5EDE7",
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#173F35",
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    color: "#52665A",
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9B6B6",
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
  },
  signOutText: {
    color: "#A33232",
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    textAlign: "center",
    fontSize: 10,
    color: "#8A918B",
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 24,
  },
});