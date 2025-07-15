import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface HowItWorksScreenProps {
  navigation: any;
}

const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState<'nursing' | 'caregiving' | 'equipments'>('nursing');

  const services = [
    { id: 'nursing', label: 'Nursing' },
    { id: 'caregiving', label: 'Caregiving' },
    { id: 'equipments', label: 'Equipments' },
  ];

  const steps = [
    {
      id: 1,
      title: 'BOOK A SERVICE',
      icon: 'calendar-plus',
      description: [
        'Select a service location',
        'Select a service',
        'Provide care requirements',
        'Review and submit'
      ],
      time: '5 min'
    },
    {
      id: 2,
      title: 'FINALIZE HEALTHCARE PROFESSIONAL',
      icon: 'account-check-outline',
      description: [
        'We shortlist and share profile of a most suitable healthcare professional',
        'You interview and confirm the healthcare professional'
      ],
      time: '2-8 hrs.'
    },
    {
      id: 3,
      title: 'RECEIVE SERVICE',
      icon: 'handshake-outline',
      description: [
        'We prepare a customized care plan',
        'Healthcare professional reports for service at your location'
      ]
    },
    {
      id: 4,
      title: 'MAKE PAYMENT',
      icon: 'currency-inr',
      description: [
        'You pay when service starts'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e824c" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How does it work?</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Category Tabs */}
      <View style={styles.tabContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.tab,
              selectedService === service.id && styles.activeTab
            ]}
            onPress={() => setSelectedService(service.id as any)}
          >
            <Text style={[
              styles.tabText,
              selectedService === service.id && styles.activeTabText
            ]}>
              {service.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Steps */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepContainer}>
              {/* Step Icon */}
              <View style={styles.stepIconContainer}>
                <View style={styles.stepIcon}>
                  <MaterialCommunityIcons name={step.icon as any} size={24} color="#1e824c" />
                </View>
                {index < steps.length - 1 && <View style={styles.connectorLine} />}
              </View>

              {/* Step Content */}
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <View style={styles.stepDescription}>
                  {step.description.map((item, idx) => (
                    <Text key={idx} style={styles.descriptionItem}>• {item}</Text>
                  ))}
                </View>
                {step.time && (
                  <View style={styles.timeContainer}>
                    <MaterialCommunityIcons name="refresh" size={16} color="#1e824c" />
                    <Text style={styles.timeText}>{step.time}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1e824c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#e9ecef',
  },
  activeTab: {
    backgroundColor: '#d4edda',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#1e824c',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepsContainer: {
    paddingVertical: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e824c',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectorLine: {
    width: 2,
    height: 40,
    backgroundColor: '#1e824c',
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e824c',
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 8,
  },
  descriptionItem: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e824c',
    marginLeft: 4,
  },
});

export default HowItWorksScreen; 