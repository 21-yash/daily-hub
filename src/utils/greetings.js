/**
 * Dynamic Greeting System - Inspired by Claude AI
 * 
 * Provides contextual, varied, and delightful greetings
 * based on time, day, season, and randomness
 */

class GreetingService {
  constructor() {
    // Time-based greetings
    this.morningGreetings = [
      "Rise and shine! ☀️",
      "Good morning! Ready to conquer the day?",
      "Morning! Let's make today amazing!",
      "Hello! The early bird gets the worm 🐦",
      "Good morning! Coffee first? ☕",
      "Hey there! New day, new possibilities!",
      "Morning sunshine! ☀️",
      "Wakey wakey! Time to be productive!",
      "Good morning! What's on your agenda today?"
    ];

    this.afternoonGreetings = [
      "Good afternoon! Hope you're having a great day!",
      "Hey! How's your day going?",
      "Afternoon! Making progress? 💪",
      "Hello! Halfway through the day already!",
      "Good afternoon! Time for a quick break?",
      "Hey there! Staying productive?",
      "Afternoon! You're doing great!",
      "Hello! Keep up the momentum! 🚀"
    ];

    this.eveningGreetings = [
      "Good evening! Winding down?",
      "Evening! How was your day?",
      "Hey! Time to relax 🌆",
      "Good evening! Ready to unwind?",
      "Evening! Reflect on today's wins!",
      "Hello! Time to recharge 🔋",
      "Good evening! You earned this rest!",
      "Hey there! Evening vibes ✨"
    ];

    this.nightGreetings = [
      "Good night! Still working? 🌙",
      "Evening! Don't burn the midnight oil too long!",
      "Hey night owl! 🦉",
      "Late night session? Stay focused!",
      "Hello! Remember to get some sleep! 😴",
      "Night time productivity? Nice! 🌟",
      "Good evening! Wrap it up soon!",
      "Hey! Night mode activated 🌙"
    ];

    // Day-specific greetings
    this.dayGreetings = {
      0: ["Happy Sunday! 🌅", "Sunday funday!", "Relaxing Sunday?"],
      1: ["Happy Monday! Let's do this! 💪", "Monday motivation!", "New week, new goals!"],
      2: ["Happy Tuesday! Keep the momentum!", "Tuesday grind!", "You've got this!"],
      3: ["Wednesday wisdom! 🧠", "Halfway through!", "Hump day!"],
      4: ["Thursday vibes! Almost there!", "Thursday thoughts!", "One more day!"],
      5: ["TGIF! 🎉", "Friday feeling!", "Weekend incoming!"],
      6: ["Saturday! Time to relax!", "Happy Saturday! 🎨", "Weekend mode!"]
    };

    // Season-specific greetings (Northern Hemisphere)
    this.seasonalGreetings = {
      spring: ["Spring is here! 🌸", "Blooming season!", "Fresh start!"],
      summer: ["Summer vibes! ☀️", "Hot day ahead!", "Stay cool!"],
      fall: ["Fall feelings! 🍂", "Autumn atmosphere!", "Cozy season!"],
      winter: ["Winter wonder! ❄️", "Stay warm!", "Cold but cozy!"]
    };

    // Special occasions (format: MM-DD)
    this.specialDates = {
      "01-01": ["Happy New Year! 🎊", "New year, new you!", "2026 begins!"],
      "02-14": ["Happy Valentine's Day! ❤️", "Love is in the air!", "Spread the love!"],
      "10-31": ["Happy Halloween! 🎃", "Spooky season!", "Trick or treat!"],
      "12-25": ["Merry Christmas! 🎄", "Happy Holidays!", "Season's greetings!"],
      "12-31": ["Happy New Year's Eve! 🎉", "Last day of the year!", "Cheers to the new year!"],
      "01-26": ["Happy Republic Day! 🇮🇳", "Proud to be Indian!", "Jai Hind!"],
      "03-14": ["Happy Holi! 🎨", "Festival of Colors!", "Let the colors fly!"],
      "08-15": ["Happy Independence Day! 🇮🇳", "Celebrating freedom!", "Jai Hind!"],
      "10-02": ["Happy Gandhi Jayanti!", "Remembering Mahatma Gandhi."],
      "10-20": ["Happy Diwali! 🪔", "Festival of Lights!", "Wishing you joy and prosperity!"],
      "10-22": ["Happy Govardhan Puja! 🐄", "Celebrating the divine!", "Wishing you blessings!"],
      "10-23": ["Happy Bhai Dooj! 👫", "Celebrating sibling love!", "Wishing you joy!"],
      "11-05": ["Happy Guru Nanak Jayanti! 🙏", "Remembering Guru Nanak Dev Ji.", "Wishing you peace and harmony!"]
    };

    // Random fun greetings (like Claude's personality)
    this.funGreetings = [
      "Hey there! Ready to be productive? 🚀",
      "Hello, human! Let's get stuff done!",
      "Greetings! I'm here to help organize your life!",
      "Hi! Your personal productivity hub awaits!",
      "Welcome back! I've been waiting for you!",
      "Hello! Let's make magic happen! ✨",
      "Hey! Time to tackle that to-do list!",
      "Hi there! What are we accomplishing today?",
      "Welcome! Your digital sanctuary awaits!",
      "Hello, friend! Let's be awesome today!"
    ];

    // Weather-based greetings (can be enhanced with actual weather data)
    this.weatherGreetings = {
      sunny: ["Beautiful sunny day! ☀️", "Sunshine ahead!", "Perfect weather!"],
      rainy: ["Rainy day vibes 🌧️", "Cozy weather!", "Rain, rain!"],
      cloudy: ["Cloudy but productive! ☁️", "Grey skies, bright ideas!"],
      snowy: ["Snow day! ❄️", "Winter wonderland!", "Stay warm!"]
    };
  }

