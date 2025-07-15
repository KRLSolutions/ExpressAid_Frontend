import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const faqs = [
  { q: 'How fast can a nurse arrive?', a: 'Usually within 60 minutes, depending on your location and nurse availability.' },
  { q: 'Do I need a prescription for medicines?', a: 'For most medicines, yes. Some OTC products do not require a prescription.' },
  { q: 'What if I need to cancel?', a: 'You can cancel anytime before the nurse is assigned. After assignment, cancellation fees may apply.' },
  { q: 'Are your nurses certified?', a: 'Yes, all our nurses are certified and background-checked.' },
  { q: 'Can I book for someone else?', a: 'Absolutely! You can book for family or friends using their details.' },
];

const FAQScreen = ({ navigation }: any) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const animatedHeights = useRef(faqs.map(() => new Animated.Value(0))).current;

  const toggleAccordion = (idx: number) => {
    if (openIndex === idx) {
      Animated.timing(animatedHeights[idx], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setOpenIndex(null));
    } else {
      if (openIndex !== null) {
        Animated.timing(animatedHeights[openIndex], {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
      Animated.timing(animatedHeights[idx], {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
      setOpenIndex(idx);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {faqs.map((faq, idx) => (
          <View key={idx} style={styles.card}>
            <TouchableOpacity onPress={() => toggleAccordion(idx)} style={styles.questionRow} accessibilityLabel={`Toggle answer for: ${faq.q}`}>
              <Text style={styles.question}>{faq.q}</Text>
              <Feather name={openIndex === idx ? 'chevron-up' : 'chevron-down'} size={20} color="#2563eb" />
            </TouchableOpacity>
            <Animated.View style={{ height: animatedHeights[idx].interpolate({ inputRange: [0, 1], outputRange: [0, 60] }), overflow: 'hidden' }}>
              {openIndex === idx && <Text style={styles.answer}>{faq.a}</Text>}
            </Animated.View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 18, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, zIndex: 10 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 18, marginTop: 18, marginBottom: 8, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  answer: { marginTop: 8, fontSize: 15, color: '#444' },
});

export default FAQScreen; 