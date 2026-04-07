import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getStorageData, manageFavorites } from "../services/storage";

const DEFAULT_THEME = {
  background: "#2F6C7A",
  accent: "#0D4E68",
  accentSoft: "#7AA5AA",
  icon: "dumbbell",
};

const SPORT_THEME_MAP = {
  ฟุตบอล: {
    background: "#183A16",
    accent: "#0D691C",
    accentSoft: "#2A5A24",
    icon: "soccer",
  },
  ฟุตซอล: {
    background: "#1E3A5F",
    accent: "#0A5E9A",
    accentSoft: "#4D81B8",
    icon: "soccer-field",
  },
  บาสเก็ตบอล: {
    background: "#C56B1F",
    accent: "#E3A12D",
    accentSoft: "#8B4518",
    icon: "basketball",
  },
  เทนนิส: {
    background: "#6F6F72",
    accent: "#2E2E31",
    accentSoft: "#9A9AA0",
    icon: "tennis",
  },
  แบดมินตัน: {
    background: "#8E0B0B",
    accent: "#C64A4A",
    accentSoft: "#560A0A",
    icon: "badminton",
  },
  วอลเลย์บอล: {
    background: "#FFD24A",
    accent: "#F5A623",
    accentSoft: "#FFB52E",
    icon: "volleyball",
  },
  ว่ายน้ำ: {
    background: "#4F7F87",
    accent: "#0D4E68",
    accentSoft: "#7AA5AA",
    icon: "swim",
  },
  ปิงปอง: {
    background: "#5D86A4",
    accent: "#162E85",
    accentSoft: "#8188D4",
    icon: "table-tennis",
  },
  สควอช: {
    background: "#7B5C1E",
    accent: "#44300A",
    accentSoft: "#B6872E",
    icon: "racquetball",
  },
};

const getSportTheme = (sportName) => SPORT_THEME_MAP[sportName] || DEFAULT_THEME;

