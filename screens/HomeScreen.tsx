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
  const [howItWorksVisible, setHowItWorksVisible] = React.useState(false);
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

  // --- FEATURED SERVICES DATA ---
  const featuredServices = [
    {
      id: '1',
      title: '24/7 Emergency Care',
      icon: 'medical-bag',
      color: '#ef4444',
    },
    {
      id: '2',
      title: 'Home Nursing',
      icon: 'stethoscope',
      color: '#3b82f6',
    },
    {
      id: '3',
      title: 'Elderly Care',
      icon: 'account-heart',
      color: '#10b981',
    },
    {
      id: '4',
      title: 'Post-Surgery Care',
      icon: 'hospital-building',
      color: '#f59e0b',
    },
  ];

  // --- QUICK ACTIONS DATA ---
  const quickActions = [
    {
      id: '1',
      title: 'Book Nurse',
      subtitle: 'Find & book instantly',
      icon: 'nurse',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      onPress: goToSymptomEntry,
    },
    {
      id: '2',
      title: 'Track Order',
      subtitle: 'Monitor your care',
      icon: 'map-marker-path',
      color: '#10b981',
      bgColor: '#ecfdf5',
      onPress: handleTrackNurse,
    },
    {
      id: '3',
      title: 'Find Hospitals',
      subtitle: 'Nearby facilities',
      icon: 'hospital-marker',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      onPress: openHospitalInMaps,
    },
    {
      id: '4',
      title: 'Health Tips',
      subtitle: 'Daily wellness',
      icon: 'lightbulb-on',
      color: '#8b5cf6',
      bgColor: '#f3f4f6',
      onPress: () => setHowItWorksVisible(true),
    },
  ];

  // --- HEALTH TIPS DATA ---
  const healthTips = [
    {
      id: '1',
      title: 'Stay Hydrated',
      description: 'Drink 8 glasses of water daily for better health',
      icon: 'cup-water',
      color: '#3b82f6',
    },
    {
      id: '2',
      title: 'Regular Exercise',
      description: '30 minutes of daily activity boosts immunity',
      icon: 'run',
      color: '#10b981',
    },
    {
      id: '3',
      title: 'Quality Sleep',
      description: '7-9 hours of sleep improves recovery',
      icon: 'sleep',
      color: '#8b5cf6',
    },
  ];

  // --- EMERGENCY CONTACTS DATA ---
  const emergencyContacts = [
    {
      id: '1',
      name: 'Ambulance',
      number: '108',
      icon: 'ambulance',
      color: '#ef4444',
    },
    {
      id: '2',
      name: 'Police',
      number: '100',
      icon: 'shield-alert',
      color: '#3b82f6',
    },
    {
      id: '3',
      name: 'Fire',
      number: '101',
      icon: 'fire-truck',
      color: '#f59e0b',
    },
  ];

  // --- TESTIMONIALS CAROUSEL COMPONENT ---
  const TestimonialCarousel: React.FC = () => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const flatListRef = React.useRef<FlatList>(null);
    const CARD_WIDTH = Math.round(width * 0.92);

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
        showsHorizontalScrollIndicator={false}
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
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 20,
              marginRight: index === testimonials.length - 1 ? 0 : 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
              marginHorizontal: 12,
              marginTop: 20,
              marginBottom: 20,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2563eb', marginRight: 8 }}>{item.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#fbbf24" style={{ marginRight: 1 }} />
                ))}
              </View>
            </View>
            <Text style={{ color: '#374151', fontSize: 15, lineHeight: 22 }}>{item.message}</Text>
          </Animated.View>
        )}
      />
    );
  };

  // --- FEATURE CARDS COMPONENT ---
  const FeatureCards: React.FC = () => {
    const features = [
      {
        id: '1',
        icon: 'heart',
        value: '5000+',
        label: 'Happy Patients',
        color: '#ec4899',
        bgColor: '#fdf2f8',
      },
      {
        id: '2',
        icon: 'clock-outline',
        value: '24/7',
        label: 'Available',
        color: '#3b82f6',
        bgColor: '#eff6ff',
      },
      {
        id: '3',
        icon: 'flash',
        value: '15min',
        label: 'Response Time',
        color: '#f59e0b',
        bgColor: '#fffbeb',
      },
      {
        id: '4',
        icon: 'star',
        value: '4.9',
        label: 'Rating',
        color: '#10b981',
        bgColor: '#ecfdf5',
      },
    ];

    return (
      <View style={styles.featureGrid}>
        {features.map((feature, index) => (
          <Animated.View
            key={feature.id}
            entering={FadeInUp.duration(900).delay(index * 100)}
            style={[styles.featureCard, { backgroundColor: feature.bgColor }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon as any} size={24} color={feature.color} />
            </View>
            <Text style={[styles.featureValue, { color: feature.color }]}>{feature.value}</Text>
            <Text style={styles.featureLabel}>{feature.label}</Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  // --- FEATURED SERVICES COMPONENT ---
  const FeaturedServices: React.FC = () => {
    return (
      <View style={styles.featuredServicesContainer}>
        <Text style={styles.sectionTitle}>Featured Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
          {featuredServices.map((service, index) => (
            <Animated.View
              key={service.id}
              entering={FadeInUp.duration(900).delay(index * 100)}
              style={styles.serviceCard}
            >
              <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                <MaterialCommunityIcons name={service.icon as any} size={28} color={service.color} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // --- QUICK ACTIONS COMPONENT ---
  const QuickActions: React.FC = () => {
    return (
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <Animated.View
              key={action.id}
              entering={FadeInUp.duration(900).delay(index * 100)}
            >
              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: action.bgColor }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionTitle, { color: action.color }]}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  // --- HEALTH TIPS COMPONENT ---
  const HealthTips: React.FC = () => {
    return (
      <View style={styles.healthTipsContainer}>
        <Text style={styles.sectionTitle}>Daily Health Tips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsScroll}>
          {healthTips.map((tip, index) => (
            <Animated.View
              key={tip.id}
              entering={FadeInUp.duration(900).delay(index * 100)}
              style={styles.healthTipCard}
            >
              <View style={[styles.healthTipIcon, { backgroundColor: tip.color + '20' }]}>
                <MaterialCommunityIcons name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <Text style={styles.healthTipTitle}>{tip.title}</Text>
              <Text style={styles.healthTipDescription}>{tip.description}</Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // --- EMERGENCY CONTACTS COMPONENT ---
  const EmergencyContacts: React.FC = () => {
    const handleEmergencyCall = (number: string) => {
      Linking.openURL(`tel:${number}`);
    };

    return (
      <View style={styles.emergencyContainer}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.emergencyGrid}>
          {emergencyContacts.map((contact, index) => (
            <Animated.View
              key={contact.id}
              entering={FadeInUp.duration(900).delay(index * 100)}
            >
              <TouchableOpacity
                style={styles.emergencyCard}
                onPress={() => handleEmergencyCall(contact.number)}
                activeOpacity={0.8}
              >
                <View style={[styles.emergencyIcon, { backgroundColor: contact.color + '20' }]}>
                  <MaterialCommunityIcons name={contact.icon as any} size={24} color={contact.color} />
                </View>
                <Text style={styles.emergencyName}>{contact.name}</Text>
                <Text style={[styles.emergencyNumber, { color: contact.color }]}>{contact.number}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  // --- STATS BANNER COMPONENT ---
  const StatsBanner: React.FC = () => {
    return (
      <Animated.View
        entering={FadeInUp.duration(900)}
        style={styles.statsBanner}
      >
        <LinearGradient
          colors={['#2563eb', '#1d4ed8']}
          style={styles.statsGradient}
        >
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Patients Served</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Expert Nurses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  // --- WELCOME BANNER COMPONENT ---
  const WelcomeBanner: React.FC = () => {
    return (
      <Animated.View
        entering={FadeInUp.duration(900)}
        style={styles.welcomeBanner}
      >
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe']}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeIcon}>
              <MaterialCommunityIcons name="heart-pulse" size={32} color="#2563eb" />
            </View>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Your Health, Our Priority</Text>
              <Text style={styles.welcomeSubtitle}>Professional care at your doorstep</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const bounce = useSharedValue(0);
  React.useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value * 6 }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Fixed Header with Menu and Light Bulb */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.lightbulbBtn} onPress={() => setHowItWorksVisible(true)}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ 
          paddingBottom: 120,
          backgroundColor: 'transparent' 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Animated.View
            entering={FadeInUp.duration(900)}
            style={styles.titleWrap}
          >
            <Text style={styles.welcomeText}>
              Welcome {getFirstName(userData?.name || 'User')}
            </Text>
            <Text style={styles.subtitleText}>
              Book a nurse in 10 mins
            </Text>
          </Animated.View>
          
          <Animated.View style={styles.floatingSearchWrap}> 
            <Animated.View style={bounceStyle}>
              <Pressable style={styles.bigSearchBar} onPress={goToSymptomEntry} android_ripple={{ color: '#e0e7ff' }}>
                <Ionicons name="search" size={24} color="#2563eb" style={{ marginLeft: 20, marginRight: 12 }} />
                <Text style={styles.bigSearchInput}>Click to Book in 10 Mins</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {/* Welcome Banner */}
          <WelcomeBanner />
          {/* Stats Banner - At the top for impact */}
          <StatsBanner />

          {/* Testimonials Section */}
          <TestimonialCarousel />

          {/* Why Choose ExpressAid Section */}
          <View style={styles.whyChooseSection}>
            <Text style={styles.sectionTitle}>Why Choose ExpressAid?</Text>
            <FeatureCards />
          </View>

          {/* Quick Actions Section */}
          <QuickActions />

          {/* Featured Services Section */}
          <FeaturedServices />

          {/* Health Tips Section */}
          <HealthTips />

          {/* Emergency Contacts Section */}
          <EmergencyContacts />
        </View>
      </ScrollView>

      <>
        {howItWorksVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Header with close button */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <MaterialCommunityIcons name="lightbulb-on" size={28} color="#2563eb" />
                  <Text style={styles.modalTitle}>Health Tips & How It Works</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setHowItWorksVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                                 <TouchableOpacity 
                   style={[styles.tabButton, styles.activeTabButton]}
                   onPress={() => setHowItWorksTab('Nursing')}
                 >
                   <MaterialCommunityIcons name="stethoscope" size={20} color="#2563eb" />
                   <Text style={styles.activeTabText}>Nursing</Text>
                 </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.tabButton}
                  onPress={() => setHowItWorksTab('Caregiving')}
                >
                  <MaterialCommunityIcons name="account-heart" size={20} color="#6b7280" />
                  <Text style={styles.tabText}>Caregiving</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.tabButton}
                  onPress={() => setHowItWorksTab('Equipments')}
                >
                  <MaterialCommunityIcons name="medical-bag" size={20} color="#6b7280" />
                  <Text style={styles.tabText}>Equipment</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {howItWorksTab === 'Nursing' && (
                  <View style={styles.tabContent}>
                    {/* How It Works Steps */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>How Nursing Service Works</Text>
                      <View style={styles.stepsContainer}>
                        {[
                          {
                            icon: 'calendar-plus',
                            title: 'Book a Home Nurse',
                            description: 'Choose your location and required service. Share your care needs and preferences. Submit your request in seconds.',
                            time: '~5 min',
                            color: '#10b981'
                          },
                          {
                            icon: 'account-check-outline',
                            title: 'Get Matched with a Nurse',
                            description: 'We quickly find the best nurse for your needs. Review nurse profile and confirm your choice.',
                            time: '~5 min',
                            color: '#3b82f6'
                          },
                          {
                            icon: 'handshake-outline',
                            title: 'Receive Quality Care at Home',
                            description: 'Your nurse arrives at your location. Care is delivered as per your plan and needs.',
                            time: '~10 min',
                            color: '#f59e0b'
                          },
                          {
                            icon: 'currency-inr',
                            title: 'Pay Easily & Enjoy Peace of Mind',
                            description: 'Pay securely when your service starts. Multiple payment options available.',
                            time: 'Instant',
                            color: '#8b5cf6'
                          }
                        ].map((step, index) => (
                          <View key={index} style={styles.stepContainer}>
                            <View style={styles.stepHeader}>
                              <View style={[styles.stepIcon, { backgroundColor: step.color + '20' }]}>
                                <MaterialCommunityIcons name={step.icon as any} size={24} color={step.color} />
                              </View>
                              <View style={styles.stepInfo}>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <View style={styles.timeBadge}>
                                  <Text style={[styles.timeText, { color: step.color }]}>{step.time}</Text>
                                </View>
                              </View>
                            </View>
                            <Text style={styles.stepDescription}>{step.description}</Text>
                            {index < 3 && <View style={[styles.stepDivider, { backgroundColor: step.color + '30' }]} />}
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Health Tips */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Daily Health Tips</Text>
                      <View style={styles.tipsGrid}>
                        {[
                          {
                            icon: 'cup-water',
                            title: 'Stay Hydrated',
                            description: 'Drink 8-10 glasses of water daily for better health and recovery',
                            color: '#3b82f6'
                          },
                          {
                            icon: 'run',
                            title: 'Light Exercise',
                            description: 'Gentle walking or stretching helps with circulation and mood',
                            color: '#10b981'
                          },
                          {
                            icon: 'sleep',
                            title: 'Quality Sleep',
                            description: '7-9 hours of sleep improves healing and immune function',
                            color: '#8b5cf6'
                          },
                          {
                            icon: 'food-apple',
                            title: 'Balanced Diet',
                            description: 'Include fruits, vegetables, and proteins in your daily meals',
                            color: '#f59e0b'
                          }
                        ].map((tip, index) => (
                          <View key={index} style={styles.tipCard}>
                            <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
                              <MaterialCommunityIcons name={tip.icon as any} size={20} color={tip.color} />
                            </View>
                            <Text style={styles.tipTitle}>{tip.title}</Text>
                            <Text style={styles.tipDescription}>{tip.description}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Emergency Preparedness */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Emergency Preparedness</Text>
                      <View style={styles.emergencyTipsContainer}>
                        <View style={styles.emergencyTip}>
                          <MaterialCommunityIcons name="phone-alert" size={24} color="#ef4444" />
                          <Text style={styles.emergencyTipText}>Keep emergency contacts handy</Text>
                        </View>
                        <View style={styles.emergencyTip}>
                          <MaterialCommunityIcons name="medical-bag" size={24} color="#ef4444" />
                          <Text style={styles.emergencyTipText}>Have basic first aid supplies ready</Text>
                        </View>
                        <View style={styles.emergencyTip}>
                          <MaterialCommunityIcons name="file-document" size={24} color="#ef4444" />
                          <Text style={styles.emergencyTipText}>Keep medical records organized</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {howItWorksTab === 'Caregiving' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.comingSoonText}>Caregiving services coming soon!</Text>
                    <Text style={styles.comingSoonSubtext}>We're working on bringing you professional caregiving services.</Text>
                  </View>
                )}

                {howItWorksTab === 'Equipments' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.comingSoonText}>Medical equipment rental coming soon!</Text>
                    <Text style={styles.comingSoonSubtext}>We're working on bringing you medical equipment rental services.</Text>
                  </View>
                )}
              </ScrollView>
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
      </>
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
    paddingTop: Platform.OS === 'android' ? 120 : 140,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  menuBtn: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  lightbulbBtn: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contentContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  titleWrap: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  floatingSearchWrap: {
    width: '100%',
  },
  bigSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    height: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bigSearchInput: {
    flex: 1,
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
  },
  whyChooseSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    marginLeft: 4,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuredServicesContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  servicesScroll: {
    paddingRight: 20,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  healthTipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tipsScroll: {
    paddingRight: 20,
  },
  healthTipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  healthTipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthTipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  healthTipDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emergencyContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  emergencyNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsBanner: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  statsGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 10,
  },
  welcomeBanner: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  welcomeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    marginRight: 15,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeTabButton: {
    backgroundColor: '#2563eb',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  tabText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  modalScrollView: {
    width: '100%',
  },
  tabContent: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%',
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1e3a5c',
    marginBottom: 4,
  },
  timeBadge: {
    backgroundColor: '#e6f9f0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  stepDivider: {
    height: 1,
    marginVertical: 16,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  tipDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emergencyTipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: (width - 60) / 2, // Adjust for grid layout
  },
  emergencyTipText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;