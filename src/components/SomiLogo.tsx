import React from 'react';

export function SomiLogo({ className = "h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 830 300"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* S */}
      <path
        d="M50,250 C150,250 200,200 200,150 C200,100 150,75 100,75 C50,75 0,100 0,150"
        stroke="url(#somiGradient)"
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* O */}
      <circle
        cx="400"
        cy="150"
        r="75"
        stroke="url(#somiGradient)"
        strokeWidth="30"
        fill="none"
      />
      
      {/* M */}
      <path
        d="M600,75 L600,225 L700,150 L800,225 L800,75"
        stroke="url(#somiGradient)"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* I */}
      <path
        d="M1000,75 L1000,225"
        stroke="url(#somiGradient)"
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="somiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#6B4E71' }} />
          <stop offset="100%" style={{ stopColor: '#563E5A' }} />
        </linearGradient>
      </defs>
    </svg>
  );
}