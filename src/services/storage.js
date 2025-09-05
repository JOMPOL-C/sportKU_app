import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_SPORT_IMAGE = 'https://via.placeholder.com/150';

// ฟังก์ชันสำหรับอ่านข้อมูล
export const getStorageData = async (key, defaultValue = []) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return defaultValue;
  }
};

// ฟังก์ชันสำหรับบันทึกข้อมูล
export const storeStorageData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
    throw e;
  }
};

// ฟังก์ชันสำหรับจัดการรายการโปรด
export const manageFavorites = async (sport) => {
  try {
    const favorites = await getStorageData("favorites");
    const existingIndex = favorites.findIndex(fav => fav.id === sport.id);
    
    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
    } else {
      favorites.push({
        id: sport.id,
        name: sport.name,
        type: sport.type,
        price: sport.price,
        courts: sport.courts,
        image: sport.image || DEFAULT_SPORT_IMAGE
      });
    }
    
    await storeStorageData("favorites", favorites);
    return favorites;
  } catch (error) {
    console.error("Error managing favorites:", error);
    throw error;
  }
};