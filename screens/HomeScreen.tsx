import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Pressable, Dimensions, Alert, Modal, FlatList, KeyboardAvoidingView, TextInput, Image, Linking, ScrollView, ImageBackground, SafeAreaView } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart, useActiveOrder } from '../CartContext';
import ViewCartBar from '../components/ViewCartBar';
import { fetchAndSetCart } from '../hooks/useCartInitialization';
import ViewActiveOrderBar from '../components/ViewActiveOrderBar';
import * as Location from 'expo-location';
import { useUserStore } from '../store/userStore';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Animated as RNAnimated } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.82); // 82% of screen
const SIDE_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;
const SNAP_INTERVAL = ITEM_WIDTH + CARD_MARGIN * 2;

interface HomeScreenProps {
  userData?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userData }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { cart, setCart } = useCart();
  const { activeOrder, refreshActiveOrder } = useActiveOrder();
  const { location, setLocation } = useUserStore();
  const [locationModalVisible, setLocationModalVisible] = React.useState(false);
  const [requestingLocation, setRequestingLocation] = React.useState(false);
  const [hospitalMapVisible, setHospitalMapVisible] = React.useState(false);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [locationPermissionPermanentlyDenied, setLocationPermissionPermanentlyDenied] = React.useState(false);
  // 1. Remove all old howItWorksVisible state, modal, and debug code
  // 2. Add new state for the modal
  const [showHowItWorksModal, setShowHowItWorksModal] = React.useState(false);
  // Add state for tab selection
  const [howItWorksTab, setHowItWorksTab] = React.useState<'Nursing' | 'Caregiving' | 'Equipments'>('Nursing');
  
  // Optimize cart polling with better state management
  const setCartRef = React.useRef(setCart);
  setCartRef.current = setCart;
  
  // Debounced cart fetching to prevent excessive API calls
  const debouncedFetchCart = React.useCallback(
    React.useMemo(() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('🔄 Debounced cart fetch triggered');
          fetchAndSetCart(setCartRef.current);
        }, 1000); // 1 second debounce
      };
    }, []),
    []
  );
  
  React.useEffect(() => {
    console.log('🔄 HomeScreen useEffect running - setting up optimized cart polling');
    // Fetch cart immediately on mount
    fetchAndSetCart(setCartRef.current);
    
    // Set up polling every 2 minutes instead of 1 minute to reduce server load
    const interval = setInterval(() => {
      console.log('⏰ Cart polling interval triggered (2 min)');
      fetchAndSetCart(setCartRef.current);
    }, 120000); // 2 minutes instead of 1 minute
    
    return () => {
      console.log('🧹 HomeScreen useEffect cleanup - clearing interval');
      clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once on mount

  // Optimize focus effect with useCallback
  const handleFocusEffect = React.useCallback(() => {
    refreshActiveOrder();
  }, [refreshActiveOrder]);

  useFocusEffect(handleFocusEffect);

  // Memoize location request function
  const requestLocation = React.useCallback(async () => {
    setRequestingLocation(true);
    try {
      let { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationModalVisible(true);
        setLocationPermissionPermanentlyDenied(!canAskAgain);
        setRequestingLocation(false);
        return;
      }
      // Only fetch location if permission is granted
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: '',
      };
      setLocation(coords);
      setRequestingLocation(false);
      setLocationPermissionPermanentlyDenied(false);
    } catch (e) {
      // Only show modal if error is not due to permission denial
      setLocationModalVisible(true);
      setRequestingLocation(false);
    }
  }, [setLocation]);

  // Memoize navigation functions
  const openDrawer = React.useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  // Performance monitoring function
  // const showPerformanceSummary = React.useCallback(() => {
  //   performanceMonitor.logPerformanceSummary();
  // }, []);

  const goToSymptomEntry = React.useCallback(() => {
    navigation.navigate('SymptomEntry');
  }, [navigation]);

  // Extract first name from full name
  const getFirstName = React.useCallback((fullName: string) => {
    return fullName ? fullName.split(' ')[0] : 'User';
  }, []);

  const handleTrackNurse = React.useCallback(() => {
    if (activeOrder && (activeOrder.orderId || activeOrder._id)) {
      navigation.navigate('SearchingForNurseScreen', { orderId: activeOrder.orderId || activeOrder._id || '' });
    } else {
      // Optionally show an alert if no active order
      // alert('No active order to track');
    }
  }, [activeOrder, navigation]);

  const openHospitalInMaps = React.useCallback(() => {
    if (!location) {
      requestLocation();
      return;
    }
    setHospitalMapVisible(true);
  }, [location, requestLocation]);

  const getHospitalMapUrl = React.useCallback(() => {
    if (!location) return '';
    const { latitude, longitude } = location;
    return `https://www.google.com/maps/search/hospitals+and+clinics/@${latitude},${longitude},14z`;
  }, [location]);







  // --- TESTIMONIALS DATA ---
  const testimonials = [
    {
      id: '1',
      name: 'Priya S.',
      message: 'Expressaid made it so easy to book a nurse for my father. The service was quick and professional!',
    },
    {
      id: '2',
      name: 'Rahul M.',
      message: 'I was amazed by how fast the nurse arrived. The app is a lifesaver for my family!',
    },
    {
      id: '3',
      name: 'Anjali T.',
      message: 'The nurses are caring and skilled. I feel safe using Expressaid for my mother care.',
    },
    {
      id: '4',
      name: 'Vikram P.',
      message: 'Booking was seamless and the support team is very helpful. Highly recommended!',
    },
    {
      id: '5',
      name: 'Meena R.',
      message: 'Expressaid changed the way we manage home care. Thank you for this wonderful app!',
    },
  ];



  // Revert BlueHeading to previous left margin
  const BlueHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <LinearGradient
      colors={["#2563eb", "#60a5fa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ borderRadius: 18, marginTop: 18, marginBottom: 8, alignSelf: 'flex-start', marginLeft: 24, paddingHorizontal: 18, paddingVertical: 6 }}
    >
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 }}>{children}</Text>
    </LinearGradient>
  );

  // --- TESTIMONIALS CAROUSEL COMPONENT ---
  // Revert TestimonialCarousel paddings and card width
  const TestimonialCarousel: React.FC = () => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const flatListRef = React.useRef<FlatList>(null);
    const CARD_WIDTH = Math.round(width * 0.92); // almost full width

    React.useEffect(() => {
      const interval = setInterval(() => {
        setActiveIndex(prev => {
          const next = (prev + 1) % testimonials.length;
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    return (
      <FlatList
        ref={flatListRef}
        data={testimonials}
        horizontal
        showsHorizontalScrollIndicator={false} // ensure no scroll bar
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2, paddingVertical: 12 }}
        snapToInterval={CARD_WIDTH}
        decelerationRate={0.92}
        pagingEnabled
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.duration(900)}
            style={{
              width: CARD_WIDTH,
              height: 120,
              backgroundColor: 'rgba(255,255,255,0.75)',
              borderRadius: 24,
              padding: 18,
              marginRight: index === testimonials.length - 1 ? 0 : 16, // add space except last card
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.35,
              shadowRadius: 32,
              elevation: 32,
              justifyContent: 'center',
              marginHorizontal: 12,
              marginTop: 40,
              marginBottom: 32,
              transform: [{ translateY: Math.sin(index) * 8 }], // subtle floating effect
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2563eb', marginRight: 8 }}>{item.name}</Text>
              <View style={{ flexDirection: 'row' }}>{[...Array(5)].map((_, i) => (<Ionicons key={i} name="star" size={16} color="#fbbf24" style={{ marginRight: 1 }} />))}</View>
            </View>
            <Text style={{ color: '#222', fontSize: 15 }}>{item.message}</Text>
          </Animated.View>
        )}
      />
    );
  };

  // Add state for active indices at the top of HomeScreen


  const bounce = useSharedValue(0);
  React.useEffect(() => {
    bounce.value = withRepeat(
      withTiming(1, { duration: 700 }),
      -1,
      true
    );
  }, []);
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value * 8 - 4 }],
  }));

  console.log('RENDER HomeScreen, howItWorksVisible:', showHowItWorksModal);

  // Steps data for each tab
  const howItWorksSteps = {
    Nursing: [
      {
        title: 'Book Instantly',
        details: [
          'Choose your location and service',
          'Tell us your care needs',
          'Tap to book in seconds',
        ],
      },
      {
        title: 'Meet Your Nurse',
        details: [
          'We match you with a trusted nurse',
          'You can review and confirm the profile',
        ],
      },
      {
        title: 'Get Care at Home',
        details: [
          'Your nurse arrives at your doorstep',
          'Relax while we take care of you',
        ],
      },
      {
        title: 'Easy Payment',
        details: [
          'Pay only when your service starts',
        ],
      },
    ],
    Caregiving: [
      {
        title: 'Book a Caregiver',
        details: [
          'Select your needs and location',
          'Book in just a few taps',
        ],
      },
      {
        title: 'Personalized Match',
        details: [
          'We find the best caregiver for you',
          'You can review and approve',
        ],
      },
      {
        title: 'Care at Your Home',
        details: [
          'Caregiver visits your home',
          'Support and companionship provided',
        ],
      },
      {
        title: 'Simple Payment',
        details: [
          'Pay when care begins',
        ],
      },
    ],
    Equipments: [
      {
        title: 'Browse Equipments',
        details: [
          'See available medical equipment',
          'Choose what you need',
        ],
      },
      {
        title: 'Quick Delivery',
        details: [
          'We deliver to your doorstep',
          'Setup and demo included',
        ],
      },
      {
        title: 'Easy Returns',
        details: [
          'Return or extend as needed',
          'We handle pickup and support',
        ],
      },
      {
        title: 'Pay Securely',
        details: [
          'Pay online or on delivery',
        ],
      },
    ],
  };



  // Add Stats component
  const StatsSection = React.memo(() => {
    const stats = [
      { number: '5000+', label: 'Happy Patients', icon: 'heart', color: '#ef4444', bgColor: '#fef2f2' },
      { number: '24/7', label: 'Available', icon: 'clock', color: '#3b82f6', bgColor: '#eff6ff' },
      { number: '15min', label: 'Response Time', icon: 'lightning-bolt', color: '#f59e0b', bgColor: '#fffbeb' },
      { number: '4.9★', label: 'Rating', icon: 'star', color: '#10b981', bgColor: '#ecfdf5' },
    ];

    return (
      <View style={{ width: '100%', marginBottom: 32, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 24 }}>
          Why Choose ExpressAid?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {stats.map((stat, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(600).delay(index * 150)}
              style={{ 
                width: '48%', 
                alignItems: 'center', 
                marginBottom: 20,
                paddingVertical: 20,
                paddingHorizontal: 16,
                backgroundColor: stat.bgColor,
                borderRadius: 20,
                shadowColor: stat.color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 12,
                borderWidth: 1,
                borderColor: `${stat.color}20`,
              }}
            >
                              <View style={{ 
                  backgroundColor: stat.color, 
                  borderRadius: 16, 
                  padding: 12, 
                  marginBottom: 12,
                  shadowColor: stat.color,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                <MaterialCommunityIcons name={stat.icon as any} size={24} color="#fff" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: stat.color, marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                {stat.number}
              </Text>
              <Text style={{ fontSize: 13, color: '#374151', textAlign: 'center', fontWeight: '500' }}>
                {stat.label}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  });

  // Add Featured Services component
  const FeaturedServices = React.memo(() => {
    const services = [
      {
        id: '1',
        title: '24/7 Emergency Care',
        description: 'Immediate medical assistance at your doorstep',
        icon: 'ambulance',
        color: '#ef4444',
        bgColor: '#fef2f2',
        features: ['Instant Response', 'Qualified Nurses', 'Medical Equipment']
      },
      {
        id: '2',
        title: 'Home Nursing Care',
        description: 'Professional nursing care in the comfort of your home',
        icon: 'home-heart',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        features: ['Personalized Care', 'Regular Monitoring', 'Family Support']
      },
      {
        id: '3',
        title: 'Elder Care Services',
        description: 'Compassionate care for senior family members',
        icon: 'account-heart',
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
        features: ['Companionship', 'Medication Management', 'Daily Activities']
      }
    ];

    return (
      <View style={{ width: '100%', marginBottom: 32, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 }}>
          Featured Services
        </Text>
        {services.map((service, index) => (
          <Animated.View
            key={service.id}
            entering={FadeInUp.duration(600).delay(index * 200)}
            style={{
              backgroundColor: service.bgColor,
              borderRadius: 24,
              padding: 28,
              marginBottom: 20,
              shadowColor: service.color,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 16,
              borderWidth: 1,
              borderColor: `${service.color}15`,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ 
                backgroundColor: service.color, 
                borderRadius: 18, 
                padding: 14, 
                marginRight: 18,
                shadowColor: service.color,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <MaterialCommunityIcons name={service.icon as any} size={30} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.05)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                  {service.title}
                </Text>
                <Text style={{ fontSize: 15, color: '#6b7280', lineHeight: 20 }}>
                  {service.description}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {service.features.map((feature, idx) => (
                <View key={idx} style={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  borderRadius: 14, 
                  paddingHorizontal: 14, 
                  paddingVertical: 8, 
                  marginRight: 10, 
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ))}
      </View>
    );
  });

  // Add Call-to-Action component
  const CallToAction = React.memo(() => {
    return (
      <View style={{ width: '100%', marginBottom: 32, paddingHorizontal: 20 }}>
        <Animated.View
          entering={FadeInUp.duration(800)}
          style={{
            backgroundColor: 'rgba(37, 99, 235, 0.92)',
            borderRadius: 28,
            padding: 36,
            alignItems: 'center',
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.35,
            shadowRadius: 28,
            elevation: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.25)', 
            borderRadius: 24, 
            padding: 18, 
            marginBottom: 24,
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <MaterialCommunityIcons name="phone-in-talk" size={36} color="#fff" />
          </View>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
            Need Immediate Help?
          </Text>
          <Text style={{ fontSize: 17, color: 'rgba(255,255,255,0.95)', marginBottom: 28, textAlign: 'center', lineHeight: 24 }}>
            Our team is available 24/7 to provide you with the best care possible
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingVertical: 18,
              paddingHorizontal: 36,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
            onPress={goToSymptomEntry}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2563eb' }}>
              Book Now
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Main content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ 
          paddingBottom: 120, // Add bottom padding to account for the cart bars
          backgroundColor: 'transparent' 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Now inside the scrollable container */}
        <View style={styles.headerSection}>
          <View style={styles.headerTopBar}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
              <Ionicons name="menu" size={28} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.lightbulbBtn} onPress={() => setShowHowItWorksModal(true)}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          <Animated.View
            entering={FadeInUp.duration(900)}
            style={styles.titleWrap}
          >
            <Text style={styles.title}>
              {`${t('welcome')} ${getFirstName(userData?.name || 'User')}`}
              {`\n${t('book_nurse')}`}
            </Text>
          </Animated.View>
          
          <Animated.View style={styles.floatingSearchWrap}> 
            <Animated.View style={bounceStyle}>
              <Pressable style={styles.bigSearchBar} onPress={goToSymptomEntry} android_ripple={{ color: '#e0e7ff' }}>
                <Ionicons name="search" size={28} color="#2563eb" style={{ marginLeft: 18, marginRight: 10 }} />
                <Text style={styles.bigSearchInput}>{t('search_nurse')}</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {/* --- TESTIMONIALS SECTION --- */}
          <TestimonialCarousel />
          {/* Add Stats component */}
          <StatsSection />
          {/* Add Featured Services component */}
          <FeaturedServices />
          {/* Add Call-to-Action component */}
          <CallToAction />
        </View>
      </ScrollView>

      {showHowItWorksModal && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', zIndex: 9999 }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%', alignItems: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.18, shadowRadius: 12 }}>
            {/* Heading */}
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2563eb', marginBottom: 18 }}>How The App Works?</Text>
            {/* Tab Bar - Only Nursing */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  borderRadius: 20,
                  backgroundColor: '#2563eb',
                  marginHorizontal: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Nursing</Text>
              </View>
            </View>
            {/* Stepper/Timeline - Only Nursing Steps */}
            <View style={{ width: '100%' }}>
              {howItWorksSteps['Nursing'].map((step, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }}>
                  <View style={{ width: 36, alignItems: 'center' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                    </View>
                    {idx < howItWorksSteps['Nursing'].length - 1 && (
                      <View style={{ width: 2, height: 32, backgroundColor: '#2563eb', marginTop: 2 }} />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2563eb' }}>{step.title}</Text>
                    {step.details.map((d, i) => (
                      <Text key={i} style={{ color: '#374151', fontSize: 14, marginLeft: 8, marginTop: 2 }}>{d}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            {/* Close Button */}
            <TouchableOpacity onPress={() => setShowHowItWorksModal(false)} style={{ backgroundColor: '#2563eb', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 32, alignSelf: 'center', marginTop: 8 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* View Active Order Bar above the cart bar */}
      <ViewActiveOrderBar navigation={navigation} style={{ height: 40, paddingVertical: 0 }} textStyle={{ fontSize: 14 }} />
      {/* View Cart Bar at the bottom if cart has items */}
      <ViewCartBar navigation={navigation} style={{ height: 40, paddingVertical: 0 }} textStyle={{ fontSize: 14 }} />
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '80%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{t('location_required')}</Text>
            <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 24 }}>
              {locationPermissionPermanentlyDenied
                ? t('location_access_permanently_denied')
                : t('location_access_message')}
            </Text>
            {locationPermissionPermanentlyDenied ? (
              <TouchableOpacity
                style={{ backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 12 }}
                onPress={() => {
                  setLocationModalVisible(false);
                  Linking.openSettings();
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('open_settings')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 12 }}
                onPress={() => {
                  setLocationModalVisible(false);
                  requestLocation();
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('retry')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, borderWidth: 1, borderColor: '#2563eb' }}
              onPress={() => {
                setLocationModalVisible(false);
              }}
            >
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={hospitalMapVisible}
        animationType="slide"
        onRequestClose={() => setHospitalMapVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{t('nearby_hospitals')}</Text>
            <TouchableOpacity onPress={() => setHospitalMapVisible(false)}>
              <Text style={{ fontSize: 24, color: '#666' }}>×</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: getHospitalMapUrl() }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerSection: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 80 : 100, // Increased top padding to move everything down more
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32, // Increased bottom margin for more spacing
    marginTop: 16, // Added top margin for extra spacing
  },
  menuBtn: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  lightbulbBtn: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contentContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 20, // Add some top padding to separate from header
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 36, // Increased bottom margin
    marginTop: 16, // Added top margin
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '88%',
    height: 56,
    marginBottom: 36,
    elevation: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#94a3b8',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 10,
    marginRight: 16,
    fontWeight: '600',
  },
  floatingSearchWrap: {
    width: '92%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  bigSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 32,
    width: '100%',
    height: 68,
    elevation: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    marginBottom: 0,
    paddingHorizontal: 8,
  },
  bigSearchInput: {
    flex: 1,
    fontSize: 22,
    color: '#2563eb',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: '600',
  },
});

export default HomeScreen; 