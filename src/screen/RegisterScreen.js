import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import CustomButton from "../components/CustomButton";
import SearchBox from "../components/SearchBox";
import { registerUser } from "../services/api";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("ผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      await registerUser(username, password);
      Alert.alert("สำเร็จ", "ลงทะเบียนสำเร็จ", [
        { text: "ตกลง", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (error) {
      Alert.alert("ผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ลงทะเบียน</Text>
      
      <SearchBox
        placeholder="ชื่อผู้ใช้"
        value={username}
        onChangeText={setUsername}
      />
      
      <SearchBox
        placeholder="รหัสผ่าน"
        secure={true}
        value={password}
        onChangeText={setPassword}
      />
      
      <SearchBox
        placeholder="ยืนยันรหัสผ่าน"
        secure={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      <CustomButton
        title={loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
        backgroundColor="orange"
        onPress={handleRegister}
        disabled={loading}
      />
      
      <CustomButton
        title="กลับไปหน้าเข้าสู่ระบบ"
        backgroundColor="purple"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6e6fa",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
});

export default RegisterScreen;
