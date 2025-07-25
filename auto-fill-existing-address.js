// Script to auto-fill existing address with missing fields
import { autoFillAndUpdateAddress } from './utils/addressUtils.js';

// Your existing address data
const existingAddress = {
  _id: "6883f7306a7b5a0027923048",
  type: "home",
  address: "Sumadhura Vasantham, NCPR Industrial Layout, Doddanakundi Industrial A…",
  name: "My Address",
  latitude: 12.983599699167108,
  longitude: 77.70908011123538,
  houseNumber: "110",
  floor: "1",
  block: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false
};

// Function to auto-fill the existing address
async function autoFillExistingAddress() {
  console.log('🔄 Starting auto-fill for existing address...');
  console.log('📍 Address ID:', existingAddress._id);
  console.log('📍 Current address:', existingAddress);
  
  try {
    const updatedAddress = await autoFillAndUpdateAddress(existingAddress._id, existingAddress);
    
    console.log('\n✅ Address updated successfully!');
    console.log('📍 Updated address:', updatedAddress);
    
    // Show what was filled
    console.log('\n📋 Auto-filled fields:');
    if (updatedAddress.city && !existingAddress.city) {
      console.log(`   City: ${updatedAddress.city}`);
    }
    if (updatedAddress.state && !existingAddress.state) {
      console.log(`   State: ${updatedAddress.state}`);
    }
    if (updatedAddress.pincode && !existingAddress.pincode) {
      console.log(`   Pincode: ${updatedAddress.pincode}`);
    }
    if (updatedAddress.landmark && !existingAddress.landmark) {
      console.log(`   Landmark: ${updatedAddress.landmark}`);
    }
    if (updatedAddress.block && !existingAddress.block) {
      console.log(`   Block: ${updatedAddress.block}`);
    }
    
  } catch (error) {
    console.error('❌ Error auto-filling address:', error);
  }
}

// Run the auto-fill
autoFillExistingAddress(); 