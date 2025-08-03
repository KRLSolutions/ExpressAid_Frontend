import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Rect, Path, G, Defs, LinearGradient, Stop, Ellipse, Polygon, Text as SvgText } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Blue and white themed hospital and nurse illustrations
const HealthTrackingIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="hospitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
      <LinearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#dbeafe" />
        <Stop offset="100%" stopColor="#bfdbfe" />
      </LinearGradient>
      <LinearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
    </Defs>
    {/* Large Hospital Building */}
    <G transform="rotate(-5 200 120)">
      {/* Main building */}
      <Rect x="80" y="80" width="240" height="120" rx="8" fill="url(#buildingGradient)" />
      <Rect x="85" y="85" width="230" height="110" rx="4" fill="#ffffff" />
      
      {/* Windows */}
      <Rect x="100" y="100" width="40" height="30" fill="#2563eb" opacity="0.3" />
      <Rect x="150" y="100" width="40" height="30" fill="#2563eb" opacity="0.3" />
      <Rect x="200" y="100" width="40" height="30" fill="#2563eb" opacity="0.3" />
      <Rect x="250" y="100" width="40" height="30" fill="#2563eb" opacity="0.3" />
      
      <Rect x="100" y="140" width="40" height="30" fill="#2563eb" opacity="0.3" />
      <Rect x="150" y="140" width="40" height="30" fill="#2563eb" opacity="0.3" />
      <Rect x="200" y="140" width="40" height="30" fill="#2563eb" opacity="0.3" />
      <Rect x="250" y="140" width="40" height="30" fill="#2563eb" opacity="0.3" />
      
      {/* Entrance */}
      <Rect x="170" y="170" width="60" height="30" fill="url(#hospitalGradient)" />
      <Rect x="175" y="175" width="50" height="20" fill="#ffffff" />
      
      {/* Medical Cross */}
      <Path d="M190 185 L210 185 M200 175 L200 195" stroke="url(#crossGradient)" strokeWidth="4" />
    </G>
    
    {/* Health monitoring devices */}
    <G transform="rotate(10 320 80)">
      <Rect x="300" y="60" width="80" height="40" rx="6" fill="url(#hospitalGradient)" />
      <Rect x="305" y="65" width="70" height="30" rx="3" fill="#ffffff" />
      <Path d="M310 75 L320 70 L330 75 L340 65 L350 72" stroke="#2563eb" strokeWidth="2" fill="none" />
    </G>
    
    {/* Floating medical elements */}
    <Circle cx="60" cy="60" r="12" fill="#3b82f6" opacity="0.8" />
    <Circle cx="340" cy="40" r="8" fill="#1d4ed8" opacity="0.7" />
    <Circle cx="50" cy="180" r="10" fill="#60a5fa" opacity="0.6" />
    
    {/* Medical symbols */}
    <Path d="M30 100 L50 100 M40 90 L40 110" stroke="#2563eb" strokeWidth="3" />
    <Path d="M350 160 L370 160 M360 150 L360 170" stroke="#2563eb" strokeWidth="3" />
  </Svg>
);

