import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';

const INJECTED_JS = `
  (function() {
    // Hide website header/footer for native app feel
    const hideElements = () => {
      const header = document.querySelector('header, .header, nav, .navbar, [class*="header"], #header');
      if (header) header.style.display = 'none';
      
      const footer = document.querySelector('footer, .footer, #footer');
      if (footer) footer.style.display = 'none';
      
      // Fix images - more aggressive loading
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
    
    // Block redirects/ads
    const blocked = ['flixzone', 'flix', 'redirect', 'popup', 'ads', 'advertising', 'click', 'moontv'];
    const originalOpen = window.open;
    window.open = function(url) {
      if (url && blocked.some(d => url.toLowerCase().includes(d))) {
        console.log('Blocked:', url);
        return null;
      }
      return originalOpen?.apply(this, arguments);
    };
    
    // Block popups
    window.alert = function(msg) { console.log('Alert blocked:', msg); };
    window.confirm = function(msg) { console.log('Confirm blocked:', msg); return true; };
    
    // Pull to refresh
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    document.addEventListener('touchend', function(e) {
      let touchEndY = e.changedTouches[0].screenY;
      if (window.scrollY === 0 && touchEndY - touchStartY > 100) {
        window.location.reload();
      }
    }, false);
    
    console.log('Bookmarks: Injected scripts loaded');
  })();
`;

export default function BookmarksScreen() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('https://animekai.to/user/bookmarks');

  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
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
          <Text style={styles.headerTitle}>My Bookmarks</Text>
        </View>
        <TouchableOpacity onPress={() => webViewRef.current?.reload()}>
          <Ionicons name="refresh" size={24} color="#ff4757" />
        </TouchableOpacity>
      </View>
      
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://animekai.to/user/bookmarks' }}
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
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
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
