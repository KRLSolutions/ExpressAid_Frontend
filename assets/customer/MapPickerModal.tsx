import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import { modalStyles } from "../styles/modalStyles";
import MapView, { Region, Marker } from "react-native-maps";
import { useUserStore } from "@/store/userStore";
import {
  getLatLong,
  getPlacesSuggestions,
  reverseGeocode,
} from "@/utils/mapUtils";
import LocationItem from "./LocationItem";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap";
import { mapStyles } from "@/styles/mapStyles";

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onSelectLocation: (location: any) => void;
}

// Define type for suggestions
interface Suggestion {
  place_id: string;
  description: string;
}

const MapPickerModal: FC<MapPickerModalProps> = ({
  visible,
  selectedLocation,
  onClose,
  title,
  onSelectLocation,
}) => {
  const mapRef = useRef<MapView>(null);
  const [text, setText] = useState("");
  const { location } = useUserStore();
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [locations, setLocations] = useState([]);
  const textInputRef = useRef<TextInput>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const fetchLocation = async (query: string) => {
    if (query?.length > 4) {
      const data = await getPlacesSuggestions(query);
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (selectedLocation?.latitude) {
      setAddress(selectedLocation?.address);
      setRegion({
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });

      mapRef?.current?.fitToCoordinates(
        [
          {
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
          },
        ],
        {
          edgePadding: { top: 50, left: 50, bottom: 50, right: 50 },
          animated: true,
        }
      );
    }
  }, [selectedLocation, mapRef]);

  const addLocation = async (place_id: string) => {
    const data = await getLatLong(place_id);
    if (data) {
      setRegion({
        latitude: data.latitude,
        longitude: data.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
      setAddress(data.address);
    }
    textInputRef.current?.blur();
    setText("");
  };

  const renderLocations = ({ item }: any) => {
    return (
      <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
    );
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    try {
      const address = await reverseGeocode(
        newRegion?.latitude,
        newRegion?.longitude
      );
      setRegion(newRegion);
      setAddress(address);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGpsButtonPress = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      mapRef.current?.fitToCoordinates([{ latitude, longitude }], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
      const address = await reverseGeocode(latitude, longitude);
      setAddress(address);
      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles?.modalContainer}>
        <Text style={modalStyles?.centerText}>Select {title}</Text>

        <TouchableOpacity onPress={onClose}>
          <Text style={modalStyles?.cancelButton}>Cancel</Text>
        </TouchableOpacity>

        <View style={modalStyles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#777" />
          <TextInput
            ref={textInputRef}
            style={modalStyles.input}
            placeholder="Search address"
            placeholderTextColor="#aaa"
            value={text}
            onChangeText={(e) => {
              setText(e);
              setShowSuggestions(true);
              getPlacesSuggestions(e);
            }}
            onFocus={() => setShowSuggestions(true)}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={modalStyles.suggestionItem}
                onPress={async () => {
                  setShowSuggestions(false);
                  setText(item.description);
                  await addLocation(item.place_id);
                }}
              >
                <Text style={modalStyles.suggestionText}>{item.description}</Text>
              </TouchableOpacity>
            )}
            style={modalStyles.suggestionsList}
          />
        )}

        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1, borderRadius: 12, minHeight: 200 }}
            region={region}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {region && (
              <Marker coordinate={region} />
            )}
          </MapView>
          <View style={{ position: 'absolute', bottom: 20, right: 20, flexDirection: 'column', gap: 10 }}>
            <TouchableOpacity
              style={modalStyles.zoomButton}
              onPress={() => setRegion(r => ({ ...r, latitudeDelta: r.latitudeDelta / 2, longitudeDelta: r.longitudeDelta / 2 }))}
            >
              <Ionicons name="add" size={24} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.zoomButton}
              onPress={() => setRegion(r => ({ ...r, latitudeDelta: r.latitudeDelta * 2, longitudeDelta: r.longitudeDelta * 2 }))}
            >
              <Ionicons name="remove" size={24} color="#222" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={modalStyles?.footerContainer}>
          <Text style={modalStyles.addressText} numberOfLines={2}>
            {address === "" ? "Getting address..." : address}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[modalStyles.button, { marginRight: 10 }]}
              onPress={() => {
                onSelectLocation({
                  type: title,
                  latitude: region?.latitude,
                  longitude: region?.longitude,
                  address: address,
                });
                onClose();
              }}
            >
              <Text style={modalStyles.buttonText}>Set Address</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.button}
              onPress={() => {
                setText('');
                setShowSuggestions(true);
                textInputRef.current?.focus();
              }}
            >
              <Text style={modalStyles.buttonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(MapPickerModal);
