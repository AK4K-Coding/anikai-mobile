import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const scheduleNewEpisodeNotification = async (animeTitle, episodeNumber) => {
  if (Platform.OS === 'android') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `New Episode Available!`,
        body: `${animeTitle} - Episode ${episodeNumber} is now available`,
        data: { animeTitle, episodeNumber, type: 'new_episode' },
      },
      trigger: null, // Immediate notification
    });
  }
};

export const scheduleDownloadCompleteNotification = async (filename) => {
  if (Platform.OS === 'android') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Download Complete',
        body: `${filename} has been downloaded successfully`,
        data: { filename, type: 'download_complete' },
      },
      trigger: null,
    });
  }
};

export const setupNotificationCategories = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationCategoryAsync('episode', [
      {
        identifier: 'watch',
        buttonTitle: 'Watch Now',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'bookmark',
        buttonTitle: 'Bookmark',
        options: { opensAppToForeground: false },
      },
    ]);
  }
};

export const getNotificationToken = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }
  
  const token = await Notifications.getExpoPushTokenAsync();
  return token;
};
