import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path, G, Defs, LinearGradient, Stop, Ellipse, Polygon } from 'react-native-svg';
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
    
    {/* Medical equipment */}
    <G transform="rotate(5 320 120)">
      <Rect x="300" y="100" width="60" height="80" rx="6" fill="#ffffff" opacity="0.9" />
      <Rect x="305" y="105" width="50" height="70" rx="3" fill="#f1f5f9" />
      
      {/* Medical cross on equipment */}
      <Path d="M320 120 L340 120 M330 110 L330 130" stroke="#2563eb" strokeWidth="3" />
      
      {/* Medical tools */}
      <Rect x="315" y="140" width="30" height="4" fill="#2563eb" rx="2" />
      <Circle cx="330" cy="160" r="8" fill="#2563eb" opacity="0.3" />
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
    <Circle cx="350" cy="60" r="6" fill="#2563eb" opacity="0.5" />
    <Path d="M30 120 L50 120 M40 110 L40 130" stroke="#2563eb" strokeWidth="2" />
  </Svg>
);

const MedicineIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="medicineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
      <LinearGradient id="pharmacyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#f3f4f6" />
        <Stop offset="100%" stopColor="#e5e7eb" />
      </LinearGradient>
      <LinearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3b82f6" />
        <Stop offset="100%" stopColor="#2563eb" />
      </LinearGradient>
    </Defs>
    
    {/* Large Pharmacy/Medicine Storage */}
    <G transform="rotate(-12 200 130)">
      <Rect x="60" y="80" width="280" height="100" rx="10" fill="url(#pharmacyGradient)" />
      <Rect x="70" y="90" width="260" height="80" rx="6" fill="#ffffff" />
      
      {/* Multiple medicine shelves */}
      <Rect x="80" y="100" width="240" height="20" rx="3" fill="#f8fafc" />
      <Rect x="80" y="130" width="240" height="20" rx="3" fill="#f8fafc" />
      <Rect x="80" y="160" width="240" height="20" rx="3" fill="#f8fafc" />
    </G>
    
    {/* Large Medicine Bottles */}
    <G transform="rotate(-8 200 120)">
      {/* Row 1 */}
      <Rect x="90" y="105" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="135" y="105" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="180" y="105" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="225" y="105" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="270" y="105" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      
      {/* Row 2 */}
      <Rect x="90" y="165" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="135" y="165" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="180" y="165" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="225" y="165" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      <Rect x="270" y="165" width="35" height="50" rx="4" fill="url(#bottleGradient)" />
      
      {/* Bottle details */}
      <Rect x="95" y="110" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="140" y="110" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="185" y="110" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="230" y="110" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="275" y="110" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      
      <Rect x="95" y="170" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="140" y="170" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="185" y="170" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="230" y="170" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
      <Rect x="275" y="170" width="25" height="40" rx="2" fill="#ffffff" opacity="0.4" />
    </G>
    
    {/* Large Pill Container */}
    <G transform="rotate(5 320 80)">
      <Rect x="300" y="60" width="80" height="40" rx="8" fill="url(#medicineGradient)" />
      <Rect x="305" y="65" width="70" height="30" rx="4" fill="#ffffff" />
      
      {/* Pills */}
      <Circle cx="320" cy="80" r="4" fill="#2563eb" />
      <Circle cx="335" cy="80" r="4" fill="#2563eb" />
      <Circle cx="350" cy="80" r="4" fill="#2563eb" />
      <Circle cx="365" cy="80" r="4" fill="#2563eb" />
    </G>
    
    {/* Medical Cross */}
    <Path d="M190 50 L210 50 M200 40 L200 60" stroke="url(#medicineGradient)" strokeWidth="5" />
    
    {/* Floating pills */}
    <Circle cx="60" cy="70" r="6" fill="#2563eb" opacity="0.8" />
    <Circle cx="340" cy="40" r="5" fill="#2563eb" opacity="0.7" />
    <Circle cx="50" cy="200" r="4" fill="#2563eb" opacity="0.6" />
    <Circle cx="350" cy="200" r="5" fill="#2563eb" opacity="0.7" />
  </Svg>
);

