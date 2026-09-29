
import { router } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const enquiries = [
  {
    id: "ENQ-001",
    title: "Modern 3 BHK Apartment",
    location: "Vaishali Nagar, Jaipur",
    price: "₹85 Lakh",
    status: "Pending",
    date: "Just now",
  },
  {
    id: "ENQ-002",
    title: "Premium Residential Plot",
    location: "Ajmer Road, Jaipur",
    price: "₹45 Lakh",
    status: "Broker Assigned",
    date: "Yesterday",
  },
];

export default function MyEnquiries() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.heading}>My Enquiries</Text>
      <Text style={styles.subtitle}>
        Track your property enquiries and their progress.
      </Text>

      {enquiries.map((enquiry) => (
        <View key={enquiry.id} style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.reference}>{enquiry.id}</Text>

            <View
              style={[
                styles.statusBadge,
                enquiry.status === "Pending"
                  ? styles.pendingBadge
                  : styles.assignedBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  enquiry.status === "Pending"
                    ? styles.pendingText
                    : styles.assignedText,
                ]}
              >
                {enquiry.status}
              </Text>
            </View>
          </View>

          <Text style={styles.propertyTitle}>
            {enquiry.title}
          </Text>

          <Text style={styles.location}>
            📍 {enquiry.location}
          </Text>

          <Text style={styles.price}>{enquiry.price}</Text>

          <View style={styles.divider} />

          <Text style={styles.date}>
            Enquiry submitted: {enquiry.date}
          </Text>
        </View>
      ))}

      <Pressable
        style={styles.browseButton}
        onPress={() => router.push("/properties")}
      >
        <Text style={styles.browseButtonText}>
          Explore More Properties
        </Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Sample enquiries for UI demonstration. Live enquiry
        tracking will be connected when the backend is built.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  backText: {
    color: "#555B68",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#171923",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#737987",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E9EAF0",
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reference: {
    fontSize: 12,
    color: "#888D99",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: "#FFF2D6",
  },
  assignedBadge: {
    backgroundColor: "#E5F1FF",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pendingText: {
    color: "#966000",
  },
  assignedText: {
    color: "#245FA8",
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171923",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: "#737987",
    marginBottom: 12,
  },
  price: {
    fontSize: 19,
    fontWeight: "700",
    color: "#E87524",
  },
  divider: {
    height: 1,
    backgroundColor: "#ECEEF2",
    marginVertical: 16,
  },
  date: {
    fontSize: 12,
    color: "#888D99",
  },
  browseButton: {
    backgroundColor: "#E87524",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 12,
    color: "#969BA6",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 18,
  },
});