import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { manageFavorites } from "../services/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const DEFAULT_SPORT_IMAGE = 'https://via.placeholder.com/150';

const RecipCard = ({ item = {} }) => {
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);

  const safeItem = {
    id: item?.id || Math.random().toString(),
    name: item?.name || 'ไม่ระบุชื่อ',
    type: item?.type || 'ไม่ระบุประเภท',
    price: item?.price || 0,
    courts: item?.courts || 0,
    image: item?.image || DEFAULT_SPORT_IMAGE
  };

  const toggleFavorite = async () => {
    try {
      await manageFavorites(safeItem);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate("Booking", { sport: safeItem })}
    >
      <Image 
        style={styles.image} 
        source={{ uri: safeItem.image }} 
        resizeMode="cover"
        defaultSource={{ uri: DEFAULT_SPORT_IMAGE }}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{safeItem.name}</Text>
        <Text style={styles.category}>{safeItem.type}</Text>
        <Text style={styles.price}>ราคา: {safeItem.price} บาท/ชั่วโมง</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite();
        }}
      >
        <MaterialIcons 
          name={isFavorite ? "favorite" : "favorite-border"} 
          size={24} 
          color={isFavorite ? "#ff6f61" : "#aaa"} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 10,
        marginVertical: 8,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
        minHeight: 100, // ป้องกันการ์ดแบนเกินไป
    },
    image: { 
        width: 80, 
        height: 80, 
        borderRadius: 8,
        aspectRatio: 1, // ทำให้รูปเป็นสี่เหลี่ยมจัตุรัสเสมอ
    },
    textContainer: { 
        flex: 1, 
        paddingLeft: 12, 
        justifyContent: "center",
        flexShrink: 1, // ป้องกันข้อความดันขอบการ์ด
    },
    title: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: "#333",
        marginBottom: 4,
    },
    category: { 
        fontSize: 14, 
        color: "#777", 
        marginBottom: 4,
    },
    price: { 
        fontSize: 14, 
        color: "#28a745",
        fontWeight: 'bold',
    },
    favoriteButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
    },
});

export default RecipCard;