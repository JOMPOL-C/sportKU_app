import React, { useEffect, useState } from "react";
import { 
  View, 
  Text,
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SearchBox from "../components/SearchBox";
import SportShowcaseCard from "../components/SportShowcaseCard";
import { getSports } from "../services/api";

const SearchScreen = ({ route }) => {
  const [search, setSearch] = useState("");
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const user = route?.params?.user ?? null;

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSports();
      setSports(data);
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลได้:", error);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่ภายหลัง");
      setSports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSport = (sport) => {
    navigation.navigate("Booking", { 
      sport: {
        id: sport.id,
        name: sport.name,
        type: sport.type,
        price: sport.price,
        courts: sport.courts,
        image: sport.image
      },
      user
    });
  };

  return (
    <View style={styles.container}>
      <SearchBox
        placeholder="ค้นหากีฬา..."
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#ff6f61" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchSports}
          >
            <Text style={styles.retryText}>ลองอีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sports.filter((item) => 
            item.name?.toLowerCase().includes(search.toLowerCase().trim())
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SportShowcaseCard
              sport={item}
              variant="compact"
              style={styles.sportCard}
              onPress={() => handleBookSport(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ไม่พบผลลัพธ์ที่ค้นหา</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 15,
        backgroundColor: '#f5f5f5'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888'
    },
    listContainer: {
        paddingBottom: 20
    },
    sportCard: {
        marginBottom: 14,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 10
    },
    retryButton: {
        backgroundColor: '#ff6f61',
        padding: 10,
        borderRadius: 5
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});


export default SearchScreen;
