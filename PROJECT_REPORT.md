# AgroGuardian: Comprehensive Technology & Implementation Report

**AgroGuardian** is a comprehensive, multi-module, location-aware, and dynamically localized agricultural platform designed specifically for Indian farmers. The following report details the complete technology stack, third-party integrations, and core logic used throughout the frontend and backend architectures.

---

## 1. Frontend Architecture & Design

**Technology Stack:** React.js, Vite
**Purpose:** To build a lightning-fast, Single Page Application (SPA) that does not require full-page reloads, ensuring a smooth app-like experience on mobile and desktop browsers. We used Vite as the build tool for rapid hot-module replacement during development.

**Routing & State Management**
*   **React Router (`react-router-dom`)**: Used in `App.jsx` to map different pages (`/auth`, `/weather`, `/chatbot`, etc.) to their respective components. We implemented a custom `ProtectedRoute` wrapper to ensure only logged-in sessions can access core agricultural modules.
*   **React Context API**: We built custom, globally accessible state controllers to manage complex app-wide data without relying on heavy libraries like Redux.
    *   `AuthContext.jsx`: Manages user login state and JSON Web Tokens (JWT).
    *   `LanguageContext.jsx`: Stores the user's current 8-language preference and houses the core `t(key)` translation dictionary.
    *   `LocationContext.jsx`: Interacts with the browser's `navigator.geolocation` API to dynamically fetch the user's latitude and longitude for weather and alert systems.

**Styling & UI Design**
*   **Pure CSS Variables (`index.css`)**: We avoided heavy CSS frameworks like Bootstrap to achieve a highly customized, premium "Glassmorphism" aesthetic. Utilizing CSS variables (`--bg-deep`, `--orange-primary`), we ensured complete UI consistency across gradients, animated cards, and dark-mode backdrops.
*   **Lucide React Icons**: A lightweight, modern SVG icon library used extensively across the `BottomNav.jsx`, `MentorshipPage.jsx`, and `HomePage.jsx` to visually guide farmers through the app without relying on text.

---

## 2. API Integrations & External Services

**1. Google Translate API (GTX API)**
*   **Implementation Location:** `Translate.jsx`, `AuthPage.jsx`, `backend/routes/chat.js`
*   **Purpose:** To achieve full 8-language localization (English, Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati) without having to manually translate thousands of dynamic database rows.
*   **How it works:** 
    *   When a state is selected on the `AuthPage`, it passes the English array of Districts to the API and dynamically replaces the `<select>` options with the user's native language.
    *   In the backend `chat.js`, we intercept non-English chat inputs, translate them to English using this API, match the intent against an English agricultural knowledge base, and translate the result *back* to the user's native tongue instantly.

**2. Open-Meteo Forecasting API**
*   **Implementation Location:** `WeatherPage.jsx`
*   **Purpose:** To fetch entirely free, hyper-localized, 7-day weather forecasting data without API keys or usage limits.
*   **How it works:** Taking the GPS coordinates from `LocationContext`, we hit the Open-Meteo endpoint to retrieve hourly precipitation, temperature, wind speed, and humidity, allowing us to render conditional farming advice (e.g., "High winds. Do not spray pesticides.").

**3. Web Speech API (HTML5 Native)**
*   **Implementation Location:** `ChatbotPage.jsx`
*   **Purpose:** To provide a highly accessible, Voice-to-Text and Text-to-Speech interface for farmers who prefer speaking over typing.
*   **How it works:** We utilize `window.speechSynthesis` paired with BCP-47 language codes (e.g., `ta-IN` for Tamil, `mr-IN` for Marathi) to read Chatbot advice aloud in the natively localized voice.

---

## 3. Backend Architecture & Database

**Technology Stack:** Node.js, Express.js
**Purpose:** To securely manage user data, scale API requests, and handle heavy processing outside the user's browser.

**Core Middleware**
*   **JWT (`jsonwebtoken`)**: Used in `middleware/auth.js` for stateless session authentication. When a user logs in, they receive an encrypted token. Every subsequent request (asking the AI, fetching mentorship tasks, fetching crops) sends this token to prove identity.
*   **Bcrypt (`bcryptjs`)**: Used to hash passwords (e.g., `123456` turns into an unreadable string) before saving to the database, ensuring that if the database is ever breached, no user passwords can be stolen.
*   **Multer**: Handles `multipart/form-data` uploads, specifically utilized in the `DiseaseDetectionPage.jsx` so farmers can upload physical `.jpg` pictures of diseased leaves to the server.

**Database (SQLite)**
*   **Location:** `database/db.js`
*   **Purpose:** A lightweight, self-contained SQL database engine that requires no complex server setup, perfect for college projects and fast prototyping.
*   **Structure:** We implemented relational tables linking `users` (credentials) to `crops` (active farm fields) and `mentorship_tasks` (weekly targeted actions), ensuring data persistence across app restarts.

---

## 4. Key Modules & Functional Logic

**Mentorship & Task Engine (`MentorshipPage.jsx`)**
*   **Logic:** When a user registers a crop (e.g., Wheat), the backend generates a timeline dataset of boolean tasks (e.g., "Day 14: Apply NPK fertilizer"). The frontend groups these rows dynamically using Javascript `Math.ceil(day_offset / 7)` to present them as "Week 1", "Week 2", etc. Selecting the checkbox fires a `PUT` request to update SQLite instantly, syncing the dynamic progression bar.

**State-District Cascading System (`AuthPage.jsx`)**
*   **Logic:** Prevents bad database entries by forcing users to pick their state from a pre-defined array (`STATES`). That selection acts as an object mapping key to unlock the secondary array of matching `STATE_DISTRICTS`, preventing a user in "Tamil Nadu" from selecting a district in "Punjab".

**AI Chatbot Engine (`chat.js`)**
*   **Logic:** Because integrating heavy LLMs (like OpenAI/Gemini) costs money and requires rate-limit management, we built a highly efficient **Rule-Based NLP Proxy Matrix**. It parses English translations of User inputs, checks against algorithmic keyword triggers (`msg.includes('fungus')`), and returns specialized local agricultural advice. 
