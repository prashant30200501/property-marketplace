
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
import { loginUser } from "../../services/api";

const COLORS = {
  navy: "#0D1B2A",
  navyLight: "#172A40",
  gold: "#D4A017",
  goldLight: "#E8BD4A",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#17212F",
  muted: "#7B8491",
  border: "#E3E7ED",
};

type Role = "Customer" | "Broker";
type LoginMethod = "Phone" | "Email";

export default function LoginScreen() {
  const [role, setRole] = useState<Role>("Customer");

  // Unified login field: phone number or email
  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Automatically identify phone number vs email
  const isEmail = identifier.trim().includes("@");

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
  
    setOtp("");
    setOtpSent(false);
  };

  const handleLogin = async () => {



  if (!identifier.trim()) {
    
    Alert.alert(
      "Missing details",
      "Please enter your phone number or email."
    );
    return;
  }

  if (isEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      Alert.alert(
        "Password required",
        "Please enter your Nestora password."
      );
      return;
    }

    try {
      const data = await loginUser(
        identifier.trim().toLowerCase(),
        password
      );

      // Make sure the selected role matches the backend role.
      const backendRole =
        data.role === "broker" ? "Broker" : "Customer";

      if (backendRole !== role) {
        Alert.alert(
          "Role mismatch",
          `This account is registered as ${backendRole}. Please select ${backendRole} to continue.`
        );
        return;
      }

      Alert.alert(
        "Welcome back",
        "You have successfully signed in.",
        [
          {
            text: "Continue",
            onPress: () =>
              router.replace(
                backendRole === "Customer"
                  ? "/customer-home"
                  : "/broker-home"
              ),
          },
        ]
      );
    } catch (error) {
      console.error("Login failed:", error);

      Alert.alert(
        "Login failed",
        "Invalid email or password. Please try again."
      );
    }

    return;
  }

  // Phone login remains temporary until OTP backend is implemented.
  if (!/^\+?[\d\s()-]{7,}$/.test(identifier.trim())) {
    Alert.alert(
      "Invalid phone number",
      "Please enter a valid phone number or email address."
    );
    return;
  }

  if (!otpSent) {
    setOtpSent(true);

    Alert.alert(
      "OTP preview",
      "The OTP interface is ready. Actual SMS delivery will be added later."
    );

    return;
  }

  if (!otp.trim()) {
    Alert.alert("Missing OTP", "Please enter the OTP.");
    return;
  }

  router.replace(
    role === "Customer"
      ? "/customer-home"
      : "/broker-home"
  );
};

  // Keep your existing return (...) here for now.

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>N</Text>
              <View style={styles.brandMarkDot} />
            </View>

            <Text style={styles.brandName}>NESTORA</Text>
            <Text style={styles.brandTagline}>
              FIND YOUR PERFECT HOME
            </Text>
          </View>

          {/* Login card */}
          <View style={styles.loginCard}>
            <View style={styles.headingContainer}>
              <Text style={styles.eyebrow}>WELCOME BACK</Text>
              <Text style={styles.heading}>Find your place.</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your property journey.
              </Text>
            </View>

            {/* Role selector */}
            <Text style={styles.fieldLabel}>CONTINUE AS</Text>
            <View style={styles.roleSelector}>
              {(["Customer", "Broker"] as Role[]).map((item) => {
                const selected = role === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => handleRoleChange(item)}
                    style={[
                      styles.roleButton,
                      selected && styles.roleButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        selected && styles.roleButtonTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>



{/* Phone or Email */}
<Text style={styles.fieldLabel}>PHONE NUMBER OR EMAIL</Text>

<View style={styles.inputContainer}>
  <Text style={styles.inputIcon}>
    {isEmail ? "✉" : "☎"}
  </Text>

  <TextInput
    style={styles.input}
    placeholder="Enter phone number or email"
    placeholderTextColor={COLORS.muted}
    value={identifier}
    onChangeText={(value) => {
      setIdentifier(value);
      setOtpSent(false);
      setOtp("");
    }}
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    accessibilityLabel="Phone number or email"
  />
</View>

{/* Email password */}
{isEmail && (
  <>
    <View style={styles.passwordLabelRow}>
      <Text style={styles.fieldLabel}>PASSWORD</Text>

      <Pressable
        onPress={() =>
          Alert.alert(
            "Forgot password",
            "Password recovery will be added later."
          )
        }
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>▣</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor={COLORS.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        accessibilityLabel="Password"
      />

      <Pressable
        onPress={() => setShowPassword(!showPassword)}
        hitSlop={10}
      >
        <Text style={styles.showPassword}>
          {showPassword ? "HIDE" : "SHOW"}
        </Text>
      </Pressable>
    </View>
  </>
)}

{/* Phone OTP */}
{!isEmail && otpSent && (
  <>
    <Text style={styles.fieldLabel}>ONE-TIME PASSWORD</Text>

    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>✉</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        placeholderTextColor={COLORS.muted}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        accessibilityLabel="One-time password"
      />
    </View>
  </>
)}

{/* Continue button */}
<Pressable
  onPress={handleLogin}
  style={({ pressed }) => [
    styles.signInButton,
    pressed && styles.buttonPressed,
  ]}
>
  <Text style={styles.signInText}>
    {isEmail
      ? "Sign In"
      : otpSent
        ? "Verify OTP"
        : "Send OTP"}
  </Text>

  <Text style={styles.buttonArrow}>→</Text>
</Pressable>

{/* Google sign-in */}
<Pressable
 onPress={() =>
  router.push({
    pathname: "/profile-setup",
    params: { role },
  })
}
  style={({ pressed }) => [
    styles.googleButton,
    pressed && styles.buttonPressed,
  ]}
>
  <Text style={styles.googleG}>G</Text>
  <Text style={styles.googleButtonText}>Continue with Google</Text>
</Pressable>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>NEW TO NESTORA?</Text>
              <View style={styles.divider} />
            </View>

            <Pressable
              style={styles.createAccountButton}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.createAccountText}>Create an account</Text>
            </Pressable>

            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <Text style={styles.footerText}>
            YOUR NEXT CHAPTER STARTS AT HOME
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 24,
  },
  brandHeader: {
    backgroundColor: COLORS.navy,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 42,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  brandMark: {
    width: 54,
    height: 54,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  brandMarkText: {
    color: COLORS.gold,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  brandMarkDot: {
    position: "absolute",
    width: 7,
    height: 7,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    top: 8,
    right: 8,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 5,
  },
  brandTagline: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 7,
  },
  loginCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    shadowColor: "#071321",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  headingContainer: {
    marginBottom: 25,
  },
  eyebrow: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 9,
  },
  heading: {
    color: COLORS.navy,
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  fieldLabel: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  roleSelector: {
    flexDirection: "row",
    backgroundColor: "#F1F3F6",
    borderRadius: 13,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.navy,
  },
  roleButtonText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  roleButtonTextSelected: {
    color: COLORS.white,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 22,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    color: COLORS.gold,
    fontSize: 18,
    width: 28,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 14,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
  },
  showPassword: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    paddingLeft: 8,
  },
  signInButton: {
    minHeight: 56,
    backgroundColor: COLORS.gold,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  signInText: {
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginHorizontal: 12,
  },
  createAccountButton: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  createAccountText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "700",
  },
  termsText: {
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
  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 25,
  },
    googleButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    backgroundColor: COLORS.white,
  },

  googleG: {
    color: "#4285F4",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 12,
  },

  googleButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
});