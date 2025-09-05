import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { getUserBookings } from "../services/api";

const ProfileScreen = ({ route }) => {
  const { user } = route.params;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userBookings = await getUserBookings(user.id);
        setBookings(userBookings);
      } catch (error) {
        Alert.alert("ผิดพลาด", "ไม่สามารถโหลดประวัติการจองได้");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
        <Text style={styles.profileText}>ชื่อผู้ใช้: {user.username}</Text>
        {user.name && <Text style={styles.profileText}>ชื่อ: {user.name}</Text>}
        {user.email && <Text style={styles.profileText}>อีเมล: {user.email}</Text>}
        {user.phone && <Text style={styles.profileText}>โทรศัพท์: {user.phone}</Text>}
      </View>

      <View style={styles.bookingsSection}>
        <Text style={styles.sectionTitle}>ประวัติการจอง</Text>
        
        {loading ? (
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        ) : bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <View key={index} style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>{booking.sport_name} - {booking.court_name}</Text>
              <Text style={styles.bookingText}>เวลา: {JSON.parse(booking.selected_times).join(", ")}</Text>
              <Text style={styles.bookingText}>วันที่: {new Date(booking.booking_date).toLocaleDateString()}</Text>
              <Text style={styles.bookingStatus}>สถานะ: {booking.status}</Text>
            </View>
          ))?? []
        ) : (
          <Text style={styles.noBookingsText}>ยังไม่มีประวัติการจอง</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  bookingsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  profileText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  bookingCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  bookingText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  bookingStatus: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  noBookingsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 16,
  },
});

export default ProfileScreen;