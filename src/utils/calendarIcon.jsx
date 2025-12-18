import React from 'react';

/**
 * A custom, dynamic calendar icon component.
 * It takes a `date` prop (a number or string) and displays it.
 * This version is styled to look more like a standard emoji.
 *
 * @param {object} props
 * @param {string | number} props.date - The date number (e.g., 30) to display.
 * @param {string} props.className - Tailwind classes (e.g., "w-10 h-10 text-gray-400").
 * The `text-` color will be used for the outline/rings.
 */
const DynamicCalendarIcon = ({ dateObject, className }) => {

  const d = dateObject || new Date();
  const monthString = d.toLocaleString('default', { month: 'short' });
  const dayNumber = d.getDate();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" // This will be the outline color from className
      strokeWidth="0.8" // Thinner, cleaner stroke
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className} // Pass in Tailwind classes (e.g., w-12 h-12 text-gray-400)
    >
      {/* 1. Main calendar body (white) with an outline */}
      <rect x="3" y="5" width="18" height="16" rx="2" ry="2" fill="#FFFFFF" />
      
      {/* 2. The top bar (red) */}
      <path fill="#ef4444" stroke="#ef4444" strokeWidth="2" d="M3 10h18V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3Z" />
      
      {/* 3. The rings (use outline color) */}
      <path d="M19 3v3" />
      <path d="M5 3v3" />

      {/* 4. Grid lines (light gray) - uncomment if you want them
      <path d="M3 14h18" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M3 18h18" stroke="#e2e8f0" strokeWidth="1" />
      */}

      {/* 4. The dynamic MONTH text (white, positioned in the red bar) */}
      <text
        x="50%" // Center horizontally
        y="8.7"  // Positioned vertically in the red area
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#FFFFFF" // White text for contrast on red
        fontSize="6"   // Smaller font size for month
        fontWeight="bold"
        fontFamily="aerial"
        stroke="none"
      >
        {monthString ? monthString : ''}
      </text>

      {/* 5. The dynamic date text (dark) */}
      <text
        x="50%" // Center horizontally
        y="16.8"  // Positioned in the middle of the white area
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#1e293b" // A dark slate color
        fontSize="9"
        fontWeight="bold"
        fontFamily="aerial"
        stroke="none" // No outline on the text
      >
        {dayNumber}
      </text>
    </svg>
  );
};

export default DynamicCalendarIcon;