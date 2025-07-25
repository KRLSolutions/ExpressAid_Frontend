import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Modal, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AnimatedChatbotProps {
  onChatOpen: () => void;
}

const AnimatedChatbot: React.FC<AnimatedChatbotProps> = ({ onChatOpen }) => {
  const danceValue = useSharedValue(0);
  const bounceValue = useSharedValue(0);
  const rotateValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const waveValue = useSharedValue(0);
  const eyeBlinkValue = useSharedValue(0);
  const pulseValue = useSharedValue(0);

  // Dancing animation
  useEffect(() => {
    danceValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Bouncing animation
  useEffect(() => {
    bounceValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Rotation animation
  useEffect(() => {
    rotateValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Wave animation
  useEffect(() => {
    waveValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Eye blink animation
  useEffect(() => {
    const blink = () => {
      eyeBlinkValue.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    };

    const interval = setInterval(blink, 3000);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Particle animations
  const particleAnimations = [...Array(6)].map((_, index) => {
    const particleValue = useSharedValue(0);
    
    useEffect(() => {
      particleValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, []);
    
    return particleValue;
  });

  const handlePress = () => {
    scaleValue.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onChatOpen();
  };

  const danceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(danceValue.value, [-1, 1], [-5, 5]) },
      { translateY: interpolate(bounceValue.value, [0, 1], [0, -8]) },
      { rotate: `${interpolate(rotateValue.value, [-1, 1], [-5, 5])}deg` },
    ],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(waveValue.value, [0, 1], [0, 20])}deg` },
    ],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(eyeBlinkValue.value, [0, 1], [1, 0.3]),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pulseValue.value, [0, 1], [1, 1.1]) },
    ],
  }));

  const chatBubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pulseValue.value, [0, 1], [1, 1.05]) },
      { rotate: `${interpolate(pulseValue.value, [0, 1], [0, 5])}deg` },
    ],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Pulse ring effect */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />
      
      {/* Main robot container */}
      <Animated.View style={[styles.robotContainer, danceStyle, scaleStyle]}>
        <LinearGradient
          colors={['#4f46e5', '#7c3aed', '#2563eb']}
          style={styles.robotBody}
        >
          {/* Robot head */}
          <View style={styles.robotHead}>
            {/* Eyes */}
            <View style={styles.eyesContainer}>
              <Animated.View style={[styles.eye, styles.eyeLeft, eyeStyle]} />
              <Animated.View style={[styles.eye, styles.eyeRight, eyeStyle]} />
            </View>
            
            {/* Mouth */}
            <View style={styles.mouth}>
              <View style={styles.mouthLine} />
            </View>
            
            {/* Antenna */}
            <View style={styles.antenna}>
              <View style={styles.antennaBase} />
              <View style={styles.antennaTop} />
            </View>
          </View>

          {/* Robot body */}
          <View style={styles.robotTorso}>
            {/* Chest panel */}
            <View style={styles.chestPanel}>
              <MaterialCommunityIcons name="heart-pulse" size={16} color="#ffffff" />
            </View>
            
            {/* Arms */}
            <View style={styles.armsContainer}>
              <Animated.View style={[styles.arm, styles.armLeft, waveStyle]}>
                <View style={styles.armJoint} />
                <View style={styles.armSegment} />
              </Animated.View>
              
              <Animated.View style={[styles.arm, styles.armRight, waveStyle]}>
                <View style={styles.armJoint} />
                <View style={styles.armSegment} />
              </Animated.View>
            </View>
          </View>

          {/* Robot legs */}
          <View style={styles.legsContainer}>
            <View style={styles.leg}>
              <View style={styles.legJoint} />
              <View style={styles.legSegment} />
            </View>
            <View style={styles.leg}>
              <View style={styles.legJoint} />
              <View style={styles.legSegment} />
            </View>
          </View>
        </LinearGradient>

        {/* Chat bubble */}
        <Animated.View style={[styles.chatBubble, chatBubbleStyle]}>
          <MaterialCommunityIcons name="message-text" size={16} color="#4f46e5" />
        </Animated.View>
      </Animated.View>

      {/* Floating particles */}
      <View style={styles.particlesContainer}>
        {particleAnimations.map((particleValue, index) => {
          const particleStyle = useAnimatedStyle(() => ({
            opacity: interpolate(particleValue.value, [0, 1], [0.3, 1]),
            transform: [
              { 
                translateY: interpolate(particleValue.value, [0, 1], [0, -20 - index * 5]) 
              },
              { 
                scale: interpolate(particleValue.value, [0, 1], [0.8, 1.2]) 
              },
            ],
          }));
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                particleStyle,
                {
                  left: `${15 + index * 14}%`,
                  top: `${10 + index * 8}%`,
                },
              ]}
            />
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 1000,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    top: -10,
    left: -10,
  },
  robotContainer: {
    width: 60,
    height: 80,
    alignItems: 'center',
  },
  robotBody: {
    width: 60,
    height: 80,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  robotHead: {
    width: 40,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  eye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4f46e5',
  },
  eyeLeft: {
    marginRight: 4,
  },
  eyeRight: {
    marginLeft: 4,
  },
  mouth: {
    width: 12,
    height: 2,
    backgroundColor: '#4f46e5',
    borderRadius: 1,
    marginTop: 2,
  },
  antenna: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
  },
  antennaBase: {
    width: 2,
    height: 6,
    backgroundColor: '#ffffff',
  },
  antennaTop: {
    width: 4,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  robotTorso: {
    width: 50,
    height: 35,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chestPanel: {
    width: 20,
    height: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  armsContainer: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 8,
  },
  arm: {
    alignItems: 'center',
  },
  armLeft: {
    marginLeft: -8,
  },
  armRight: {
    marginRight: -8,
  },
  armJoint: {
    width: 4,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  armSegment: {
    width: 3,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  legsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 2,
  },
  leg: {
    alignItems: 'center',
  },
  legJoint: {
    width: 4,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  legSegment: {
    width: 3,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  chatBubble: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 30,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  particlesContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: -20,
    left: -20,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    opacity: 0.6,
  },
});

export default AnimatedChatbot; 