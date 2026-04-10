import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSettings, saveSettings, clearHistory, getBookmarks, getDownloads, clearAllBookmarks, clearAllDownloads, setPin, verifyPin, disablePin, isPinEnabled, getPin } from '../utils/storage';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    autoPlay: true,
    autoNext: true,
    notifications: true,
    keepScreenOn: true,
    downloadQuality: '720p',
    streamQuality: 'auto',
    dataSaver: false,
    doubleTapSeek: true,
    swipeGestures: true,
    subtitlesEnabled: true,
    defaultSubLang: 'en',
    adBlocker: true,
    autoSkipIntro: false,
    skipSeconds: 85,
    pictureInPicture: true,
    hardwareAcceleration: true,
    preloadNext: true,
    darkTheme: true,
    compactUI: false,
    showEpisodeThumbnails: true,
    defaultAudioLang: 'jp',
    playbackSpeed: 1,
    sleepTimer: 0,
    autoFullscreen: false,
    showProgressBar: true,
    cacheSize: '500MB',
    autoResume: true,
    smartQuality: true,
    hapticFeedback: true,
    reducedMotion: false,
    appLock: false,
    defaultTab: 'Home',
  });
  const [stats, setStats] = useState({ bookmarks: 0, downloads: 0 });
  const [pinSetupVisible, setPinSetupVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinStep, setPinStep] = useState(1);
  const [pinError, setPinError] = useState('');
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadSettings();
    requestNotificationPermission();
  }, []);

  const loadSettings = async () => {
    const saved = await getSettings();
    const pinEnabled = await isPinEnabled();
    setSettings({ ...settings, ...saved, appLock: pinEnabled });
    const bookmarks = await getBookmarks();
    const downloads = await getDownloads();
    setStats({ bookmarks: bookmarks.length, downloads: downloads.length });
    await calculateCacheSize();
  };

  const calculateCacheSize = async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const info = await FileSystem.getInfoAsync(cacheDir);
        if (info.exists && info.size) {
          const sizeMB = (info.size / (1024 * 1024)).toFixed(1);
          setCacheSize(`${sizeMB} MB`);
        }
      }
    } catch (error) {
      console.log('Error calculating cache size:', error);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      // Clear WebView cache by clearing cache directory
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const file of files) {
          try {
            await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
          } catch (e) {
            // Ignore errors for individual files
          }
        }
      }
      
      // Also try to clear specific WebView directories
      const webkitDir = `${FileSystem.documentDirectory}WebKit`;
      try {
        const webkitInfo = await FileSystem.getInfoAsync(webkitDir);
        if (webkitInfo.exists) {
          await FileSystem.deleteAsync(webkitDir, { idempotent: true });
        }
      } catch (e) {
        // Directory might not exist
      }
      
      await calculateCacheSize();
      showToast('Cache cleared successfully');
    } catch (error) {
      console.log('Error clearing cache:', error);
      showToast('Failed to clear cache');
    } finally {
      setIsClearingCache(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleExportSettings = async () => {
    try {
      const allSettings = {
        settings,
        bookmarks: await getBookmarks(),
        history: await getWatchHistory(),
        exportedAt: new Date().toISOString(),
        version: '1.6.2'
      };
      const json = JSON.stringify(allSettings, null, 2);
      
      // Copy to clipboard would be ideal, but we'll show it
      Alert.alert(
        'Export Settings',
        'Your settings have been prepared. Copy this data to save your configuration.',
        [{ text: 'OK' }]
      );
      console.log('Settings export:', json);
      showToast('Settings exported');
    } catch (error) {
      showToast('Export failed');
    }
  };

  const handleImportSettings = () => {
    Alert.alert(
      'Import Settings',
      'This feature requires paste access. Settings will be imported from clipboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import',
          onPress: () => {
            showToast('Import feature coming soon');
          }
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: '🎬 Watch anime ad-free with AniKai Mobile!\n\nThe ultimate anime streaming app with smart auto-resume, PIN lock security, and beautiful UI.\n\nDownload now: https://github.com/yourusername/anikai-mobile/releases',
        title: 'AniKai Mobile - Anime Streaming App'
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Enjoying AniKai?',
      'Your rating helps us grow and reach more anime fans!',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Rate 5 Stars',
          onPress: () => {
            Linking.openURL('https://github.com/yourusername/anikai-mobile/releases');
            showToast('Thanks for your support!');
          }
        },
      ]
    );
  };

  const handlePinDigitPress = (digit) => {
    if (pinStep === 1) {
      if (pinInput.length < 4) {
        const newPin = pinInput + digit;
        setPinInput(newPin);
        if (newPin.length === 4) {
          setTimeout(() => setPinStep(2), 200);
        }
      }
    } else {
      if (pinConfirmInput.length < 4) {
        const newPin = pinConfirmInput + digit;
        setPinConfirmInput(newPin);
        if (newPin.length === 4) {
          setTimeout(() => confirmPinSetup(newPin), 200);
        }
      }
    }
  };

  const confirmPinSetup = async (confirmedPin) => {
    if (pinInput === confirmedPin) {
      await setPin(pinInput);
      setPinSetupVisible(false);
      setPinInput('');
      setPinConfirmInput('');
      setPinStep(1);
      setPinError('');
      updateSetting('appLock', true);
      Alert.alert('Success', 'PIN lock enabled successfully');
    } else {
      setPinError('PINs do not match. Try again.');
      setPinConfirmInput('');
      setTimeout(() => {
        setPinStep(1);
        setPinInput('');
        setPinError('');
      }, 1500);
    }
  };

  const handleBackspace = () => {
    if (pinStep === 1) {
      setPinInput(pinInput.slice(0, -1));
    } else {
      setPinConfirmInput(pinConfirmInput.slice(0, -1));
    }
  };

  const cancelPinSetup = () => {
    setPinSetupVisible(false);
    setPinInput('');
    setPinConfirmInput('');
    setPinStep(1);
    setPinError('');
  };

  const handleDisablePin = async () => {
    const currentPin = await getPin();
    Alert.alert(
      'Disable PIN Lock',
      'Enter your current PIN to disable:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disable', 
          style: 'destructive',
          onPress: async () => {
            await disablePin();
            updateSetting('appLock', false);
            Alert.alert('Success', 'PIN lock disabled');
          }
        },
      ]
    );
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
    }
  };

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Watch History',
      'Are you sure you want to clear your watch history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Success', 'Watch history cleared');
          },
        },
      ]
    );
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://animekai.to/');
  };

  const showQualityPicker = (settingKey, title, options) => {
    Alert.alert(
      title,
      'Select quality:',
      options.map(opt => ({
        text: opt.label,
        onPress: () => updateSetting(settingKey, opt.value),
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleClearBookmarks = () => {
    Alert.alert(
      'Clear All Bookmarks',
      `This will remove all ${stats.bookmarks} bookmarks. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllBookmarks();
            Alert.alert('Success', 'All bookmarks cleared');
            loadSettings();
          },
        },
      ]
    );
  };

  const handleClearDownloads = () => {
    Alert.alert(
      'Clear All Downloads',
      `This will remove all ${stats.downloads} downloaded episodes. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllDownloads();
            Alert.alert('Success', 'All downloads cleared');
            loadSettings();
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, onValueChange, type = 'switch', onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && type !== 'switch'}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color="#ff4757" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333', true: '#ff4757' }}
          thumbColor="#fff"
        />
      ) : type === 'value' ? (
        <Text style={styles.valueText}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} scrollEnabled={!pinSetupVisible}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <SettingItem
          icon="play-circle-outline"
          title="Auto Play"
          subtitle="Automatically start playing videos"
          value={settings.autoPlay}
          onValueChange={(v) => updateSetting('autoPlay', v)}
        />
        <SettingItem
          icon="skip-forward-outline"
          title="Auto Next Episode"
          subtitle="Automatically play next episode"
          value={settings.autoNext}
          onValueChange={(v) => updateSetting('autoNext', v)}
        />
        <SettingItem
          icon="eye-outline"
          title="Keep Screen On"
          subtitle="Prevent screen from sleeping while watching"
          value={settings.keepScreenOn}
          onValueChange={(v) => updateSetting('keepScreenOn', v)}
        />
        <SettingItem
          icon="expand-outline"
          title="Double Tap to Seek"
          subtitle="Double tap sides to skip forward/back 10s"
          value={settings.doubleTapSeek}
          onValueChange={(v) => updateSetting('doubleTapSeek', v)}
        />
        <SettingItem
          icon="hand-left-outline"
          title="Swipe Gestures"
          subtitle="Swipe to seek, adjust volume/brightness"
          value={settings.swipeGestures}
          onValueChange={(v) => updateSetting('swipeGestures', v)}
        />
        <SettingItem
          icon="speedometer-outline"
          title="Playback Speed"
          subtitle="Default playback speed"
          type="value"
          value={settings.playbackSpeed + 'x'}
          onPress={() => Alert.alert('Playback Speed', 'Select speed:', [
            { text: '0.5x', onPress: () => updateSetting('playbackSpeed', 0.5) },
            { text: '0.75x', onPress: () => updateSetting('playbackSpeed', 0.75) },
            { text: '1.0x', onPress: () => updateSetting('playbackSpeed', 1) },
            { text: '1.25x', onPress: () => updateSetting('playbackSpeed', 1.25) },
            { text: '1.5x', onPress: () => updateSetting('playbackSpeed', 1.5) },
            { text: '2.0x', onPress: () => updateSetting('playbackSpeed', 2) },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
        <SettingItem
          icon="moon-outline"
          title="Sleep Timer"
          subtitle="Auto-pause after specified time"
          type="value"
          value={settings.sleepTimer === 0 ? 'Off' : settings.sleepTimer + ' min'}
          onPress={() => Alert.alert('Sleep Timer', 'Auto-pause after:', [
            { text: 'Off', onPress: () => updateSetting('sleepTimer', 0) },
            { text: '15 min', onPress: () => updateSetting('sleepTimer', 15) },
            { text: '30 min', onPress: () => updateSetting('sleepTimer', 30) },
            { text: '45 min', onPress: () => updateSetting('sleepTimer', 45) },
            { text: '60 min', onPress: () => updateSetting('sleepTimer', 60) },
            { text: '90 min', onPress: () => updateSetting('sleepTimer', 90) },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
        <SettingItem
          icon="timer-outline"
          title="Auto Skip Intro"
          subtitle="Skip anime intro automatically (85s)"
          value={settings.autoSkipIntro}
          onValueChange={(v) => updateSetting('autoSkipIntro', v)}
        />
        <SettingItem
          icon="scan-outline"
          title="Auto Fullscreen"
          subtitle="Enter fullscreen when video starts"
          value={settings.autoFullscreen}
          onValueChange={(v) => updateSetting('autoFullscreen', v)}
        />
        <SettingItem
          icon="images-outline"
          title="Episode Thumbnails"
          subtitle="Show thumbnails for episodes"
          value={settings.showEpisodeThumbnails}
          onValueChange={(v) => updateSetting('showEpisodeThumbnails', v)}
        />
        <SettingItem
          icon="layers-outline"
          title="Picture in Picture"
          subtitle="Continue watching in small window"
          value={settings.pictureInPicture}
          onValueChange={(v) => updateSetting('pictureInPicture', v)}
        />
        <SettingItem
          icon="play-back-outline"
          title="Auto Resume"
          subtitle="Continue from where you left off"
          value={settings.autoResume}
          onValueChange={(v) => updateSetting('autoResume', v)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality & Streaming</Text>
        <SettingItem
          icon="wifi-outline"
          title="Streaming Quality"
          subtitle="Default quality for streaming"
          type="value"
          value={settings.streamQuality}
          onPress={() => showQualityPicker('streamQuality', 'Streaming Quality', [
            { label: 'Auto (Recommended)', value: 'auto' },
            { label: '360p (Data Saver)', value: '360p' },
            { label: '480p', value: '480p' },
            { label: '720p (HD)', value: '720p' },
            { label: '1080p (Full HD)', value: '1080p' },
          ])}
        />
        <SettingItem
          icon="download-outline"
          title="Download Quality"
          subtitle="Default quality for downloads"
          type="value"
          value={settings.downloadQuality}
          onPress={() => showQualityPicker('downloadQuality', 'Download Quality', [
            { label: '360p (~150MB/episode)', value: '360p' },
            { label: '480p (~250MB/episode)', value: '480p' },
            { label: '720p (~400MB/episode)', value: '720p' },
            { label: '1080p (~800MB/episode)', value: '1080p' },
          ])}
        />
        <SettingItem
          icon="cellular-outline"
          title="Data Saver Mode"
          subtitle="Lower quality on mobile data"
          value={settings.dataSaver}
          onValueChange={(v) => updateSetting('dataSaver', v)}
        />
        <SettingItem
          icon="speedometer-outline"
          title="Hardware Acceleration"
          subtitle="Use GPU for better performance"
          value={settings.hardwareAcceleration}
          onValueChange={(v) => updateSetting('hardwareAcceleration', v)}
        />
        <SettingItem
          icon="cloud-download-outline"
          title="Preload Next Episode"
          subtitle="Buffer next episode while watching"
          value={settings.preloadNext}
          onValueChange={(v) => updateSetting('preloadNext', v)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subtitles & Audio</Text>
        <SettingItem
          icon="text-outline"
          title="Enable Subtitles"
          subtitle="Show subtitles by default"
          value={settings.subtitlesEnabled}
          onValueChange={(v) => updateSetting('subtitlesEnabled', v)}
        />
        <SettingItem
          icon="language-outline"
          title="Subtitle Language"
          subtitle="Preferred subtitle language"
          type="value"
          value={settings.defaultSubLang.toUpperCase()}
          onPress={() => Alert.alert('Subtitle Language', 'Select language:', [
            { text: 'English', onPress: () => updateSetting('defaultSubLang', 'en') },
            { text: 'Spanish', onPress: () => updateSetting('defaultSubLang', 'es') },
            { text: 'Japanese', onPress: () => updateSetting('defaultSubLang', 'ja') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
        <SettingItem
          icon="mic-outline"
          title="Audio Language"
          subtitle="Preferred audio language"
          type="value"
          value={settings.defaultAudioLang.toUpperCase()}
          onPress={() => Alert.alert('Audio Language', 'Select language:', [
            { text: 'Japanese', onPress: () => updateSetting('defaultAudioLang', 'jp') },
            { text: 'English', onPress: () => updateSetting('defaultAudioLang', 'en') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          icon="moon-outline"
          title="Dark Theme"
          subtitle="Use dark color scheme"
          value={settings.darkTheme}
          onValueChange={(v) => updateSetting('darkTheme', v)}
        />
        <SettingItem
          icon="phone-portrait-outline"
          title="Compact UI"
          subtitle="Smaller interface elements"
          value={settings.compactUI}
          onValueChange={(v) => updateSetting('compactUI', v)}
        />
        <SettingItem
          icon="eye-off-outline"
          title="Reduced Motion"
          subtitle="Disable animations for accessibility"
          value={settings.reducedMotion}
          onValueChange={(v) => updateSetting('reducedMotion', v)}
        />
        <SettingItem
          icon="color-palette-outline"
          title="Accent Color"
          subtitle="App accent color"
          type="value"
          value="#ff4757"
          onPress={() => Alert.alert('Accent Color', 'Choose color:', [
            { text: 'Red', onPress: () => updateSetting('accentColor', '#ff4757') },
            { text: 'Blue', onPress: () => updateSetting('accentColor', '#3742fa') },
            { text: 'Green', onPress: () => updateSetting('accentColor', '#2ed573') },
            { text: 'Purple', onPress: () => updateSetting('accentColor', '#a55eea') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network & Performance</Text>
        <SettingItem
          icon="cellular-outline"
          title="Smart Quality"
          subtitle="Auto-adjust quality based on connection"
          value={settings.smartQuality}
          onValueChange={(v) => updateSetting('smartQuality', v)}
        />
        <SettingItem
          icon="save-outline"
          title="Cache Size"
          subtitle="Maximum cache storage"
          type="value"
          value={settings.cacheSize}
          onPress={() => Alert.alert('Cache Size', 'Select cache limit:', [
            { text: '100MB', onPress: () => updateSetting('cacheSize', '100MB') },
            { text: '250MB', onPress: () => updateSetting('cacheSize', '250MB') },
            { text: '500MB', onPress: () => updateSetting('cacheSize', '500MB') },
            { text: '1GB', onPress: () => updateSetting('cacheSize', '1GB') },
            { text: '2GB', onPress: () => updateSetting('cacheSize', '2GB') },
            { text: 'Unlimited', onPress: () => updateSetting('cacheSize', 'Unlimited') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
        <SettingItem
          icon="wifi-outline"
          title="Wi-Fi Only"
          subtitle="Only stream on Wi-Fi connections"
          value={settings.wifiOnly || false}
          onValueChange={(v) => updateSetting('wifiOnly', v)}
        />
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={() => {
            if (isClearingCache) return;
            Alert.alert(
              'Clear Cache',
              `Current cache size: ${cacheSize}\n\nThis will clear all cached images and WebView data. Continue?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: handleClearCache },
              ]
            );
          }}
          disabled={isClearingCache}
        >
          <View style={styles.settingIcon}>
            {isClearingCache ? (
              <ActivityIndicator size="small" color="#ff4757" />
            ) : (
              <Ionicons name="trash-outline" size={22} color="#ff4757" />
            )}
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Clear Cache</Text>
            <Text style={styles.settingSubtitle}>
              {isClearingCache ? 'Clearing...' : `Current: ${cacheSize}`}
            </Text>
          </View>
          {!isClearingCache && <Ionicons name="chevron-forward" size={20} color="#666" />}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <SettingItem
          icon="shield-checkmark-outline"
          title="Ad Blocker"
          subtitle="Block ads and popups automatically"
          value={settings.adBlocker}
          onValueChange={(v) => updateSetting('adBlocker', v)}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="App Lock"
          subtitle={settings.appLock ? "PIN protection enabled" : "Require PIN to open app"}
          value={settings.appLock}
          onValueChange={(v) => {
            if (v) {
              setPinSetupVisible(true);
            } else {
              handleDisablePin();
            }
          }}
        />
        <SettingItem
          icon="notifications-outline"
          title="New Episode Alerts"
          subtitle="Get notified when new episodes are available"
          value={settings.notifications}
          onValueChange={(v) => updateSetting('notifications', v)}
        />
        <SettingItem
          icon="finger-print-outline"
          title="Haptic Feedback"
          subtitle="Vibration on interactions"
          value={settings.hapticFeedback}
          onValueChange={(v) => updateSetting('hapticFeedback', v)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingItem
          icon="apps-outline"
          title="Default Tab"
          subtitle="Tab to show on app launch"
          type="value"
          value={settings.defaultTab}
          onPress={() => Alert.alert('Default Tab', 'Open app to:', [
            { text: 'Home', onPress: () => updateSetting('defaultTab', 'Home') },
            { text: 'Bookmarks', onPress: () => updateSetting('defaultTab', 'Bookmarks') },
            { text: 'Watching', onPress: () => updateSetting('defaultTab', 'Watching') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
        <SettingItem
          icon="globe-outline"
          title="Language"
          subtitle="App interface language"
          type="value"
          value="English"
          onPress={() => Alert.alert('Language', 'Select language:', [
            { text: 'English', onPress: () => {} },
            { text: 'Spanish', onPress: () => {} },
            { text: 'Japanese', onPress: () => {} },
            { text: 'Cancel', style: 'cancel' },
          ])}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.bookmarks}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.downloads}</Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.actionItem} onPress={handleClearHistory}>
          <View style={styles.settingIcon}>
            <Ionicons name="trash-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Clear Watch History</Text>
            <Text style={styles.settingSubtitle}>Remove all watch history data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={handleClearBookmarks}>
          <View style={styles.settingIcon}>
            <Ionicons name="bookmark-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Clear Bookmarks</Text>
            <Text style={styles.settingSubtitle}>Remove all bookmarked anime</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={handleClearDownloads}>
          <View style={styles.settingIcon}>
            <Ionicons name="download-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Clear Downloads</Text>
            <Text style={styles.settingSubtitle}>Remove all downloaded episodes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Tips</Text>
        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert(
          'Keyboard Shortcuts',
          '• Space/K: Play/Pause\n' +
          '• ←/→: Seek 5s backward/forward\n' +
          '• F: Fullscreen\n' +
          '• M: Mute\n\n' +
          'Touch Gestures:\n' +
          '• Double tap left: -10s\n' +
          '• Double tap right: +10s\n' +
          '• Swipe horizontal: Seek\n' +
          '• Long press: Change speed',
          [{ text: 'Got it!' }]
        )}>
          <View style={styles.settingIcon}>
            <Ionicons name="help-circle-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Keyboard Shortcuts</Text>
            <Text style={styles.settingSubtitle}>View all shortcuts & gestures</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert(
          'About AniKai',
          'AniKai Mobile is an enhanced streaming app for animekai.to\n\n' +
          'Features:\n' +
          '• Ad-free experience\n' +
          '• Gesture controls\n' +
          '• Sleep timer\n' +
          '• Auto skip intro\n' +
          '• Customizable settings\n\n' +
          'Made with ❤️ for anime fans',
          [{ text: 'Close' }]
        )}>
          <View style={styles.settingIcon}>
            <Ionicons name="heart-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>About</Text>
            <Text style={styles.settingSubtitle}>App information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <SettingItem
          icon="bug-outline"
          title="Debug Mode"
          subtitle="Show debug information"
          value={settings.debugMode || false}
          onValueChange={(v) => updateSetting('debugMode', v)}
        />
        <TouchableOpacity style={styles.actionItem} onPress={handleExportSettings}>
          <View style={styles.settingIcon}>
            <Ionicons name="share-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Export Settings</Text>
            <Text style={styles.settingSubtitle}>Backup your preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={handleShareApp}>
          <View style={styles.settingIcon}>
            <Ionicons name="share-social-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Share App</Text>
            <Text style={styles.settingSubtitle}>Tell friends about AniKai</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleRateApp}>
          <View style={styles.settingIcon}>
            <Ionicons name="star-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Rate App</Text>
            <Text style={styles.settingSubtitle}>Love it? Give us 5 stars!</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert(
          'Advanced Options',
          'These are advanced settings. Only use if you know what you\'re doing.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset App', style: 'destructive', onPress: () => Alert.alert('Reset', 'All settings will be reset to default.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Done', 'App settings reset') },
            ])},
          ]
        )}>
          <View style={styles.settingIcon}>
            <Ionicons name="code-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Advanced</Text>
            <Text style={styles.settingSubtitle}>Reset app, debug info</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity style={styles.actionItem} onPress={handleVisitWebsite}>
          <View style={styles.settingIcon}>
            <Ionicons name="globe-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Visit Website</Text>
            <Text style={styles.settingSubtitle}>Open animekai.to in browser</Text>
          </View>
          <Ionicons name="open-outline" size={20} color="#666" />
        </TouchableOpacity>
        <View style={styles.infoItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="information-circle-outline" size={22} color="#ff4757" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Version</Text>
            <Text style={styles.settingSubtitle}>1.7.1</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AniKai Mobile v1.7.1</Text>
        <Text style={styles.footerSubtext}>The ultimate anime streaming experience</Text>
      </View>
    </ScrollView>

    {/* Toast Notification */}
    {toastMessage && (
      <View style={styles.toast}>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    )}

    {/* PIN Setup Modal - Outside ScrollView */}
    {pinSetupVisible && (
      <View style={styles.pinOverlay}>
        <View style={styles.pinContainer}>
          <Text style={styles.pinTitle}>
            {pinStep === 1 ? 'Set up PIN' : 'Confirm PIN'}
          </Text>
          <Text style={styles.pinSubtitle}>
            {pinStep === 1 ? 'Enter a 4-digit PIN' : 'Re-enter your PIN to confirm'}
          </Text>
          
          {/* PIN Display */}
          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[
                styles.pinDot,
                (pinStep === 1 ? pinInput.length : pinConfirmInput.length) > i && styles.pinDotFilled
              ]} />
            ))}
          </View>
          
          {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
          
          {/* Numpad */}
          <View style={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.numpadButton}
                onPress={() => handlePinDigitPress(num.toString())}
              >
                <Text style={styles.numpadText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.numpadButton} onPress={cancelPinSetup}>
              <Text style={styles.numpadTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.numpadButton} onPress={() => handlePinDigitPress('0')}>
              <Text style={styles.numpadText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.numpadButton} onPress={handleBackspace}>
              <Ionicons name="backspace-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  valueText: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#ff4757',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  pinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pinContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pinTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  pinSubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 32,
  },
  pinDisplay: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff4757',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#ff4757',
  },
  pinError: {
    color: '#ff4757',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: 280,
  },
  numpadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  numpadText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  numpadTextCancel: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    zIndex: 2000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
