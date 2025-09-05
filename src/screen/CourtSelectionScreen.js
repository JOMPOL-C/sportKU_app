import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const CourtSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { params = {} } = route;
  const { selectedTimes = [], courts = 0, sport = {} } = params;

  const [selectedCourt, setSelectedCourt] = useState(null);

  const courtList = Array.from(
    { length: Math.max(0, Number(courts) || 0) }, 
    (_, i) => `สนาม ${i + 1}`
  );

  const handleConfirm = () => {
    if (!selectedCourt) {
      Alert.alert("กรุณาเลือกสนามก่อน");
      return;
    }

    navigation.navigate("Payment", { 
      selectedTimes, 
      selectedCourt,
      sport 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>เลือกสนามสำหรับ {sport.name || "ไม่ระบุ"}</Text>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {courtList.map((court, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                selectedCourt === court && styles.selectedCard
              ]}
              onPress={() => setSelectedCourt(court)}
            >
              <Text style={[
                styles.cardText,
                selectedCourt === court && styles.selectedText
              ]}>
                {court}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedCourt && styles.disabledButton
            ]}
            onPress={handleConfirm}
            disabled={!selectedCourt}
          >
            <Text style={styles.confirmText}>ยืนยันการจอง</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    container: { 
        flex: 1,
        paddingHorizontal: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: { 
        fontSize: 22, 
        fontWeight: "bold", 
        marginVertical: 20,
        color: '#2c3e50',
        textAlign: 'center'
    },
    scrollContent: {
        paddingBottom: 100, // ให้เนื้อหาอยู่เหนือปุ่มยืนยัน
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        marginBottom: 15,
        borderRadius: 10,
        elevation: 3,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#ddd'
    },
    selectedCard: { 
        backgroundColor: "#ff6f61",
        borderColor: '#ff6f61'
    },
    cardText: { 
        fontSize: 18, 
        fontWeight: "600", 
        color: "#333" 
    },
    selectedText: { 
        color: "#fff" 
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    confirmButton: {
        backgroundColor: "#28a745", 
        padding: 16, 
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3
    },
    disabledButton: { 
        backgroundColor: "#95a5a6" 
    },
    confirmText: { 
        color: "#fff", 
        fontSize: 18,
        fontWeight: 'bold'
    },
    errorText: { 
        color: "red", 
        fontSize: 18, 
        marginBottom: 20 
    },
    backButton: {
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center'
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});

export default CourtSelectionScreen;