import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getUserBookings } from "../services/api";
import { formatTimeSlots, parseStoredTimeSlots } from "../utils/timeSlots";
import SportShowcaseCard from "../components/SportShowcaseCard";

const formatBookingDate = (value) => {
  if (!value) {
    return "ไม่ระบุ";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const mapBookingStatus = (status) => {
  if (status === "confirmed") {
    return "จองสำเร็จ";
  }

  if (status === "pending") {
    return "กำลังดำเนินการ";
  }

  return status || "กำลังดำเนินการ";
};

const HistoryScreen = ({ route }) => {
  const user = route?.params?.user ?? null;
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookingHistory = useCallback(async () => {
    if (!user?.id) {
      setHistory([]);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);

    try {
      const historyData = await getUserBookings(user.id);
      setHistory(historyData);
    } catch (error) {
      console.error("ไม่สามารถโหลดประวัติการจองได้!", error);
      Alert.alert("เกิดข้อผิดพลาด", "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadBookingHistory();
    }, [loadBookingHistory])
  );

  const handleCardPress = (item) => {
    const sportName = item.display_sport_name || item.sport_name || "ไม่ระบุกีฬา";
    const courtName = item.display_court_name || item.court_name || "ไม่ระบุสนาม";

    Alert.alert(
      "รายละเอียดการจอง",
      `กีฬา: ${sportName}\n\nเวลา: ${formatTimeSlots(
        parseStoredTimeSlots(item.selected_times)
      )}\n\nสนาม: ${courtName}\n\nวันที่: ${formatBookingDate(
        item.booking_date
      )}\n\nสถานะ: ${mapBookingStatus(item.status)}`,
      [{ text: "ตกลง" }]
    );
  };

  const renderBookingItem = ({ item }) => {
    const sportName = item.display_sport_name || item.sport_name || "ไม่ระบุกีฬา";

    return (
      <SportShowcaseCard
        sport={{ name: sportName }}
        variant="history"
        style={styles.historyCard}
        onPress={() => handleCardPress(item)}
        historyMeta={{
          status: mapBookingStatus(item.status),
          time: formatTimeSlots(parseStoredTimeSlots(item.selected_times)),
          court: item.display_court_name || item.court_name || "ไม่ระบุสนาม",
          date: formatBookingDate(item.booking_date),
        }}
      />
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
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadBookingHistory}
              colors={["#111827"]}
              tintColor="#111827"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#888" />
          <Text style={styles.noHistoryText}>
            {user?.id ? "ยังไม่มีประวัติการจอง" : "กรุณาเข้าสู่ระบบใหม่"}
          </Text>
          {user?.id ? (
            <TouchableOpacity style={styles.refreshButton} onPress={loadBookingHistory}>
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.refreshText}> โหลดข้อมูลใหม่</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAF9",
  },
  header: {
    marginBottom: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2937",
  },
  headerDivider: {
    height: 3,
    width: 140,
    backgroundColor: "#111827",
    marginTop: 12,
    borderRadius: 999,
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noHistoryText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 15,
    marginBottom: 25,
    textAlign: "center",
  },
  refreshButton: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    elevation: 3,
  },
  refreshText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default HistoryScreen;
