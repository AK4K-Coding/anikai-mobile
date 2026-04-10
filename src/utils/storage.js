import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@anikai_bookmarks';
const WATCH_HISTORY_KEY = '@anikai_watch_history';
const SETTINGS_KEY = '@anikai_settings';
const DOWNLOADS_KEY = '@anikai_downloads';
const PIN_KEY = '@anikai_pin';
const PIN_ENABLED_KEY = '@anikai_pin_enabled';
const VIDEO_PROGRESS_KEY = '@anikai_video_progress';

// Bookmarks
export const getBookmarks = async () => {
  try {
    const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const addBookmark = async (anime) => {
  try {
    const bookmarks = await getBookmarks();
    const exists = bookmarks.find(b => b.id === anime.id);
    if (!exists) {
      bookmarks.unshift({ ...anime, addedAt: new Date().toISOString() });
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (animeId) => {
  try {
    const bookmarks = await getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== animeId);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Watch History
export const getWatchHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(WATCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

export const addToHistory = async (episode) => {
  try {
    const history = await getWatchHistory();
    const filtered = history.filter(h => h.id !== episode.id);
    filtered.unshift({ ...episode, watchedAt: new Date().toISOString() });
    // Keep only last 100
    const trimmed = filtered.slice(0, 100);
    await AsyncStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('Error adding to history:', error);
    return false;
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(WATCH_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

// Settings
export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {
      autoPlay: true,
      autoNext: true,
      quality: 'auto',
      notifications: true,
      darkMode: true,
      downloadQuality: '720p',
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Downloads
export const getDownloads = async () => {
  try {
    const downloads = await AsyncStorage.getItem(DOWNLOADS_KEY);
    return downloads ? JSON.parse(downloads) : [];
  } catch (error) {
    console.error('Error getting downloads:', error);
    return [];
  }
};

export const addDownload = async (download) => {
  try {
    const downloads = await getDownloads();
    downloads.unshift({ ...download, downloadedAt: new Date().toISOString() });
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
    return true;
  } catch (error) {
    console.error('Error adding download:', error);
    return false;
  }
};

export const removeDownload = async (downloadId) => {
  try {
    const downloads = await getDownloads();
    const filtered = downloads.filter(d => d.id !== downloadId);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing download:', error);
    return false;
  }
};

export const clearAllDownloads = async () => {
  try {
    await AsyncStorage.removeItem(DOWNLOADS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing downloads:', error);
    return false;
  }
};

export const updateDownloadProgress = async (downloadId, progress) => {
  try {
    const downloads = await getDownloads();
    const updated = downloads.map(d => 
      d.id === downloadId ? { ...d, progress, status: progress === 100 ? 'completed' : 'downloading' } : d
    );
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error updating download progress:', error);
    return false;
  }
};

export const clearAllBookmarks = async () => {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
};

// PIN Lock
export const getPin = async () => {
  try {
    const pin = await AsyncStorage.getItem(PIN_KEY);
    return pin;
  } catch (error) {
    console.error('Error getting PIN:', error);
    return null;
  }
};

export const setPin = async (pin) => {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error setting PIN:', error);
    return false;
  }
};

export const verifyPin = async (inputPin) => {
  try {
    const storedPin = await getPin();
    return storedPin === inputPin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

export const isPinEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking PIN enabled:', error);
    return false;
  }
};

export const disablePin = async () => {
  try {
    await AsyncStorage.removeItem(PIN_KEY);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
    return true;
  } catch (error) {
    console.error('Error disabling PIN:', error);
    return false;
  }
};

// Video Progress - Smart Auto-Resume
export const getVideoProgress = async (videoId) => {
  try {
    const progress = await AsyncStorage.getItem(VIDEO_PROGRESS_KEY);
    const allProgress = progress ? JSON.parse(progress) : {};
    return allProgress[videoId] || { currentTime: 0, duration: 0, updatedAt: null };
  } catch (error) {
    console.error('Error getting video progress:', error);
    return { currentTime: 0, duration: 0 };
  }
};

export const saveVideoProgress = async (videoId, currentTime, duration) => {
  try {
    const progress = await AsyncStorage.getItem(VIDEO_PROGRESS_KEY);
    const allProgress = progress ? JSON.parse(progress) : {};
    allProgress[videoId] = {
      currentTime,
      duration,
      updatedAt: new Date().toISOString(),
      percent: duration > 0 ? Math.round((currentTime / duration) * 100) : 0
    };
    // Keep only last 100 videos to prevent storage bloat
    const entries = Object.entries(allProgress);
    if (entries.length > 100) {
      const sorted = entries.sort((a, b) => new Date(b[1].updatedAt) - new Date(a[1].updatedAt));
      const trimmed = Object.fromEntries(sorted.slice(0, 100));
      await AsyncStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(trimmed));
    } else {
      await AsyncStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(allProgress));
    }
    return true;
  } catch (error) {
    console.error('Error saving video progress:', error);
    return false;
  }
};

export const getAllVideoProgress = async () => {
  try {
    const progress = await AsyncStorage.getItem(VIDEO_PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {};
  } catch (error) {
    console.error('Error getting all video progress:', error);
    return {};
  }
};

export const clearVideoProgress = async () => {
  try {
    await AsyncStorage.removeItem(VIDEO_PROGRESS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing video progress:', error);
    return false;
  }
};
