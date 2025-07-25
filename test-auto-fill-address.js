// Test script to demonstrate auto-fill address functionality
import { autoFillAddressFields } from './utils/addressUtils.js';

// Example usage with your address data
const testAddress = {
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
  isDefault: false,
  _id: "6883f7306a7b5a0027923048"
};

// Function to test auto-fill
async function testAutoFill() {
  console.log('🧪 Testing auto-fill address functionality...');
  console.log('📍 Original address:', testAddress);
  
  try {
    const filledAddress = await autoFillAddressFields(testAddress);
    console.log('✅ Auto-filled address:', filledAddress);
    
    // Show what was filled
    console.log('\n📋 Filled fields:');
    if (filledAddress.city && !testAddress.city) {
      console.log(`   City: ${filledAddress.city}`);
    }
    if (filledAddress.state && !testAddress.state) {
      console.log(`   State: ${filledAddress.state}`);
    }
    if (filledAddress.pincode && !testAddress.pincode) {
      console.log(`   Pincode: ${filledAddress.pincode}`);
    }
    if (filledAddress.landmark && !testAddress.landmark) {
      console.log(`   Landmark: ${filledAddress.landmark}`);
    }
    if (filledAddress.block && !testAddress.block) {
      console.log(`   Block: ${filledAddress.block}`);
    }
    
  } catch (error) {
    console.error('❌ Error during auto-fill:', error);
  }
}

// Run the test
testAutoFill(); 