// New illustrations for the updated onboarding flow
const QuickNurseArrivalIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
      <LinearGradient id="nurseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#10b981" />
        <Stop offset="100%" stopColor="#059669" />
      </LinearGradient>
      <LinearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#f59e0b" />
        <Stop offset="100%" stopColor="#d97706" />
      </LinearGradient>
    </Defs>
    
    {/* Large Clock with 10 minutes */}
    <G transform="rotate(-5 200 120)">
      <Circle cx="200" cy="120" r="60" fill="url(#clockGradient)" />
      <Circle cx="200" cy="120" r="55" fill="#ffffff" />
      <Circle cx="200" cy="120" r="3" fill="#2563eb" />
      
      {/* Clock hands */}
      <Path d="M200 120 L200 85" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      <Path d="M200 120 L230 120" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      
      {/* Clock numbers */}
      <SvgText x="200" y="75" fontSize="12" fill="#2563eb" textAnchor="middle">12</SvgText>
      <SvgText x="200" y="165" fontSize="12" fill="#2563eb" textAnchor="middle">6</SvgText>
      <SvgText x="125" y="120" fontSize="12" fill="#2563eb" textAnchor="middle">9</SvgText>
      <SvgText x="275" y="120" fontSize="12" fill="#2563eb" textAnchor="middle">3</SvgText>
    </G>
    
    {/* Nurse arriving with speed lines */}
    <G transform="rotate(10 320 140)">
      {/* Speed lines */}
      <Path d="M280 130 L300 130" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
      <Path d="M285 140 L305 140" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
      <Path d="M290 150 L310 150" stroke="#f59e0b" strokeWidth="2" opacity="0.4" />
      
      {/* Nurse figure */}
      <Circle cx="320" cy="120" r="25" fill="url(#nurseGradient)" />
      <Circle cx="320" cy="95" r="18" fill="#fbbf24" />
      
      {/* Nurse cap */}
      <Path d="M302 85 Q320 70 338 85 L335 90 Q320 75 305 90 Z" fill="#ffffff" />
      <Rect x="315" y="80" width="10" height="5" fill="#10b981" />
      
      {/* Nurse body */}
      <Rect x="305" y="135" width="30" height="40" rx="6" fill="url(#nurseGradient)" />
      
      {/* Nurse arms */}
      <Rect x="295" y="140" width="12" height="30" rx="6" fill="url(#nurseGradient)" />
      <Rect x="333" y="140" width="12" height="30" rx="6" fill="url(#nurseGradient)" />
      
      {/* Nurse legs */}
      <Rect x="310" y="170" width="8" height="25" rx="4" fill="url(#nurseGradient)" />
      <Rect x="322" y="170" width="8" height="25" rx="4" fill="url(#nurseGradient)" />
    </G>
    
    {/* "10 mins" text */}
    <SvgText x="200" y="220" fontSize="16" fill="#2563eb" textAnchor="middle" fontWeight="bold">10 MINUTES</SvgText>
    
    {/* Floating elements */}
    <Circle cx="60" cy="60" r="8" fill="#2563eb" opacity="0.6" />
    <Circle cx="340" cy="60" r="6" fill="#10b981" opacity="0.7" />
    <Path d="M30 100 L50 100 M40 90 L40 110" stroke="#2563eb" strokeWidth="2" />
  </Svg>
);

const NurseCareIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="nurseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
      <LinearGradient id="roomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#eff6ff" />
        <Stop offset="100%" stopColor="#dbeafe" />
      </LinearGradient>
      <LinearGradient id="uniformGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ffffff" />
        <Stop offset="100%" stopColor="#f8fafc" />
      </LinearGradient>
      <LinearGradient id="vitalsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#10b981" />
        <Stop offset="100%" stopColor="#059669" />
      </LinearGradient>
    </Defs>
    
    {/* Large Hospital Room */}
    <Rect x="40" y="60" width="320" height="140" rx="12" fill="url(#roomGradient)" />
    <Rect x="50" y="70" width="300" height="120" rx="8" fill="#ffffff" />
    
    {/* Large Nurse Figure */}
    <G transform="rotate(-8 200 140)">
      {/* Nurse body */}
      <Rect x="160" y="120" width="80" height="60" rx="8" fill="url(#uniformGradient)" />
      <Rect x="165" y="125" width="70" height="50" rx="4" fill="url(#nurseGradient)" />
      
      {/* Nurse head */}
      <Circle cx="200" cy="100" r="25" fill="#fbbf24" />
      
      {/* Nurse cap */}
      <Path d="M175 85 Q200 65 225 85 L220 90 Q200 70 180 90 Z" fill="#ffffff" />
      <Rect x="190" y="75" width="20" height="8" fill="#2563eb" />
      
      {/* Nurse arms */}
      <Rect x="140" y="130" width="15" height="40" rx="7" fill="url(#uniformGradient)" />
      <Rect x="245" y="130" width="15" height="40" rx="7" fill="url(#uniformGradient)" />
      
      {/* Nurse legs */}
      <Rect x="170" y="175" width="12" height="35" rx="6" fill="url(#uniformGradient)" />
      <Rect x="218" y="175" width="12" height="35" rx="6" fill="url(#uniformGradient)" />
      
      {/* Nurse shoes */}
      <Rect x="165" y="205" width="18" height="8" rx="4" fill="#374151" />
      <Rect x="217" y="205" width="18" height="8" rx="4" fill="#374151" />
    </G>
    
    {/* Vitals monitoring equipment */}
    <G transform="rotate(5 320 120)">
      <Rect x="300" y="100" width="60" height="80" rx="6" fill="url(#vitalsGradient)" />
      <Rect x="305" y="105" width="50" height="70" rx="3" fill="#ffffff" />
      
      {/* Heart rate monitor */}
      <Path d="M310 120 L320 115 L330 125 L340 110 L350 120" stroke="#10b981" strokeWidth="2" fill="none" />
      
      {/* Blood pressure cuff */}
      <Rect x="315" y="140" width="30" height="4" fill="#10b981" rx="2" />
      <Circle cx="330" cy="160" r="8" fill="#10b981" opacity="0.3" />
    </G>
    
    {/* Patient bed */}
    <G transform="rotate(-3 100 160)">
      <Rect x="60" y="140" width="80" height="40" rx="6" fill="#e5e7eb" />
      <Rect x="65" y="145" width="70" height="30" rx="3" fill="#ffffff" />
      <Rect x="70" y="150" width="60" height="20" fill="#f3f4f6" />
    </G>
    
    {/* Medical charts */}
    <Rect x="280" y="80" width="40" height="30" fill="#ffffff" opacity="0.8" />
    <Path d="M285 90 L295 85 L305 90 L315 80" stroke="#2563eb" strokeWidth="2" fill="none" />
    
    {/* Floating medical elements */}
    <Circle cx="50" cy="80" r="8" fill="#2563eb" opacity="0.6" />
    <Circle cx="350" cy="60" r="6" fill="#10b981" opacity="0.5" />
    <Path d="M30 120 L50 120 M40 110 L40 130" stroke="#2563eb" strokeWidth="2" />
  </Svg>
);

const AffordableCareIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="moneyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#10b981" />
        <Stop offset="100%" stopColor="#059669" />
      </LinearGradient>
      <LinearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#f59e0b" />
        <Stop offset="100%" stopColor="#d97706" />
      </LinearGradient>
      <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
    </Defs>
    
    {/* Large Price Tag */}
    <G transform="rotate(-5 200 120)">
      <Rect x="150" y="80" width="100" height="80" rx="8" fill="url(#moneyGradient)" />
      <Rect x="155" y="85" width="90" height="70" rx="4" fill="#ffffff" />
      
      {/* Dollar sign */}
      <SvgText x="200" y="115" fontSize="24" fill="#10b981" textAnchor="middle" fontWeight="bold">$</SvgText>
      <SvgText x="200" y="140" fontSize="16" fill="#10b981" textAnchor="middle">AFFORDABLE</SvgText>
    </G>
    
    {/* Efficiency Chart */}
    <G transform="rotate(8 320 100)">
      <Rect x="300" y="60" width="80" height="80" rx="6" fill="url(#efficiencyGradient)" />
      <Rect x="305" y="65" width="70" height="70" rx="3" fill="#ffffff" />
      
      {/* Chart bars */}
      <Rect x="310" y="120" width="15" height="20" fill="#f59e0b" />
      <Rect x="330" y="110" width="15" height="30" fill="#f59e0b" />
      <Rect x="350" y="100" width="15" height="40" fill="#f59e0b" />
      
      {/* Chart line */}
      <Path d="M310 120 L330 110 L350 100" stroke="#f59e0b" strokeWidth="2" fill="none" />
    </G>
    
    {/* Efficiency icon */}
    <G transform="rotate(-3 100 100)">
      <Circle cx="100" cy="100" r="30" fill="url(#efficiencyGradient)" />
      <Circle cx="100" cy="100" r="25" fill="#ffffff" />
      
      {/* Lightning bolt */}
      <Path d="M95 85 L105 95 L100 105 L110 115 L105 125 L95 115 L100 105 Z" fill="#f59e0b" />
    </G>
    
    {/* Money symbols */}
    <Circle cx="60" cy="60" r="12" fill="url(#moneyGradient)" />
    <SvgText x="60" y="65" fontSize="12" fill="#ffffff" textAnchor="middle" fontWeight="bold">$</SvgText>
    
    <Circle cx="340" cy="60" r="10" fill="url(#moneyGradient)" />
    <SvgText x="340" y="65" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">$</SvgText>
    
    {/* Efficiency text */}
    <SvgText x="200" y="220" fontSize="14" fill="#10b981" textAnchor="middle" fontWeight="bold">VERY CHEAP & EFFICIENT</SvgText>
    
    {/* Floating elements */}
    <Circle cx="50" cy="180" r="6" fill="#10b981" opacity="0.7" />
    <Circle cx="350" cy="180" r="5" fill="#f59e0b" opacity="0.6" />
    <Path d="M30 140 L50 140 M40 130 L40 150" stroke="#10b981" strokeWidth="2" />
  </Svg>
);

const AppFeaturesIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="supportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
      <LinearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#f59e0b" />
        <Stop offset="100%" stopColor="#d97706" />
      </LinearGradient>
      <LinearGradient id="emergencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ef4444" />
        <Stop offset="100%" stopColor="#dc2626" />
      </LinearGradient>
    </Defs>
    
    {/* Large 24/7 Clock */}
    <G transform="rotate(-5 200 120)">
      <Circle cx="200" cy="120" r="60" fill="url(#clockGradient)" />
      <Circle cx="200" cy="120" r="55" fill="#ffffff" />
      <Circle cx="200" cy="120" r="3" fill="#f59e0b" />
      
      {/* Clock hands */}
      <Path d="M200 120 L200 85" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <Path d="M200 120 L230 120" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      
      {/* Clock numbers */}
      <SvgText x="200" y="75" fontSize="12" fill="#f59e0b" textAnchor="middle">12</SvgText>
      <SvgText x="200" y="165" fontSize="12" fill="#f59e0b" textAnchor="middle">6</SvgText>
      <SvgText x="125" y="120" fontSize="12" fill="#f59e0b" textAnchor="middle">9</SvgText>
      <SvgText x="275" y="120" fontSize="12" fill="#f59e0b" textAnchor="middle">3</SvgText>
      
      {/* 24/7 text */}
      <SvgText x="200" y="200" fontSize="14" fill="#f59e0b" textAnchor="middle" fontWeight="bold">24/7</SvgText>
    </G>
    
    {/* Emergency support icons */}
    <G transform="rotate(8 100 100)">
      <Circle cx="100" cy="100" r="25" fill="url(#emergencyGradient)" />
      <Path d="M95 95 L105 105 M105 95 L95 105" stroke="#ffffff" strokeWidth="3" />
    </G>
    
    <G transform="rotate(-8 320 100)">
      <Circle cx="320" cy="100" r="20" fill="url(#emergencyGradient)" />
      <Path d="M315 95 L325 105 M325 95 L315 105" stroke="#ffffff" strokeWidth="2" />
    </G>
    
    <G transform="rotate(5 100 180)">
      <Circle cx="100" cy="180" r="18" fill="url(#supportGradient)" />
      <Path d="M95 175 L105 185 M105 175 L95 185" stroke="#ffffff" strokeWidth="2" />
    </G>
    
    <G transform="rotate(-5 320 180)">
      <Circle cx="320" cy="180" r="22" fill="url(#supportGradient)" />
      <Path d="M315 175 L325 185 M325 175 L315 185" stroke="#ffffff" strokeWidth="2" />
    </G>
    
    {/* Support text */}
    <SvgText x="200" y="220" fontSize="14" fill="#2563eb" textAnchor="middle" fontWeight="bold">24/7 SUPPORT</SvgText>
    
    {/* Floating elements */}
    <Circle cx="60" cy="60" r="8" fill="#2563eb" opacity="0.7" />
    <Circle cx="340" cy="60" r="6" fill="#ef4444" opacity="0.6" />
    <Path d="M30 140 L50 140 M40 130 L40 150" stroke="#2563eb" strokeWidth="2" />
  </Svg>
);

const slides = [
  {
    illustration: QuickNurseArrivalIllustration,
    title: 'Nurse Arrives in\n10 Minutes',
    subtitle: 'When you book, a qualified nurse will arrive at your doorstep within 10 minutes.',
    buttonText: 'Continue',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    illustration: NurseCareIllustration,
    title: 'Professional Care\n& Treatment',
    subtitle: 'The nurse will treat you by taking vitals and providing comprehensive care.',
    buttonText: 'Continue',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    illustration: AffordableCareIllustration,
    title: 'Very Cheap &\nEfficient',
    subtitle: 'Get quality healthcare services at affordable prices with maximum efficiency.',
    buttonText: 'Continue',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    illustration: AppFeaturesIllustration,
    title: '24/7 Healthcare\nSupport',
    subtitle: 'Get round-the-clock healthcare support and emergency services whenever you need them.',
    buttonText: 'Get Started',
    gradient: ['#2563eb', '#1d4ed8'],
  },
];

type OnboardingScreenProps = {
  navigation: any;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset animations for new slide
    titleAnim.setValue(0);
    subtitleAnim.setValue(0);
    buttonAnim.setValue(0);

    // Enhanced animations with bounce effect
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleNext = () => {
    // Enhanced button press animation with bounce
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if this is the last slide
    if (currentIndex === slides.length - 1) {
      navigation.replace('PhoneInput');
    } else {
      // Move to next slide
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    navigation.replace('PhoneInput');
  };

  const currentSlide = slides[currentIndex];

  return (
    <ExpoLinearGradient
      colors={currentSlide.gradient as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Header with skip button only */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.slide} contentContainerStyle={styles.slideContent}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <currentSlide.illustration />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleAnim,
                transform: [
                  {
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>{currentSlide.title}</Text>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: subtitleAnim,
                transform: [
                  {
                    translateY: subtitleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{currentSlide.buttonText}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </ExpoLinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerLeft: {
    width: 40, // Placeholder for left side
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  subtitleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 40,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen; 