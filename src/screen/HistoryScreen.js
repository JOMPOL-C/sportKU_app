import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookingHistory = async () => {
    setRefreshing(true);
    try {
      const storedHistory = await AsyncStorage.getItem("bookingHistory");
      const historyData = storedHistory ? JSON.parse(storedHistory) : [];
      setHistory(historyData.reverse());
    } catch (error) {
      console.error("ไม่สามารถโหลดประวัติการจองได้!", error);
      Alert.alert("เกิดข้อผิดพลาด", "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookingHistory();
  }, []);

  const handleCardPress = (item) => {
    Alert.alert(
      "📋 รายละเอียดการจอง",
      `กีฬา: ${item.sport}\n\n เวลา: ${item.selectedTimes?.join(", ") ||
         "ไม่ระบุ"}\n\n สนาม: ${item.selectedCourt}\n\n วันที่: ${item.date || 
            "ไม่ระบุ"}\n\n สถานะ: ${item.status || "กำลังดำเนินการ"}`,
      [
        { text: "ตกลง" }
      ]
    );
  };

  const renderBookingItem = ({ item }) => {
    const sportName = typeof item.sport === 'object' ? item.sport.name : item.sport;
    const isSuccess = item.status === "จองสำเร็จ";

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.sportIconContainer}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "time"} 
              size={24} 
              color={isSuccess ? "#4CAF50" : "#FFC107"} 
            />
            <Text style={styles.sportText}>{sportName || "ไม่ระบุกีฬา"}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            isSuccess ? styles.successBadge : styles.pendingBadge
          ]}>
            <Text style={styles.statusText}>
              {item.status || "กำลังดำเนินการ"}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color="#555" />
          <Text style={styles.historyText}> {item.selectedTimes?.join(", ") || "ไม่ระบุ"}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={styles.historyText}> {item.selectedCourt || "ไม่ระบุ"}</Text>
        </View>
        
        {item.date && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#555" />
            <Text style={styles.historyText}> {item.date}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ประวัติการจอง</Text>
          <View style={styles.headerDivider} />
        </View>
        
        {history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderBookingItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadBookingHistory}
                colors={["#FF6B6B"]}
                tintColor="#FF6B6B"
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#888" />
            <Text style={styles.noHistoryText}>ยังไม่มีประวัติการจอง</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadBookingHistory}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.refreshText}> โหลดข้อมูลใหม่</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.92)'
  },
  header: {
    marginBottom: 25,
    alignItems: 'center'
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: '#2C3E50',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  headerDivider: {
    height: 3,
    width: '30%',
    backgroundColor: '#FF6B6B',
    marginTop: 10,
    borderRadius: 3
  },
  listContainer: {
    paddingBottom: 20
  },
  historyItem: {
    backgroundColor: "#FFF",
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B6B'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  sportIconContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sportText: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  successBadge: {
    backgroundColor: '#E8F5E9'
  },
  pendingBadge: {
    backgroundColor: '#FFF8E1'
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  historyText: { 
    fontSize: 16, 
    color: '#555',
    marginLeft: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  noHistoryText: { 
    fontSize: 18, 
    color: "#7F8C8D",
    marginTop: 15,
    marginBottom: 25,
    textAlign: 'center'
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    elevation: 3
  },
  refreshText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5
  }
});

export default HistoryScreen;