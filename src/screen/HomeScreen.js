import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getPopularSports } from "../services/api";
import SportShowcaseCard from "../components/SportShowcaseCard";

const { width: screenWidth } = Dimensions.get("window");
const HERO_CARD_WIDTH = screenWidth - 48;
const HERO_CARD_GAP = 14;
const HERO_SNAP_INTERVAL = HERO_CARD_WIDTH + HERO_CARD_GAP;

const HomeScreen = ({ navigation, route }) => {
  const user = route?.params?.user ?? null;
  const [favorites, setFavorites] = useState([]);
  const [popularSports, setPopularSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const loadFavorites = async () => {
    const favData = await AsyncStorage.getItem("favorites");
    return favData ? JSON.parse(favData) : [];
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [favoriteSports, sportData] = await Promise.all([
        loadFavorites(),
        getPopularSports(),
      ]);

      setFavorites(favoriteSports);
      setPopularSports(sportData);
      setActiveSlide(0);
    } catch (loadError) {
      console.error("Error loading home data:", loadError);
      setError("ไม่สามารถโหลดข้อมูลหน้าแรกได้");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const featuredSports = popularSports.slice(0, 4);

  const handleBookSport = (sport) => {
    navigation.navigate("Booking", { sport, user });
  };

  const handleHeroScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextSlide = Math.round(offsetX / HERO_SNAP_INTERVAL);
    setActiveSlide(nextSlide);
  };

  const renderHeroCard = ({ item }) => {
    return (
      <SportShowcaseCard
        sport={item}
        variant="hero"
        style={styles.heroCard}
        onPress={() => handleBookSport(item)}
      />
    );
  };

  const renderFavoriteCard = (item, index) => (
    <SportShowcaseCard
      key={`${item.id}-${index}`}
      sport={item}
      variant="compact"
      style={styles.favoriteCardSpacing}
      onPress={() => handleBookSport(item)}
      onFavoriteChange={({ favorites: nextFavorites, isFavorite, sport }) => {
        if (!isFavorite) {
          setFavorites((currentFavorites) =>
            currentFavorites.filter((favorite) => String(favorite.id) !== String(sport.id))
          );
          return;
        }

        setFavorites(nextFavorites);
      }}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D4E68" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>ลองอีกครั้ง</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>
            {user?.username ? `ยินดีต้อนรับ ${user.username}` : "ยินดีต้อนรับ"}
          </Text>
          <Text style={styles.headerSubtitle}>เลือกกีฬาที่อยากเล่นแล้วจองได้เลย</Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>กีฬาที่นิยมในขณะนี้</Text>

          {featuredSports.length > 0 ? (
            <>
              <FlatList
                horizontal
                data={featuredSports}
                renderItem={renderHeroCard}
                keyExtractor={(item) => `featured-${item.id}`}
                snapToInterval={HERO_SNAP_INTERVAL}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
                onMomentumScrollEnd={handleHeroScrollEnd}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.heroListContent}
              />

              <View style={styles.paginationRow}>
                {featuredSports.map((item, index) => (
                  <View
                    key={`dot-${item.id}`}
                    style={[
                      styles.paginationDot,
                      index === activeSlide && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>ยังไม่มีข้อมูลกีฬายอดนิยม</Text>
              <Text style={styles.emptyCardText}>เมื่อเริ่มมีการจอง ระบบจะจัดอันดับกีฬาที่ถูกจองบ่อยขึ้นมาให้อัตโนมัติ</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>รายการโปรด</Text>

          {favorites.length > 0 ? (
            favorites.map((item, index) => renderFavoriteCard(item, index))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>ยังไม่มีรายการโปรด</Text>
              <Text style={styles.emptyCardText}>กดหัวใจจากหน้าค้นหา แล้วกีฬาที่ชอบจะขึ้นตรงนี้</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2EE",
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F2EE",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F2EE",
    padding: 24,
  },
  errorText: {
    color: "#A91E00",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0D4E68",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  headerBlock: {
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#66615B",
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#242424",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  heroListContent: {
    paddingHorizontal: 24,
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
    marginRight: HERO_CARD_GAP,
  },
  favoriteCardSpacing: {
    marginHorizontal: 24,
    marginBottom: 18,
    minHeight: 132,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#CFC9C2",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: "#0D70F2",
  },
  emptyCard: {
    marginHorizontal: 24,
    backgroundColor: "#FFFDFC",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECE3DA",
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
  },
  emptyCardText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#66615B",
  },
});

export default HomeScreen;
