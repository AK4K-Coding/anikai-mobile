import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, BackHandler, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useKeepAwake } from 'expo-keep-awake';

const INJECTED_JAVASCRIPT = `
  (function() {
    // ===== ANTI-AD & REDIRECT BLOCKING =====
    const blockedDomains = ['flixzone', 'flix', 'redirect', 'popup', 'ads', 'advertising', 'click', 'track', 'sponsored', 'yflix', 'moontv'];
    
    // Override window.open to block popups
    const originalOpen = window.open;
    window.open = function(url, target, features) {
      if (url && blockedDomains.some(d => url.toLowerCase().includes(d))) {
        console.log('Blocked popup:', url);
        return null;
      }
      return originalOpen.apply(this, arguments);
    };
    
    // Block location changes
    let originalLocation = window.location.href;
    Object.defineProperty(window, 'location', {
      get: function() {
        return {
          get href() { return originalLocation; },
          set href(url) {
            if (blockedDomains.some(d => url.toLowerCase().includes(d))) {
              console.log('Blocked redirect:', url);
              return;
            }
            originalLocation = url;
            window.location.href = url;
          }
        };
      }
    });
    
    // Block clicks on ad elements
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a, button, [onclick]');
      if (target) {
        const href = target.href || target.getAttribute('href') || '';
        if (blockedDomains.some(d => href.toLowerCase().includes(d))) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Blocked click:', href);
          return false;
        }
      }
    }, true);
    
    // ===== IMAGE FIXING =====
    const fixAllImages = () => {
      document.querySelectorAll('img').forEach(img => {
        if (img.dataset.src && !img.src) img.src = img.dataset.src;
        if (img.dataset.original && !img.src) img.src = img.dataset.original;
        if (img.dataset.lazy && !img.src) img.src = img.dataset.lazy;
        
        img.loading = 'eager';
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        
        img.onerror = function() {
          if (this.dataset.src) this.src = this.dataset.src;
          if (this.dataset.original) this.src = this.dataset.original;
        };
      });
    };
    
    // ===== ADVANCED VIDEO PLAYER FEATURES =====
    let videoPlayer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSeeking = false;
    let seekDirection = null;
    let brightnessStart = 0;
    let volumeStart = 0;
    
    const setupVideoGestures = () => {
      const video = document.querySelector('video');
      if (!video || video.dataset.gestures) return;
      video.dataset.gestures = 'true';
      videoPlayer = video;
      
      // Double tap to seek
      let lastTap = 0;
      video.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
          // Double tap detected
          const rect = video.getBoundingClientRect();
          const x = e.changedTouches[0].clientX - rect.left;
          const width = rect.width;
          
          if (x < width * 0.3) {
            // Left side - seek backward 10s
            video.currentTime = Math.max(0, video.currentTime - 10);
            showToast('⏪ -10s');
          } else if (x > width * 0.7) {
            // Right side - seek forward 10s
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            showToast('⏩ +10s');
          }
        }
        lastTap = currentTime;
      });
      
      // Swipe gestures for volume/brightness/seek
      video.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = new Date().getTime();
        isSeeking = false;
        seekDirection = null;
      }, { passive: true });
      
      video.addEventListener('touchmove', function(e) {
        if (e.touches.length !== 1) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;
        const rect = video.getBoundingClientRect();
        
        // Horizontal swipe (seeking)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
          isSeeking = true;
          const seekAmount = Math.floor(deltaX / 10);
          if (seekAmount > 0) {
            showToast('⏩ +' + seekAmount + 's');
          } else if (seekAmount < 0) {
            showToast('⏪ ' + seekAmount + 's');
          }
          e.preventDefault();
        }
      }, { passive: false });
      
      video.addEventListener('touchend', function(e) {
        if (!isSeeking) return;
        
        const touchX = e.changedTouches[0].clientX;
        const deltaX = touchX - touchStartX;
        const seekAmount = Math.floor(deltaX / 10);
        
        if (seekAmount !== 0 && videoPlayer) {
          videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + seekAmount));
        }
        isSeeking = false;
      });
      
      // Playback speed indicator
      const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
      let currentSpeedIdx = 2;
      
      // Speed control on long press
      let longPressTimer;
      video.addEventListener('touchstart', function() {
        longPressTimer = setTimeout(() => {
          currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
          video.playbackRate = speeds[currentSpeedIdx];
          showToast('⚡ ' + speeds[currentSpeedIdx] + 'x');
        }, 800);
      }, { passive: true });
      
      video.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
      });
    };
    
    // Toast notification system
    const showToast = (message) => {
      const existing = document.querySelector('.anikai-toast');
      if (existing) existing.remove();
      
      const toast = document.createElement('div');
      toast.className = 'anikai-toast';
      toast.textContent = message;
      toast.style.cssText = 
        'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);' +
        'background: rgba(0,0,0,0.9); color: #ff4757; border: 2px solid #ff4757;' +
        'padding: 16px 24px; border-radius: 12px; z-index: 2147483647;' +
        'font-weight: 700; font-size: 18px; text-align: center;' +
        'box-shadow: 0 4px 20px rgba(255,71,87,0.4);';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 1200);
    };
    
    // Auto skip intro detection (pattern matching)
    const detectAndSkipIntro = () => {
      const video = document.querySelector('video');
      if (!video) return;
      
      // Common intro patterns
      const introPatterns = [
        { start: 0, end: 85 },      // 0:00 to 1:25
        { start: 0, end: 90 },      // 0:00 to 1:30
        { start: 135, end: 225 },   // 2:15 to 3:45 (recap + intro)
      ];
      
      let hasSkipped = false;
      video.addEventListener('timeupdate', function() {
        if (hasSkipped) return;
        
        const time = video.currentTime;
        // Check if we're in intro zone
        for (const pattern of introPatterns) {
          if (time >= pattern.start && time < pattern.start + 2) {
            showToast('⏭️ Skipping Intro...');
            video.currentTime = pattern.end;
            hasSkipped = true;
            setTimeout(() => hasSkipped = false, 5000);
            break;
          }
        }
      });
    };
    
    // Sleep timer
    let sleepTimerId = null;
    const setSleepTimer = (minutes) => {
      if (sleepTimerId) clearTimeout(sleepTimerId);
      
      const ms = minutes * 60 * 1000;
      showToast('😴 Sleep timer: ' + minutes + ' min');
      
      sleepTimerId = setTimeout(() => {
        const video = document.querySelector('video');
        if (video) video.pause();
        showToast('⏹️ Sleep timer ended');
      }, ms);
    };
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      const video = document.querySelector('video');
      if (!video) return;
      
      switch(e.key) {
        case 'ArrowRight':
          video.currentTime += 5;
          showToast('⏩ +5s');
          break;
        case 'ArrowLeft':
          video.currentTime -= 5;
          showToast('⏪ -5s');
          break;
        case ' ':
        case 'k':
          if (video.paused) {
            video.play();
            showToast('▶️ Play');
          } else {
            video.pause();
            showToast('⏸️ Pause');
          }
          break;
        case 'f':
          if (video.requestFullscreen) {
            video.requestFullscreen();
          }
          break;
        case 'm':
          video.muted = !video.muted;
          showToast(video.muted ? '🔇 Muted' : '🔊 Unmuted');
          break;
      }
    });
    
    // ===== STYLES =====
    const style = document.createElement('style');
    style.textContent = 
      '[class*="flix"], [id*="flix"], [class*="ad-"], [id*="ad-"], ' +
      '[class*="popup"], [id*="popup"], [class*="banner"], ' +
      '.announcement, .cookie-banner, .consent-popup, .advertisement, ' +
      '[class*="sponsored"], [id*="sponsored"], [class*="yflix"], [id*="yflix"] { ' +
      '  display: none !important; }' +
      'img { opacity: 1 !important; visibility: visible !important; }' +
      'body { -webkit-tap-highlight-color: transparent; }' +
      'html { scroll-behavior: smooth; }' +
      'video { outline: none; }';
    document.head.appendChild(style);
    
    // Run image fixer
    fixAllImages();
    setInterval(fixAllImages, 1500);
    
    // Setup video features
    setInterval(() => {
      setupVideoGestures();
      const video = document.querySelector('video');
      if (video && !video.dataset.enhanced) {
        video.dataset.enhanced = 'true';
        detectAndSkipIntro();
        
        // Set default quality to auto
        if (video.canPlayType) {
          video.setAttribute('preload', 'auto');
        }
      }
    }, 2000);
    
    // Signal ready
    window.ReactNativeWebView.postMessage('pageLoaded');
  })();
`;

export default function HomeScreen({ navigation }) {
  useKeepAwake();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data === 'pageLoaded') {
      setLoading(false);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert(
      'Connection Error',
      'Failed to load AniKai. Please check your internet connection.',
      [{ text: 'Retry', onPress: () => webViewRef.current?.reload() }, { text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://animekai.to/home' }}
        style={styles.webview}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setTimeout(() => setLoading(false), 800)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="always"
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4757" />
          </View>
        )}
        pullToRefreshEnabled={true}
        bounces={true}
        overScrollMode="content"
        textZoom={100}
        setSupportMultipleWindows={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
      />
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ff4757" />
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
  webview: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
});
