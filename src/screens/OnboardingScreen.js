import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to AniKai',
    subtitle: 'Your ultimate anime streaming companion',
    icon: 'play-circle',
    description: 'Watch your favorite anime with a beautiful native app experience. Seamless browsing, smart features, and zero distractions.',
  },
  {
    id: '2',
    title: 'Smart Auto-Resume',
    subtitle: 'Never lose your place again',
    icon: 'time',
    description: 'The app remembers exactly where you left off in every episode. Red progress bars show what you\'ve watched.',
  },
  {
    id: '3',
    title: 'PIN Lock Security',
    subtitle: 'Keep your watch history private',
    icon: 'lock-closed',
    description: 'Set a 4-digit PIN to secure the app. Perfect for shared devices or keeping your anime preferences private.',
  },
  {
    id: '4',
    title: 'Ad-Free Experience',
    subtitle: 'No redirects, no popups',
    icon: 'shield-checkmark',
    description: 'Built-in ad blocking keeps annoying redirects away. Just pure anime streaming without interruptions.',
  },
  {
    id: '5',
    title: 'Ready to Watch?',
    subtitle: 'Let\'s get started',
    icon: 'rocket',
    description: 'Tap "Get Started" to begin your anime journey. Your next favorite show is waiting!',
  },
];

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('@anikai_onboarding_seen', 'true');
        onComplete();
      } catch (err) {
        console.log('Error saving onboarding status:', err);
      }
    }
  };

  const skip = async () => {
    try {
      await AsyncStorage.setItem('@anikai_onboarding_seen', 'true');
      onComplete();
    } catch (err) {
      console.log('Error saving onboarding status:', err);
    }
  };

  const Slide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer, { transform: [{ translateY }], opacity }]}>
          <Ionicons name={item.icon} size={120} color="#ff4757" />
        </Animated.View>
        <Animated.View style={{ opacity }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[styles.dot, { width: dotWidth, opacity }]}              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.skipButton}>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        renderItem={({ item, index }) => <Slide item={item} index={index} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        ref={slidesRef}
      />

      <Paginator />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    width,
    height: height * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4757',
    marginHorizontal: 4,
  },
  footer: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#ff4757',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default OnboardingScreen;
