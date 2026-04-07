import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { saveBooking } from "../services/api";
import QRCode from "react-native-qrcode-svg";
import generatePayload from "promptpay-qr";
import { formatTimeSlots } from "../utils/timeSlots";

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { params = {} } = route;
  const { selectedTimes = [], selectedCourt = "ไม่ระบุ", sport = {}, user = null } = params;

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [qrSvg, setQrSvg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const successScale = useRef(new Animated.Value(0.4)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successPulse = useRef(new Animated.Value(0.8)).current;

  const bookingTimestamp = useMemo(() => new Date(), []);
  const selectedCourtLabel =
    selectedCourt?.name || selectedCourt?.court_name || selectedCourt || "ไม่ระบุ";

  const calculateAmount = (timeSlots) => {
    if (!Array.isArray(timeSlots)) return 0;

    const totalHours = timeSlots.reduce((sum, slot) => {
      if (!slot) return sum;

      const label = slot.label || slot;
      const startTime = slot.startTime || slot.start_time || String(label).split("-")[0];
      const endTime = slot.endTime || slot.end_time || String(label).split("-")[1];
      const [start, end] = [startTime, endTime];

      if (!start || !end) return sum;

      const startHour = parseInt(start.split(":")[0], 10) || 0;
      const endHour = parseInt(end.split(":")[0], 10) || 0;
      return sum + Math.max(0, endHour - startHour);
    }, 0);

    const pricePerHour = Number(sport.price) || 0;
    return totalHours * pricePerHour;
  };

  const amount = calculateAmount(selectedTimes);
  const bookingDateLabel = bookingTimestamp.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const bookingTimeLabel = formatTimeSlots(selectedTimes);

  const promptPayInfo = {
    phoneNumber: "0942109053",
    name: "สนามกีฬา ABC",
    amount,
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  useEffect(() => {
    navigation.setOptions({ headerShown: !paymentConfirmed });

    if (!paymentConfirmed) {
      successScale.setValue(0.4);
      successOpacity.setValue(0);
      successPulse.setValue(0.8);
      return;
    }

    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(successPulse, {
          toValue: 1.08,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(successPulse, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    navigation,
    paymentConfirmed,
    successOpacity,
    successPulse,
    successScale,
  ]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = generatePayload(promptPayInfo.phoneNumber, {
        amount: promptPayInfo.amount,
      });
      setQrSvg(payload);
    } catch (err) {
      console.error("QR generation error:", err);
      setError("ไม่สามารถสร้าง QR Code ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!user?.id) {
      Alert.alert("ไม่สามารถทำรายการได้", "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    try {
      await saveBooking(user.id, {
        sport,
        selectedCourt,
        selectedTimes,
        amount,
        paymentMethod: "promptpay",
      });
      setPaymentConfirmed(true);
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", err?.message || "ไม่สามารถบันทึกข้อมูลการจองได้");
      console.error(err);
    }
  };

  if (paymentConfirmed) {
    return (
      <View style={styles.successScreen}>
        <Text style={styles.successTitle}>จองสำเร็จ</Text>
        <Text style={styles.successSubtitle}>
          {sport.name || "ไม่ระบุกีฬา"} • {selectedCourtLabel} • {bookingTimeLabel}
        </Text>

        <Animated.View
          style={[
            styles.successIconWrap,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.successPulseRing,
              {
                opacity: successOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.22],
                }),
                transform: [{ scale: successPulse }],
              },
            ]}
          />
          <View style={styles.successCircle}>
            <MaterialIcons name="check" size={78} color="#FFFFFF" />
          </View>
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.successConfirmButton}
          onPress={() => navigation.replace("Homepage", { user })}
        >
          <Text style={styles.successConfirmText}>ยืนยัน</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.successActionButton}
          onPress={() => navigation.replace("Search", { user })}
        >
          <Text style={styles.successActionText}>ค้นหากิจกรรมอื่นๆ</Text>
          <MaterialIcons name="search" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <MaterialIcons name="qr-code-2" size={18} color="#FFFFFF" />
          <Text style={styles.heroBadgeText}>พร้อมเพย์</Text>
        </View>
        <Text style={styles.title}>ชำระเงินค่าจองสนาม</Text>
        <Text style={styles.subtitle}>
          ตรวจสอบรายละเอียดให้เรียบร้อย แล้วสแกน QR เพื่อชำระเงินได้ทันที
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>รายละเอียดการจอง</Text>
          <View style={styles.amountPill}>
            <MaterialIcons name="payments" size={16} color="#FFFFFF" />
            <Text style={styles.amountPillText}>{amount.toLocaleString("th-TH")} บาท</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <MaterialIcons name="sports-soccer" size={22} color="#0D4E68" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>กีฬา</Text>
              <Text style={styles.infoValue}>{sport.name || "ไม่ระบุกีฬา"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="stadium" size={22} color="#0D4E68" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>สนาม</Text>
              <Text style={styles.infoValue}>{selectedCourtLabel}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#0D4E68" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>วันที่</Text>
              <Text style={styles.infoValue}>{bookingDateLabel}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={22} color="#0D4E68" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>เวลา</Text>
              <Text style={styles.infoValue}>{bookingTimeLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.qrCard}>
        <View style={styles.qrHeader}>
          <Text style={styles.sectionTitle}>สแกนเพื่อชำระเงิน</Text>
          <Text style={styles.qrSubtitle}>ยอดสุทธิ {amount.toLocaleString("th-TH")} บาท</Text>
        </View>

        {isLoading ? (
          <View style={styles.qrState}>
            <ActivityIndicator size="large" color="#0D4E68" />
            <Text style={styles.qrStateText}>กำลังสร้าง QR Code...</Text>
          </View>
        ) : error ? (
          <View style={styles.qrState}>
            <MaterialIcons name="error-outline" size={34} color="#B42318" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={generateQRCode}>
              <Text style={styles.retryText}>ลองอีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.qrCodeWrapper}>
              <QRCode value={qrSvg || "promptpay"} size={220} />
            </View>

            <View style={styles.accountCard}>
              <View style={styles.accountRow}>
                <MaterialIcons name="smartphone" size={20} color="#555B66" />
                <Text style={styles.accountText}>เบอร์พร้อมเพย์: {promptPayInfo.phoneNumber}</Text>
              </View>
              <View style={styles.accountRow}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#555B66" />
                <Text style={styles.accountText}>ชื่อบัญชี: {promptPayInfo.name}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          (isLoading || !!error || paymentConfirmed) && styles.disabledButton,
        ]}
        onPress={confirmBooking}
        disabled={isLoading || !!error || paymentConfirmed}
      >
        <MaterialIcons
          name={paymentConfirmed ? "check-circle" : "verified"}
          size={22}
          color="#FFFFFF"
        />
        <Text style={styles.confirmText}>
          {paymentConfirmed ? "ชำระเงินแล้ว" : "ยืนยันการชำระเงิน"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: "#F6F3EE",
  },
  heroCard: {
    backgroundColor: "#0D4E68",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.82)",
  },
  summaryCard: {
    backgroundColor: "#FFFDFC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9DED4",
    shadowColor: "#221E18",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1F1F",
  },
  amountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B80A8",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  amountPillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF7FB",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  infoTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A736D",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F1F1F",
  },
  qrCard: {
    backgroundColor: "#FFFDFC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E9DED4",
    shadowColor: "#221E18",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  qrHeader: {
    alignItems: "center",
    marginBottom: 18,
  },
  qrSubtitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#6A625B",
  },
  qrState: {
    alignItems: "center",
    paddingVertical: 28,
  },
  qrStateText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6A625B",
  },
  qrCodeWrapper: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  accountCard: {
    backgroundColor: "#EEF7FB",
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#343434",
  },
  confirmButton: {
    backgroundColor: "#1B80A8",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#0B5F7E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#9BA6A0",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 8,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 14,
    fontSize: 15,
    textAlign: "center",
    color: "#B42318",
  },
  retryButton: {
    backgroundColor: "#0D4E68",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  successScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 28,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1F1F1F",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#6A625B",
    marginBottom: 72,
  },
  successIconWrap: {
    width: 184,
    height: 184,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 84,
  },
  successPulseRing: {
    position: "absolute",
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: "#1B80A8",
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#1B80A8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B5F7E",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  successConfirmButton: {
    minWidth: 168,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#CFE6F1",
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successConfirmText: {
    color: "#1B80A8",
    fontSize: 17,
    fontWeight: "800",
  },
  successActionButton: {
    marginTop: "auto",
    width: "100%",
    backgroundColor: "#1B80A8",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0B5F7E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  successActionText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginRight: 10,
  },
});

export default PaymentScreen;
