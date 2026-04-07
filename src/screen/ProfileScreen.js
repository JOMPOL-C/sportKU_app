import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { clearAllBookingsDebug, getAllBookingsDebug, getUserBookings } from "../services/api";
import { formatTimeSlots, parseStoredTimeSlots } from "../utils/timeSlots";

const ProfileScreen = ({ route, navigation }) => {
  const user = route?.params?.user ?? null;
  const [latestBooking, setLatestBooking] = useState(null);

  const loadLatestBooking = async () => {
    if (!user?.id) {
      setLatestBooking(null);
      return;
    }

    try {
      const bookings = await getUserBookings(user.id);
      setLatestBooking(bookings[0] || null);
    } catch (error) {
      console.error("ไม่สามารถโหลดกิจกรรมล่าสุดได้", error);
      setLatestBooking(null);
    }
  };

  useEffect(() => {
    loadLatestBooking();
  }, [user?.id]);

  const displayName = user?.name || user?.username || "ผู้ใช้งาน";
  const avatarInitials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }, [displayName]);

  const latestActivityTitle = latestBooking
    ? latestBooking.display_sport_name || latestBooking.sport_name || "ไม่ระบุกีฬา"
    : "ยังไม่มีกิจกรรม";
  const latestActivityMeta = latestBooking
    ? `${latestBooking.display_court_name || latestBooking.court_name || "ไม่ระบุสนาม"} • ${formatTimeSlots(
        parseStoredTimeSlots(latestBooking.selected_times)
      )}`
    : "เริ่มจองกีฬาแรกของคุณได้เลย";

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: () => {
          const parentNavigation = navigation.getParent?.() ?? navigation;
          parentNavigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  const handleShowDatabaseBookings = async () => {
    try {
      const bookings = await getAllBookingsDebug();

      if (bookings.length === 0) {
        Alert.alert("ฐานข้อมูลจริง", "ยังไม่มีรายการจองในฐานข้อมูลของแอป");
        return;
      }

      const previewText = bookings
        .slice(0, 8)
        .map((booking, index) => {
          const bookingDate = booking.booking_date
            ? new Date(booking.booking_date).toLocaleDateString("th-TH")
            : "ไม่ระบุวันที่";

          return `${index + 1}. ${booking.username || `user#${booking.user_id}`} • ${
            booking.sport_name || "ไม่ระบุกีฬา"
          } • ${booking.court_name || "ไม่ระบุสนาม"} • ${bookingDate}`;
        })
        .join("\n");

      const extraCount = bookings.length > 8 ? `\n\nและอีก ${bookings.length - 8} รายการ` : "";

      Alert.alert("ฐานข้อมูลจริง", `${previewText}${extraCount}`);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอ่านข้อมูลจากฐานข้อมูลได้");
    }
  };

  const handleClearDatabaseBookings = () => {
    Alert.alert(
      "ล้างข้อมูลจองทั้งหมด",
      "รายการจองในฐานข้อมูลของแอปจะถูกลบทั้งหมด ต้องการดำเนินการต่อหรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ล้างข้อมูล",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllBookingsDebug();
              await loadLatestBooking();
              Alert.alert("สำเร็จ", "ล้างข้อมูลจองในฐานข้อมูลของแอปแล้ว");
            } catch (error) {
              Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถล้างข้อมูลจองได้");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroSection}>
        <View style={styles.heroTopRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing} />
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarInitials || "U"}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.latestActivityBlock}>
            <Text style={styles.latestActivityLabel}>กิจกรรมล่าสุด</Text>
            <Text style={styles.latestActivityTitle}>{latestActivityTitle}</Text>
            <Text style={styles.latestActivityMeta}>{latestActivityMeta}</Text>
          </View>
        </View>

        <Text style={styles.heroName}>{displayName}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileEyebrow}>บัญชีของฉัน</Text>
        <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
        {user ? (
          <View style={styles.profileInfoList}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>ชื่อผู้ใช้</Text>
              <Text style={styles.profileValue}>{user.username}</Text>
            </View>
            {user.name ? (
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>ชื่อ</Text>
                <Text style={styles.profileValue}>{user.name}</Text>
              </View>
            ) : null}
            {user.email ? (
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>อีเมล</Text>
                <Text style={styles.profileValue}>{user.email}</Text>
              </View>
            ) : null}
            {user.phone ? (
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>โทรศัพท์</Text>
                <Text style={styles.profileValue}>{user.phone}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.noBookingsText}>ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่</Text>
        )}
      </View>

      {__DEV__ ? (
        <View style={styles.devSection}>
          <Text style={styles.profileEyebrow}>สำหรับพัฒนา</Text>
          <Text style={styles.sectionTitle}>ฐานข้อมูลจริงของแอป</Text>
          <Text style={styles.devText}>
            ใช้ส่วนนี้ดูรายการจองใน SQLite ที่แอปรันอยู่บน emulator ไม่ใช่ไฟล์ใน assets
          </Text>

          <TouchableOpacity
            style={styles.devPrimaryButton}
            onPress={handleShowDatabaseBookings}
            activeOpacity={0.85}
          >
            <MaterialIcons name="storage" size={18} color="#fff" />
            <Text style={styles.devPrimaryButtonText}>ดู bookings ในฐานข้อมูล</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.devSecondaryButton}
            onPress={handleClearDatabaseBookings}
            activeOpacity={0.85}
          >
            <MaterialIcons name="delete-outline" size={18} color="#B42318" />
            <Text style={styles.devSecondaryButtonText}>ล้างข้อมูลจองทั้งหมด</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={18} color="#fff" />
        <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  heroSection: {
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrap: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  avatarRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#1B80A8',
    borderTopColor: 'transparent',
    borderRightColor: '#1B80A8',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  heroDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#D6D3D1',
    marginRight: 18,
  },
  latestActivityBlock: {
    flex: 1,
  },
  latestActivityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  latestActivityTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  latestActivityMeta: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECE7E1',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1F2937',
  },
  profileEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  profileInfoList: {
    gap: 8,
  },
  profileInfoRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 3,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  devSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECE7E1',
  },
  devText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginBottom: 14,
  },
  devPrimaryButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  devPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  devSecondaryButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3CACA',
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  devSecondaryButtonText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  noBookingsText: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 16,
  },
});

export default ProfileScreen;
