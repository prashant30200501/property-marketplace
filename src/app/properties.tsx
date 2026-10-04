import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { getProperties } from "../services/api";

const propertyTypes = [
  "All",
  "Flat",
  "Individual House",
  "PG",
  "Commercial Property",
  "Office",
];



export default function PropertiesScreen() {
    const router = useRouter();
 const [selectedListingType, setSelectedListingType] = useState("Buy");
const [selectedPropertyType, setSelectedPropertyType] = useState("All");
const [search, setSearch] = useState("");
const [properties, setProperties] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  loadProperties();
}, []);

async function loadProperties() {
  try {
    setLoading(true);
    setError("");

    const data = await getProperties();

    const formattedProperties = data.map((property: any) => ({
      id: property.id,
      title: property.title,
      location: property.address,
      price: `₹${Number(property.price).toLocaleString("en-IN")}`,
      type:
        property.property_type === "residential"
          ? "Flat"
          : property.property_type === "commercial"
          ? "Commercial Property"
          : property.property_type,
      listingType: "Buy",
      details: property.description || "Property details available",
      emoji:
        property.property_type === "commercial"
          ? "🏬"
          : "🏡",
    }));

    setProperties(formattedProperties);
  } catch (error) {
    console.error("Failed to load properties:", error);
    setError("Unable to load properties.");
  } finally {
    setLoading(false);
  }
}

const filteredProperties = properties.filter((property) => {
  const matchesListingType =
    property.listingType === selectedListingType;

  const matchesPropertyType =
    selectedPropertyType === "All" ||
    property.type === selectedPropertyType;

  const searchText = search.toLowerCase();

  const matchesSearch =
    property.title.toLowerCase().includes(searchText) ||
    property.location.toLowerCase().includes(searchText) ||
    property.type.toLowerCase().includes(searchText);

  return (
    matchesListingType &&
    matchesPropertyType &&
    matchesSearch
  );
});

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NESTORA</Text>
          <Text style={styles.heading}>Explore properties</Text>
          <Text style={styles.subtitle}>
            Find a place that feels like home.
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search location or property"
          placeholderTextColor="#8A918B"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

     {/* Buy / Rent selector */}
<Text style={styles.sectionTitle}>Looking to</Text>

<View style={styles.listingTypeContainer}>
  {["Buy", "Rent"].map((listingType) => {
    const isSelected = selectedListingType === listingType;

    return (
      <Pressable
        key={listingType}
        onPress={() => {
          setSelectedListingType(listingType);
          setSelectedPropertyType("All");
        }}
        style={[
          styles.listingTypeButton,
          isSelected && styles.listingTypeButtonSelected,
        ]}
      >
        <Text
          style={[
            styles.listingTypeText,
            isSelected && styles.listingTypeTextSelected,
          ]}
        >
          {listingType}
        </Text>
      </Pressable>
    );
  })}
</View>

{/* Categories */}
<Text style={styles.sectionTitle}>Property type</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {propertyTypes.map((type) => {
          const isSelected = selectedPropertyType === type;

          return (
            <Pressable
  key={type}
  onPress={() => setSelectedPropertyType(type)}
  style={[
    styles.categoryButton,
    selectedPropertyType === type &&
      styles.categoryButtonSelected,
  ]}
>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && (
  <Text style={styles.loadingText}>
    Loading properties...
  </Text>
)}

{error && !loading && (
  <Text style={styles.errorText}>
    {error}
  </Text>
)}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>Available properties</Text>
        <Text style={styles.resultCount}>
          {filteredProperties.length} found
        </Text>
      </View>

      {!loading && filteredProperties.length > 0 ? (
        filteredProperties.map((property) => (
          <Pressable
  key={property.id}
  style={styles.propertyCard}
  onPress={() =>
    router.push({
      pathname: "/property-details",
      params: { id: property.id },
    })
  }
>
            {/* Placeholder image */}
            <View style={styles.propertyImage}>
              <Text style={styles.propertyEmoji}>
                {property.emoji}
              </Text>

              <View style={styles.imageTag}>
                <Text style={styles.imageTagText}>
                  {property.type}
                </Text>
              </View>
            </View>

            {/* Property information */}
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyPrice}>
                {property.price}
              </Text>

              <Text style={styles.propertyTitle}>
                {property.title}
              </Text>

              <Text style={styles.propertyLocation}>
                📍 {property.location}
              </Text>

              <View style={styles.propertyFooter}>
                <Text style={styles.propertyDetails}>
                  {property.details}
                </Text>

                <Text style={styles.viewDetails}>
                  View details →
                </Text>
              </View>
            </View>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔎</Text>
          <Text style={styles.emptyTitle}>
            No properties found
          </Text>
          <Text style={styles.emptySubtitle}>
            Try another search or select a different category.
          </Text>

          <Pressable
            style={styles.resetButton}
            onPress={() => {
              setSearch("");
              setSelectedPropertyType("All");
            }}
          >
            <Text style={styles.resetButtonText}>
              Reset filters
            </Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.disclaimer}>
  Properties from Nestora.
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
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#668674",
    marginBottom: 8,
  },
  heading: {
    fontSize: 25,
    fontWeight: "700",
    color: "#173F35",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 7,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 15,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E5E9E3",
  },
  searchIcon: {
    fontSize: 25,
    color: "#668674",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#263B30",
    paddingVertical: 0,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#47765E",
    paddingLeft: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#202A25",
  },
  categoryList: {
    gap: 10,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E1",
  },
  categoryButtonSelected: {
    backgroundColor: "#173F35",
    borderColor: "#173F35",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#526057",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 12,
    color: "#788078",
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EBE5",
  },
  propertyImage: {
    height: 165,
    backgroundColor: "#E5EDE7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  propertyEmoji: {
    fontSize: 65,
  },
  imageTag: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#173F35",
  },
  propertyInfo: {
    padding: 16,
  },
  propertyPrice: {
    fontSize: 19,
    fontWeight: "700",
    color: "#173F35",
    marginBottom: 6,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263B30",
  },
  propertyLocation: {
    fontSize: 12,
    color: "#7B827C",
    marginTop: 8,
  },
  propertyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EEF0EC",
  },
  propertyDetails: {
    fontSize: 12,
    color: "#6F786F",
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: "700",
    color: "#47765E",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 38,
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
  resetButton: {
    backgroundColor: "#173F35",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  disclaimer: {
    textAlign: "center",
    color: "#929890",
    fontSize: 11,
    marginTop: 12,
  },
  listingTypeContainer: {
  flexDirection: "row",
  backgroundColor: "#E9EEE9",
  borderRadius: 14,
  padding: 4,
  marginTop: 14,
  marginBottom: 24,
},

listingTypeButton: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 13,
  borderRadius: 11,
},

listingTypeButtonSelected: {
  backgroundColor: "#173F35",
},

listingTypeText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#526057",
},

listingTypeTextSelected: {
  color: "#FFFFFF",
},

loadingText: {
  textAlign: "center",
  color: "#668674",
  fontSize: 14,
  marginVertical: 20,
},

errorText: {
  textAlign: "center",
  color: "#B44A4A",
  fontSize: 14,
  marginVertical: 20,
},
});