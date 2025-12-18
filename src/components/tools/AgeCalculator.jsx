import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, TrendingUp, Globe, Sun, Moon, Sparkles, Gift, Cake } from 'lucide-react';

const AgeCalculator = ({ theme, showToast }) => {
  const [birthDate, setBirthDate] = useState({
    day: '',
    month: '',
    year: ''
  });
  const [ageData, setAgeData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const zodiacSigns = [
    { name: 'Capricorn', start: '12-22', end: '01-19', emoji: '♑' },
    { name: 'Aquarius', start: '01-20', end: '02-18', emoji: '♒' },
    { name: 'Pisces', start: '02-19', end: '03-20', emoji: '♓' },
    { name: 'Aries', start: '03-21', end: '04-19', emoji: '♈' },
    { name: 'Taurus', start: '04-20', end: '05-20', emoji: '♉' },
    { name: 'Gemini', start: '05-21', end: '06-20', emoji: '♊' },
    { name: 'Cancer', start: '06-21', end: '07-22', emoji: '♋' },
    { name: 'Leo', start: '07-23', end: '08-22', emoji: '♌' },
    { name: 'Virgo', start: '08-23', end: '09-22', emoji: '♍' },
    { name: 'Libra', start: '09-23', end: '10-22', emoji: '♎' },
    { name: 'Scorpio', start: '10-23', end: '11-21', emoji: '♏' },
    { name: 'Sagittarius', start: '11-22', end: '12-21', emoji: '♐' }
  ];

  const getZodiacSign = (month, day) => {
    const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    for (let sign of zodiacSigns) {
      const [startMonth, startDay] = sign.start.split('-').map(Number);
      const [endMonth, endDay] = sign.end.split('-').map(Number);
      
      if (startMonth === endMonth) {
        if (month === startMonth && day >= startDay && day <= endDay) {
          return sign;
        }
      } else {
        if ((month === startMonth && day >= startDay) || 
            (month === endMonth && day <= endDay)) {
          return sign;
        }
      }
    }
    return zodiacSigns[0];
  };

  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const getNextBirthday = (birthDate, today) => {
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    return nextBirthday;
  };

  const calculateAge = () => {
    const { day, month, year } = birthDate;

    if (!day || !month || !year) {
      showToast('Please enter complete birth date', 'error');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (dayNum < 1 || dayNum > 31) {
      showToast('Invalid day', 'error');
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      showToast('Invalid month', 'error');
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      showToast('Invalid year', 'error');
      return;
    }

    const birth = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();

    if (birth > today) {
      showToast('Birth date cannot be in the future', 'error');
      return;
    }

    // Calculate age components
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days
    const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    
    // Calculate other time units
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Next birthday calculation
    const nextBirthday = getNextBirthday(birth, today);
    const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    const nextAge = years + 1;

    // Zodiac sign
    const zodiac = getZodiacSign(monthNum, dayNum);

    // Day of week born
    const dayOfWeekBorn = getDayOfWeek(birth);

    // Leap years lived
    let leapYearsLived = 0;
    for (let y = yearNum; y <= today.getFullYear(); y++) {
      if (isLeapYear(y)) leapYearsLived++;
    }

    // Age in different planets (approximate)
    const mercuryYear = 0.24;
    const venusYear = 0.62;
    const marsYear = 1.88;
    const jupiterYear = 11.86;
    const saturnYear = 29.46;

    setAgeData({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthday: nextBirthday.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      daysUntilBirthday,
      nextAge,
      zodiac,
      dayOfWeekBorn,
      leapYearsLived,
      planetAges: {
        mercury: (years / mercuryYear).toFixed(1),
        venus: (years / venusYear).toFixed(1),
        mars: (years / marsYear).toFixed(1),
        jupiter: (years / jupiterYear).toFixed(1),
        saturn: (years / saturnYear).toFixed(1)
      },
      birthDate: birth.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      generation: getGeneration(yearNum)
    });

    setShowResults(true);
  };

  const getGeneration = (year) => {
    if (year >= 1997 && year <= 2012) return 'Gen Z';
    if (year >= 1981 && year <= 1996) return 'Millennial';
    if (year >= 1965 && year <= 1980) return 'Gen X';
    if (year >= 1946 && year <= 1964) return 'Baby Boomer';
    if (year >= 1928 && year <= 1945) return 'Silent Generation';
    return 'Greatest Generation';
  };

  const handleInputChange = (field, value) => {
    if (value === '' || /^\d+$/.test(value)) {
      setBirthDate({ ...birthDate, [field]: value });
    }
  };

  const resetCalculator = () => {
    setBirthDate({ day: '', month: '', year: '' });
    setAgeData(null);
    setShowResults(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🎂 Age Calculator</h2>
      </div>

      {/* Input Section */}
      <div className={`${cardBg} p-6 rounded-2xl border ${borderColor}`}>
        <h3 className="text-lg font-semibold mb-4">Enter Your Birth Date</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className={`block text-sm pl-2 ${textSecondary} mb-2`}>Day</label>
            <input
              type="number"
              placeholder="DD"
              min="1"
              max="31"
              value={birthDate.day}
              onChange={(e) => handleInputChange('day', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} text-center text-lg font-semibold`}
            />
          </div>
          <div>
            <label className={`block text-sm pl-2 ${textSecondary} mb-2`}>Month</label>
            <input
              type="number"
              placeholder="MM"
              min="1"
              max="12"
              value={birthDate.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} text-center text-lg font-semibold`}
            />
          </div>
          <div>
            <label className={`block text-sm pl-2 ${textSecondary} mb-2`}>Year</label>
            <input
              type="number"
              placeholder="YYYY"
              min="1900"
              max={new Date().getFullYear()}
              value={birthDate.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} text-center text-lg font-semibold`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={calculateAge}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold active:scale-95 transition-all"
          >
            Calculate Age
          </button>
          {showResults && (
            <button
              onClick={resetCalculator}
              className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl font-semibold active:scale-95 transition-all`}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {showResults && ageData && (
        <div className="space-y-4 animate-pop-up">
          {/* Main Age Display */}
          <div className={`${cardBg} p-6 rounded-2xl border ${borderColor} text-center`}>
            <Cake className="mx-auto mb-3 text-pink-500" size={40} />
            <div className="flex justify-center items-center gap-4 mb-2">
              <div>
                <p className="text-5xl font-bold text-blue-500">{ageData.years}</p>
                <p className={`text-sm ${textSecondary}`}>Years</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-500">{ageData.months}</p>
                <p className={`text-sm ${textSecondary}`}>Months</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-orange-500">{ageData.days}</p>
                <p className={`text-sm ${textSecondary}`}>Days</p>
              </div>
            </div>
            <p className={`text-sm ${textSecondary} mt-2`}>
              Born on {ageData.birthDate}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`${cardBg} p-4 rounded-xl border ${borderColor}`}>
              <Calendar className="text-blue-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{ageData.totalDays.toLocaleString()}</p>
              <p className={`text-xs ${textSecondary}`}>Total Days</p>
            </div>
            <div className={`${cardBg} p-4 rounded-xl border ${borderColor}`}>
              <TrendingUp className="text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{ageData.totalWeeks.toLocaleString()}</p>
              <p className={`text-xs ${textSecondary}`}>Total Weeks</p>
            </div>
            <div className={`${cardBg} p-4 rounded-xl border ${borderColor}`}>
              <Clock className="text-purple-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{ageData.totalHours.toLocaleString()}</p>
              <p className={`text-xs ${textSecondary}`}>Total Hours</p>
            </div>
            <div className={`${cardBg} p-4 rounded-xl border ${borderColor}`}>
              <Heart className="text-red-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{(ageData.totalDays * 100000).toLocaleString()}</p>
              <p className={`text-xs ${textSecondary}`}>Heartbeats*</p>
            </div>
          </div>

          {/* Next Birthday */}
          <div className={`${cardBg} p-4 rounded-2xl border-2 border-pink-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-pink-500 mb-1">Next Birthday</p>
                <p className="font-bold">{ageData.nextBirthday}</p>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {ageData.daysUntilBirthday} days until you turn {ageData.nextAge}
                </p>
              </div>
              <Gift className="text-pink-500" size={40} />
            </div>
          </div>

          {/* Detailed Stats */}
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} />
              Detailed Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={textSecondary}>Total Months:</span>
                <span className="font-semibold">{ageData.totalMonths.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Total Minutes:</span>
                <span className="font-semibold">{ageData.totalMinutes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Total Seconds:</span>
                <span className="font-semibold">{ageData.totalSeconds.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Day of Week Born:</span>
                <span className="font-semibold">{ageData.dayOfWeekBorn}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Zodiac Sign:</span>
                <span className="font-semibold">{ageData.zodiac.emoji} {ageData.zodiac.name}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Generation:</span>
                <span className="font-semibold">{ageData.generation}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Leap Years Lived:</span>
                <span className="font-semibold">{ageData.leapYearsLived}</span>
              </div>
            </div>
          </div>

          {/* Age on Other Planets */}
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Globe className="text-blue-500" size={20} />
              Your Age on Other Planets
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>☿️ Mercury</p>
                <p className="text-xl font-bold text-orange-500">{ageData.planetAges.mercury}</p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>♀️ Venus</p>
                <p className="text-xl font-bold text-yellow-500">{ageData.planetAges.venus}</p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>♂️ Mars</p>
                <p className="text-xl font-bold text-red-500">{ageData.planetAges.mars}</p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>♃ Jupiter</p>
                <p className="text-xl font-bold text-orange-400">{ageData.planetAges.jupiter}</p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} col-span-2`}>
                <p className={`text-xs ${textSecondary} mb-1`}>♄ Saturn</p>
                <p className="text-xl font-bold text-yellow-600">{ageData.planetAges.saturn}</p>
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
            <h3 className="font-bold mb-3">🎉 Fun Facts</h3>
            <div className="space-y-2 text-sm">
              <p className={textSecondary}>
                • You've experienced approximately <span className="font-bold text-blue-500">{ageData.totalDays}</span> sunrises and sunsets!
              </p>
              <p className={textSecondary}>
                • You've lived through about <span className="font-bold text-green-500">{Math.floor(ageData.totalDays / 7)}</span> weekends.
              </p>
              <p className={textSecondary}>
                • Your heart has beaten approximately <span className="font-bold text-red-500">{(ageData.totalMinutes * 72).toLocaleString()}</span> times!
              </p>
              <p className={textSecondary}>
                • You've slept for roughly <span className="font-bold text-purple-500">{Math.floor(ageData.totalDays / 3)}</span> days (assuming 8 hours/day).
              </p>
            </div>
          </div>

          <p className={`text-xs ${textSecondary} text-center`}>
            * Approximate values based on average calculations
          </p>
        </div>
      )}
    </div>
  );
};

export default AgeCalculator;