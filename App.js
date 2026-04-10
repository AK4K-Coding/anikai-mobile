import React, { useState, useEffect } from 'react';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { isPinEnabled, verifyPin, getPin } from './src/utils/storage';

const Tab = createBottomTabNavigator();

// PIN Lock Screen Component
function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigitPress = (digit) => {
    if (error) setError('');
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => verifyAndUnlock(newPin), 100);
      }
    }
  };

  const verifyAndUnlock = async (inputPin) => {
    const isValid = await verifyPin(inputPin);
    if (isValid) {
      onUnlock();
    } else {
      setShake(true);
      setError('Incorrect PIN. Try again.');
      setPin('');
      setTimeout(() => setShake(false), 300);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  return (
    <View style={lockStyles.container}>
      <View style={lockStyles.logoContainer}>
        <Ionicons name="lock-closed" size={64} color="#ff4757" />
        <Text style={lockStyles.title}>App Locked</Text>
        <Text style={lockStyles.subtitle}>Enter your PIN to continue</Text>
      </View>

      {/* PIN Display */}
      <View style={[lockStyles.pinDisplay, shake && lockStyles.shake]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[
            lockStyles.pinDot,
            pin.length > i && lockStyles.pinDotFilled
          ]} />
        ))}
      </View>

      {error ? <Text style={lockStyles.error}>{error}</Text> : null}

      {/* Numpad */}
      <View style={lockStyles.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={lockStyles.numpadButton}
            onPress={() => handleDigitPress(num.toString())}
          >
            <Text style={lockStyles.numpadText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={lockStyles.numpadButton} />
        <TouchableOpacity style={lockStyles.numpadButton} onPress={() => handleDigitPress('0')}>
          <Text style={lockStyles.numpadText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={lockStyles.numpadButton} onPress={handleBackspace}>
          <Ionicons name="backspace-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('@anikai_onboarding_seen');
      if (hasSeenOnboarding !== 'true') {
        setShowOnboarding(true);
        setIsLoading(false);
      } else {
        checkPinStatus();
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      checkPinStatus();
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    checkPinStatus();
  };

  const checkPinStatus = async () => {
    const pinEnabled = await isPinEnabled();
    setIsLocked(pinEnabled);
    setIsLoading(false);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff4757" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  if (isLocked) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <PinLockScreen onUnlock={handleUnlock} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Bookmarks') {
                iconName = focused ? 'bookmark' : 'bookmark-outline';
              } else if (route.name === 'Watching') {
                iconName = focused ? 'play-circle' : 'play-circle-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#ff4757',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: {
              backgroundColor: '#1a1a1a',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerStyle: {
              backgroundColor: '#0f0f0f',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'AniKai' }} />
          <Tab.Screen name="Bookmarks" component={BookmarksScreen} options={{ title: 'My Bookmarks' }} />
          <Tab.Screen name="Watching" component={DownloadsScreen} options={{ title: 'Continue Watching' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
});

const lockStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  pinDisplay: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  shake: {
    transform: [{ translateX: 0 }],
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff4757',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#ff4757',
  },
  error: {
    color: '#ff4757',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: 300,
  },
  numpadButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  numpadText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
});
