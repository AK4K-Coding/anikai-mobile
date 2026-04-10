# Changelog

## v1.7.1 - April 10, 2026

### 🎉 App Store Ready Release

### 📱 Onboarding Experience
- **Beautiful First-Launch Tutorial**: 5-slide animated onboarding
- **Feature Highlights**: Smart auto-resume, PIN lock, ad-free browsing
- **Skip Option**: Users can skip if they prefer
- **Smooth Animations**: Engaging transitions between slides

### 🔗 Share & Rate Features
- **Share App**: Native Android share sheet with pre-written message
- **Rate App**: Prompt users to rate with 5-star CTA
- **GitHub Integration**: Links to releases page for ratings

### 📄 Legal & Documentation
- **Privacy Policy**: Complete privacy policy explaining local-only data
- **Terms of Service**: User agreement and disclaimer
- **Contributing Guide**: Instructions for open source contributors
- **MIT License**: Open source licensing

### 🎨 UI Polish
- **Enhanced Settings**: Share, Rate, and Export options
- **Toast Notifications**: Feedback for user actions
- **Better Icons**: Consistent Ionicons throughout

### 🛡️ Security Improvements
- **moontv Redirects Blocked**: Added to blocked domains list
- **Better Ad Blocking**: Multiple layers of protection

## v1.7.0 - April 10, 2026

### 🚀 GAME-CHANGING FEATURES

### 🎬 Smart Auto-Resume with Visual Progress Bars
- **Automatic Timestamp Saving**: Saves exact video position every second
- **Visual Progress Bars**: Red bars on episode thumbnails showing % watched
- **Time Remaining Badge**: Shows "12m left" on partially watched episodes
- **Auto-Resume**: Automatically jumps to saved position when re-opening episode
- **Resume Toast**: Shows "Resumed from 8:42" notification
- **Smart Cleanup**: Auto-removes progress when episode finishes (>95% watched)

### 🔄 Fixed Clear Cache
- **Actually Clears Cache**: Uses FileSystem to delete WebView cache files
- **Real-time Size Display**: Shows actual cache size (e.g., "Current: 45.2 MB")
- **Loading Indicator**: Activity spinner while clearing
- **Toast Confirmation**: "Cache cleared successfully" notification

### 📤 Export Settings
- **Backup Feature**: Export all settings, bookmarks, and history
- **JSON Format**: Saves as structured data for future import

### 📊 Enhanced Continue Watching
- **Progress Indicators**: Visual bars on episode cards
- **Time Tracking**: Know exactly where you left off
- **Smart Storage**: Keeps last 100 episodes, auto-removes old ones

### 🛡️ Improved Ad Blocking
- **yflix.to blocked**: Added to blocked domains
- **CSS Selectors**: Hides yflix banner ads

## v1.6.1 - April 10, 2026

### 🔒 App PIN Lock - Now Fully Working!
- **PIN Setup in Settings**: Tap "App Lock" → Enter 4-digit PIN → Confirm PIN
- **PIN Lock Screen**: Beautiful lock screen with numpad on app launch
- **Visual Feedback**: PIN dots fill as you type, error shake animation
- **Security**: PIN stored securely in AsyncStorage
- **Disable PIN**: Toggle off to remove protection

### 🚫 Ad Blocking Improved
- **Blocked yflix.to ads**: Added yflix.to to blocked domains
- **CSS Blocking**: Added yflix selectors to hide banner ads
- **URL Pattern Matching**: Now blocks `https://yflix.to/?utm_source=anikai.to`

### PIN Lock Features:
- 4-digit numeric PIN
- Enter PIN twice to confirm during setup
- Incorrect PIN shows error and clears input
- Backspace support
- Beautiful dark theme matching app
- Smooth animations

## v1.6.0 - April 10, 2026

### 🎉 Major Feature Update: Ultimate Anime Experience

