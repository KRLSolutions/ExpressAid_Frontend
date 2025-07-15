import React, { useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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

  const handleNext = (index: number) => {
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
            <Text variant="headlineMedium" style={styles.title}>{slide.title}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{slide.subtitle}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleNext(idx)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-forward" size={28} color="#fff" />
            </TouchableOpacity>
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
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 32,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default OnboardingScreen; 