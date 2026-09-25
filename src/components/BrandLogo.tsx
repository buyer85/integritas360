import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${currentSize} ${className}`}
      aria-label="INTEGRITAS360 Brand Emblem"
    >
      {!imageError ? (
        <img
          src="/logo.png"
          alt="Integritas360 Logo"
          className="w-full h-full object-cover rounded-xl shadow-lg ring-1 ring-amber-500/40 hover:ring-amber-400 transition-all drop-shadow-md"
          onError={() => setImageError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="shieldGoldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="0.5" stopColor="#FCD34D" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="shieldInnerGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0B1120" />
            </linearGradient>
          </defs>

          {/* Outer 360 degree orbit ring */}
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="url(#shieldGoldGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* Main Solid Shield */}
          <path
            d="M24 6L38 12V23C38 31.5 32 39 24 42C16 39 10 31.5 10 23V12L24 6Z"
            fill="url(#shieldInnerGrad)"
            stroke="url(#shieldGoldGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Shield Contour */}
          <path
            d="M24 9.5L35 14.5V23C35 29.8 30.2 35.8 24 38.2C17.8 35.8 13 29.8 13 23V14.5L24 9.5Z"
            stroke="url(#shieldGoldGrad)"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Certified Integrity Checkmark */}
          <path
            d="M18 23.5L22 27.5L30 18.5"
            stroke="url(#shieldGoldGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
