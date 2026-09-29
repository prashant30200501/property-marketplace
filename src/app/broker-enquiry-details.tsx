
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    enquiries,
    updateEnquiryStatus,
    type EnquiryStatus,
} from "../data/enquiries";


export default function BrokerEnquiryDetailsScreen() {
  const { enquiryId } = useLocalSearchParams<{
    enquiryId: string;
  }>();

  const enquiry = enquiries.find(
    (item) => item.id === enquiryId
  );
  const [status, setStatus] = useState<EnquiryStatus>(
  enquiry?.status ?? "New"
);

  if (!enquiry) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Enquiry not found</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
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
      <Text style={styles.reference}>{enquiry.id}</Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          {status}
        </Text>
      </View>
      <View style={styles.card}>
  <Text style={styles.sectionTitle}>Update Enquiry Status</Text>

  <View style={styles.statusOptions}>
    {["New", "Contacted", "Site Visit", "Converted", "Closed"].map(
      (item) => (
        <Pressable
          key={item}
          style={[
            styles.statusOption,
            status === item && styles.selectedStatusOption,
          ]}
          onPress={() => {
  setStatus(item as EnquiryStatus);
  updateEnquiryStatus(enquiry.id, item as EnquiryStatus);
}}
        >
          <Text
            style={[
              styles.statusOptionText,
              status === item && styles.selectedStatusOptionText,
            ]}
          >
            {item}
          </Text>
        </Pressable>
      )
    )}
  </View>

  <Text style={styles.statusHint}>
    Select the current stage of this enquiry.
  </Text>
</View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Property</Text>
        <Text style={styles.propertyTitle}>
          {enquiry.property}
        </Text>
        <Text style={styles.detail}>
          📍 {enquiry.location}
        </Text>
        <Text style={styles.price}>{enquiry.price}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.customerName}>
          {enquiry.customer}
        </Text>
        <Text style={styles.detail}>
          Phone: {enquiry.phone}
        </Text>
      </View>

      
<View style={styles.card}>
  <Text style={styles.sectionTitle}>
    Enquiry Activity Timeline
  </Text>

  {enquiry.history.map((activity, index) => (
    <View key={`${activity.status}-${index}`} style={styles.timelineItem}>
      <View style={styles.timelineIndicator}>
        <View style={styles.timelineDot} />

        {index !== enquiry.history.length - 1 && (
          <View style={styles.timelineLine} />
        )}
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineStatus}>
          {activity.status}
        </Text>

        <Text style={styles.timelineTimestamp}>
          {activity.timestamp}
        </Text>
      </View>
    </View>
  ))}

  <View style={styles.currentStatusBox}>
    <Text style={styles.currentStatusLabel}>
      CURRENT STATUS
    </Text>
    <Text style={styles.currentStatusValue}>
      {status}
    </Text>
  </View>
</View>

      <Text style={styles.disclaimer}>
        Sample data only. Calling customers and updating
        enquiry statuses will be connected later.
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
  propertyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263B30",
    marginBottom: 10,
  },
  detail: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#47765E",
    marginTop: 8,
  },
  customerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#263B30",
    marginBottom: 8,
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
  disclaimer: {
    color: "#999",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
    statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE5DF",
    backgroundColor: "#FFFFFF",
  },
  selectedStatusOption: {
    backgroundColor: "#173F35",
    borderColor: "#173F35",
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#526057",
  },
  selectedStatusOptionText: {
    color: "#FFFFFF",
  },
  statusHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 14,
  },

  timelineItem: {
    flexDirection: "row",
    minHeight: 62,
  },
  timelineIndicator: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#47765E",
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#DDE5DF",
    marginTop: 4,
    marginBottom: -2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "700",
    color: "#263B30",
  },
  timelineTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  currentStatusBox: {
    backgroundColor: "#EAF1EB",
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  currentStatusLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#668071",
    marginBottom: 5,
  },
  currentStatusValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#173F35",
  },
});