const SportShowcaseCard = ({
  sport,
  variant = "hero",
  onPress,
  style,
  historyMeta = null,
  onFavoriteChange,
}) => {
  const safeSport = {
    id: sport?.id || Math.random().toString(),
    name: sport?.name || "ไม่ระบุชื่อ",
    type: sport?.type || "ไม่ระบุประเภท",
    price: sport?.price || 0,
    courts: sport?.courts || 0,
    bookingCount: sport?.bookingCount || 0,
    image: sport?.image || null,
  };
  const theme = getSportTheme(safeSport.name);
  const [isFavorite, setIsFavorite] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (variant !== "compact") {
        return undefined;
      }

      let isMounted = true;

      const syncFavoriteStatus = async () => {
        try {
          const favorites = await getStorageData("favorites");
          const sportId = String(safeSport.id);
          const favoriteExists = favorites.some((favorite) => String(favorite.id) === sportId);

          if (isMounted) {
            setIsFavorite(favoriteExists);
          }
        } catch (error) {
          console.error("Failed to load favorite status:", error);
        }
      };

      syncFavoriteStatus();

      return () => {
        isMounted = false;
      };
    }, [safeSport.id, variant])
  );

  const toggleFavorite = async () => {
    try {
      const favorites = await manageFavorites(safeSport);
      const sportId = String(safeSport.id);
      const nextIsFavorite = favorites.some((favorite) => String(favorite.id) === sportId);
      setIsFavorite(nextIsFavorite);

      if (typeof onFavoriteChange === "function") {
        onFavoriteChange({
          sport: safeSport,
          isFavorite: nextIsFavorite,
          favorites,
        });
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  if (variant === "compact") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.compactCard, { backgroundColor: theme.background }, style]}
        onPress={onPress}
      >
        <View style={[styles.compactWaveLeft, { backgroundColor: theme.accent }]} />
        <View style={[styles.compactWaveRight, { backgroundColor: theme.accentSoft }]} />

        <TouchableOpacity
          style={styles.compactFavoriteButton}
          onPress={(event) => {
            event.stopPropagation();
            toggleFavorite();
          }}
        >
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={22}
            color={isFavorite ? "#fff" : "rgba(255,255,255,0.88)"}
          />
        </TouchableOpacity>

        <View style={styles.compactTextBlock}>
          <Text style={styles.compactTitle}>{safeSport.name}</Text>
          <Text style={styles.compactMeta}>ประเภท {safeSport.type}</Text>
          <Text style={styles.compactMeta}>ราคา {safeSport.price} บาท/ชั่วโมง</Text>
        </View>

        <View style={styles.compactIconWrap}>
          <MaterialCommunityIcons name={theme.icon} size={72} color="rgba(255,255,255,0.22)" />
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "favorite") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.favoriteCard, { backgroundColor: theme.background }, style]}
        onPress={onPress}
      >
        <View style={[styles.favoriteAccent, { backgroundColor: theme.accent }]} />
        <View style={[styles.favoriteSlope, { backgroundColor: theme.accentSoft }]} />

        <View style={styles.favoriteHeader}>
          <Text style={styles.favoriteTag}>รายการโปรด</Text>
          <MaterialIcons name="favorite" size={20} color="#fff" />
        </View>

        <Text style={styles.favoriteTitle}>{safeSport.name}</Text>
        <Text style={styles.favoriteMeta}>ประเภท {safeSport.type}</Text>
        <Text style={styles.favoriteMeta}>ราคา {safeSport.price} บาท/ชั่วโมง</Text>
        <Text style={styles.favoriteMeta}>มีสนามทั้งหมด {safeSport.courts || 0} สนาม</Text>

        <View style={styles.favoriteFooter}>
          <Text style={styles.favoriteFooterText}>จองต่อได้ทันที</Text>
          <MaterialIcons name="north-east" size={18} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "history") {
    const isSuccess = historyMeta?.status === "จองสำเร็จ";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.historyCard, { backgroundColor: theme.background }, style]}
        onPress={onPress}
      >
        <View style={[styles.historyAccentLeft, { backgroundColor: theme.accent }]} />
        <View style={[styles.historyAccentRight, { backgroundColor: theme.accentSoft }]} />

        <View style={styles.historyHeader}>
          <View style={styles.historyTitleRow}>
            <View style={styles.historyStatusIcon}>
              <MaterialIcons
                name={isSuccess ? "check-circle" : "schedule"}
                size={22}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.historyTitle}>{safeSport.name}</Text>
          </View>

          <View style={styles.historyBadge}>
            <Text style={styles.historyBadgeText}>{historyMeta?.status || "กำลังดำเนินการ"}</Text>
          </View>
        </View>

        <View style={styles.historyDivider} />

        <View style={styles.historyDetails}>
          <View style={styles.historyDetailRow}>
            <MaterialIcons name="schedule" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.historyDetailText}>{historyMeta?.time || "ไม่ระบุ"}</Text>
          </View>
          <View style={styles.historyDetailRow}>
            <MaterialIcons name="location-on" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.historyDetailText}>{historyMeta?.court || "ไม่ระบุ"}</Text>
          </View>
          <View style={styles.historyDetailRow}>
            <MaterialIcons name="calendar-today" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.historyDetailText}>{historyMeta?.date || "ไม่ระบุ"}</Text>
          </View>
        </View>

        <View style={styles.historyIconWrap}>
          <MaterialCommunityIcons name={theme.icon} size={76} color="rgba(255,255,255,0.16)" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.heroCard, { backgroundColor: theme.background }, style]}
      onPress={onPress}
    >
      <View style={[styles.heroWaveLeft, { backgroundColor: theme.accent }]} />
      <View style={[styles.heroWaveCenter, { backgroundColor: theme.accentSoft }]} />
      <View style={[styles.heroWaveRight, { backgroundColor: theme.accent }]} />

      <View style={styles.heroTextBlock}>
        <Text style={styles.heroEyebrow}>ฮิตวันนี้</Text>
        <Text style={styles.heroTitle}>{safeSport.name}</Text>
        <Text style={styles.heroSubtitle}>ประเภท {safeSport.type}</Text>
        <Text style={styles.heroMeta}>
          {safeSport.bookingCount || 0} การจอง • {safeSport.courts || 0} สนาม • {safeSport.price} บาท/ชม.
        </Text>
      </View>

      <View style={styles.heroIconWrap}>
        <MaterialCommunityIcons name={theme.icon} size={92} color="rgba(255,255,255,0.26)" />
      </View>

      <View style={styles.heroFooter}>
        <Text style={styles.heroFooterText}>แตะเพื่อเลือกสนาม</Text>
        <MaterialIcons name="arrow-forward" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    minHeight: 118,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    shadowColor: "#102027",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  compactTextBlock: {
    zIndex: 2,
    maxWidth: "70%",
  },
  compactTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  compactMeta: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    marginBottom: 4,
  },
  compactFavoriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 3,
  },
  compactIconWrap: {
    position: "absolute",
    right: 14,
    bottom: 8,
    zIndex: 2,
  },
  compactWaveLeft: {
    position: "absolute",
    left: -20,
    bottom: -30,
    width: 160,
    height: 80,
    borderTopRightRadius: 100,
    transform: [{ rotate: "-6deg" }],
  },
  compactWaveRight: {
    position: "absolute",
    right: -18,
    bottom: -18,
    width: 120,
    height: 110,
    borderTopLeftRadius: 36,
    transform: [{ rotate: "16deg" }],
  },
  heroCard: {
    height: 230,
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
    shadowColor: "#102027",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  heroTextBlock: {
    zIndex: 2,
    maxWidth: "68%",
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroMeta: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
  },
  heroFooter: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  heroFooterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  heroIconWrap: {
    position: "absolute",
    right: 18,
    top: 42,
    zIndex: 2,
  },
  heroWaveLeft: {
    position: "absolute",
    left: -40,
    bottom: -46,
    width: 220,
    height: 130,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 30,
    transform: [{ rotate: "-8deg" }],
  },
  heroWaveCenter: {
    position: "absolute",
    left: 140,
    bottom: -52,
    width: 180,
    height: 150,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 40,
    transform: [{ rotate: "5deg" }],
  },
  heroWaveRight: {
    position: "absolute",
    right: -30,
    bottom: -30,
    width: 110,
    height: 150,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    transform: [{ rotate: "18deg" }],
  },
  favoriteCard: {
    borderRadius: 28,
    padding: 22,
    minHeight: 178,
    overflow: "hidden",
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 7,
  },
  favoriteAccent: {
    position: "absolute",
    left: -20,
    bottom: -48,
    width: 240,
    height: 110,
    borderTopRightRadius: 110,
    transform: [{ rotate: "-4deg" }],
  },
  favoriteSlope: {
    position: "absolute",
    right: -10,
    bottom: -8,
    width: 180,
    height: 120,
    borderTopLeftRadius: 36,
    transform: [{ rotate: "-14deg" }],
  },
  favoriteHeader: {
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  favoriteTag: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  favoriteTitle: {
    zIndex: 2,
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  favoriteMeta: {
    zIndex: 2,
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    marginBottom: 6,
  },
  favoriteFooter: {
    zIndex: 2,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteFooterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  historyCard: {
    minHeight: 188,
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 7,
  },
  historyAccentLeft: {
    position: "absolute",
    left: -34,
    bottom: -54,
    width: 220,
    height: 110,
    borderTopRightRadius: 120,
    transform: [{ rotate: "-6deg" }],
  },
  historyAccentRight: {
    position: "absolute",
    right: -18,
    top: 24,
    width: 144,
    height: 120,
    borderBottomLeftRadius: 42,
    transform: [{ rotate: "16deg" }],
  },
  historyHeader: {
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  historyStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 10,
  },
  historyTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    flexShrink: 1,
  },
  historyBadge: {
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  historyBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  historyDivider: {
    zIndex: 2,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 16,
  },
  historyDetails: {
    zIndex: 2,
    gap: 10,
    maxWidth: "76%",
  },
  historyDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyDetailText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
    flexShrink: 1,
  },
  historyIconWrap: {
    position: "absolute",
    right: 16,
    bottom: 14,
    zIndex: 1,
  },
});

export default SportShowcaseCard;
