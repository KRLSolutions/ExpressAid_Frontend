import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your ExpressAid AI assistant. How can I help you today? 🤖',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);

  const quickActions = [
    { text: 'Book a Nurse', icon: 'nurse' },
    { text: 'Pricing Info', icon: 'currency-inr' },
    { text: 'Service Areas', icon: 'map-marker' },
    { text: 'Emergency Help', icon: 'ambulance' },
  ];

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalScale.value = withSpring(0, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const simulateTyping = (response: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);
  };

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('book') || lowerMessage.includes('nurse') || lowerMessage.includes('care')) {
      return "Great! To book a nurse, simply tap the 'Book Nurse' button on the home screen. You'll be guided through a quick process to select your location and service type. Our nurses typically arrive within 10-15 minutes! 🚀";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "Our pricing is transparent and varies based on the service type and duration. Basic home nursing starts from ₹500/hour. You'll see the exact price before confirming your booking. We also offer package deals for regular care! 💰";
    } else if (lowerMessage.includes('time') || lowerMessage.includes('duration') || lowerMessage.includes('how long')) {
      return "Booking takes just 2-3 minutes! Our nurses typically arrive within 10-15 minutes of booking. Service duration depends on your needs - from 1 hour to full-day care. We're available 24/7! ⏰";
    } else if (lowerMessage.includes('qualification') || lowerMessage.includes('trained') || lowerMessage.includes('certified')) {
      return "All our nurses are professionally qualified, certified, and thoroughly vetted. They have years of experience in home healthcare. We also conduct regular training and background checks for your safety! ✅";
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return "For emergencies, please call 108 immediately. While we provide quick home care, serious medical emergencies require professional emergency services. We can assist with post-emergency care once you're stable! 🚨";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('cash')) {
      return "We accept multiple payment methods: UPI, cards, digital wallets, and cash. Payment is processed securely when your service starts. You can also save payment methods for faster future bookings! 💳";
    } else if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('city')) {
      return "We currently serve major cities across India including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and more. We're expanding rapidly! Just enter your location in the app to check availability in your area! 📍";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! I'm here to help anytime. Feel free to ask more questions or use the app to book services. Have a great day! 😊";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm here to help you with ExpressAid services. You can ask me about booking nurses, pricing, locations, or any other questions about our home healthcare services!";
    } else {
      const responses = [
        "That's a great question! For specific details about our services, you can explore the app or ask me about booking, pricing, or locations. I'm here to help! 🤖",
        "I'd be happy to help with that! ExpressAid offers professional home nursing care. You can ask me about booking, pricing, nurse qualifications, or service areas. What would you like to know? 💡",
        "Thanks for asking! I can help you with booking nurses, understanding our services, pricing, or finding care in your area. What specific information are you looking for? 🏥",
        "Great question! ExpressAid provides 24/7 home healthcare services. I can assist with bookings, pricing, nurse details, or service information. What would you like to learn more about? ⭐",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();

    // Generate AI response
    const aiResponse = generateAIResponse(inputText.trim());
    simulateTyping(aiResponse);
  };

  const handleQuickAction = (action: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: action,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();

    // Generate AI response
    const aiResponse = generateAIResponse(action);
    simulateTyping(aiResponse);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          {/* Header */}
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.botAvatar}>
                <MaterialCommunityIcons name="robot" size={24} color="#ffffff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.botName}>ExpressAid AI</Text>
                <Text style={styles.botStatus}>Online • Ready to help</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Messages */}
          <KeyboardAvoidingView
            style={styles.messagesContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  {!message.isUser && (
                    <View style={styles.botMessageAvatar}>
                      <MaterialCommunityIcons name="robot" size={16} color="#4f46e5" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userBubble : styles.botBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.isUser ? styles.userText : styles.botText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        message.isUser ? styles.userTime : styles.botTime,
                      ]}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}

                             {/* Typing indicator */}
               {isTyping && (
                 <View style={styles.messageContainer}>
                   <View style={styles.botMessageAvatar}>
                     <MaterialCommunityIcons name="robot" size={16} color="#4f46e5" />
                   </View>
                   <View style={styles.typingBubble}>
                     <View style={styles.typingDots}>
                       <View style={[styles.dot, styles.dot1]} />
                       <View style={[styles.dot, styles.dot2]} />
                       <View style={[styles.dot, styles.dot3]} />
                     </View>
                   </View>
                 </View>
               )}

               {/* Quick Actions */}
               {messages.length === 1 && !isTyping && (
                 <View style={styles.quickActionsContainer}>
                   <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
                   <View style={styles.quickActionsGrid}>
                     {quickActions.map((action, index) => (
                       <TouchableOpacity
                         key={index}
                         style={styles.quickActionButton}
                         onPress={() => handleQuickAction(action.text)}
                       >
                         <MaterialCommunityIcons name={action.icon as any} size={20} color="#4f46e5" />
                         <Text style={styles.quickActionText}>{action.text}</Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 </View>
               )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() === '' && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={inputText.trim() === ''}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={inputText.trim() === '' ? '#9ca3af' : '#ffffff'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    height: height * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  botName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  botStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botMessageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botTime: {
    color: '#9ca3af',
  },
  typingBubble: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  quickActionsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default ChatbotModal; 