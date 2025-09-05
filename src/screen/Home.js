import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";

const Home = ({ navigation }) => {
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
        <CustomButton
            title="Login"
            backgroundColor="purple"
            onPress={() => navigation.navigate("Login")}
        />
        <CustomButton
            title="Register"
            backgroundColor="orange"
            onPress={() => navigation.navigate("Register")}
        />
        <CustomButton
            title="Homepage"
            backgroundColor="pink"
            onPress={() => navigation.navigate("Homepage")}
        />
        </View>
    );
}
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e6e6fa",
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
    },
});

export default Home;