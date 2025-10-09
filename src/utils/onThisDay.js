export const historicalEvents = [
  // January
  { month: 1, day: 1, event: "🎉 New Year's Day" },
  { month: 1, day: 26, event: "🇮🇳 Republic Day of India (1950) - Constitution came into effect" },
  { month: 1, day: 30, event: "🕊️ Mahatma Gandhi assassinated (1948)" },
  
  // February
  { month: 2, day: 14, event: "💝 Pulwama Attack (2019) - 40 CRPF personnel martyred" },
  { month: 2, day: 28, event: "📚 C.V. Raman discovered Raman Effect (1928)" },
  
  // March
  { month: 3, day: 12, event: "🚶 Dandi March began (1930) - Salt Satyagraha" },
  { month: 3, day: 23, event: "⚡ Bhagat Singh, Rajguru, Sukhdev executed (1931)" },
  
  // April
  { month: 4, day: 13, event: "💔 Jallianwala Bagh Massacre (1919)" },
  { month: 4, day: 14, event: "👶 B.R. Ambedkar's Birthday (1891) - Architect of Indian Constitution" },
  
  // May
  { month: 5, day: 11, event: "🇮🇳 India conducted Pokhran nuclear tests (1998)" },
  { month: 5, day: 27, event: "🇮🇳 First Prime Minister Jawaharlal Nehru passed away (1964)" },
  
  // June
  { month: 6, day: 18, event: "🚂 First passenger train in India ran (1853)" },
  { month: 6, day: 23, event: "⚔️ Battle of Plassey (1757) - British dominance began" },
  
  // July
  { month: 7, day: 26, event: "⚔️ Kargil Vijay Diwas (1999) - India reclaimed Tiger Hill" },
  { month: 7, day: 28, event: "🧪 Homi J. Bhabha born (1909) - Father of Indian nuclear program" },
  
  // August
  { month: 8, day: 8, event: "🚩 Quit India Movement launched (1942)" },
  { month: 8, day: 9, event: "💔 Nagasaki atomic bombing (1945)" },
  { month: 8, day: 15, event: "🇮🇳 Independence Day of India (1947) - Freedom from British rule" },
  { month: 8, day: 29, event: "🏑 India won first Olympic gold in hockey (1928)" },
  
  // September
  { month: 9, day: 5, event: "👨‍🏫 Teachers' Day (India) - Dr. Radhakrishnan's Birthday" },
  { month: 9, day: 17, event: "⚔️ Operation Polo (1948) - Hyderabad integrated into India" },
  
  // October
  { month: 10, day: 2, event: "🇮🇳 Gandhi Jayanti - Mahatma Gandhi's Birthday (1869)" },
  { month: 10, day: 31, event: "🕊️ Indira Gandhi assassinated (1984)" },
  
  // November
  { month: 11, day: 8, event: "💸 Demonetization announced in India (2016)" },
  { month: 11, day: 14, event: "👶 Children's Day (India) - Nehru's Birthday" },
  { month: 11, day: 19, event: "👸 Rani Lakshmibai born (1828) - Queen of Jhansi" },
  { month: 11, day: 26, event: "💔 Mumbai Terror Attack (2008) - 26/11" },
  
  // December
  { month: 12, day: 6, event: "⚖️ Babri Masjid demolished (1992)" },
  { month: 12, day: 16, event: "💔 Nirbhaya case incident (2012)" },
  { month: 12, day: 25, event: "🎄 Atal Bihari Vajpayee's Birthday (1924)" }
];

export const getOnThisDay = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return historicalEvents.filter(event => 
    event.month === month && event.day === day
  );
};
