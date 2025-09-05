import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import ไฟล์ของแต่ละหน้า
import LoginScreen from "./src/screen/LoginScreen";
import RegisterScreen from "./src/screen/RegisterScreen";
import Homepage from "./src/screen/Homepage";
import SearchScreen from "./src/screen/SearchScreen"; // เพิ่มการ import SearchScreen
import CourtSelectionScreen from "./src/screen/CourtSelectionScreen";
import BookingScreen from "./src/screen/BookingScreen";
import PaymentScreen from "./src/screen/PaymentScreen";
import HistoryScreen from "./src/screen/HistoryScreen";

const Stack = createStackNavigator();

const App = () => {

  useEffect(() => {
    // เรียกใช้เมื่อแอพเริ่มทำงาน
    initializeDatabase();
  }, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Homepage" 
          component={Homepage} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ title: 'ค้นหากีฬา' }} 
        />
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen} 
          options={{ title: 'จองสนาม' }} 
        />
        <Stack.Screen 
          name="CourtSelection" 
          component={CourtSelectionScreen} 
          options={{ title: 'เลือกสนาม' }} 
        />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen} 
          options={{ title: 'ชำระเงิน' }} 
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'ประวัติการจอง' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;