import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

const SearchBox = ({ value, onChangeText, secure, placeholder }) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secure}
                placeholderTextColor="#888"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    input: {
        height: 50,
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 2,
        fontSize: 16,
        color: "#333",
    },
});

export default SearchBox;