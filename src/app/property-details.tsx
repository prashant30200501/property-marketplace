import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const properties = [
  {
    id: "1",
    title: "Modern Family Villa",
    location: "Vaishali Nagar, Jaipur",
    price: "₹85 Lakh",
    type: "Individual House",
    listingType: "Buy",
    details: "3 BHK • 1,850 sq.ft.",
    emoji: "🏡",
    description:
      "A spacious family villa in a well-connected residential area of Jaipur.",
    features: ["3 Bedrooms", "2 Bathrooms", "Parking", "Garden"],
  },
  {
    id: "2",
    title: "Premium City Apartment",
    location: "Jagatpura, Jaipur",
    price: "₹52 Lakh",
    type: "Flat",
    listingType: "Buy",
    details: "2 BHK • 1,200 sq.ft.",
    emoji: "🏢",
    description:
      "A comfortable apartment with convenient access to nearby amenities.",
    features: ["2 Bedrooms", "2 Bathrooms", "Security", "Lift"],
  },
  {
    id: "3",
    title: "Comfortable Student PG",
    location: "Gopalpura, Jaipur",
    price: "₹8,000/month",
    type: "PG",
    listingType: "Rent",
    details: "Single room • Furnished",
    emoji: "🛏️",
    description:
      "A furnished PG option for students looking for accommodation in Jaipur.",
    features: ["Furnished", "Single Room", "Student Friendly"],
  },
  {
    id: "4",
    title: "Commercial Office Space",
    location: "Malviya Nagar, Jaipur",
    price: "₹1.2 Crore",
    type: "Office",
    listingType: "Buy",
    details: "Office • 2,000 sq.ft.",
    emoji: "🏬",
    description:
      "A commercial office space suitable for business use.",
    features: ["2,000 sq.ft.", "Office Space", "Commercial Area"],
  },
  {
    id: "5",
    title: "Retail Commercial Space",
    location: "Tonk Road, Jaipur",
    price: "₹35,000/month",
    type: "Commercial Property",
    listingType: "Rent",
    details: "Shop • 850 sq.ft.",
    emoji: "🏪",
    description:
      "A retail space available for rent in a commercial area.",
    features: ["850 sq.ft.", "Retail Space", "Road Access"],
  },
];

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const property = properties.find((item) => item.id === id);

  if (!property) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Property not found.</Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to properties</Text>
      </Pressable>

      <View style={styles.image}>
        <Text style={styles.emoji}>{property.emoji}</Text>

        <View style={styles.tag}>
          <Text style={styles.tagText}>{property.type}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.listingType}>
          For {property.listingType}
        </Text>

        <Text style={styles.price}>{property.price}</Text>

        <Text style={styles.title}>{property.title}</Text>

        <Text style={styles.location}>
          📍 {property.location}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Property overview</Text>
        <Text style={styles.overview}>{property.details}</Text>

        <Text style={styles.sectionTitle}>About this property</Text>
        <Text style={styles.description}>
          {property.description}
        </Text>

        <Text style={styles.sectionTitle}>Features</Text>

        <View style={styles.features}>
          {property.features.map((feature) => (
            <View key={feature} style={styles.feature}>
              <Text style={styles.featureText}>✓ {feature}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.enquiryButton}
          onPress={() => {}}
        >
          <Text style={styles.enquiryButtonText}>
            Contact about this property
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Sample property details for demonstration only.
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
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    marginBottom: 16,
  },
  backButtonText: {
    color: "#47765E",
    fontSize: 14,
    fontWeight: "700",
  },
  image: {
    height: 230,
    backgroundColor: "#E5EDE7",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 20,
  },
  emoji: {
    fontSize: 85,
  },
  tag: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  tagText: {
    color: "#173F35",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8EBE5",
  },
  listingType: {
    color: "#668674",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  price: {
    color: "#173F35",
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: "#263B30",
    fontSize: 21,
    fontWeight: "700",
  },
  location: {
    color: "#7B827C",
    fontSize: 14,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0EC",
    marginVertical: 22,
  },
  sectionTitle: {
    color: "#202A25",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  overview: {
    color: "#526057",
    fontSize: 14,
  },
  description: {
    color: "#6F786F",
    fontSize: 14,
    lineHeight: 22,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  feature: {
    backgroundColor: "#F1F5F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  featureText: {
    color: "#365B47",
    fontSize: 13,
    fontWeight: "600",
  },
  enquiryButton: {
    backgroundColor: "#173F35",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 28,
  },
  enquiryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disclaimer: {
    color: "#929890",
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
  },
  notFound: {
    color: "#263B30",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
  },
});