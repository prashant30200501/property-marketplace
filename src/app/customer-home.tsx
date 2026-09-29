import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function CustomerHomeScreen() {
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
          <Text style={styles.greeting}>Welcome to Nestora 👋</Text>
          <Text style={styles.subtitle}>Find a place you'll love.</Text>
        </View>

       <Pressable
  style={styles.logoutButton}
  onPress={() => router.replace("/(tabs)")}
>
  <Text style={styles.logoutText}>Logout</Text>
</Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location, property..."
          placeholderTextColor="#888"
        />
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTag}>YOUR NEXT CHAPTER</Text>
        <Text style={styles.bannerTitle}>
          Find your{"\n"}perfect place.
        </Text>
        <Text style={styles.bannerSubtitle}>
          Explore properties that feel like home.
        </Text>

       <Pressable
  style={styles.exploreButton}
  onPress={() => router.push("/properties")}
>
  <Text style={styles.exploreButtonText}>
    Explore properties →
  </Text>
</Pressable>
            </View>

      {/* My Enquiries */}
      <Pressable
        style={styles.myEnquiriesButton}
        onPress={() => router.push("/my-enquiries")}
      >
        <Text style={styles.myEnquiriesIcon}>📋</Text>

        <View style={styles.myEnquiriesContent}>
          <Text style={styles.myEnquiriesTitle}>
            My Enquiries
          </Text>
          <Text style={styles.myEnquiriesSubtitle}>
            Track your property enquiries
          </Text>
        </View>

        <Text style={styles.myEnquiriesArrow}>→</Text>
      </Pressable>

      {/* Property categories */}

      {/* Property categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse by category</Text>
      </View>

      <View style={styles.categoryContainer}>
        <Pressable style={styles.categoryCard}>
          <Text style={styles.categoryEmoji}>🏡</Text>
          <Text style={styles.categoryTitle}>Residential</Text>
        </Pressable>

        <Pressable style={styles.categoryCard}>
          <Text style={styles.categoryEmoji}>🏢</Text>
          <Text style={styles.categoryTitle}>Commercial</Text>
        </Pressable>

        <Pressable style={styles.categoryCard}>
          <Text style={styles.categoryEmoji}>🌳</Text>
          <Text style={styles.categoryTitle}>Land</Text>
        </Pressable>
      </View>

      {/* Featured properties */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured properties</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🏘️</Text>
        <Text style={styles.emptyTitle}>Your future home awaits</Text>
        <Text style={styles.emptySubtitle}>
          Properties will appear here once listings are available.
        </Text>
      </View>

      {/* Bottom note */}
      <Text style={styles.footer}>
        Find your place. Make it yours.
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
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E5EDE7",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    fontSize: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EAECE8",
  },
  searchIcon: {
    fontSize: 25,
    color: "#777",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#222",
  },
  banner: {
    backgroundColor: "#173F35",
    borderRadius: 22,
    padding: 24,
    marginBottom: 30,
  },
  bannerTag: {
    color: "#BFD7C8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38,
  },
  bannerSubtitle: {
    color: "#D5E2DA",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 20,
  },
  exploreButton: {
    alignSelf: "flex-start",
    backgroundColor: "#D9E8D7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: "#173F35",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202A25",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAECE8",
  },
  categoryEmoji: {
    fontSize: 27,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34443B",
    textAlign: "center",
  },
  viewAll: {
    color: "#47765E",
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 38,
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
  myEnquiriesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAECE8",
    marginBottom: 30,
  },
  myEnquiriesIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  myEnquiriesContent: {
    flex: 1,
  },
  myEnquiriesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#173F35",
  },
  myEnquiriesSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },
  myEnquiriesArrow: {
    fontSize: 22,
    color: "#47765E",
  },
});