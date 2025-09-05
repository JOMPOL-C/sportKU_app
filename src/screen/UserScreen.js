import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { addUser, getUser, addBooking, getUserBookings } from '../services/database';

const UserScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  const handleRegister = async () => {
    try {
      await addUser(username, password);
      Alert.alert('Success', 'User registered successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const userData = await getUser(username);
      if (userData && userData.password === password) {
        setUser(userData);
        const userBookings = await getUserBookings(userData.id);
        setBookings(userBookings);
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddBooking = async () => {
    if (!user) return;
    
    try {
      await addBooking(
        user.id,
        'Badminton',
        1,
        '2023-07-20',
        '18:00-19:00'
      );
      const updatedBookings = await getUserBookings(user.id);
      setBookings(updatedBookings);
      Alert.alert('Success', 'Booking added successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {!user ? (
        <>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <Button title="Register" onPress={handleRegister} />
          <Button title="Login" onPress={handleLogin} />
        </>
      ) : (
        <>
          <Text>Welcome, {username}!</Text>
          <Button title="Add Test Booking" onPress={handleAddBooking} />
          
          <Text style={{ marginTop: 20 }}>Your Bookings:</Text>
          <FlatList
            data={bookings}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderBottomWidth: 1 }}>
                <Text>Sport: {item.sport_type}</Text>
                <Text>Court: {item.court_number}</Text>
                <Text>Date: {item.booking_date}</Text>
                <Text>Time: {item.time_slot}</Text>
                <Text>Status: {item.status}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

export default UserScreen;