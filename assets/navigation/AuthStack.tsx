import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PhoneInputScreen from '../screens/PhoneInputScreen';
import OTPScreen from '../screens/OTPScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PhoneInput: { onLogin: (user: any) => void };
  OTP: { phoneNumber: string; onLogin: (user: any) => void; otp?: string };
  ProfileSetup: { phoneNumber: string; onLogin: (user: any) => void };
};

const Stack = createStackNavigator<AuthStackParamList>();

type AuthStackProps = {
  onLogin: (user: any) => void;
};

const AuthStack: React.FC<AuthStackProps> = ({ onLogin }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="PhoneInput" component={PhoneInputScreen} initialParams={{ onLogin }} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </Stack.Navigator>
);

export default AuthStack;
