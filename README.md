# 🚀 Daily Hub

<div align="center">

![Daily Hub](https://img.shields.io/badge/Daily%20Hub-Productivity%20Dashboard-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-06B6D4?style=flat-square&logo=tailwindcss)

**Your all-in-one personal productivity dashboard**

[Live Demo](https://21-yash.github.io/daily-hub/) • [Features](#-features) • [Getting Started](#-getting-started)

</div>

---

## ✨ Features

### 📋 Productivity
- **Task Management** - Create, organize, and track your daily tasks
- **Notes** - Quick note-taking with categories and search
- **Habit Tracker** - Build and maintain positive habits
- **Expense Tracker** - Monitor your spending with visual insights

### 🔐 Security
- **Password Manager** - Securely store and manage passwords with AES-256 encryption
- **Master Password Protection** - Lock your vault with auto-lock on inactivity
- **Cloud Sync** - Encrypted sync across devices when logged in

### 🎯 Utilities
- **Calculator** - Full-featured calculator
- **Unit Converter** - Length, weight, temperature, volume, and more
- **Time Zone Converter** - Convert times across global timezones
- **Age Calculator** - Calculate age and time between dates
- **Text Counter** - Character, word, and sentence counting
- **Find & Replace** - Text manipulation tool
- **PDF Tools** - Merge, split, and compress PDFs

### 🎮 Entertainment
- **Games** - Memory Match, Tic-Tac-Toe, Word Guess, Typing Test, and more
- **Cricket Scoreboard** - Live cricket scores
- **Watchlist** - Track movies and TV shows with ratings
- **News Feed** - Stay updated with latest news

### 📅 Personal
- **Birthday Reminders** - Never miss important birthdays
- **Quick Links** - Access your favorite websites instantly
- **Weather Widget** - Real-time weather for your city
- **Holiday Calendar** - Indian holidays and festivals

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Encryption | CryptoJS (AES-256) |
| HTTP Client | Axios |
| Deployment | GitHub Pages |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/21-yash/daily-hub.git

# Navigate to project directory
cd daily-hub

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_backend_url
VITE_ENCRYPTION_KEY=your_secure_encryption_key
VITE_NEWS_KEY=your_news_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run deploy
```

This will build the project and push to the `gh-pages` branch.

---

## 📱 Responsive Design

Daily Hub is fully responsive with:
- **Mobile-first design** with touch-friendly UI
- **Desktop sidebar** for quick navigation on larger screens
- **Adaptive layouts** that adjust to any screen size

---

## 🔒 Security Features

- All passwords encrypted with **AES-256** using CryptoJS
- User-specific encryption keys derived from master password
- Auto-lock vault after configurable inactivity period
- No sensitive data stored in plain text

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made by [Yash](https://github.com/21-yash)**

</div>
