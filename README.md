# DailyHub - The All-in-One Personal Dashboard

DailyHub is a comprehensive, all-in-one personal productivity and lifestyle application built with React and Capacitor. It's designed to be a single "hub" for managing all aspects of your daily life, from tasks and notes to secure passwords, expenses, and even entertainment.

The app features a secure, **end-to-end encrypted cloud synchronization** system, ensuring your data is safe and accessible across devices.

## ✨ Core Features

DailyHub is a "super-app" that combines dozens of utilities into one clean interface.

### Dashboard & Productivity
* **🏠 Main Dashboard:** A central hub showing a personalized greeting, current time and date, "On This Day" facts, and a detailed weather widget.
* **🎯 Task Manager (Todos):** A simple and effective todo list to manage your daily tasks.
* **📃 Notes:** A full-featured notes-taking module with titles, content, and categories.
* **🥅 Habit Tracker:** A dedicated module to build and track your habits over time.
* **💸 Expense Tracker:** Log and categorize your daily expenses to manage your budget.
* **🎂 Birthday Reminders:** Never miss a birthday again. Get upcoming reminders and native notifications.
* **💧 Water Intake:** A simple tracker to ensure you stay hydrated.
* **⏰ Timers & Reminders:** Set custom timers and recurring reminders with native notifications.

### Security & Data
* **🔑 Encrypted Password Manager:** A secure vault for all your passwords.
    * **Master Password:** The entire vault is locked behind a single, secure master password.
    * **End-to-End Encryption:** Passwords are encrypted *on your device* before being synced to the cloud.
    * **Auto-Lock:** The vault automatically locks after a period of inactivity (configurable in settings).
    * **Password Generator:** A built-in generator for creating strong, unique passwords.
    * **Recovery Questions:** Securely recover your vault if you forget your master password.
* **☁️ Encrypted Cloud Sync:** All your data (tasks, notes, habits, passwords, etc.) is automatically synced to the cloud. Sensitive data is encrypted client-side.
* **🔄 Robust Syncing:** Data is synced automatically on app load, on data change, and before the app closes or goes into the background.

### Information & Utilities
* **🤖 AI Chat:** An integrated AI assistant (powered by Gemini) for questions and conversations.
* **📰 News Feed:** A built-in news reader to catch up on the latest headlines.
* **🏏 Cricket Scoreboard:** Get live scores and updates for cricket matches.
* **🎬 Movie & TV Watchlist:** Keep track of what you want to watch and what you've seen.
* **🧮 Calculator:** A sleek, built-in calculator for quick math.
* **🔁 Unit Converter:** A powerful converter for Length, Weight, Temperature, Volume, Area, and Speed.
* **🗺️ Timezone Converter:** Easily convert times between different timezones.
* **💯 Text Counter:** A utility to count words, characters, sentences, and paragraphs.
* **📅 Age Calculator:** Quickly calculate age or time duration between two dates.
* **📄 PDF Tools:** A set of tools for working with PDF documents.
* **🔎 Find & Replace:** A simple tool for finding and replacing text in a large block.

### Entertainment & Personal
* **🎮 Games Arcade:** A collection of 10+ classic mini-games:
    * Tic-Tac-Toe
    * Memory Match
    * Number Guessing
    * Word Guess (Wordle-like)
* Typing Test
    * Whac-A-Mole
    * Simon Says
    * Connect Four
    * Chess (vs. AI)
    * Reaction Time
* **🎵 Music Player:** A simple music player to listen to your favorite tracks.
* **🔗 Quick Links:** A personal bookmark manager for your most-visited sites.

## 🛠️ Built With

* **[React](https://reactjs.org/):** The core JavaScript library for building the user interface.
* **[Capacitor](https://capacitorjs.com/):** The native runtime that enables this web app to run natively on iOS, Android, and the Web.
* **[TailwindCSS](https://tailwindcss.com/):** (Inferred from class names) For all styling and UI.
* **[Lucide React](https://lucide.dev/):** For a rich, modern icon set.
* **State-Based Routing:** A custom navigation system built on React's `useState` (`activeView`) instead of a traditional router library.
* **Custom Services:** The app is architected with services for modularity:
    * `authService`: Manages user authentication (signup, login, logout) and data synchronization.
    * `encryptionService`: Handles all client-side encryption/decryption for the password manager and sensitive data.
    * `notificationService`: A wrapper around Capacitor's native notification API.

## 🔌 Implied Capacitor Plugins

This `App.jsx` file uses services that wrap core Capacitor functionality. The following plugins are essential for the app to function as designed:

* **`@capacitor/notifications`**: Used by `notificationService` to schedule local notifications for birthdays and reminders.
* **`@capacitor/app`**: Listens for app lifecycle events (e.g., going to background) to trigger data sync.
* **`@capacitor/status-bar`**: To control the style of the native status bar.
* **`@capacitor/keyboard`**: To manage how the native keyboard interacts with the webview.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* [Node.js](https://nodejs.org/) (which includes `npm`)
* [Android Studio](https://developer.android.com/studio) (for Android development)
* [Xcode](https://developer.apple.com/xcode/) (for iOS development)

### **Important: Backend Configuration**

This application requires a custom backend to function. The `authService` is built to communicate with a server for:
1.  User authentication (register/login).
2.  Storing and retrieving user data (todos, notes, encrypted passwords, etc.).

You will need to **build your own backend API** and update the `src/services/authService.js` file to point to your API endpoints.

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/21-yash/dailyhub.git](https://github.com/21-yash/dailyhub.git)
    cd dailyhub
    ```

2.  **Install NPM packages**
    ```sh
    npm install
    ```

3.  **Install Capacitor dependencies**
    ```sh
    # Install Capacitor CLI
    npm install @capacitor/cli @capacitor/core
    
    # Add native platforms
    npm install @capacitor/android @capacitor/ios
    ```

4.  **Install Required Plugins**
    ```sh
    npm install @capacitor/notifications @capacitor/app @capacitor/status-bar @capacitor/keyboard
    ```

5.  **Sync the project**
    This command copies your web code and plugin configurations into the native projects.
    ```sh
    npx cap sync
    ```

## 🖥️ Usage

### 1. Run as a web app

This is the fastest way to test and develop UI features.
```sh
npm run dev