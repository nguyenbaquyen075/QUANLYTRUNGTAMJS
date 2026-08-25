import React from 'react';

export function ShoppingBagPlusIcon({ className = "w-6 h-6", strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Curved Handle top */}
      <path d="M8.5 7.5a3.5 3.5 0 0 1 7 0" />
      {/* Rounded trapezoid bag body */}
      <path d="M5.5 8.5h13a1.5 1.5 0 0 1 1.48 1.68l-1.1 9.5A2 2 0 0 1 16.89 21.5H7.11a2 2 0 0 1-1.99-1.82l-1.1-9.5A1.5 1.5 0 0 1 5.5 8.5z" />
      {/* Plus Sign in center */}
      <path d="M12 12v5" />
      <path d="M9.5 14.5h5" />
    </svg>
  );
}

export function ShoppingBagIcon({ className = "w-6 h-6", strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Curved Handle top */}
      <path d="M8.5 7.5a3.5 3.5 0 0 1 7 0" />
      {/* Rounded trapezoid bag body */}
      <path d="M5.5 8.5h13a1.5 1.5 0 0 1 1.48 1.68l-1.1 9.5A2 2 0 0 1 16.89 21.5H7.11a2 2 0 0 1-1.99-1.82l-1.1-9.5A1.5 1.5 0 0 1 5.5 8.5z" />
    </svg>
  );
}

export default ShoppingBagPlusIcon;


