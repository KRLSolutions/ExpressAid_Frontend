import React, { useState, useRef, useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const Swiper = require('react-native-swiper').default;

const { width, height } = Dimensions.get('window');

const slides = [
  {
    image: require('../assets/onboarding1.png'),
    title: 'Your Health, Your Way',
    subtitle: 'Seamless Access to On-Demand Healthcare Services',
  },
  {
    image: require('../assets/onboarding2.png'),
    title: 'Unlocking Health Insights',
    subtitle: 'Harnessing Smart Data for Your Wellness Journey',
  },
  {
    image: require('../assets/onboarding3.png'),
    title: 'Discover Authentic Medicines',
    subtitle: 'Explore genuine and original medicine products recommended by doctors.',
  },
  {
    image: require('../assets/onboarding4.png'),
    title: 'Revolutionising Health Records',
    subtitle: 'Bringing all health data to the digital world.',
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

  const handleNext = (index: number) => {
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

    if (index === slides.length - 1) {
      navigation.replace('PhoneInput');
    } else {
      setCurrentIndex(index + 1);
      swiperRef?.scrollBy(1);
    }
  };

  let swiperRef: any = null;

  return (
    <Swiper
      loop={false}
      index={currentIndex}
      onIndexChanged={setCurrentIndex}
      showsPagination={true}
      activeDotColor="#2563eb"
      dotColor="#e0e7ff"
      ref={ref => (swiperRef = ref)}
    >
      {slides.map((slide, idx) => (
        <ImageBackground
          key={idx}
          source={slide.image}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <View style={styles.overlay} />
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
              <Text variant="headlineMedium" style={styles.title}>{slide.title}</Text>
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
              <Text variant="bodyMedium" style={styles.subtitle}>{slide.subtitle}</Text>
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
                  onPress={() => handleNext(idx)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="arrow-forward" size={28} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </ImageBackground>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  titleContainer: {
    marginBottom: 8,
  },
  subtitleContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    alignSelf: 'center',
    marginTop: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default OnboardingScreen; 