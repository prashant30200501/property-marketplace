

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { enquiries } from "../data/enquiries";


export default function BrokerEnquiriesScreen() {
    const [, setRefreshVersion] = useState(0);

useFocusEffect(
  useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, [])
);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Broker Dashboard</Text>
      </Pressable>

      <Text style={styles.heading}>Customer Enquiries</Text>
      <Text style={styles.subtitle}>
        Manage interested customers and follow up on
        their property enquiries.
      </Text>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryNumber}>
            {enquiries.length}
          </Text>
          <Text style={styles.summaryLabel}>
            Total enquiries
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View>
          <Text style={styles.summaryNumber}>
            {enquiries.filter((e) => e.status === "New").length}
          </Text>
          <Text style={styles.summaryLabel}>
            New enquiries
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          All enquiries
        </Text>
        <Text style={styles.count}>
          {enquiries.length} records
        </Text>
      </View>

      {enquiries.map((enquiry) => (
        <View key={enquiry.id} style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.enquiryId}>
              {enquiry.id}
            </Text>

            <View
              style={[
                styles.statusBadge,
                enquiry.status === "New"
                  ? styles.newBadge
                  : enquiry.status === "Contacted"
                  ? styles.contactedBadge
                  : styles.visitBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  enquiry.status === "New"
                    ? styles.newText
                    : enquiry.status === "Contacted"
                    ? styles.contactedText
                    : styles.visitText,
                ]}
              >
                {enquiry.status}
              </Text>
            </View>
          </View>

          <Text style={styles.propertyTitle}>
            {enquiry.property}
          </Text>

          <Text style={styles.location}>
            📍 {enquiry.location}
          </Text>

          <Text style={styles.price}>
            {enquiry.price}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.customerLabel}>
            CUSTOMER
          </Text>

          <Text style={styles.customerName}>
            {enquiry.customer}
          </Text>

          <Text style={styles.phone}>
            {enquiry.phone}
          </Text>

          <Text style={styles.date}>
            Received: {enquiry.date}
          </Text>

          <Pressable
            style={styles.viewButton}
            onPress={() =>
              router.push({
                pathname: "/broker-enquiry-details",
                params: { enquiryId: enquiry.id },
              })
            }
          >
            <Text style={styles.viewButtonText}>
              View enquiry details →
            </Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.disclaimer}>
        Sample enquiries for demonstration only.
        Customer details and statuses are not live.
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
  subtitle: {
    fontSize: 14,
    color: "#777",
    lineHeight: 21,
    marginBottom: 24,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#173F35",
    borderRadius: 18,
    paddingVertical: 22,
    marginBottom: 30,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#D5E2DA",
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#557568",
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
  count: {
    fontSize: 12,
    color: "#777",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECE8",
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  enquiryId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newBadge: {
    backgroundColor: "#FFF0D5",
  },
  contactedBadge: {
    backgroundColor: "#E5F1FF",
  },
  visitBadge: {
    backgroundColor: "#E5F4E8",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  newText: {
    color: "#946000",
  },
  contactedText: {
    color: "#245FA8",
  },
  visitText: {
    color: "#287542",
  },
  propertyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#263B30",
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },
  price: {
    fontSize: 19,
    fontWeight: "700",
    color: "#47765E",
  },
  divider: {
    height: 1,
    backgroundColor: "#ECEEE9",
    marginVertical: 16,
  },
  customerLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#999",
    marginBottom: 7,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#263B30",
  },
  phone: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 12,
  },
  viewButton: {
    backgroundColor: "#EAF1EB",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#173F35",
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});