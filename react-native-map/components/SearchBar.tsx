import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

interface SearchBarProps {
  onLocationSelect: (location: Location) => void;
}

const GOOGLE_MAPS_APIKEY = "AIzaSyDyX3tqTIsVIp3UiYYaFcnAKBERDoa5VQU";

const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect }) => {
  const [history, setHistory] = useState<Location[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("searchHistory");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory) as Location[]);
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  const saveHistory = async (newLocation: Omit<Location, "id">) => {
    try {
      const locationWithId: Location = { id: uuidv4(), ...newLocation };
      const updatedHistory = [
        locationWithId,
        ...history.filter((item) => item.name !== newLocation.name),
      ].slice(0, 5);

      setHistory(updatedHistory);
      await AsyncStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  return (
    <View>
      <GooglePlacesAutocomplete
        placeholder="Search for a place"
        minLength={2}
        fetchDetails={true}
        query={{
          key: GOOGLE_MAPS_APIKEY,
          language: "en",
        }}
        onPress={(data, details) => {
          if (details) {
            const location: Omit<Location, "id"> = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              name: data.description,
            };
            saveHistory(location);
            onLocationSelect({ id: uuidv4(), ...location });
          }
        }}
        styles={{
          container: styles.container,
          textInput: styles.textInput,
        }}
      />

      {/* Display Search History */}
      {history.length > 0 && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          style={styles.recentlySearchList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.historyItem} onPress={() => onLocationSelect(item)}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // container: { width: "100%", zIndex: 1, marginBottom: 60, marginTop: 20 },
  container: { position: "absolute", width: "100%", zIndex: 1, marginBottom: 60 },
  textInput: { height: 44, backgroundColor: "#fff", borderRadius: 5, paddingHorizontal: 10 },
  historyItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "#f8f8f8" },
  recentlySearchList: { marginTop: 40 }
});

export default SearchBar;