const HomeCareIllustration = () => (
  <Svg width={width * 0.9} height={height * 0.4} viewBox="0 0 400 240">
    <Defs>
      <LinearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2563eb" />
        <Stop offset="100%" stopColor="#1d4ed8" />
      </LinearGradient>
      <LinearGradient id="sofaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#dbeafe" />
        <Stop offset="100%" stopColor="#bfdbfe" />
      </LinearGradient>
      <LinearGradient id="roomGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#eff6ff" />
        <Stop offset="100%" stopColor="#dbeafe" />
      </LinearGradient>
    </Defs>
    
    {/* Large Home Interior */}
    <Rect x="40" y="60" width="320" height="160" rx="12" fill="url(#roomGradient2)" />
    <Rect x="50" y="70" width="300" height="140" rx="8" fill="#ffffff" />
    
    {/* Large 3D House Structure */}
    <Path d="M120 100 L280 100 L280 60 L200 30 L120 60 Z" fill="url(#homeGradient)" />
    <Rect x="140" y="80" width="120" height="20" fill="#ffffff" />
    <Rect x="160" y="85" width="80" height="10" fill="#2563eb" />
    
    {/* Large 3D Sofa */}
    <G transform="rotate(-10 200 160)">
      <Rect x="100" y="140" width="200" height="60" rx="10" fill="url(#sofaGradient)" />
      <Rect x="110" y="150" width="180" height="40" rx="6" fill="#ffffff" opacity="0.3" />
      
      {/* Sofa cushions */}
      <Rect x="120" y="155" width="50" height="30" rx="4" fill="#ffffff" opacity="0.5" />
      <Rect x="180" y="155" width="50" height="30" rx="4" fill="#ffffff" opacity="0.5" />
      <Rect x="240" y="155" width="50" height="30" rx="4" fill="#ffffff" opacity="0.5" />
    </G>
    
    {/* Medical equipment in home */}
    <G transform="rotate(8 100 120)">
      <Rect x="70" y="100" width="60" height="40" rx="6" fill="url(#homeGradient)" />
      <Rect x="75" y="105" width="50" height="30" rx="3" fill="#ffffff" />
      <Path d="M85 115 L95 110 L105 115 L115 105" stroke="#2563eb" strokeWidth="2" fill="none" />
    </G>
    
    {/* Nurse visiting home */}
    <G transform="rotate(-5 320 140)">
      {/* Nurse figure */}
      <Circle cx="320" cy="120" r="20" fill="url(#homeGradient)" />
      <Circle cx="320" cy="95" r="15" fill="#fbbf24" />
      
      {/* Nurse cap */}
      <Path d="M305 85 Q320 70 335 85 L330 90 Q320 75 310 90 Z" fill="#ffffff" />
      <Rect x="315" y="80" width="10" height="5" fill="#2563eb" />
      
      {/* Nurse body */}
      <Rect x="305" y="135" width="30" height="40" rx="6" fill="url(#homeGradient)" />
      
      {/* Nurse arms */}
      <Rect x="295" y="140" width="12" height="30" rx="6" fill="url(#homeGradient)" />
      <Rect x="333" y="140" width="12" height="30" rx="6" fill="url(#homeGradient)" />
      
      {/* Nurse legs */}
      <Rect x="310" y="170" width="8" height="25" rx="4" fill="url(#homeGradient)" />
      <Rect x="322" y="170" width="8" height="25" rx="4" fill="url(#homeGradient)" />
    </G>
    
    {/* Medical bag */}
    <G transform="rotate(3 80 180)">
      <Rect x="60" y="170" width="40" height="30" rx="6" fill="#374151" />
      <Rect x="65" y="175" width="30" height="20" rx="3" fill="#6b7280" />
      <Path d="M70 180 L90 180 M80 175 L80 185" stroke="#2563eb" strokeWidth="2" />
    </G>
    
    {/* Large Heart symbol */}
    <Path d="M350 80 Q350 65 365 65 Q380 65 380 80 Q380 95 365 95 Q350 95 350 80" fill="#2563eb" />
    
    {/* Floating medical elements */}
    <Circle cx="50" cy="100" r="8" fill="#2563eb" opacity="0.7" />
    <Circle cx="350" cy="40" r="6" fill="#2563eb" opacity="0.6" />
    <Path d="M30 140 L50 140 M40 130 L40 150" stroke="#2563eb" strokeWidth="2" />
  </Svg>
);

const slides = [
  {
    illustration: HealthTrackingIllustration,
    title: 'Smart Health\nMonitoring',
    subtitle: 'Track your vital signs and health metrics with advanced monitoring technology.',
    buttonText: 'Continue',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    illustration: NurseCareIllustration,
    title: 'Professional\nNurse Care',
    subtitle: 'Get expert nursing care delivered to your doorstep with certified professionals.',
    buttonText: 'Continue',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    illustration: MedicineIllustration,
    title: 'Authentic\nMedicines',
    subtitle: 'Access genuine medicines and healthcare products from trusted sources.',
    buttonText: 'Continue',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    illustration: HomeCareIllustration,
    title: 'Home Healthcare\nServices',
    subtitle: 'Quality healthcare services delivered to your home for your comfort.',
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

    // Animate content in sequence
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 600,
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
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
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
      {/* Header with time and skip button */}
      <View style={styles.header}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.headerRight}>
          <MaterialIcons name="wifi" size={16} color="#fff" style={styles.headerIcon} />
          <MaterialIcons name="battery-full" size={16} color="#fff" style={styles.headerIcon} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
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
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 8,
  },
  skipButton: {
    marginLeft: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
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