  /**
   * Get current season based on month
   */
  getSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  /**
   * Get a random item from an array
   */
  random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get time-based greeting
   */
  getTimeGreeting(hour) {
    if (hour >= 5 && hour < 12) return this.random(this.morningGreetings);
    if (hour >= 12 && hour < 17) return this.random(this.afternoonGreetings);
    if (hour >= 17 && hour < 21) return this.random(this.eveningGreetings);
    return this.random(this.nightGreetings);
  }

  /**
   * Get day-specific greeting
   */
  getDayGreeting(day) {
    return this.random(this.dayGreetings[day]);
  }

  /**
   * Get seasonal greeting
   */
  getSeasonalGreeting(month) {
    const season = this.getSeason(month);
    return this.random(this.seasonalGreetings[season]);
  }

  /**
   * Check for special date greeting
   */
  getSpecialDateGreeting(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${month}-${day}`;
    
    if (this.specialDates[dateKey]) {
      return this.random(this.specialDates[dateKey]);
    }
    return null;
  }

  /**
   * Main greeting function - returns a contextual greeting
   * @param {object} options - Options for greeting selection
   * @returns {string} - A delightful greeting
   */
  getGreeting(options = {}) {
    const now = options.date || new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();

    // Priority 1: Special dates (holidays, etc.)
    const specialGreeting = this.getSpecialDateGreeting(now);
    if (specialGreeting && Math.random() > 0.3) { // 70% chance to show special greeting
      return specialGreeting;
    }

    // Priority 2: Mix of different greeting types
    const greetingTypes = [
      () => this.getTimeGreeting(hour),        // Time-based (40%)
      () => this.getDayGreeting(day),          // Day-based (20%)
      () => this.random(this.funGreetings),    // Fun random (30%)
      () => this.getSeasonalGreeting(month)    // Seasonal (10%)
    ];

    // Weighted random selection
    const weights = [40, 20, 30, 10];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < greetingTypes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return greetingTypes[i]();
      }
    }

    // Fallback
    return this.getTimeGreeting(hour);
  }

  /**
   * Get greeting with username
   */
  getPersonalizedGreeting(username, options = {}) {
    const greeting = this.getGreeting(options);
    
    if (username) {
      // Sometimes add username, sometimes not (like Claude does)
      if (Math.random() > 0.5) {
        return `${greeting.split('!')[0]}, ${username}! ${greeting.split('!').slice(1).join('!')}`;
      }
    }
    
    return greeting;
  }

  /**
   * Get greeting icon/emoji
   */
  getGreetingIcon(hour) {
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 21) return '🌆';
    return '🌙';
  }

  /**
   * Get a motivational quote to go with greeting
   */
  getMotivationalQuote() {
    const quotes = [
      "Make it happen!",
      "You've got this!",
      "One step at a time!",
      "Progress over perfection!",
      "Stay focused!",
      "Believe in yourself!",
      "Keep pushing forward!",
      "Today is your day!",
      "Small wins add up!",
      "You're doing great!"
    ];
    return this.random(quotes);
  }

  /**
   * Get complete greeting package
   * Returns greeting, icon, and optional quote
   */
  getGreetingPackage(username = null) {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      greeting: this.getPersonalizedGreeting(username),
      icon: this.getGreetingIcon(hour),
      quote: Math.random() > 0.6 ? this.getMotivationalQuote() : null, // 40% chance
      timestamp: now.toISOString()
    };
  }
}

// Export singleton instance
export const greetingService = new GreetingService();

// Export class for testing
export default GreetingService;