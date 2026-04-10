import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';

const INJECTED_JS = `
  (function() {
    // ===== SMART AUTO-RESUME & PROGRESS BARS =====
    const progressStore = {};
    
    // Add visual progress bars to episode cards
    const addProgressBars = () => {
      // Find all episode cards/items on continue watching page
      const episodeCards = document.querySelectorAll('[class*="episode"], [class*="item"], .film-item, .anime-item, .watch-item');
      
      episodeCards.forEach((card, index) => {
        // Skip if already has progress bar
        if (card.querySelector('.anikai-progress-bar')) return;
        
        // Try to get episode ID from link or data attribute
        const link = card.querySelector('a');
        const episodeId = link?.href || card.dataset?.id || 'episode_' + index;
        
        // Get saved progress from localStorage
        const saved = localStorage.getItem('anikai_progress_' + episodeId);
        if (saved) {
          const progress = JSON.parse(saved);
          if (progress.percent > 0 && progress.percent < 95) {
            // Create progress bar
            const progressContainer = document.createElement('div');
            progressContainer.className = 'anikai-progress-bar';
            progressContainer.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:4px;background:rgba(0,0,0,0.5);z-index:10;';
            
            const progressFill = document.createElement('div');
            progressFill.style.cssText = 'height:100%;width:' + progress.percent + '%;background:#ff4757;transition:width 0.3s;';
            
            progressContainer.appendChild(progressFill);
            card.style.position = 'relative';
            card.appendChild(progressContainer);
            
            // Add time remaining badge
            if (progress.duration > 0) {
              const remaining = Math.ceil((progress.duration - progress.currentTime) / 60);
              const badge = document.createElement('div');
              badge.className = 'anikai-time-badge';
              badge.textContent = remaining + 'm left';
              badge.style.cssText = 'position:absolute;top:8px;right:8px;background:#ff4757;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;z-index:10;';
              card.appendChild(badge);
            }
          }
        }
      });
    };
    
    // Track video progress on watch pages
    const trackVideoProgress = () => {
      const video = document.querySelector('video');
      if (!video) return;
      
      // Get episode ID from URL
      const episodeId = window.location.pathname + window.location.search;
      
      let saveTimeout;
      const saveProgress = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          if (video.duration > 0) {
            const progress = {
              currentTime: video.currentTime,
              duration: video.duration,
              percent: Math.round((video.currentTime / video.duration) * 100),
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('anikai_progress_' + episodeId, JSON.stringify(progress));
          }
        }, 1000);
      };
      
      video.addEventListener('timeupdate', saveProgress);
      video.addEventListener('pause', saveProgress);
      video.addEventListener('ended', () => {
        localStorage.removeItem('anikai_progress_' + episodeId);
      });
      
      // Auto-resume from saved position
      const saved = localStorage.getItem('anikai_progress_' + episodeId);
      if (saved) {
        const progress = JSON.parse(saved);
        if (progress.percent < 95) {
          video.currentTime = progress.currentTime;
          // Show resume notification
          const toast = document.createElement('div');
          toast.textContent = 'Resumed from ' + Math.floor(progress.currentTime / 60) + ':' + String(Math.floor(progress.currentTime % 60)).padStart(2, '0');
          toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#ff4757;color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;z-index:9999;animation:fadeIn 0.3s;';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      }
    };
    
    // Run progress bar injection periodically
    setInterval(addProgressBars, 1000);
    
    // Start tracking if on watch page
    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/episode')) {
      setTimeout(trackVideoProgress, 1500);
    }
    
    // ===== UI ENHANCEMENTS =====
    const hideElements = () => {
      const header = document.querySelector('header, .header, nav, .navbar, [class*="header"], #header');
      if (header) header.style.display = 'none';
      
      const footer = document.querySelector('footer, .footer, #footer');
      if (footer) footer.style.display = 'none';
      
      const downloadBtns = document.querySelectorAll('[class*="download"], [id*="download"], .download-btn');
      downloadBtns.forEach(btn => btn.style.display = 'none');
      
      document.querySelectorAll('img').forEach(img => {
        if (img.dataset.src && !img.src) img.src = img.dataset.src;
        if (img.dataset.original && !img.src) img.src = img.dataset.original;
        if (img.dataset.lazy && !img.src) img.src = img.dataset.lazy;
        if (img.dataset.srcset && !img.src) img.src = img.dataset.srcset.split(',')[0];
        
        img.loading = 'eager';
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        
        img.onerror = function() {
          if (this.dataset.src) this.src = this.dataset.src;
          else if (this.dataset.original) this.src = this.dataset.original;
          else if (this.dataset.lazy) this.src = this.dataset.lazy;
        };
      });
    };
    
    hideElements();
    setInterval(hideElements, 800);
    
    // ===== AD BLOCKING =====
    const blocked = ['flixzone', 'flix', 'redirect', 'popup', 'ads', 'advertising', 'click', 'yflix', 'sponsor', 'moontv'];
    const originalOpen = window.open;
    window.open = function(url) {
      if (url && blocked.some(d => url.toLowerCase().includes(d))) {
        console.log('Blocked:', url);
        return null;
      }
      return originalOpen?.apply(this, arguments);
    };
    
    window.alert = function(msg) { console.log('Alert blocked:', msg); };
    window.confirm = function(msg) { console.log('Confirm blocked:', msg); return true; };
    
    // ===== PULL TO REFRESH =====
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    document.addEventListener('touchend', function(e) {
      const touchEndY = e.changedTouches[0].screenY;
      if (window.scrollY === 0 && touchEndY - touchStartY > 100) {
        window.location.reload();
      }
    }, false);
    
    console.log('🎬 AniKai Smart Features Loaded');
  })();
`;

export default function DownloadsScreen() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('https://animekai.to/user/watching');

  const handleWatchPress = () => {
    Alert.alert(
      'Continue Watching',
      'Tap any anime to resume watching from where you left off.\n\nEpisodes show your progress - click to continue!',
      [{ text: 'Got it' }]
    );
  };

  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    // If user navigates to watch page, let them watch
    if (navState.url.includes('/watch') || navState.url.includes('/episode')) {
      // User clicked an anime, they're now watching
    }
  };

  const goBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const isWatchingPage = currentUrl.includes('/watch') || currentUrl.includes('/episode');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isWatchingPage && (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#ff4757" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Continue Watching</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleWatchPress} style={styles.headerBtn}>
            <Ionicons name="information-circle-outline" size={24} color="#ff4757" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => webViewRef.current?.reload()}>
            <Ionicons name="refresh" size={24} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>
      
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://animekai.to/user/watching' }}
        style={styles.webview}
        injectedJavaScript={INJECTED_JS}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setTimeout(() => setLoading(false), 500)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="always"
        cacheEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        pullToRefreshEnabled={true}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff4757" />
          <Text style={styles.loadingText}>Loading your watchlist...</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBtn: {
    padding: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
});
