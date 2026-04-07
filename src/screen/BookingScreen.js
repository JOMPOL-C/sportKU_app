import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getBookedTimeSlotsForCourt, getCourtsBySport, getTimeSlots } from "../services/api";
import { formatTimeSlots, hasTimeConflict } from "../utils/timeSlots";

const BookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { params = {} } = route;
  const sport = params.sport || {
    name: "ไม่ระบุกีฬา",
    courts: 0,
    price: 0,
  };
  const user = params.user || null;

  const [selectedCourt, setSelectedCourt] = useState(null);
  const [isCourtDropdownOpen, setIsCourtDropdownOpen] = useState(false);
  const [selectedTimeSelections, setSelectedTimeSelections] = useState([
    null,
    null,
    null,
  ]);
  const [openTimeDropdownIndex, setOpenTimeDropdownIndex] = useState(null);
  const [courts, setCourts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookingOptions = async () => {
      if (!sport?.id) {
        setError("ไม่พบข้อมูลกีฬา");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [courtData, slotData] = await Promise.all([
          getCourtsBySport(sport.id),
          getTimeSlots(),
        ]);

        setCourts(courtData);
        setTimeSlots(slotData);
      } catch (loadError) {
        console.error("ไม่สามารถโหลดข้อมูลการจองได้:", loadError);
        setError("ไม่สามารถโหลดข้อมูลสนามหรือช่วงเวลาได้ กรุณาลองใหม่");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingOptions();
  }, [sport?.id]);

  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!selectedCourt?.id || !sport?.id) {
        setBookedSlots([]);
        return;
      }

      setIsCheckingAvailability(true);

      try {
        const existingBookedSlots = await getBookedTimeSlotsForCourt({
          sport,
          selectedCourt,
        });
        setBookedSlots(existingBookedSlots);
      } catch (loadError) {
        console.error("ไม่สามารถโหลดช่วงเวลาที่ถูกจองได้:", loadError);
        setBookedSlots([]);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    loadBookedSlots();
  }, [selectedCourt, sport]);

  const selectedTimes = useMemo(
    () => selectedTimeSelections.filter(Boolean),
    [selectedTimeSelections]
  );

  const visibleTimeIndexes = useMemo(() => {
    const indexes = [0];

    if (selectedTimeSelections[0]) {
      indexes.push(1);
    }

    if (selectedTimeSelections[1]) {
      indexes.push(2);
    }

    return indexes;
  }, [selectedTimeSelections]);

  const getAvailableTimeOptions = (index) => {
    const reservedIds = selectedTimeSelections
      .filter((slot, slotIndex) => slot && slotIndex !== index)
      .map((slot) => slot.id);

    return timeSlots.filter(
      (slot) =>
        !reservedIds.includes(slot.id) &&
        !hasTimeConflict(bookedSlots, [
          {
            id: slot.id,
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        ])
    );
  };

  const handleSelectTime = (index, slot) => {
    setSelectedTimeSelections((prev) => {
      const nextSelections = [...prev];
      nextSelections[index] = slot;

      return nextSelections;
    });
    setOpenTimeDropdownIndex(null);
  };

  const handleClearTime = (index) => {
    setSelectedTimeSelections((prev) =>
      prev.map((slot, slotIndex) => (slotIndex < index ? slot : null))
    );
    setOpenTimeDropdownIndex(null);
  };

  const handleConfirm = () => {
    if (!selectedCourt) {
      Alert.alert("กรุณาเลือกสนามก่อน");
      return;
    }

    if (selectedTimes.length === 0) {
      Alert.alert("กรุณาเลือกเวลาอย่างน้อย 1 ช่วง");
      return;
    }

    navigation.navigate("Payment", {
      selectedTimes,
      selectedCourt,
      sport,
      user,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#5F6368" />
        <Text style={styles.centerStateText}>กำลังโหลดสนามและช่วงเวลา...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>จองสนามกีฬา</Text>
        <Text style={styles.heroTitle}>{sport.name || "ไม่ระบุกีฬา"}</Text>
        <Text style={styles.heroSubtitle}>
          เลือกสนามก่อน แล้วค่อยเลือกเวลาได้สูงสุด 3 ช่วง
        </Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <MaterialIcons name="stadium" size={16} color="#111827" />
            <Text style={styles.heroMetaText}>{courts.length} สนาม</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <MaterialIcons name="payments" size={16} color="#111827" />
            <Text style={styles.heroMetaText}>{sport.price || 0} บาท/ชม.</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. เลือกสนาม</Text>
        <Text style={styles.sectionDescription}>เลือกสนามที่ต้องการก่อนเริ่มเลือกเวลา</Text>

        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.dropdownTrigger,
              isCourtDropdownOpen && styles.dropdownTriggerOpen,
              selectedCourt && styles.dropdownTriggerSelected,
            ]}
            onPress={() => setIsCourtDropdownOpen((prev) => !prev)}
          >
            <View style={styles.dropdownTriggerTextWrap}>
              <Text style={styles.dropdownLabel}>สนามที่เลือก</Text>
              <Text style={styles.dropdownValue}>
                {selectedCourt?.name || "กดเพื่อเลือกสนาม"}
              </Text>
            </View>
            <MaterialIcons
              name={isCourtDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={28}
              color="#4F5358"
            />
          </TouchableOpacity>

          {isCourtDropdownOpen ? (
            <View style={styles.dropdownMenu}>
              {courts.map((court, index) => {
                const isSelected = selectedCourt?.id === court.id;

                return (
                  <TouchableOpacity
                    key={court.id}
                    activeOpacity={0.85}
                    style={[
                      styles.dropdownItem,
                      index === courts.length - 1 && styles.dropdownItemLast,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCourt(court);
                      setIsCourtDropdownOpen(false);
                      setOpenTimeDropdownIndex(null);
                      setSelectedTimeSelections([null, null, null]);
                    }}
                  >
                    <View>
                      <Text style={styles.dropdownItemTitle}>{court.name}</Text>
                      <Text style={styles.dropdownItemSubtitle}>พร้อมจองได้ทันที</Text>
                    </View>
                    {isSelected ? (
                      <MaterialIcons name="check-circle" size={22} color="#111827" />
                    ) : (
                      <MaterialIcons name="stadium" size={20} color="#8B8076" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. เลือกเวลา</Text>
        <Text style={styles.sectionDescription}>
          {selectedCourt
            ? `เลือกเวลาให้ ${selectedCourt.name} ได้สูงสุด 3 ช่วง ระบบจะค่อย ๆ เพิ่มช่องให้`
            : "เลือกสนามก่อนเพื่อเปิดการเลือกเวลา"}
        </Text>

        {selectedCourt && isCheckingAvailability ? (
          <View style={styles.availabilityNotice}>
            <ActivityIndicator size="small" color="#5F6368" />
            <Text style={styles.availabilityNoticeText}>กำลังเช็กช่วงเวลาที่ถูกจอง...</Text>
          </View>
        ) : null}

        {selectedCourt && !isCheckingAvailability && bookedSlots.length > 0 ? (
          <View style={styles.availabilityNotice}>
            <MaterialIcons name="event-busy" size={18} color="#B42318" />
            <Text style={styles.availabilityNoticeText}>
              ช่วงเวลาที่ถูกจองแล้ววันนี้: {formatTimeSlots(bookedSlots, "ไม่ระบุ")}
            </Text>
          </View>
        ) : null}

        <View style={styles.timeSelectorStack}>
          {visibleTimeIndexes.map((index) => {
            const selectedSlot = selectedTimeSelections[index];
            const availableSlots = getAvailableTimeOptions(index);
            const isOpen = openTimeDropdownIndex === index;

            return (
              <View key={`time-slot-${index}`} style={styles.dropdownWrap}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!selectedCourt}
                  style={[
                    styles.dropdownTrigger,
                    styles.timeDropdownTrigger,
                    !selectedCourt && styles.dropdownTriggerDisabled,
                    isOpen && styles.dropdownTriggerOpen,
                    selectedSlot && styles.dropdownTriggerSelected,
                  ]}
                  onPress={() => {
                    if (!selectedCourt) {
                      return;
                    }

                    setIsCourtDropdownOpen(false);
                    setOpenTimeDropdownIndex((prev) => (prev === index ? null : index));
                  }}
                >
                  <View style={styles.timeDropdownTextWrap}>
                    <View style={styles.timeDropdownHeader}>
                      <View style={styles.timeSlotBadge}>
                        <Text style={styles.timeSlotBadgeText}>ช่วง {index + 1}</Text>
                      </View>
                      {selectedSlot ? (
                        <View style={styles.timeSelectedPill}>
                          <MaterialIcons name="check" size={14} color="#111827" />
                          <Text style={styles.timeSelectedPillText}>เลือกแล้ว</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text
                      style={[
                        styles.dropdownValue,
                        styles.timeDropdownValue,
                        !selectedSlot && styles.dropdownPlaceholder,
                      ]}
                    >
                      {selectedSlot?.label || "กดเพื่อเลือกช่วงเวลา"}
                    </Text>
                    <Text style={styles.timeDropdownHint}>
                      {index === 0
                        ? "เริ่มจากช่วงแรกก่อน แล้วระบบจะเพิ่มช่องถัดไปให้อัตโนมัติ"
                        : "เปลี่ยนหรือล้างช่วงเวลานี้ได้จากเมนูด้านล่าง"}
                    </Text>
                  </View>

                  <MaterialIcons
                    name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={28}
                    color={selectedCourt ? "#4F5358" : "#B4AAA1"}
                  />
                </TouchableOpacity>

                {isOpen ? (
                  <View style={styles.dropdownMenu}>
                    {selectedSlot ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.dropdownItem}
                        onPress={() => handleClearTime(index)}
                      >
                        <View>
                          <Text style={styles.dropdownItemTitle}>ล้างช่วงเวลานี้</Text>
                          <Text style={styles.dropdownItemSubtitle}>
                            ช่องถัดไปจะถูกล้างตามลำดับเพื่อกันเวลาไม่ต่อเนื่อง
                          </Text>
                        </View>
                        <MaterialIcons
                          name="remove-circle-outline"
                          size={22}
                          color="#B42318"
                        />
                      </TouchableOpacity>
                    ) : null}

                    {availableSlots.length === 0 ? (
                      <View style={styles.emptyDropdownState}>
                        <MaterialIcons name="event-busy" size={20} color="#8B8076" />
                        <Text style={styles.emptyDropdownStateText}>
                          ไม่มีช่วงเวลาว่างให้เลือกแล้ว
                        </Text>
                      </View>
                    ) : null}

                    {availableSlots.map((slot, slotIndex) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const isLastItem = slotIndex === availableSlots.length - 1;

                      return (
                        <TouchableOpacity
                          key={slot.id}
                          activeOpacity={0.85}
                          style={[
                            styles.dropdownItem,
                            isLastItem && styles.dropdownItemLast,
                            isSelected && styles.dropdownItemSelected,
                          ]}
                          onPress={() => handleSelectTime(index, slot)}
                        >
                          <View>
                            <Text style={styles.dropdownItemTitle}>{slot.label}</Text>
                            <Text style={styles.dropdownItemSubtitle}>
                              {index === 0
                                ? "ช่วงเวลาแรกของการจอง"
                                : `เพิ่มเป็นช่วงเวลาที่ ${index + 1}`}
                            </Text>
                          </View>
                          {isSelected ? (
                            <MaterialIcons name="check-circle" size={22} color="#111827" />
                          ) : (
                            <MaterialIcons name="schedule" size={20} color="#8B8076" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.confirmButton,
          (!selectedCourt || selectedTimes.length === 0) && styles.confirmButtonDisabled,
        ]}
        onPress={handleConfirm}
        disabled={!selectedCourt || selectedTimes.length === 0}
      >
        <Text style={styles.confirmButtonText}>ไปหน้าชำระเงิน</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: "#FAFAF9",
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FAFAF9",
  },
  centerStateText: {
    marginTop: 12,
    fontSize: 15,
    color: "#66615B",
  },
  errorText: {
    color: "#B42318",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ECE7E1",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  heroEyebrow: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroTitle: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#4B5563",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  heroMetaText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1F1F",
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6A625B",
    marginBottom: 14,
  },
  dropdownWrap: {
    gap: 10,
  },
  dropdownTrigger: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  dropdownTriggerOpen: {
    borderColor: "#D6D3D1",
  },
  dropdownTriggerDisabled: {
    backgroundColor: "#F5F5F4",
    borderColor: "#E7E5E4",
  },
  dropdownTriggerSelected: {
    borderColor: "#111827",
    backgroundColor: "#FFFFFF",
  },
  dropdownTriggerTextWrap: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A736D",
    marginBottom: 4,
  },
  dropdownValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F1F1F",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    overflow: "hidden",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: "#F8FAFC",
  },
  emptyDropdownState: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  emptyDropdownStateText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  dropdownItemTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#262626",
    marginBottom: 4,
  },
  dropdownItemSubtitle: {
    fontSize: 13,
    color: "#7A736D",
  },
  timeSelectorStack: {
    gap: 12,
  },
  availabilityNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    marginBottom: 12,
  },
  availabilityNoticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
  },
  timeDropdownTrigger: {
    paddingVertical: 18,
  },
  timeDropdownTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  timeDropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeSlotBadge: {
    backgroundColor: "#111827",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  timeSlotBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  timeSelectedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  timeSelectedPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 4,
  },
  timeDropdownValue: {
    marginBottom: 8,
  },
  dropdownPlaceholder: {
    color: "#94887D",
  },
  timeDropdownHint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#7A736D",
  },
  confirmButton: {
    backgroundColor: "#111827",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#9BA6A0",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});

export default BookingScreen;
