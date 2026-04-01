# 📂 AgroGuardian Project Structure Explained

AgroGuardian is a modern agricultural management platform built with React (Frontend) and Node.js (Backend).

## 🚀 Root Directory
- **agro.bat**: One-click launch script to start both Frontend & Backend.
- **PROJECT_STRUCTURE.md**: Detailed explanation of all project files.
- **backend/**: Contains the server-side logic and database.
- **frontend/**: Contains the user interface and components.

---

## 🛠️ Backend Architecture (Node.js/Express)
Located in `backend/`

- **index.js**: The main server entry point. Configures middleware, database, and all API routes.
- **.env**: Environment variables (Port, Database URLs, API Keys).
- **database/db.js**: Initializes the SQLite database and creates tables for Users, Mentorship, and Alerts.
- **middleware/auth.js**: Middleware that verifies JWT tokens to protect user-specific routes.
- **routes/**: Modularied API endpoints:
  - **auth.js**: Login, registration, and profile management.
  - **crop.js**: Crop advisor logic and mentorship selection.
  - **disease.js**: AI disease detection capture and processing.
  - **weather.js**: Fetches localized weather forecasts.
  - **market.js**: Scrapes or fetches real-time crop prices.
  - **pest.js**: Provides pest alerts based on the current month and user location.
  - **chat.js**: Powers the AI chatbot using Gemini/OpenAI.

---

## 🎨 Frontend Architecture (React/Vite)
Located in `frontend/`

- **src/main.jsx**: The React entry point that renders the App component.
- **src/App.jsx**: Global configuration including the Router and all Context Providers.
- **src/index.css**: The **Design System**. Controls the premium dark mode, glassmorphism, and responsive layouts.
- **src/i18n/translations.js**: The **Language Engine**. Contains all text strings in English, Tamil, Hindi, and Marathi.

### 🧩 Core Folders
- **src/context/**: State management for global data:
  - **AuthContext.jsx**: Manages user login state, registration, and authentication tokens.
  - **LanguageContext.jsx**: Handles app-wide language switching and translation persistence.
  - **LocationContext.jsx**: Manages GPS coordinates and reverse geocoding for cities/states.

- **src/components/**: Reusable UI building blocks:
  - **LanguageSwitcher.jsx**: Premium dropdown for selecting languages.
  - **BottomNav.jsx**: Mobile-optimized navigation bar.
  - **Translate.jsx**: Component to render raw and localized text side-by-side.
  - **ProtectedRoute.jsx**: Ensures only logged-in users can access farming modules.

- **src/pages/**: Main application screens:
  - **AuthPage.jsx**: Redesigned Login & Registration interface.
  - **HomePage.jsx**: Dashboard with smart cards for all modules.
  - **WeatherPage.jsx**: Localized forecasts with farming advisories.
  - **ChatbotPage.jsx**: AI voice-enabled farming assistant.
  - **CropAdvisorPage.jsx**: Form-based analysis for soil and water suitability.

---

## 🌟 Modern Features
1. **Dynamic Localization**: All pages adapt instantly to English, Tamil, Hindi, or Marathi.
2. **GPS Intelligence**: Weather, Market Prices, and Pest Alerts automatically refresh based on your location.
3. **AI Integration**: Disease detection and chat utilize state-of-the-art AI models for farming.
4. **Mobile First UI**: Designed specifically for farmers on tablets and smartphones with a premium dark theme.
