import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

const CustomButton = ({ title, onPress, backgroundColor }) => {
    return (
        <TouchableOpacity 
            style={[styles.button , { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 200,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default CustomButton;