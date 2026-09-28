
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const COLORS = {
  navy: "#0D1B2A",
  gold: "#D4A017",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#17212F",
  muted: "#7B8491",
  border: "#E3E7ED",
};

type Role = "Customer" | "Broker";

export default function RegisterScreen() {
  const router = useRouter();
  const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

  const [role, setRole] = useState<Role>("Customer");
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
   if (
  !fullName.trim() ||
  !email.trim() ||
  !phone.trim() ||
  !password.trim() ||
  !confirmPassword.trim()
) {
  showAlert(
  "Missing details",
  "Please fill in all required fields, including password confirmation."
);
  return;
}

    if (role === "Broker" && !agencyName.trim()) {
      Alert.alert("Agency name required", "Please enter your agency name.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak password",
        "Your password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Your passwords do not match.");
      return;
    }

    Alert.alert(
      "Registration UI ready",
      `Your ${role.toLowerCase()} account form is ready. We'll connect it to the backend next.`
    );
  };

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    options: {
      keyboardType?: "default" | "email-address" | "phone-pad";
      secureTextEntry?: boolean;
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
    } = {}
  ) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={options.keyboardType ?? "default"}
        secureTextEntry={options.secureTextEntry}
        autoCapitalize={options.autoCapitalize ?? "sentences"}
        autoCorrect={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>N</Text>
              <View style={styles.brandMarkDot} />
            </View>

            <Text style={styles.brandName}>NESTORA</Text>
            <Text style={styles.tagline}>FIND YOUR PERFECT HOME</Text>
          </View>

          {/* Registration form */}
          <View style={styles.card}>
            <Text style={styles.eyebrow}>JOIN NESTORA</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              {role === "Customer"
                ? "Your perfect home is just a few steps away."
                : "Connect with property seekers and grow your business."}
            </Text>

            <Text style={styles.fieldLabel}>I WANT TO JOIN AS</Text>
            <View style={styles.roleSelector}>
              {(["Customer", "Broker"] as Role[]).map((item) => {
                const selected = role === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setRole(item)}
                    style={[
                      styles.roleButton,
                      selected && styles.roleButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        selected && styles.roleTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {renderInput(
              "FULL NAME",
              "Enter your full name",
              fullName,
              setFullName
            )}

            {role === "Broker" &&
              renderInput(
                "AGENCY / BUSINESS NAME",
                "Enter your agency name",
                agencyName,
                setAgencyName
              )}

            {renderInput(
              "EMAIL ADDRESS",
              "you@example.com",
              email,
              setEmail,
              {
                keyboardType: "email-address",
                autoCapitalize: "none",
              }
            )}

            {renderInput(
              "PHONE NUMBER",
              "Enter your phone number",
              phone,
              setPhone,
              { keyboardType: "phone-pad" }
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 8 characters"
                  placeholderTextColor={COLORS.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                >
                  <Text style={styles.showText}>
                    {showPassword ? "HIDE" : "SHOW"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {renderInput(
              "CONFIRM PASSWORD",
              "Re-enter your password",
              confirmPassword,
              setConfirmPassword,
              {
                secureTextEntry: !showPassword,
                autoCapitalize: "none",
              }
            )}

            <Pressable
              onPress={handleRegister}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <View style={styles.signInRow}>
              <Text style={styles.signInPrompt}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/")}>
                <Text style={styles.signInLink}>Sign in</Text>
              </Pressable>
            </View>

            <Text style={styles.terms}>
              By creating an account, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <Text style={styles.footer}>
            YOUR NEXT CHAPTER STARTS AT HOME
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 24,
  },
  header: {
    backgroundColor: COLORS.navy,
    alignItems: "center",
    paddingTop: 25,
    paddingBottom: 42,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    left: 22,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#344355",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 34,
    marginTop: -3,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  brandMarkText: {
    color: COLORS.gold,
    fontSize: 27,
    fontWeight: "800",
  },
  brandMarkDot: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    top: 6,
    right: 6,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 5,
  },
  tagline: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 24,
    padding: 23,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    shadowColor: "#071321",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  eyebrow: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: COLORS.navy,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 9,
  },
  roleSelector: {
    flexDirection: "row",
    backgroundColor: "#F1F3F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 23,
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 9,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.navy,
  },
  roleText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  roleTextSelected: {
    color: COLORS.white,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  passwordContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 13,
  },
  showText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "800",
    paddingLeft: 8,
  },
  primaryButton: {
    minHeight: 55,
    backgroundColor: COLORS.gold,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: "800",
  },
  buttonArrow: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "700",
    marginLeft: 12,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 23,
  },
  signInPrompt: {
    color: COLORS.muted,
    fontSize: 12,
  },
  signInLink: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "800",
  },
  terms: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 20,
  },
  termsLink: {
    color: COLORS.navy,
    fontWeight: "700",
  },
  footer: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.7,
    textAlign: "center",
    marginTop: 25,
  },
});