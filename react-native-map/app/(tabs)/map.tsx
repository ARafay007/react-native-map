import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import SearchBar from "../../components/SearchBar";

const MapScreen = () => {
  const params = useLocalSearchParams();
  const [region, setRegion] = useState<Region | null>(null);

  // ✅ Get User's Current Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required to show your position.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // ✅ Update Region if URL Params Exist
  useEffect(() => {
    const lat = params.latitude ? parseFloat(params.latitude as string) : null;
    const lng = params.longitude ? parseFloat(params.longitude as string) : null;

    if (lat !== null && lng !== null) {
      setRegion((prev) => ({
        ...prev!,
        latitude: lat,
        longitude: lng,
      }));
    }
  }, [params]);

  // ✅ Handle Location Selection (Search or History)
  const handleLocationSelect = (location: { latitude: number; longitude: number }) => {
    setRegion((prev) => ({
      ...prev!,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  return (
    <View style={styles.container}>
      <SearchBar onLocationSelect={handleLocationSelect} />

      {region && (
        <MapView style={styles.map} region={region} showsUserLocation>
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;