### New Video Player Features
- **Swipe Gestures**: Swipe horizontally to seek through video
- **Double Tap to Seek**: Double tap left/right sides to skip ±10s
- **Playback Speed**: Long press video to cycle speeds (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- **Sleep Timer**: Auto-pause after 15/30/45/60/90 minutes
- **Auto Skip Intro**: Automatically skips first 85 seconds of episodes
- **Keyboard Shortcuts**:
  - Space/K: Play/Pause
  - Arrow keys: Seek ±5s
  - F: Fullscreen
  - M: Mute

### 20+ New Settings
**Playback Settings:**
- Playback Speed (0.5x - 2x)
- Sleep Timer (Off, 15-90 min)
- Swipe Gestures toggle
- Auto Fullscreen
- Auto Resume

**Appearance:**
- Dark Theme toggle
- Compact UI mode
- Reduced Motion (accessibility)
- Accent Color picker (Red, Blue, Green, Purple)

**Network & Performance:**
- Smart Quality (auto-adjust based on connection)
- Cache Size (100MB - 2GB or Unlimited)
- Wi-Fi Only mode
- Clear Cache button

**Privacy & Security:**
- App Lock (PIN protection)
- Haptic Feedback toggle
- Ad Blocker toggle

**App Settings:**
- Default Tab (Home/Bookmarks/Watching)
- Language selection
- Debug Mode

### UI Improvements
- **Help & Tips section**: View all keyboard shortcuts and gestures
- **About section**: App information and features list
- **Developer section**: Debug mode and advanced options
- **Better organization**: Settings grouped into 8 categories
- **Stats display**: Shows bookmarks and downloads count

### Technical Improvements
- Enhanced ad blocking (blocks sponsored content too)
- Better image loading with eager loading
- Improved video detection and enhancement
- Pull-to-refresh on all tabs
- Back button navigation on video pages
- Toast notifications for player actions

## v1.5.0 - April 10, 2026

### Major Redesign: Continue Watching
- **Watching Tab**: Completely remade - now shows `https://animekai.to/user/watching`
  - Shows your "Continue Watching" list from the website
  - Tap any anime to resume exactly where you left off
  - Back button appears when watching an episode
  - Pull-to-refresh support
  - Better image loading with eager loading

### General Improvements
- **Better Image Loading**: All tabs now use more aggressive image fixing
  - Handles lazy-loaded images (data-src, data-original, data-lazy)
  - Fixes broken images by trying alternate sources
  - Eager loading for instant display
  
- **Back Button Navigation**: Bookmarks and Watching tabs now show back button when on video pages
  - Navigate back to list from episode without using system back
  - Cleaner navigation experience

- **Video Playback**: Added inline media playback settings
  - Videos can play inline
  - Fullscreen support
  - No user action required to start playback

- **Tab Icon**: Changed from download icon to play-circle icon
  - Better represents "Continue Watching" functionality
  - More intuitive for users

- **UI Polish**: 
  - Loading text shows what content is loading
  - Smoother transitions between pages
  - Consistent header styling across all tabs

## v1.4.0 - April 10, 2026

### Major Redesign: Native Website Integration
- **Bookmarks Tab**: Now loads website's native bookmarks page (`animekai.to/user/bookmarks`)
  - Uses your existing website account bookmarks
  - No more custom app bookmarks - everything syncs with the website
  - Hidden website header for native app feel
  
- **Downloads Tab**: Now shows Watch History from website (`animekai.to/user/history`)
  - See what you've watched with timestamps
  - Download button in header with instructions
  - Uses website's native download functionality
  
- **Home Tab**: Removed custom bookmark/download bar
  - Website's native bookmark/download buttons now visible
  - No more intrusive floating bars covering video
  - Cleaner, more natural viewing experience

### Improvements
- **Ad Blocking**: Still blocks FlixZone and redirects in all tabs
- **Image Loading**: Fixed images not loading in all WebViews
- **Native Feel**: Headers hidden in bookmarks/history for seamless app experience
- **Refresh**: Pull-to-refresh and manual refresh button in each tab

## v1.3.0 - April 10, 2026

### Fixed
- **Download Functionality**: Downloads now properly queue with episode tracking
- **Image Loading**: Fixed anime banners not loading in Downloads and Bookmarks tabs
- **Episode Display**: Downloads now show episode number and quality (e.g., "Episode 5 • 720p")
- **Episode Count**: Bookmarks now extract and display actual episode count (not "??")
- **FlixZone Redirects**: Blocked FlixZone and other ad redirects completely
- **Ad Banners**: Removed "Free Movies & TV" banner ads and other intrusive advertisements
- **Continue Watching Images**: Fixed images in Continue Watching section not loading
- **UI Action Bar**: Completely redesigned floating bar - now Netflix-style with gradient background
- **Button Icons**: Changed from emoji to SVG icons (bookmark icon, download icon)
- **Clear Functions**: Clear Bookmarks and Clear Downloads now actually work

### New Features
- **Ad Blocker Toggle**: New setting to enable/disable ad blocking
- **Auto Skip Intro**: Setting to automatically skip anime intros (85 seconds)
- **Picture in Picture**: Continue watching in small window while using other apps
- **Hardware Acceleration**: GPU acceleration toggle for better performance
- **Preload Next Episode**: Buffer next episode while watching current
- **Audio Language**: Choose preferred audio language (Japanese/English)
- **Episode Thumbnails**: Toggle for showing episode preview thumbnails
- **Episode Info Bar**: Shows anime title and episode number in action bar

### UI Redesign
- **Netflix-Style Bar**: Bottom gradient bar with anime title and episode info
- **Icon Buttons**: Round circular buttons with SVG icons instead of emoji
- **Quality Dropdown**: Compact styled quality selector
- **Toast Notifications**: Gradient red toasts matching app theme
- **Placeholder Images**: Film/bookmark icons when anime images fail to load

### Technical
- **Enhanced Extraction**: Better title, episode, and image extraction from webpage
- **Image Validation**: Checks for valid HTTP URLs before loading images
- **Ad Blocking**: JavaScript injection blocks popups, redirects, and ad clicks
- **File System**: Added expo-file-system for download management
- **Download Progress**: Simulated progress tracking (0-100%)

## v1.2.0 - April 9, 2026

### Fixed
- **Bookmark/Download Button Placement**: Buttons now ONLY appear on watch/anime pages, not on homepage
- **Image Loading**: Fixed anime banners/posters not loading - images now load eagerly with `mixedContentMode="always"`
- **Button Bug**: Floating action bar no longer shows on startup - waits for video player page detection
- **UI Polish**: Better floating bar design at bottom of screen with backdrop blur
- **Page Detection**: Only shows buttons when video player or episode list is detected on page

### UI Improvements
- **Cleaner Homepage**: Website UI preserved - no intrusive button overlays on homepage
- **Floating Action Bar**: Modern pill-shaped bar at bottom with glassmorphism effect
- **Better Toast Notifications**: Centered, rounded, with shadow
- **Visual Feedback**: Buttons briefly turn green/red when clicked
- **Smoother Animations**: Slide-up toasts and button state changes

### Technical
- Added `mixedContentMode="always"` for HTTPS/HTTP image compatibility
- Added `cacheEnabled`, `thirdPartyCookiesEnabled` for better media loading
- Image lazy-loading fixer runs every 2 seconds
- Better path-based page detection (`/watch`, `/anime/`)

## v1.1.0 - April 9, 2026

### Fixed
- **URL Correction**: Changed from `anikai.to` to correct `animekai.to/home`

### New Features
- **Bookmark System**: In-app bookmark button appears on anime pages - tap 🔖 Bookmark to save
- **Download System**: Download episodes directly from the anime page with quality selection
- **Resolution Selector**: Choose from 360p, 480p, 720p, or 1080p for downloads
- **Toast Notifications**: Visual feedback when bookmarking or downloading
- **Stats Display**: See bookmark and download counts in Settings

### New Settings
- **Streaming Quality**: Auto, 360p, 480p, 720p, 1080p
- **Download Quality**: 360p (~150MB), 480p (~250MB), 720p (~400MB), 1080p (~800MB) per episode
- **Data Saver Mode**: Automatically reduces quality on mobile data
- **Double Tap to Seek**: Skip forward/backward 10 seconds
- **Subtitle Settings**: Enable/disable subtitles, choose language (EN/ES/JA)
- **Clear Bookmarks**: Remove all bookmarked anime
- **Clear Downloads**: Remove all downloaded episodes

### Improvements
- Enhanced JavaScript injection for page interaction
- Better anime info extraction from website
- Real-time action bar on anime watch pages

## v1.0.0 - April 9, 2026

### Initial Release
- WebView wrapper for animekai.to
- Bottom tab navigation (Home, Bookmarks, Downloads, Settings)
- Basic bookmark and download tracking
- Dark theme throughout
- Hardware back button support
- Keep screen on option
- Push notifications ready
