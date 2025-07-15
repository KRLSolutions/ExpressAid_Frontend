import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Pressable, Dimensions, Alert, Modal, FlatList, KeyboardAvoidingView, TextInput, Image, Linking, ScrollView, ImageBackground } from 'react-native';
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
      navigation.navigate('SearchingForNurseScreen', { orderId: activeOrder.orderId || activeOrder._id });
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

  // Add static articles data with memoization for better performance
  const articles = useMemo(() => [
    {
      id: '1',
      emoji: '🛡️',
      title: '10 Ways to Boost Your Immunity Naturally',
      description: '10 Ways to Boost Your Immunity Naturally',
      link: 'https://www.healthline.com/health/how-to-boost-immune-system',
      image: require('../assets/articles/immunity-boost.png'),
      content: 'Your immune system is your body\'s defense against illness. Here are 10 natural ways to strengthen it: 1) Get 7-9 hours of quality sleep nightly - sleep deprivation weakens immunity. 2) Eat a rainbow of fruits and vegetables rich in vitamins C, E, and antioxidants. 3) Include healthy fats like olive oil, nuts, and fatty fish for omega-3s. 4) Add fermented foods like yogurt, kimchi, or sauerkraut for gut health. 5) Limit added sugars which can suppress immune function. 6) Exercise regularly but moderately - intense workouts can temporarily weaken immunity. 7) Stay hydrated with water, herbal teas, and broths. 8) Manage stress through meditation, yoga, or hobbies. 9) Consider vitamin D supplements if you have limited sun exposure. 10) Practice good hygiene and avoid smoking. Remember, no single food or supplement can prevent illness, but a healthy lifestyle creates the best foundation for strong immunity.',
    },
    {
      id: '2',
      emoji: '🧠',
      title: 'How to Take Care of Your Mental Health at Home',
      description: 'How to Take Care of Your Mental Health at Home',
      link: 'https://www.who.int/campaigns/world-mental-health-day',
      image: require('../assets/adaptive-icon.png'),
      content: 'Mental health is just as important as physical health. Here are practical ways to care for your mind at home: 1) Establish a daily routine with consistent sleep and meal times. 2) Practice mindfulness or meditation for 10-15 minutes daily to reduce stress and anxiety. 3) Stay connected with loved ones through calls, video chats, or safe in-person meetings. 4) Limit news consumption and social media use to reduce information overload. 5) Exercise regularly - even a 20-minute walk can boost mood and reduce stress. 6) Pursue hobbies and activities you enjoy, whether it\'s reading, cooking, or creative projects. 7) Practice gratitude by writing down three things you\'re thankful for each day. 8) Learn to say no and set healthy boundaries to prevent burnout. 9) Consider therapy or counseling if you\'re struggling - many services are available online. 10) Remember that it\'s okay to not be okay sometimes, and seeking help is a sign of strength.',
    },
    {
      id: '3',
      emoji: '😴',
      title: 'How to Sleep Better: Simple Tips for Quality Rest',
      description: 'How to Sleep Better: Simple Tips for Quality Rest',
      link: 'https://www.sleepfoundation.org/sleep-hygiene/healthy-sleep-tips',
      image: require('../assets/adaptive-icon.png'),
      content: 'Quality sleep is essential for health and well-being. Here are proven strategies for better sleep: 1) Stick to a consistent sleep schedule, even on weekends, to regulate your body\'s internal clock. 2) Create a relaxing bedtime routine - read, take a warm bath, or practice gentle stretching. 3) Keep your bedroom cool (65-68°F), dark, and quiet. Consider blackout curtains and white noise machines. 4) Avoid screens 1-2 hours before bed - blue light can interfere with melatonin production. 5) Limit caffeine after 2 PM and avoid large meals close to bedtime. 6) Exercise regularly but finish workouts at least 3 hours before bed. 7) Use your bed only for sleep and intimacy - avoid working or watching TV in bed. 8) If you can\'t fall asleep within 20 minutes, get up and do something relaxing until you feel sleepy. 9) Consider natural sleep aids like chamomile tea or lavender essential oil. 10) Address underlying issues like stress, anxiety, or sleep disorders with professional help if needed.',
    },
    {
      id: '4',
      emoji: '🆘',
      title: 'Essential First Aid Tips Everyone Should Know',
      description: 'Essential First Aid Tips Everyone Should Know',
      link: 'https://www.redcross.org/get-help/first-aid/first-aid-steps.html',
      image: require('../assets/adaptive-icon.png'),
      content: 'Basic first aid knowledge can save lives. Here are essential skills everyone should know: 1) For bleeding: Apply direct pressure with a clean cloth, elevate the wound if possible, and call emergency services for severe bleeding. 2) For burns: Cool with running water for 10-20 minutes, cover with sterile gauze, and seek medical attention for severe burns. 3) For choking: Use the Heimlich maneuver - stand behind the person, wrap arms around their waist, make a fist above their navel, and give quick upward thrusts. 4) For unconsciousness: Check for breathing and pulse, call emergency services, and perform CPR if trained. 5) For sprains: Remember RICE - Rest, Ice, Compression, and Elevation. 6) For heat stroke: Move to a cool place, remove excess clothing, and apply cool compresses. 7) For seizures: Clear the area, don\'t restrain the person, and call emergency services if it lasts more than 5 minutes. 8) Always call emergency services for chest pain, difficulty breathing, or severe injuries. 9) Keep a well-stocked first aid kit at home and in your car. 10) Consider taking a first aid certification course for comprehensive training.',
    },
    {
      id: '5',
      emoji: '🌸',
      title: 'Dealing With Seasonal Allergies: Prevention & Care',
      description: 'Dealing With Seasonal Allergies: Prevention & Care',
      link: 'https://www.mayoclinic.org/diseases-conditions/hay-fever/in-depth/allergies/art-20049365',
      image: require('../assets/adaptive-icon.png'),
      content: 'Seasonal allergies affect millions of people. Here\'s how to manage them effectively: 1) Check pollen counts daily and plan outdoor activities when counts are lower. 2) Keep windows closed during high pollen times and use air conditioning with HEPA filters. 3) Shower and change clothes after being outdoors to remove pollen from your body and clothing. 4) Use over-the-counter antihistamines, decongestants, or nasal sprays as directed by your doctor. 5) Consider prescription medications like nasal corticosteroids for more severe symptoms. 6) Try saline nasal rinses to flush out allergens and reduce congestion. 7) Wear sunglasses and a hat outdoors to protect your eyes and face from pollen. 8) Vacuum regularly with a HEPA filter and wash bedding weekly in hot water. 9) Consider immunotherapy (allergy shots) for long-term relief from severe allergies. 10) Monitor symptoms and see a doctor if they interfere with daily activities or don\'t respond to over-the-counter treatments.',
    },
    {
      id: '6',
      emoji: '💪',
      title: 'How to Stay Fit Without Going to the Gym',
      description: 'How to Stay Fit Without Going to the Gym',
      link: 'https://www.cdc.gov/physicalactivity/basics/index.htm',
      image: require('../assets/adaptive-icon.png'),
      content: 'You don\'t need a gym membership to stay fit and healthy. Here are effective ways to exercise at home: 1) Bodyweight exercises like push-ups, squats, lunges, and planks build strength without equipment. 2) Use household items as weights - water bottles, books, or backpacks filled with items. 3) Follow online workout videos for guided sessions ranging from yoga to high-intensity training. 4) Walk or jog in your neighborhood - aim for 10,000 steps daily or 150 minutes of moderate activity weekly. 5) Use stairs instead of elevators and walk short distances instead of driving. 6) Dance to your favorite music for a fun cardio workout. 7) Try yoga or Pilates for flexibility and core strength - many free videos are available online. 8) Use resistance bands for strength training - they\'re affordable and portable. 9) Create a home circuit workout combining cardio and strength exercises. 10) Stay active throughout the day by taking regular breaks to stretch and move around.',
    },
    {
      id: '7',
      emoji: '🏥',
      title: 'Why Regular Health Checkups Are Important',
      description: 'Why Regular Health Checkups Are Important',
      link: 'https://www.nhs.uk/live-well/healthy-body/health-screening-and-checks/',
      image: require('../assets/adaptive-icon.png'),
      content: 'Regular health checkups are crucial for maintaining good health and catching problems early. Here\'s why they matter: 1) Early detection saves lives - many serious conditions show no symptoms until advanced stages. 2) Preventive care is more cost-effective than treating advanced diseases. 3) Regular screenings can detect cancer, heart disease, diabetes, and other conditions before they become serious. 4) Blood pressure, cholesterol, and blood sugar checks help monitor cardiovascular health. 5) Age-appropriate screenings like mammograms, colonoscopies, and prostate exams are essential. 6) Vaccinations protect against preventable diseases and boost immunity. 7) Dental checkups prevent oral health problems that can affect overall health. 8) Mental health screenings help identify depression, anxiety, and other conditions early. 9) Regular checkups establish a baseline for your health and help track changes over time. 10) Your doctor can provide personalized advice on lifestyle changes, diet, and exercise based on your health status.',
    },
    {
      id: '8',
      emoji: '😌',
      title: 'How to Manage Stress in Your Daily Life',
      description: 'How to Manage Stress in Your Daily Life',
      link: 'https://www.apa.org/topics/stress',
      image: require('../assets/adaptive-icon.png'),
      content: 'Stress is a normal part of life, but chronic stress can harm your health. Here are effective ways to manage it: 1) Practice deep breathing exercises - inhale for 4 counts, hold for 4, exhale for 4. 2) Exercise regularly - physical activity releases endorphins that naturally reduce stress. 3) Maintain a healthy sleep schedule - aim for 7-9 hours of quality sleep nightly. 4) Practice mindfulness or meditation for 10-20 minutes daily to calm your mind. 5) Set realistic goals and learn to say no to avoid overcommitting yourself. 6) Stay connected with supportive friends and family members. 7) Limit caffeine and alcohol, which can worsen stress and anxiety. 8) Take regular breaks during work - even 5-minute walks can help. 9) Pursue hobbies and activities you enjoy to provide mental breaks. 10) Consider professional help if stress interferes with daily life or causes physical symptoms.',
    },
    {
      id: '9',
      emoji: '🏠',
      title: 'Common Home Remedies That Actually Work',
      description: 'Common Home Remedies That Actually Work',
      link: 'https://www.medicalnewstoday.com/articles/321644',
      image: require('../assets/adaptive-icon.png'),
      content: 'Many traditional home remedies have scientific backing and can provide relief for common ailments: 1) Honey for sore throats - it has antibacterial properties and soothes irritation. 2) Ginger for nausea - fresh ginger tea or candied ginger can ease morning sickness and motion sickness. 3) Saltwater gargle for sore throats - mix 1/2 teaspoon salt in warm water and gargle several times daily. 4) Peppermint tea for digestive issues - it can relieve bloating, gas, and stomach discomfort. 5) Chamomile tea for sleep and anxiety - it has natural calming properties. 6) Apple cider vinegar for heartburn - dilute 1 tablespoon in water before meals. 7) Turmeric for inflammation - add to food or take as a supplement for joint pain. 8) Epsom salt baths for muscle soreness - the magnesium is absorbed through the skin. 9) Steam inhalation for congestion - add eucalyptus oil to hot water and inhale. 10) Remember that home remedies complement, not replace, medical treatment for serious conditions.',
    },
    {
      id: '10',
      emoji: '✨',
      title: 'How to Take Care of Your Skin & Hair Naturally',
      description: 'How to Take Care of Your Skin & Hair Naturally',
      link: 'https://www.healthline.com/health/beauty-skin-care',
      image: require('../assets/adaptive-icon.png'),
      content: 'Natural skin and hair care can be effective and gentle. Here are evidence-based natural care tips: 1) For skin: Use gentle cleansers, moisturize daily, and always wear sunscreen with SPF 30+. 2) Natural oils like coconut, jojoba, or argan oil can moisturize skin and hair without harsh chemicals. 3) Aloe vera gel soothes sunburns and irritated skin while promoting healing. 4) Honey has antibacterial properties and can be used as a natural face mask for acne-prone skin. 5) Apple cider vinegar diluted with water can balance scalp pH and reduce dandruff. 6) Essential oils like tea tree oil have antimicrobial properties for acne treatment. 7) Stay hydrated - drinking enough water improves skin elasticity and hair health. 8) Eat a balanced diet rich in vitamins A, C, E, and omega-3 fatty acids for healthy skin and hair. 9) Avoid over-washing hair and use lukewarm water to prevent dryness. 10) Protect hair from heat damage by using lower heat settings and heat protectants.',
    },
  ], []);

  // Meal & Diet Tips Articles
  const mealTips = useMemo(() => [
    {
      id: '1',
      emoji: '🥗',
      title: '10 Superfoods You Should Include in Your Diet',
      description: '10 Superfoods You Should Include in Your Diet',
      link: 'https://www.medicalnewstoday.com/articles/what-are-superfoods',
      image: require('../assets/adaptive-icon.png'),
      content: 'Superfoods are nutrient-rich foods that support overall health. Examples include berries (antioxidants), leafy greens (vitamins, fiber), nuts and seeds (healthy fats), fatty fish (omega-3s), whole grains, beans, and colorful vegetables. Eating a variety of these foods can help reduce disease risk, boost immunity, and provide lasting energy. Remember, no single food is a cure-all—focus on a balanced, diverse diet.',
    },
    {
      id: '2',
      emoji: '🥑',
      title: 'Healthy Meal Prep Ideas for Busy People',
      description: 'Healthy Meal Prep Ideas for Busy People',
      link: 'https://www.healthline.com/nutrition/meal-prep-guide',
      image: require('../assets/adaptive-icon.png'),
      content: 'Meal prep saves time and ensures healthy eating. Start by planning meals for the week and creating a shopping list. Cook proteins in bulk (chicken, fish, beans) and store in portions. Prepare grains like quinoa, brown rice, or pasta ahead of time. Chop vegetables and store in containers for quick access. Use mason jars for salads and overnight oats. Freeze soups and stews in individual portions. Invest in quality storage containers and label everything with dates. Prep breakfast items like egg muffins or smoothie packs. Remember to include variety to avoid food fatigue. This approach saves money, reduces food waste, and helps maintain healthy eating habits.',
    },
    {
      id: '3',
      emoji: '🍎',
      title: 'How to Eat More Fruits and Vegetables Daily',
      description: 'How to Eat More Fruits and Vegetables Daily',
      link: 'https://www.cdc.gov/fruitsandvegetables/index.html',
      image: require('../assets/adaptive-icon.png'),
      content: 'Aim for 5-9 servings of fruits and vegetables daily. Start by adding one serving to each meal. Keep washed, cut vegetables in the fridge for easy snacking. Add spinach or kale to smoothies for extra nutrients. Use vegetables as the base for meals (zucchini noodles, cauliflower rice). Snack on fruits instead of processed foods. Add vegetables to soups, stews, and casseroles. Try new recipes that feature vegetables as the main ingredient. Keep frozen fruits and vegetables on hand for convenience. Remember that all forms count—fresh, frozen, canned, and dried. Gradually increase portions to meet daily recommendations.',
    },
    {
      id: '4',
      emoji: '💧',
      title: 'The Importance of Staying Hydrated Throughout the Day',
      description: 'The Importance of Staying Hydrated Throughout the Day',
      link: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256',
      image: require('../assets/adaptive-icon.png'),
      content: 'Water is essential for every bodily function. Aim for 8-10 glasses daily, more if you exercise or live in hot climates. Start your day with a glass of water. Carry a reusable water bottle and sip throughout the day. Set reminders on your phone to drink water regularly. Eat water-rich foods like cucumbers, watermelon, and celery. Monitor your urine color—pale yellow indicates good hydration. Drink water before, during, and after exercise. Limit caffeine and alcohol which can dehydrate you. Consider electrolyte drinks for intense workouts. Remember that thirst is a late sign of dehydration.',
    },
    {
      id: '5',
      emoji: '🥩',
      title: 'Protein-Rich Foods for Muscle Building and Recovery',
      description: 'Protein-Rich Foods for Muscle Building and Recovery',
      link: 'https://www.healthline.com/nutrition/20-delicious-high-protein-foods',
      image: require('../assets/adaptive-icon.png'),
      content: 'Protein is crucial for muscle repair and growth. Include lean meats like chicken, turkey, and fish in your diet. Eggs are a complete protein source and versatile for any meal. Greek yogurt provides protein and probiotics for gut health. Legumes like beans, lentils, and chickpeas are excellent plant-based protein sources. Nuts and seeds offer protein and healthy fats. Quinoa is a complete plant protein. Cottage cheese is high in casein protein for sustained release. Consider protein timing—consume protein within 30 minutes after workouts. Aim for 0.8-1.2g of protein per kg of body weight daily.',
    },
    {
      id: '6',
      emoji: '🌾',
      title: 'Whole Grains vs Refined Grains: Making Better Choices',
      description: 'Whole Grains vs Refined Grains: Making Better Choices',
      link: 'https://www.wholegrainscouncil.org/whole-grains-101',
      image: require('../assets/adaptive-icon.png'),
      content: 'Whole grains contain all parts of the grain kernel, providing more nutrients and fiber. Choose brown rice over white rice, whole wheat bread over white bread, and oatmeal over sugary cereals. Look for "100% whole grain" on labels. Quinoa, barley, and farro are excellent whole grain options. Whole grains help regulate blood sugar and provide sustained energy. They also support digestive health and reduce disease risk. Gradually replace refined grains with whole grain alternatives. Remember that even whole grains should be consumed in moderation as part of a balanced diet.',
    },
    {
      id: '7',
      emoji: '🥛',
      title: 'Dairy Alternatives for Lactose Intolerance',
      description: 'Dairy Alternatives for Lactose Intolerance',
      link: 'https://www.healthline.com/nutrition/dairy-alternatives',
      image: require('../assets/adaptive-icon.png'),
      content: 'Many people are lactose intolerant or choose to avoid dairy. Almond milk is low in calories and rich in vitamin E. Soy milk provides complete protein and is often fortified with calcium. Oat milk is creamy and naturally sweet. Coconut milk is rich and works well in cooking. Cashew milk is smooth and versatile. Look for fortified alternatives to ensure adequate calcium and vitamin D intake. Consider making your own nut milks for control over ingredients. Remember that not all alternatives are nutritionally equivalent to dairy milk.',
    },
    {
      id: '8',
      emoji: '🍯',
      title: 'Natural Sweeteners: Healthier Alternatives to Sugar',
      description: 'Natural Sweeteners: Healthier Alternatives to Sugar',
      link: 'https://www.healthline.com/nutrition/natural-sugar-substitutes',
      image: require('../assets/adaptive-icon.png'),
      content: 'Natural sweeteners can be better alternatives to refined sugar. Honey contains antioxidants and has antimicrobial properties. Maple syrup provides minerals like zinc and manganese. Stevia is calorie-free and doesn\'t affect blood sugar. Monk fruit sweetener is natural and doesn\'t raise blood glucose. Coconut sugar has a lower glycemic index than regular sugar. Use these sweeteners in moderation—they still contain calories and can affect blood sugar. Consider the flavor profile when substituting in recipes.',
    },
    {
      id: '9',
      emoji: '🌿',
      title: 'Anti-Inflammatory Foods to Include in Your Diet',
      description: 'Anti-Inflammatory Foods to Include in Your Diet',
      link: 'https://www.healthline.com/nutrition/anti-inflammatory-foods',
      image: require('../assets/adaptive-icon.png'),
      content: 'Chronic inflammation contributes to many diseases. Include fatty fish like salmon and sardines for omega-3 fatty acids. Berries are rich in antioxidants that fight inflammation. Leafy greens like spinach and kale provide anti-inflammatory compounds. Nuts, especially almonds and walnuts, contain healthy fats and antioxidants. Olive oil is rich in oleic acid, which has anti-inflammatory properties. Turmeric contains curcumin, a powerful anti-inflammatory compound. Ginger has been used for centuries to reduce inflammation. Limit processed foods, refined sugars, and excessive alcohol which can promote inflammation.',
    },
    {
      id: '10',
      emoji: '🍽️',
      title: 'Mindful Eating: How to Develop a Healthier Relationship with Food',
      description: 'Mindful Eating: How to Develop a Healthier Relationship with Food',
      link: 'https://www.healthline.com/nutrition/mindful-eating-guide',
      image: require('../assets/adaptive-icon.png'),
      content: 'Mindful eating involves paying attention to the eating experience. Eat without distractions like TV or phones. Take time to appreciate the appearance and aroma of your food. Chew slowly and savor each bite. Pay attention to hunger and fullness cues. Notice how different foods make you feel. Avoid eating when stressed or emotional. Practice gratitude for your food and where it came from. Remember that mindful eating is a skill that develops with practice. It can help with weight management and developing a healthier relationship with food.',
    },
  ], []);

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
      message: 'The nurses are caring and skilled. I feel safe using Expressaid for my mother’s care.',
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

  // Define types for articles and ArticleCarousel props
  interface Article {
    id: string;
    title: string;
    description: string;
    image: any;
    content: string;
  }

  interface ArticleCarouselProps {
    data: Article[];
    dotColor?: string;
    borderColor?: string;
    showDots?: boolean;
    categoryTag?: string;
    activeIndex: number;
    setActiveIndex: (idx: number) => void;
  }

  // Update card size and floating style for ArticleCarousel
  const CARD_WIDTH = Math.round(width * 0.85); // much larger width
  const CARD_HEIGHT = 200; // much larger height
  const CARD_SPACING = 22; // keep spacing
  // const ITEM_WIDTH = Dimensions.get('window').width; // This line is now redundant
  // const SIDE_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2; // This line is now redundant

  // Revert ArticleCarousel paddings and card width
  // Update ArticleCarousel to use a modern card style with image, category tag, and title overlay
  const ArticleCarousel = React.memo((props: ArticleCarouselProps) => {
    const navigation = useNavigation();
    const scrollX = React.useRef(new RNAnimated.Value(0)).current;
    const flatListRef = React.useRef<FlatList<Article>>(null);

    // Scroll to activeIndex on mount and when activeIndex changes
    React.useEffect(() => {
      if (flatListRef.current && props.data.length > 0) {
        flatListRef.current.scrollToIndex({ index: props.activeIndex, animated: false });
      }
    }, [props.activeIndex, props.data.length]);

    return (
      <View style={{ width: '100%', marginBottom: 32 }}>
        <FlatList
          ref={flatListRef}
          data={props.data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: SIDE_SPACING }}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate={0.92}
          pagingEnabled
          onScroll={RNAnimated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const article = item as Article;
            return (
              <Animated.View
                entering={FadeInUp.duration(900)}
                style={{
                  width: ITEM_WIDTH,
                  height: 200,
                  marginHorizontal: CARD_MARGIN,
                  borderRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 16 },
                  shadowOpacity: 0.35,
                  shadowRadius: 32,
                  elevation: 32,
                  marginLeft: index === 0 ? 0 : 0,
                  marginTop: 24,
                  marginBottom: 32,
                  transform: [{ translateY: Math.sin(index) * 8 }], // subtle floating effect
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1, width: '100%', height: '100%' }}
                  activeOpacity={0.92}
                  onPress={() => (navigation.navigate as any)('ArticleDetail', { article })}
                >
                  <Image source={article.image} style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: 22 }} resizeMode="cover" />
                  <LinearGradient
                    colors={[ 'transparent', 'rgba(0,0,0,1)' ]}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 180, width: '100%' }}
                  />
                  <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.95)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>{props.categoryTag || 'Article'}</Text>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textShadowColor: 'rgba(0,0,0,0.95)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>{article.title}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, opacity: 0.95, textShadowColor: 'rgba(0,0,0,0.95)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>{article.description}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
        {/* Page Indicator Dots */}
        {props.showDots && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
            {props.data.map((_: Article, idx: number) => (
              <View
                key={idx}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 4,
                  backgroundColor: idx === props.activeIndex ? props.dotColor : props.borderColor,
                  opacity: idx === props.activeIndex ? 1 : 0.5,
                  elevation: idx === props.activeIndex ? 4 : 0,
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  });

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
  const [healthActiveIndex, setHealthActiveIndex] = React.useState(0);
  const [mealActiveIndex, setMealActiveIndex] = React.useState(0);

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

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Fullscreen background image */}
      <ImageBackground
        source={require('../assets/bg.png')}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        resizeMode="cover"
      />
      {/* Main content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.mainContent} pointerEvents="box-none">
          <Animated.View
            entering={FadeInUp.duration(900)}
            style={[styles.titleWrap, { marginTop: 110, marginBottom: 0, alignItems: 'center' }]}
          >
            <Text style={styles.title}>
              {`${t('welcome')} ${getFirstName(userData?.name || 'User')}`}
              {`\n${t('book_nurse')}`}
            </Text>
          </Animated.View>
          <Animated.View style={[styles.floatingSearchWrap, { marginTop: 24, marginBottom: 48, alignItems: 'center' }]}> 
            <Animated.View style={bounceStyle}>
              <Pressable style={styles.bigSearchBar} onPress={goToSymptomEntry} android_ripple={{ color: '#e0e7ff' }}>
                <Ionicons name="search" size={28} color="#2563eb" style={{ marginLeft: 18, marginRight: 10 }} />
                <Text style={styles.bigSearchInput}>{t('search_nurse')}</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
          {/* Health Tips Section */}
          {/* Sliding Articles Carousel: Health Tips */}
          <ArticleCarousel data={articles} dotColor="#2563eb" borderColor="#b6d0ff" showDots={false} categoryTag="Health" activeIndex={healthActiveIndex} setActiveIndex={setHealthActiveIndex} />
          {/* Curved SVG Separator */}
          <View style={{ width: '100%', height: 36, marginBottom: 8 }}>
            <Svg width="100%" height="36" viewBox="0 0 400 36" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0 }}>
              <Defs>
                <SvgLinearGradient id="blueCurve" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                  <Stop offset="100%" stopColor="#60a5fa" stopOpacity="0.12" />
                </SvgLinearGradient>
              </Defs>
              <Path d="M0,0 Q200,60 400,0 L400,36 L0,36 Z" fill="url(#blueCurve)" />
            </Svg>
          </View>
          {/* Meal Tips Section */}
          {/* Sliding Articles Carousel: Meal Tips */}
          <ArticleCarousel data={mealTips} dotColor="#2563eb" borderColor="#b6d0ff" showDots={false} categoryTag="Meal" activeIndex={mealActiveIndex} setActiveIndex={setMealActiveIndex} />
          {/* --- TESTIMONIALS SECTION --- */}
          <TestimonialCarousel />
        </View>
      </ScrollView>
      {/* Top Bar - absolutely positioned, render after mainContent for higher stacking */}
      <View style={styles.topBar} pointerEvents="auto">
        <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 4 }} onPress={() => setHowItWorksVisible(true)}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color="#2563eb" />
        </TouchableOpacity>
        {/* Removed performance/chart button and notification bell */}
      </View>
      {/* How does it work Modal */}
      <Modal
        visible={howItWorksVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHowItWorksVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 12,
            paddingBottom: 0,
            width: '100%',
            minHeight: '70%',
            maxHeight: '85%',
            alignItems: 'center',
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
          }}>
            {/* Drag indicator */}
            <View style={{ width: 48, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', marginBottom: 12 }} />
            <View style={{ width: '100%', alignItems: 'center', paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff' }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8 }}>How Expressaid Works</Text>
            </View>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
              {/* Step 1 */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
                <View style={{ width: 44, alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#e6f9f0', borderRadius: 22, padding: 8, marginBottom: 2 }}>
                    <MaterialCommunityIcons name="calendar-plus" size={26} color="#1e824c" />
                  </View>
                  <View style={{ width: 2, height: 38, backgroundColor: '#1e824c', marginVertical: 2 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 19, color: '#1e3a5c' }}>Book a Home Nurse</Text>
                  <Text style={{ color: '#444', fontSize: 16, marginTop: 2, lineHeight: 22 }}>
                    • Choose your location and required service{"\n"}
                    • Share your care needs and preferences{"\n"}• Submit your request in seconds
                  </Text>
                </View>
                <View style={{ alignItems: 'center', marginLeft: 8 }}>
                  <View style={{ backgroundColor: '#e6f9f0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Text style={{ color: '#1e824c', fontWeight: 'bold', fontSize: 17 }}>~5 <Text style={{ fontSize: 13, color: '#888' }}>min</Text></Text>
                  </View>
                </View>
              </View>
              {/* Step 2 */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
                <View style={{ width: 44, alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#e6f9f0', borderRadius: 22, padding: 8, marginBottom: 2 }}>
                    <MaterialCommunityIcons name="account-check-outline" size={26} color="#1e824c" />
                  </View>
                  <View style={{ width: 2, height: 38, backgroundColor: '#1e824c', marginVertical: 2 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 19, color: '#1e3a5c' }}>Get Matched with a Nurse</Text>
                  <Text style={{ color: '#444', fontSize: 16, marginTop: 2, lineHeight: 22 }}>
                    • We quickly find the best nurse for your needs{"\n"}• Review nurse profile and confirm your choice
                  </Text>
                </View>
                <View style={{ alignItems: 'center', marginLeft: 8 }}>
                  <View style={{ backgroundColor: '#e6f9f0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ color: '#1e824c', fontWeight: 'bold', fontSize: 17 }}>~5 <Text style={{ fontSize: 13, color: '#888' }}>min</Text></Text>
                  </View>
                </View>
              </View>
              {/* Step 3 */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
                <View style={{ width: 44, alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#e6f9f0', borderRadius: 22, padding: 8, marginBottom: 2 }}>
                    <MaterialCommunityIcons name="handshake-outline" size={26} color="#1e824c" />
                  </View>
                  <View style={{ width: 2, height: 38, backgroundColor: '#1e824c', marginVertical: 2 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 19, color: '#1e3a5c' }}>Receive Quality Care at Home</Text>
                  <Text style={{ color: '#444', fontSize: 16, marginTop: 2, lineHeight: 22 }}>
                    • Your nurse arrives at your location{"\n"}• Care is delivered as per your plan and needs
                  </Text>
                </View>
              </View>
              {/* Step 4 */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ width: 44, alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#e6f9f0', borderRadius: 22, padding: 8, marginBottom: 2 }}>
                    <MaterialCommunityIcons name="currency-inr" size={26} color="#1e824c" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 19, color: '#1e3a5c' }}>Pay Easily & Enjoy Peace of Mind</Text>
                  <Text style={{ color: '#444', fontSize: 16, marginTop: 2, lineHeight: 22 }}>
                    • Pay securely when your service starts
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={{ alignSelf: 'center', marginVertical: 18, marginBottom: 12 }} onPress={() => setHowItWorksVisible(false)}>
                <Text style={{ color: '#888', fontSize: 18, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 44 : 60,
    left: 0,
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 100, // increased to ensure topBar is always on top
  },
  menuBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 36,
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 44,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff', // changed from '#222' to white
    textAlign: 'center',
    lineHeight: 44,
    textShadowColor: 'rgba(0,0,0,0.55)', // stronger shadow for readability
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 18,
    elevation: 10,
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
    marginBottom: 36,
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