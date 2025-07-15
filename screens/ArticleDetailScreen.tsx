import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ArticleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { article } = route.params;

  // Dummy data for author, date, stats
  const author = article.author || 'Expressaid Team';
  const date = article.date || 'Jun 12, 2024';
  const views = article.views || '12.3k';
  const likes = article.likes || '2.1k';
  const category = article.category || 'Health';

  return (
    <View style={{ flex: 1 }}>
      <Image source={require('../assets/bg.png')} style={{ position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover', zIndex: -1 }} />
      {/* Top image with overlay */}
      <View style={{ position: 'relative' }}>
        <Image
          source={article.image}
          style={{ width: width, height: 270, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          resizeMode="cover"
        />
        {/* Overlay: back button */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 44, left: 18, backgroundColor: '#fff', borderRadius: 20, padding: 6, elevation: 4, zIndex: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#2563eb" />
        </TouchableOpacity>
        {/* Overlay: category tag and title */}
        <View style={{ position: 'absolute', left: 24, bottom: 32, zIndex: 5 }}>
          <View style={{ backgroundColor: '#2563eb', borderRadius: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{category}</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 26, textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, maxWidth: width * 0.8 }}>{article.title}</Text>
        </View>
      </View>
      {/* Floating card */}
      <ScrollView contentContainerStyle={{ paddingTop: 0, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.floatingCard}>
          {/* Author, date, stats */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-circle" size={28} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 15, marginRight: 10 }}>{author}</Text>
              <Ionicons name="calendar-outline" size={18} color="#b6b6b6" style={{ marginRight: 4 }} />
              <Text style={{ color: '#888', fontSize: 14, marginRight: 10 }}>{date}</Text>
              <Ionicons name="eye-outline" size={18} color="#b6b6b6" style={{ marginRight: 4 }} />
              <Text style={{ color: '#888', fontSize: 14 }}>{views}</Text>
            </View>
          </View>
          {/* Article content as full-page bullet list */}
          <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#222', marginBottom: 18, textAlign: 'center' }}>{article.title}</Text>
          {(() => {
            // Remove intro/summary before numbered tips
            const tips = String(article.content)
              .split(/\d+\)|\d+\./)
              .map(t => t.trim())
              .filter(Boolean)
              .filter(tip => tip.length > 8); // filter out very short intro lines
            return tips.map((tip, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18, width: '100%' }}>
                <Text style={{ fontSize: 22, color: '#2563eb', marginRight: 12, marginTop: 2 }}>•</Text>
                <Text style={{ color: '#222', fontSize: 18, lineHeight: 28, flex: 1 }}>{tip}</Text>
              </View>
            ));
          })()}
          {/* Dummy stats bar */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0ecff', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 8, marginRight: 12 }}>
              <Ionicons name="heart" size={20} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>{likes}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0ecff', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 8 }}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>10.2k</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingCard: {
    backgroundColor: '#fff',
    borderRadius: 36,
    marginTop: -36,
    marginHorizontal: 8,
    padding: 36,
    paddingTop: 56, // extra top padding to avoid overlap
    shadowColor: '#2563eb',
    shadowOpacity: 0.13,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
    minHeight: 480,
    width: '96%',
  },
});

export default ArticleDetailScreen; 