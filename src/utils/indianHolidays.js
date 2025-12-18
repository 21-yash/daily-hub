
export const indianHolidays = [
  // Fixed date holidays
  { month: 1, day: 26, name: 'Republic Day', emoji: '🇮🇳' },
  { month: 8, day: 15, name: 'Independence Day', emoji: '🇮🇳' },
  { month: 10, day: 2, name: 'Gandhi Jayanti', emoji: '🇮🇳' },
  { month: 12, day: 25, name: 'Christmas', emoji: '🎄' },
  { month: 1, day: 1, name: 'New Year', emoji: '🎉' },
  { month: 2, day: 14, name: "Valentine's Day", emoji: '❤️' },
  { month: 11, day: 14, name: "Children's Day", emoji: '👶' },
  { month: 2, day: 4, name: 'World Cancer Day', emoji: '🎗️' },
  { month: 3, day: 8, name: "International Women's Day", emoji: '👩' },
  { month: 4, day: 22, name: 'Earth Day', emoji: '🌍' },
  { month: 5, day: 1, name: 'Labour Day', emoji: '👷' },
  { month: 6, day: 5, name: 'World Environment Day', emoji: '🌱' },
  { month: 6, day: 21, name: 'International Yoga Day', emoji: '🧘' },
  { month: 8, day: 29, name: 'National Sports Day', emoji: '⚽' },
  { month: 9, day: 5, name: "Teacher's Day", emoji: '👨‍🏫' },
  { month: 10, day: 31, name: 'Halloween', emoji: '🎃' },
  { month: 11, day: 1, name: 'All Saints Day', emoji: '😇' },
];

// Variable date holidays for 2025-2026 (these change yearly based on lunar calendar)
export const variableHolidays2026 = [
  { month: 1, day: 14, name: 'Makar Sankranti', emoji: '🪁' },
  { month: 2, day: 15, name: 'Maha Shivaratri', emoji: '🕉️' },
  { month: 3, day: 4, name: 'Holi', emoji: '🎨' },
  { month: 4, day: 11, name: 'Eid ul-Fitr', emoji: '🌙' },
  { month: 4, day: 17, name: 'Ram Navami', emoji: '🏹' },
  { month: 4, day: 21, name: 'Mahavir Jayanti', emoji: '🙏' },
  { month: 6, day: 17, name: 'Eid ul-Adha', emoji: '🐑' },
  { month: 8, day: 26, name: 'Janmashtami', emoji: '🦚' },
  { month: 9, day: 7, name: 'Ganesh Chaturthi', emoji: '🐘' },
  { month: 10, day: 2, name: 'Dussehra', emoji: '🏹' },
  { month: 10, day: 21, name: 'Diwali', emoji: '🪔' },
  { month: 10, day: 22, name: 'Govardhan Puja', emoji: '🐄' },
  { month: 10, day: 23, name: 'Bhai Dooj', emoji: '👫' },
  { month: 11, day: 5, name: 'Guru Nanak Jayanti', emoji: '🙏' },
];

export const getSpecialDaysForDate = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const fixedHolidays = indianHolidays.filter(
    holiday => holiday.month === month && holiday.day === day
  );
  
  const variableHolidays = variableHolidays2026.filter(
    holiday => holiday.month === month && holiday.day === day
  );
  
  return [...fixedHolidays, ...variableHolidays];
};

export const getUpcomingHolidays = (count = 5) => {
  const today = new Date();
  const allHolidays = [...indianHolidays, ...variableHolidays2026];
  
  return allHolidays
    .map(holiday => {
      const holidayDate = new Date(today.getFullYear(), holiday.month - 1, holiday.day);
      if (holidayDate < today) {
        holidayDate.setFullYear(today.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((holidayDate - today) / (1000 * 60 * 60 * 24));
      return { ...holiday, date: holidayDate, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, count);
};
