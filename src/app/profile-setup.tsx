import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ProfileSetupScreen() {
    const router = useRouter();

const { role } = useLocalSearchParams<{
  role?: "Customer" | "Broker";
}>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSendOtp = () => {
    if (phone.length !== 10) {
      Alert.alert(
        "Invalid mobile number",
        "Please enter a 10-digit mobile number."
      );
      return;
    }

    // Prototype only: no real OTP is sent.
    setOtpSent(true);
    setVerified(false);

    Alert.alert(
      "Demo OTP",
      "OTP sending will be connected to the backend later."
    );
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter a 6-digit OTP."
      );
      return;
    }

    // Prototype only: this does not verify a real OTP.
    setVerified(true);
    Alert.alert("Verified", "Demo verification successful.");
  };

  const handleContinue = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(
        "Profile incomplete",
        "Please enter your name and email."
      );
      return;
    }

    if (!verified) {
      Alert.alert(
        "Verify your number",
        "Please verify your mobile number first."
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert(
        "Invalid PIN code",
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    router.replace(
  role === "Broker" ? "/broker-home" : "/customer-home"
);
 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={styles.eyebrow}>NESTORA</Text>

      <Text style={styles.heading}>
        Complete your profile
      </Text>

      <Text style={styles.subtitle}>
        Just a few details to make your property search easier.
      </Text>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressText}>
          Almost there · 1 of 1
        </Text>
      </View>

      {/* Personal details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Personal details
        </Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#929890"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#929890"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.helperText}>
          These details will come from Google sign-in
          when authentication is connected.
        </Text>
      </View>

      {/* Mobile verification */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Mobile number
        </Text>

        <Text style={styles.helperText}>
          Your number is required so brokers can contact
          you about your enquiries.
        </Text>

        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>

          <TextInput
            style={styles.phoneInput}
            placeholder="10-digit mobile number"
            placeholderTextColor="#929890"
            value={phone}
            onChangeText={(value) => {
              setPhone(value.replace(/\D/g, "").slice(0, 10));
              setOtpSent(false);
              setVerified(false);
              setOtp("");
            }}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {!verified ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={handleSendOtp}
          >
            <Text style={styles.secondaryButtonText}>
              {otpSent ? "Resend OTP" : "Send OTP"}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>
              ✓ Mobile number verified
            </Text>
          </View>
        )}

        {otpSent && !verified && (
          <>
            <Text style={styles.label}>Enter OTP</Text>

            <TextInput
              style={styles.input}
              placeholder="6-digit OTP"
              placeholderTextColor="#929890"
              value={otp}
              onChangeText={(value) =>
                setOtp(value.replace(/\D/g, "").slice(0, 6))
              }
              keyboardType="number-pad"
              maxLength={6}
            />

            <Pressable
              style={styles.secondaryButton}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.secondaryButtonText}>
                Verify OTP
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Your location
        </Text>

        <Text style={styles.helperText}>
          Enter your PIN code so we can help connect you
          with brokers in the relevant area.
        </Text>

        <Text style={styles.label}>PIN code</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit PIN code"
          placeholderTextColor="#929890"
          value={pincode}
          onChangeText={(value) =>
            setPincode(value.replace(/\D/g, "").slice(0, 6))
          }
          keyboardType="number-pad"
          maxLength={6}
        />

        <Pressable
          style={styles.locationButton}
          onPress={() =>
            Alert.alert(
              "Location",
              "Current location detection will be added later. You can enter your PIN code manually."
            )
          }
        >
          <Text style={styles.locationButtonText}>
            ◎  Use my current location
          </Text>
        </Pressable>
      </View>

      {/* Continue */}
      <Pressable
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>
          Complete profile →
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Your details help us connect you with relevant
        property brokers.
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
    paddingTop: 35,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#668674",
    marginBottom: 10,
  },
  heading: {
    fontSize: 27,
    fontWeight: "700",
    color: "#173F35",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#777",
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E2E8E1",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: "#47765E",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    color: "#788078",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E8EBE5",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#202A25",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#36483C",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8E1",
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#263B30",
    backgroundColor: "#FFFFFF",
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#7B827C",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryCode: {
    height: 50,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8E1",
    borderRadius: 11,
    backgroundColor: "#F8F8F5",
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263B30",
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8E1",
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#263B30",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#47765E",
    borderRadius: 11,
    paddingVertical: 13,
    marginTop: 14,
  },
  secondaryButtonText: {
    color: "#47765E",
    fontSize: 14,
    fontWeight: "700",
  },
  verifiedBadge: {
    backgroundColor: "#EAF4EC",
    borderRadius: 10,
    padding: 13,
    marginTop: 14,
  },
  verifiedText: {
    color: "#28613D",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  locationButton: {
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 8,
  },
  locationButtonText: {
    color: "#47765E",
    fontSize: 13,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: "#173F35",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#929890",
    marginTop: 18,
  },
});