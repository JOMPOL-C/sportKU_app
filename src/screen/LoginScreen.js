import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { loginUser } from "../services/api";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setLoading(true);

    try {
      const user = await loginUser(username.trim(), password);
      navigation.reset({
        index: 0,
        routes: [{ name: "Homepage", params: { user } }],
      });
    } catch (error) {
      Alert.alert("เข้าสู่ระบบผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnavailableFeature = (featureName) => {
    Alert.alert("ยังไม่พร้อมใช้งาน", `${featureName} จะเปิดให้ใช้งานในเวอร์ชันถัดไป`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <View style={styles.logoCard}>
              <View style={styles.logoColumn}>
                <View style={styles.logoDotSolid} />
                <View style={styles.logoDotOutline} />
              </View>
              <View style={styles.logoDivider} />
              <View style={styles.logoColumnRight}>
                <MaterialCommunityIcons name="run-fast" size={20} color="#FFFFFF" />
                <MaterialCommunityIcons name="swim" size={18} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.brandTitle}>SPORT KU KPS</Text>
            <Text style={styles.brandSubtitle}>แอปพลิเคชัน จองสนามกีฬา</Text>

            <View style={styles.formBlock}>
              <TextInput
                style={styles.input}
                placeholder="ชื่อผู้ใช้"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="รหัสผ่าน"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleUnavailableFeature("ลืมรหัสผ่าน")}
                >
                  <Text style={styles.forgotText}>ลืมรหัสผ่าน ?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialBlock}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => handleUnavailableFeature("Google Sign In")}
              >
                <AntDesign name="google" size={22} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.socialButtonHalf, styles.linkedinButton]}
                  onPress={() => handleUnavailableFeature("LinkedIn Sign In")}
                >
                  <AntDesign name="linkedin-square" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>LinkedIn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.socialButtonHalf, styles.instagramButton]}
                  onPress={() => handleUnavailableFeature("Instagram Sign In")}
                >
                  <AntDesign name="instagram" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Instagram</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.registerPrompt}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerTextPrimary}>ยังไม่มีสมาชิก ? </Text>
              <Text style={styles.registerTextSecondary}>กดตรงนี้เพื่อลงทะเบียน</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  shell: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 24,
    paddingTop: 92,
    paddingBottom: 28,
  },
  logoCard: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#1568B8",
    alignSelf: "center",
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0E4C84",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  logoColumn: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 34,
    marginRight: 10,
  },
  logoColumnRight: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 38,
    marginLeft: 10,
  },
  logoDotSolid: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  logoDotOutline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: "#FFFFFF",
  },
  logoDivider: {
    width: 2,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderRadius: 999,
  },
  brandTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    color: "#232323",
    marginBottom: 6,
  },
  brandSubtitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#2F2F2F",
    marginBottom: 34,
  },
  formBlock: {
    marginBottom: 22,
  },
  input: {
    backgroundColor: "#FFFFFF",
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#EEF1F4",
    marginBottom: 14,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionRow: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  loginButton: {
    minWidth: 156,
    backgroundColor: "#1568B8",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#7EAAD4",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#3F3F46",
    opacity: 0.72,
    borderRadius: 999,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#1F1F1F",
  },
  socialBlock: {
    marginBottom: 40,
  },
  socialButton: {
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#0C233D",
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButtonHalf: {
    width: "48.5%",
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  linkedinButton: {
    backgroundColor: "#1E466E",
  },
  instagramButton: {
    backgroundColor: "#1568B8",
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
  registerPrompt: {
    marginTop: "auto",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  registerTextPrimary: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2A2A2A",
  },
  registerTextSecondary: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8C8C8C",
  },
});

export default LoginScreen;
