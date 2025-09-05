import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView,
  Image,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [popularCourts, setPopularCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    try {
      const favData = await AsyncStorage.getItem("favorites");
      setFavorites(favData ? JSON.parse(favData) : []);
      setError(null);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setError("ไม่สามารถโหลดรายการโปรดได้");
    }
  };

  const loadBookingHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem("bookingHistory");
      const bookings = historyData ? JSON.parse(historyData) : [];
      
      const courtCounts = {};
      bookings.forEach(booking => {
        const key = `${booking.sport}-${booking.selectedCourt}`;
        courtCounts[key] = {
          sport: booking.sport,
          court: booking.selectedCourt,
          count: (courtCounts[key]?.count || 0) + 1
        };
      });
      
      setPopularCourts(
        Object.values(courtCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Error loading booking history:", error);
      setError("ไม่สามารถโหลดประวัติการจองได้");
    }
  };

  const clearBookingHistory = async () => {
    Alert.alert(
      "ยืนยันการล้างประวัติ",
      "คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการจองทั้งหมด?",
      [
        { text: "ยกเลิก", style: "cancel" },
        { 
          text: "ล้างข้อมูล", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("bookingHistory");
              setPopularCourts([]);
              Alert.alert("สำเร็จ", "ล้างประวัติการจองเรียบร้อยแล้ว");
            } catch (error) {
              Alert.alert("ผิดพลาด", "ไม่สามารถล้างประวัติได้");
            }
          }
        }
      ]
    );
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadFavorites(), loadBookingHistory()]);
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Booking", { sport: item })}
    >
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDetail}>ประเภท: {item.type}</Text>
      <Text style={styles.cardDetail}>ราคา: {item.price} บาท/ชม.</Text>
    </TouchableOpacity>
  );

  const renderPopularCourt = ({ item, index }) => (
    <TouchableOpacity style={styles.popularCard}>
      <Text style={styles.popularCourtTitle}>{item.court}</Text>
      <Text style={styles.popularCourtSport}>กีฬา: {item.sport}</Text>
      <Text style={styles.popularCourtCount}>จองแล้ว {item.count} ครั้ง</Text>
      {index < 3 && <Text style={styles.topBadge}>TOP {index + 1}</Text>}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryText}>ลองอีกครั้ง</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>จองสนามกีฬา</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>กีฬารายการโปรด</Text>
          <TouchableOpacity onPress={clearBookingHistory}>
            <Text style={styles.clearButton}>ล้างประวัติ</Text>
          </TouchableOpacity>
        </View>

        {favorites.length > 0 ? (
          <FlatList
            horizontal
            data={favorites}
            renderItem={renderFavoriteItem}
            contentContainerStyle={styles.listContainer}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <Text style={styles.emptyText}>ยังไม่มีกีฬาในรายการโปรด</Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>สนามยอดนิยม</Text>
        </View>

        {popularCourts.length > 0 ? (
          <FlatList
            horizontal
            data={popularCourts}
            renderItem={renderPopularCourt}
            contentContainerStyle={styles.listContainer}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text style={styles.emptyText}>ยังไม่มีข้อมูลสนามยอดนิยม</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 5
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  headerContainer: {
    backgroundColor: "#a91e00",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    color: "#e74c3c",
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 8,
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 160,
    alignItems: 'center'
  },
  cardImage: {
    width: 120,
    height: 80,
    borderRadius: 6,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
    textAlign: 'center'
  },
  cardDetail: {
    fontSize: 14,
    color: "#666",
    textAlign: 'center'
  },
  popularCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 160,
    position: "relative",
  },
  popularCourtTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  popularCourtSport: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  popularCourtCount: {
    fontSize: 14,
    color: "#666",
  },
  topBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 12,
    color: "#e74c3c",
    fontWeight: "500",
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginVertical: 16,
  },
});

export default HomeScreen;