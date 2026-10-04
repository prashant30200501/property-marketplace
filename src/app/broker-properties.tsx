import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getMyProperties } from "../services/api";

type Property = {
  id: string;
  title: string;
  description?: string | null;
  property_type: string;
  price: string | number;
  address: string;
  pincode: string;
  status: string;
  created_at: string;
};

export default function BrokerPropertiesScreen() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProperties = async () => {
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (error) {
      console.error("Failed to load broker properties:", error);

      Alert.alert(
        "Unable to load properties",
        "We couldn't fetch your properties. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return String(price);
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return styles.statusAvailable;

      case "sold":
        return styles.statusSold;

      default:
        return styles.statusOther;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.eyebrow}>NESTORA</Text>
          <Text style={styles.title}>My Properties</Text>
          <Text style={styles.subtitle}>
            Manage the properties you have listed.
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <Text style={styles.summaryIcon}>🏘️</Text>
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryNumber}>{properties.length}</Text>
          <Text style={styles.summaryLabel}>
            {properties.length === 1 ? "Listed property" : "Listed properties"}
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#173F35" />
          <Text style={styles.loadingText}>
            Loading your properties...
          </Text>
        </View>
      ) : properties.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyTitle}>No properties yet</Text>
          <Text style={styles.emptySubtitle}>
            Properties you list on Nestora will appear here.
          </Text>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-property")}
          >
            <Text style={styles.addButtonText}>+ Add Property</Text>
          </Pressable>
        </View>
      ) : (
        /* Property list */
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your listings</Text>

            <Pressable
              onPress={() => router.push("/add-property")}
            >
              <Text style={styles.addText}>+ Add</Text>
            </Pressable>
          </View>

          {properties.map((property) => (
            <Pressable
              key={property.id}
              style={({ pressed }) => [
                styles.propertyCard,
                pressed && styles.cardPressed,
              ]}
             onPress={() =>
  router.push({
    pathname: "/edit-property",
    params: {
      propertyId: property.id,
    },
  })
}
            >
              {/* Property icon */}
              <View style={styles.propertyIconContainer}>
                <Text style={styles.propertyIcon}>
                  {property.property_type.toLowerCase() === "land"
                    ? "🌳"
                    : property.property_type.toLowerCase() === "commercial"
                    ? "🏢"
                    : "🏠"}
                </Text>
              </View>

              {/* Property information */}
              <View style={styles.propertyInfo}>
                <Text
                  style={styles.propertyTitle}
                  numberOfLines={2}
                >
                  {property.title}
                </Text>

                <Text style={styles.propertyType}>
                  {property.property_type}
                </Text>

                <Text style={styles.propertyPrice}>
                  {formatPrice(property.price)}
                </Text>

                <Text
                  style={styles.propertyAddress}
                  numberOfLines={1}
                >
                  {property.address} · {property.pincode}
                </Text>

                <View style={styles.propertyFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(property.status),
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {property.status}
                    </Text>
                  </View>

                  <Text style={styles.dateText}>
                    Listed {formatDate(property.created_at)}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      )}

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
    alignItems: "flex-start",
    marginBottom: 24,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#47765E",
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#173F35",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    lineHeight: 19,
  },

  backButton: {
    backgroundColor: "#E5EDE7",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D5E2DA",
  },

  backButtonText: {
    color: "#173F35",
    fontSize: 13,
    fontWeight: "700",
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#173F35",
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
  },

  summaryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#315A4C",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryIcon: {
    fontSize: 24,
  },

  summaryText: {
    marginLeft: 16,
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#D5E2DA",
    fontSize: 12,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202A25",
  },

  addText: {
    color: "#47765E",
    fontSize: 13,
    fontWeight: "700",
  },

  propertyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAECE8",
  },

  cardPressed: {
    opacity: 0.82,
  },

  propertyIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EAF1EB",
    alignItems: "center",
    justifyContent: "center",
  },

  propertyIcon: {
    fontSize: 25,
  },

  propertyInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  propertyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#263B30",
    lineHeight: 20,
  },

  propertyType: {
    fontSize: 11,
    color: "#47765E",
    fontWeight: "700",
    textTransform: "capitalize",
    marginTop: 4,
  },

  propertyPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#173F35",
    marginTop: 5,
  },

  propertyAddress: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  propertyFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusAvailable: {
    backgroundColor: "#E5F2E8",
  },

  statusSold: {
    backgroundColor: "#F5E5E5",
  },

  statusOther: {
    backgroundColor: "#ECEDEA",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#315A4C",
    textTransform: "capitalize",
  },

  dateText: {
    fontSize: 10,
    color: "#999",
    marginLeft: 9,
  },

  arrow: {
    fontSize: 28,
    color: "#789084",
    marginTop: 10,
  },

  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAECE8",
  },

  loadingText: {
    fontSize: 13,
    color: "#777",
    marginTop: 12,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAECE8",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#263B30",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  addButton: {
    backgroundColor: "#D4A017",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 22,
    marginTop: 18,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    color: "#8A918B",
    fontSize: 12,
    marginTop: 28,
  },
});