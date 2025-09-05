import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import CustomButton from "../components/CustomButton";
import SearchBox from "../components/SearchBox";
import { loginUser } from "../services/api";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginUser(username, password);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>
      
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
      
      <CustomButton
        title={loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        backgroundColor="purple"
        onPress={handleLogin}
        disabled={loading}
      />
      
      <Text style={styles.noAccountText}>ยังไม่มีบัญชีใช่หรือไม่?</Text>
      
      <CustomButton
        title="สร้างบัญชีใหม่"
        backgroundColor="pink"
        onPress={() => navigation.navigate("Register")}
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
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#4b0082",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  reButtonText: {
    color: '#4b0082',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
