#!/bin/bash
set -e

echo "=========================================="
echo "AniKai Android APK Build Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}EAS CLI not found. Installing...${NC}"
    npm install -g @expo/eas-cli
fi

# Check if logged in to EAS
echo -e "${GREEN}Checking EAS login status...${NC}"
eas whoami || {
    echo -e "${RED}Not logged in to EAS. Please login:${NC}"
    eas login
}

# Check project is configured
echo -e "${GREEN}Configuring project...${NC}"
if [ ! -f "eas.json" ]; then
    eas build:configure
fi

# Build APK
echo ""
echo -e "${GREEN}Starting APK build...${NC}"
echo -e "${YELLOW}This will build an APK using Expo's cloud service.${NC}"
echo ""

eas build -p android --profile preview --message "AniKai APK Build"

echo ""
echo -e "${GREEN}Build initiated!${NC}"
echo -e "${YELLOW}You can monitor the build at: https://expo.dev/builds${NC}"
echo ""
echo "Once complete, download the APK from the provided link."
