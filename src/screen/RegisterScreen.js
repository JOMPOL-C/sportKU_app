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
import { registerUser } from "../services/api";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("ผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      Alert.alert("สำเร็จ", "ลงทะเบียนสำเร็จ", [
        { text: "ตกลง", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert("ผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.brandSubtitle}>สร้างบัญชีเพื่อเริ่มจองสนามกีฬา</Text>

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
                placeholder="ชื่อ"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
              />

              <TextInput
                style={styles.input}
                placeholder="นามสกุล"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
              />

              <TextInput
                style={styles.input}
                placeholder="อีเมล"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="เบอร์โทร"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="รหัสผ่าน"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TextInput
                style={styles.input}
                placeholder="ยืนยันรหัสผ่าน"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.secondaryButtonText}>กลับไปหน้าเข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.registerPrompt}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.registerTextPrimary}>มีบัญชีอยู่แล้ว ? </Text>
              <Text style={styles.registerTextSecondary}>กดตรงนี้เพื่อเข้าสู่ระบบ</Text>
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
    marginBottom: 28,
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
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#1568B8",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#7EAAD4",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 4,
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D7DEE7",
    backgroundColor: "#F8FAFC",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
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

export default RegisterScreen;
