import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { storeStorageData } from "../services/storage";
import QRCode from 'react-native-qrcode-svg';
import generatePayload from "promptpay-qr";

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { params = {} } = route;
  const { selectedTimes = [], selectedCourt = "ไม่ระบุ", sport = {} } = params;

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [qrSvg, setQrSvg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateAmount = (timeSlots) => {
    if (!Array.isArray(timeSlots)) return 0;
    
    const totalHours = timeSlots.reduce((sum, slot) => {
      if (!slot) return sum;
      
      const [start, end] = slot.split('-');
      if (!start || !end) return sum;
      
      const startHour = parseInt(start.split(':')[0], 10) || 0;
      const endHour = parseInt(end.split(':')[0], 10) || 0;
      return sum + (Math.max(0, endHour - startHour));
    }, 0);
    
    const pricePerHour = Number(sport.price) || 0;
    return totalHours * pricePerHour;
  };

  const amount = calculateAmount(selectedTimes);
  const promptPayInfo = {
    phoneNumber: "0942109053",
    name: "สนามกีฬา ABC",
    amount
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = generatePayload(promptPayInfo.phoneNumber, { amount: promptPayInfo.amount });
      setQrSvg(payload);
    } catch (err) {
      console.error("QR generation error:", err);
      setError("ไม่สามารถสร้าง QR Code ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async () => {
    const newBooking = {
      sport: sport.name || "ไม่ระบุกีฬา",
      selectedTimes: Array.isArray(selectedTimes) ? selectedTimes : [],
      selectedCourt,
      date: new Date().toLocaleDateString('th-TH'),
      status: "จองสำเร็จ",
      paymentMethod: "พร้อมเพย์",
      amount,
      paymentDetails: {
        promptPayNumber: promptPayInfo.phoneNumber,
        paymentTime: new Date().toLocaleTimeString('th-TH')
      }
    };

    try {
      const storedHistory = await getStorageData("bookingHistory");
      const historyData = Array.isArray(storedHistory) ? storedHistory : [];
      historyData.push(newBooking);
      
      await storeStorageData("bookingHistory", historyData);
      setPaymentConfirmed(true);
      
      Alert.alert(
        "การจองสำเร็จ",
        `คุณได้จอง ${sport.name || "ไม่ระบุ"} ${selectedCourt} เวลา ${selectedTimes.join(', ') || "ไม่ระบุ"}`,
        [{ 
          text: "ตกลง", 
          onPress: () => navigation.navigate("Homepage")
        }]
      );
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลการจองได้");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... (ส่วนที่เหลือของโค้ดคงเดิม) ... */}
    </View>
  );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    infoContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 5
    },
    value: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        paddingLeft: 15
    },
    amountText: {
        fontSize: 18,
        color: '#e91e63',
        fontWeight: 'bold',
        paddingLeft: 15
    },
    qrContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 2
    },
    qrTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    qrCodeWrapper: {
        marginVertical: 15
    },
    paymentDetails: {
        marginTop: 10,
        width: '100%'
    },
    promptPayInfo: {
        fontSize: 16,
        marginVertical: 3
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#555'
    },
    confirmButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    disabledButton: {
        backgroundColor: '#cccccc'
    },
    confirmText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold'
    },
    errorContainer: {
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        color: 'red',
        marginBottom: 10
    },
    retryButton: {
        backgroundColor: '#ff6f61',
        padding: 10,
        borderRadius: 5
    },
    retryText: {
        color: '#fff'
    },
    successContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2
    },
    successText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: 10
    },
    receiptText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20
    },
    historyButton: {
        backgroundColor: "#ff6f61",
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center'
    },
    historyButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold'
    }
});
export default PaymentScreen;