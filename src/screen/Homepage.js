import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import ไฟล์หน้าต่างๆ
import HomeScreen from "./HomeScreen";
import SearchScreen from "./SearchScreen";
import HistoryScreen from "./HistoryScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

export default function Homepage() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Search") iconName = "search";
          else if (route.name === "History") iconName = "calendar";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
