import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Globe } from "lucide-react";

const TimeZoneConverter = ({ theme, showToast }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedZones, setSelectedZones] = useState([
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
  ]);
  const [showAddZone, setShowAddZone] = useState(false);

  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const textSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";

  const timeZones = [
    { value: "Pacific/Midway", label: "Midway Island", offset: -11 },
    { value: "Pacific/Honolulu", label: "Hawaii", offset: -10 },
    { value: "America/Anchorage", label: "Alaska", offset: -9 },
    { value: "America/Los_Angeles", label: "Pacific Time (US)", offset: -8 },
    { value: "America/Denver", label: "Mountain Time (US)", offset: -7 },
    { value: "America/Chicago", label: "Central Time (US)", offset: -6 },
    { value: "America/New_York", label: "Eastern Time (US)", offset: -5 },
    { value: "America/Caracas", label: "Caracas", offset: -4 },
    { value: "America/Buenos_Aires", label: "Buenos Aires", offset: -3 },
    { value: "Atlantic/South_Georgia", label: "Mid-Atlantic", offset: -2 },
    { value: "Atlantic/Azores", label: "Azores", offset: -1 },
    { value: "Europe/London", label: "London", offset: 0 },
    { value: "Europe/Paris", label: "Paris", offset: 1 },
    { value: "Europe/Athens", label: "Athens", offset: 2 },
    { value: "Europe/Moscow", label: "Moscow", offset: 3 },
    { value: "Asia/Dubai", label: "Dubai", offset: 4 },
    { value: "Asia/Karachi", label: "Karachi", offset: 5 },
    { value: "Asia/Dhaka", label: "Dhaka", offset: 6 },
    { value: "Asia/Bangkok", label: "Bangkok", offset: 7 },
    { value: "Asia/Shanghai", label: "Beijing", offset: 8 },
    { value: "Asia/Tokyo", label: "Tokyo", offset: 9 },
    { value: "Australia/Sydney", label: "Sydney", offset: 10 },
    { value: "Pacific/Auckland", label: "Auckland", offset: 12 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeInZone = (timezone) => {
    return new Date().toLocaleString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getDateInZone = (timezone) => {
    return new Date().toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getOffsetFromUTC = (timezone) => {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const offset = (tzDate - utcDate) / (1000 * 60 * 60);
    return offset >= 0 ? `+${offset}` : offset;
  };

  const addZone = (timezone) => {
    if (!selectedZones.includes(timezone)) {
      setSelectedZones([...selectedZones, timezone]);
      showToast("Timezone added!");
    } else {
      showToast("Timezone already added", "info");
    }
    setShowAddZone(false);
  };

  const removeZone = (timezone) => {
    setSelectedZones(selectedZones.filter((z) => z !== timezone));
    showToast("Timezone removed", "info");
  };

  const getZoneInfo = (timezone) => {
    return (
      timeZones.find((tz) => tz.value === timezone) || {
        label: timezone,
        offset: 0,
      }
    );
  };

  const getBusinessHours = (timezone) => {
    const hour = parseInt(
      new Date().toLocaleString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        hour12: false,
      })
    );

    if (hour >= 9 && hour < 17)
      return { status: "Business Hours", color: "text-green-500" };
    if (hour >= 17 && hour < 22)
      return { status: "Evening", color: "text-orange-500" };
    if (hour >= 22 || hour < 6)
      return { status: "Night", color: "text-purple-500" };
    return { status: "Morning", color: "text-blue-500" };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Time Zone Converter 🌍</h2>
        <button
          onClick={() => setShowAddZone(!showAddZone)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddZone ? "Cancel" : "Add Zone"}
        </button>
      </div>
      {/* Add Zone Modal */}
      {showAddZone && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
          <h3 className="text-xl font-semibold mb-4">Select Timezone</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {timeZones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => addZone(tz.value)}
                className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                  selectedZones.includes(tz.value)
                    ? theme === "dark"
                      ? "bg-green-600/20 text-green-400 cursor-not-allowed"
                      : "bg-green-100 text-green-600 cursor-not-allowed"
                    : theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                disabled={selectedZones.includes(tz.value)}
              >
                <div className="font-semibold">{tz.label}</div>
                <div className={`text-sm ${textSecondary}`}>
                  UTC {tz.offset >= 0 ? "+" : ""}
                  {tz.offset}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Local Time */}
      <div
        className={`${cardBg} p-8 rounded-xl border ${borderColor} mb-6 text-center`}
      >
        <Globe className="mx-auto mb-3 text-blue-500" size={40} />
        <h3 className="text-2xl font-semibold mb-2">Your Local Time</h3>
        <div className="text-5xl font-bold mb-2">
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </div>
        <p className={textSecondary}>
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Timezone Cards */}
      {selectedZones.length === 0 ? (
        <div
          className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center ${textSecondary}`}
        >
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>No timezones added. Click "Add Zone" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedZones.map((zone) => {
            const zoneInfo = getZoneInfo(zone);
            const businessHours = getBusinessHours(zone);

            return (
              <div
                key={zone}
                className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105`}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{zoneInfo.label}</h3>
                      <p className="text-sm opacity-90">
                        UTC {getOffsetFromUTC(zone)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeZone(zone)}
                      className="text-white hover:bg-white/20 p-2 rounded transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold mb-2">
                      {getTimeInZone(zone)}
                    </div>
                    <p className={`text-sm ${textSecondary}`}>
                      {getDateInZone(zone)}
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-center gap-2 ${businessHours.color} font-semibold`}
                  >
                    <Clock size={16} />
                    <span>{businessHours.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Comparison */}
      {selectedZones.length > 1 && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
          <h3 className="text-xl font-semibold mb-4">Quick Comparison 📊</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderColor}`}>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">UTC Offset</th>
                </tr>
              </thead>
              <tbody>
                {selectedZones.map((zone) => {
                  const zoneInfo = getZoneInfo(zone);
                  const businessHours = getBusinessHours(zone);

                  return (
                    <tr
                      key={zone}
                      className={`border-b ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                    >
                      <td className="p-3 font-semibold">{zoneInfo.label}</td>
                      <td className="p-3">{getTimeInZone(zone)}</td>
                      <td className="p-3 text-sm">{getDateInZone(zone)}</td>
                      <td className={`p-3 ${businessHours.color} font-medium`}>
                        {businessHours.status}
                      </td>
                      <td className="p-3">{getOffsetFromUTC(zone)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meeting Planner */}
      {selectedZones.length >= 2 && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
          <h3 className="text-xl font-semibold mb-4">🤝 Best Meeting Times</h3>
          <p className={`${textSecondary} mb-4`}>
            Recommended times when all selected timezones are in business hours
            (9 AM - 5 PM):
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 24 }, (_, hour) => {
              const allInBusinessHours = selectedZones.every((zone) => {
                const zoneHour = parseInt(
                  new Date(new Date().setHours(hour)).toLocaleString("en-US", {
                    timeZone: zone,
                    hour: "2-digit",
                    hour12: false,
                  })
                );
                return zoneHour >= 9 && zoneHour < 17;
              });

              if (allInBusinessHours) {
                return (
                  <div
                    key={hour}
                    className={`p-3 rounded-lg text-center ${
                      theme === "dark"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    <div className="font-bold">{hour}:00</div>
                    <div className="text-xs">Good for all</div>
                  </div>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Time Converter Tool */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
        <h3 className="text-xl font-semibold mb-4">⏰ Time Converter</h3>
        <p className={`${textSecondary} mb-4`}>
          Convert a specific time across all your selected timezones:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="time"
            className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            onChange={(e) => {
              // This would trigger conversion - implement as needed
            }}
          />
          <input
            type="date"
            className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>
    </div>
  );
};
export default TimeZoneConverter;
