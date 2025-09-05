import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const availableTimes = [
  "09:00-10:00", "10:00-11:00", "11:00-12:00", 
  "12:00-13:00", "13:00-14:00", "14:00-15:00", 
  "15:00-16:00"
];

const BookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { params = {} } = route;
  const sport = params.sport || { 
    name: "ไม่ระบุกีฬา", 
    courts: 0,
    price: 0
  };

  const [selectedTimes, setSelectedTimes] = useState([]);

  const mergeTimeSlots = (times) => {
    if (!Array.isArray(times) || times.length === 0) return [];
    
    const validTimes = times.filter(time => {
      const parts = time?.split('-');
      return parts?.length === 2 && parts[0] && parts[1];
    });

    const sorted = [...validTimes].sort();
    const merged = [];
    let current = sorted[0].split('-');
    
    for (let i = 1; i < sorted.length; i++) {
      const [start, end] = sorted[i].split('-');
      if (start === current[1]) {
        current[1] = end;
      } else {
        merged.push(current.join('-'));
        current = [start, end];
      }
    }
    merged.push(current.join('-'));
    
    return merged;
  };

  const toggleTime = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time) 
        ? prev.filter((t) => t !== time) 
        : prev.length < 3 
          ? [...prev, time] 
          : prev
    );
  };

  const handleConfirm = () => {
    const mergedTimes = mergeTimeSlots(selectedTimes);
    if (mergedTimes.length === 0) {
      Alert.alert("กรุณาเลือกเวลาก่อน");
      return;
    }

    navigation.navigate("CourtSelection", {
      selectedTimes: mergedTimes,
      courts: sport.courts,
      sport: sport,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {sport.name ? `เลือกเวลาสำหรับ ${sport.name}` : "เลือกเวลา"}
        </Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.timeContainer}>
        {availableTimes.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeButton, 
              selectedTimes.includes(time) && styles.selectedTime
            ]}
            onPress={() => toggleTime(time)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.timeText,
              selectedTimes.includes(time) && styles.selectedTimeText
            ]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          selectedTimes.length === 0 && styles.disabledButton
        ]}
        onPress={handleConfirm}
        disabled={selectedTimes.length === 0}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmText}>ยืนยัน</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        alignItems: "center", 
        padding: 25,
        paddingTop: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    header: {
        width: '100%',
        marginBottom: 25,
        alignItems: 'center'
    },
    title: { 
        fontSize: 26,
        fontWeight: "bold", 
        marginBottom: 15,
        color: '#2c3e50',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    divider: {
        height: 3,
        width: '30%',
        backgroundColor: '#ff6f61',
        borderRadius: 3
    },
    timeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20
    },
    timeButton: { 
        backgroundColor: "#fff",
        padding: 18,
        margin: 10,
        borderRadius: 12,
        width: '42%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    selectedTime: { 
        backgroundColor: "#ff6f61",
        borderColor: '#ff6f61',
        shadowColor: '#ff6f61',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    timeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500'
    },
    selectedTimeText: {
        color: '#fff',
        fontWeight: '600'
    },
    confirmButton: {
        backgroundColor: "#28a745",
        padding: 18,
        borderRadius: 12,
        marginTop: 20,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5
    },
    disabledButton: { 
        backgroundColor: "#95a5a6",
        shadowColor: '#95a5a6' 
    },
    confirmText: { 
        color: "#fff", 
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    }
});

export default BookingScreen;