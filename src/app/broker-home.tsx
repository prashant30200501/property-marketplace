import { useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function BrokerHomeScreen() {
    const router = useRouter();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Broker Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage your properties with ease.
          </Text>
        </View>

        <Pressable
  style={styles.logoutButton}
  onPress={() => router.replace("/(tabs)")}
>
  <Text style={styles.logoutText}>Logout</Text>
</Pressable>
      </View>

      {/* Welcome card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeLabel}>WELCOME TO NESTORA</Text>
        <Text style={styles.welcomeTitle}>
          Grow your property{"\n"}business.
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Manage listings and connect with potential buyers.
        </Text>
      </View>

      {/* Overview */}
      <Text style={styles.sectionTitle}>Your overview</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🏠</Text>
          </View>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Active listings</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📩</Text>
          </View>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>New enquiries</Text>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick actions</Text>

      <View style={styles.actionsContainer}>
        <Pressable
  style={styles.actionCard}
  onPress={() => router.push("/broker-enquiries")}
>
  <View style={styles.actionIconContainer}>
    <Text style={styles.actionIcon}>💬</Text>
  </View>

  <View style={styles.actionTextContainer}>
    <Text style={styles.actionTitle}>Customer enquiries</Text>
    <Text style={styles.actionSubtitle}>
      Keep track of interested customers
    </Text>
  </View>

  <Text style={styles.arrow}>›</Text>
</Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => {}}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🏘️</Text>
          </View>

          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>My properties</Text>
            <Text style={styles.actionSubtitle}>
              View and manage your listings
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => {}}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>💬</Text>
          </View>

          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Customer enquiries</Text>
            <Text style={styles.actionSubtitle}>
              Keep track of interested customers
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      {/* Recent activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptySubtitle}>
          Your property activity and customer enquiries
          will appear here.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Your business. Your properties. Nestora.
      </Text>
    </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#173F35",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E5EDE7",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 22,
  },
  welcomeCard: {
    backgroundColor: "#173F35",
    borderRadius: 22,
    padding: 24,
    marginBottom: 30,
  },
  welcomeLabel: {
    color: "#BFD7C8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 37,
  },
  welcomeSubtitle: {
    color: "#D5E2DA",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202A25",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECE8",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF1EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#173F35",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECE8",
  },
  actionIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#EAF1EB",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 22,
    color: "#173F35",
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#263B30",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  arrow: {
    fontSize: 26,
    color: "#789084",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#47765E",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAECE8",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263B30",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    textAlign: "center",
    color: "#8A918B",
    fontSize: 12,
    marginTop: 28,
  },

  logoutButton: {
  backgroundColor: "#E5EDE7",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#D5E2DA",
},
logoutText: {
  color: "#173F35",
  fontSize: 13,
  fontWeight: "700",
},
});