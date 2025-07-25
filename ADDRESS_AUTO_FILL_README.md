# Address Auto-Fill Functionality

This feature automatically fills missing address fields (city, state, pincode, landmark, block) using Google's Reverse Geocoding API based on latitude and longitude coordinates.

## 🚀 Features

- **Automatic Field Filling**: Uses coordinates to fetch complete address details
- **Smart Field Mapping**: Maps Google's address components to your address fields
- **Preserves Existing Data**: Only fills empty/missing fields, doesn't overwrite existing data
- **Error Handling**: Gracefully handles API failures and network issues
- **User Feedback**: Shows users what fields were auto-filled

## 📁 Files Added/Modified

### Backend
- `ExpressAid_Backend/routes/places.js` - Added reverse geocoding endpoint

### Frontend
- `ExpressAid_Frontend/services/api.js` - Added reverseGeocode method
- `ExpressAid_Frontend/utils/addressUtils.js` - New utility functions
- `ExpressAid_Frontend/screens/AddAddressScreen.tsx` - Integrated auto-fill functionality

### Test Files
- `ExpressAid_Frontend/test-auto-fill-address.js` - Test script
- `ExpressAid_Frontend/auto-fill-existing-address.js` - Script for existing addresses

## 🔧 How It Works

### 1. Reverse Geocoding API
The backend uses Google's Reverse Geocoding API to convert coordinates to address details:

```javascript
POST /api/places/reverse-geocode
{
  "latitude": 12.983599699167108,
  "longitude": 77.70908011123538
}
```

### 2. Address Component Mapping
The API parses Google's address components and maps them to your address fields:

- `street_number` → `houseNumber`
- `route` → `landmark`
- `sublocality` → `block`
- `locality` → `city`
- `administrative_area_level_1` → `state`
- `postal_code` → `pincode`

### 3. Auto-Fill Process
The frontend utility functions handle the auto-fill logic:

```javascript
import { autoFillAddressFields } from '../utils/addressUtils';

const filledAddress = await autoFillAddressFields(addressData);
```

## 📖 Usage Examples

### 1. Auto-Fill New Address (Integrated in AddAddressScreen)
The `AddAddressScreen` now automatically fills missing fields when saving:

```javascript
// In handleSaveAddress function
const initialAddressData = {
  name: "My Address",
  address: "Sumadhura Vasantham...",
  latitude: 12.983599699167108,
  longitude: 77.70908011123538,
  city: "", // Will be auto-filled
  state: "", // Will be auto-filled
  pincode: "", // Will be auto-filled
  // ... other fields
};

const filledAddressData = await autoFillAddressFields(initialAddressData);
```

### 2. Auto-Fill Existing Address
To auto-fill an existing address in the database:

```javascript
import { autoFillAndUpdateAddress } from '../utils/addressUtils';

const updatedAddress = await autoFillAndUpdateAddress(addressId, addressData);
```

### 3. Auto-Fill All Addresses
To auto-fill all addresses for a user:

```javascript
import { autoFillAllAddresses } from '../utils/addressUtils';

const updatedAddresses = await autoFillAllAddresses();
```

### 4. Manual API Call
Direct API call for reverse geocoding:

```javascript
import api from '../services/api';

const addressDetails = await api.reverseGeocode(latitude, longitude);
```

## 🧪 Testing

### Test Individual Address
```bash
# Run the test script
node ExpressAid_Frontend/test-auto-fill-address.js
```

### Auto-Fill Existing Address
```bash
# Update the address ID in the script first
node ExpressAid_Frontend/auto-fill-existing-address.js
```

## 📋 Expected Results

For your address coordinates (12.983599699167108, 77.70908011123538), you should get:

```javascript
{
  formattedAddress: "Sumadhura Vasantham, NCPR Industrial Layout, Doddanakundi Industrial Area, Bengaluru, Karnataka 560037, India",
  houseNumber: "110", // Already exists
  floor: "1", // Already exists
  block: "NCPR Industrial Layout",
  landmark: "Doddanakundi Industrial Area",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560037",
  country: "India"
}
```

## ⚙️ Configuration

### Google Maps API Key
The system uses the existing Google Maps API key in:
- `ExpressAid_Backend/routes/places.js`
- `ExpressAid_Backend/routes/maps.js`

### API Endpoints
- **Reverse Geocoding**: `POST /api/places/reverse-geocode`
- **Address Management**: Existing endpoints in `/api/users/addresses`

## 🔒 Error Handling

The system handles various error scenarios:

1. **No Coordinates**: Returns original address data
2. **API Failure**: Returns original address data with error logging
3. **Invalid Response**: Validates Google API response before processing
4. **Network Issues**: Graceful fallback with user notification

## 📱 User Experience

### Success Message
When fields are auto-filled, users see:
```
Address saved successfully!

Auto-filled fields:
City: Bengaluru
State: Karnataka
Pincode: 560037
Landmark: Doddanakundi Industrial Area
```

### Error Handling
If auto-fill fails, the address is still saved with existing data, and users are notified.

## 🚀 Next Steps

1. **Test the functionality** with your existing address
2. **Run the auto-fill script** to update existing addresses
3. **Monitor the logs** to see what fields are being filled
4. **Customize field mapping** if needed for your specific use case

## 📞 Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify the Google Maps API key is valid
3. Ensure the coordinates are accurate
4. Check network connectivity for API calls 