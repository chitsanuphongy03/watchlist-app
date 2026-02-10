# 🎬 Watchlist App

A premium, design-focused mobile application for tracking your favorite entertainments. Organize Movies, Anime, Series, and Tokusatsu in one beautiful place. Built with **React Native (Expo)** and **TypeScript**.

## ✨ Features

- **🔐 Secure Authentication**: Protect your list with a 6-digit PIN and Biometric Authentication (FaceID/TouchID).
- **🌍 Universal Search**: Real-time search across **TMDB** (Movies, Series, Tokusatsu) and **Jikan** (Anime) APIs.
- **📋 Smart Watchlist**:
  - Drag & drop ranking system.
  - Status tracking (Not Watched, Watching, Watched).
  - "Next Up" highlight card for your top-priority item.
- **✨ Custom Items**: Add your own content if it's not found in the databases.
- **🔔 Smart Notifications**:
  - Reminders to watch content.
  - "Inactivity" alerts if you haven't watched anything in a while.
  - Auto-suggestion for the next item when you finish one.
- **🎨 Premium Design**:
  - Dark Red-Magenta aesthetic with gradients and blur effects.
  - Smooth animations using `react-native-reanimated`.
  - Haptic feedback and intuitive gestures.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
- **Language**: TypeScript
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Storage**:
  - `AsyncStorage` (Data persistence)
  - `Expo SecureStore` (Sensitive keys/PINs)
- **Animations**: `react-native-reanimated`, `moti`
- **APIs**:
  - [The Movie Database (TMDB)](https://www.themoviedb.org/)
  - [Jikan (MyAnimeList)](https://jikan.moe/)

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS/Android) or an emulator.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/watchlist-app.git
   cd watchlist-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API Keys**
   - Open `constants/api.ts` or create a `.env` file.
   - You can copy `.env.example` to `.env` and fill in your key:
     ```bash
     cp .env.example .env
     ```

4. **Run the app**

   ```bash
   npx expo start
   ```

5. **Scan & Play**
   - Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
   - To test **Biometrics** and **Notifications**, you will need to create a **Development Build** as these features are limited in Expo Go.

## 📱 Screenshots

|   Home & Ranking   |  Search & Filter   |  Details & Status  |
| :----------------: | :----------------: | :----------------: |
| _(Add Screenshot)_ | _(Add Screenshot)_ | _(Add Screenshot)_ |

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the app.

## 📄 License

This project is licensed under the MIT License.
