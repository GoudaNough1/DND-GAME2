import React from 'react';
import { VisualTraits } from '../types';

interface PixelAvatarProps {
  visuals: VisualTraits;
  size?: number;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ visuals, size = 120 }) => {
  const { skinColor, hairColor, hairStyle, accessory } = visuals;

  // Simple SVG construction for a retro pixel look
  // Base Head
  const head = (
    <rect x="3" y="3" width="10" height="10" fill={skinColor} rx="1" />
  );

  // Eyes
  const eyes = (
    <g fill="#1e293b">
      <rect x="5" y="6" width="2" height="2" />
      <rect x="9" y="6" width="2" height="2" />
    </g>
  );

  // Hair Styles
  const getHair = () => {
    switch (hairStyle) {
      case 0: // Bald / Shaved
        return <rect x="3" y="3" width="10" height="2" fill={skinColor} opacity="0.8" />; 
      case 1: // Short
        return <path d="M3,3 L13,3 L13,5 L3,5 Z" fill={hairColor} />;
      case 2: // Long
        return <path d="M3,3 L13,3 L13,11 L11,11 L11,5 L5,5 L5,11 L3,11 Z" fill={hairColor} />;
      case 3: // Spiky
        return <path d="M3,5 L5,2 L7,5 L9,2 L11,5 L13,2 L13,5 L3,5 Z" fill={hairColor} />;
      default: return null;
    }
  };

  // Accessories
  const getAccessory = () => {
    switch (accessory) {
      case 1: // Beard
        return <path d="M4,10 L12,10 L12,12 L4,12 Z" fill={hairColor} />;
      case 2: // Glasses
        return (
          <g stroke="#fbbf24" strokeWidth="0.5" fill="none">
             <rect x="4.5" y="5.5" width="3" height="3" />
             <rect x="8.5" y="5.5" width="3" height="3" />
             <line x1="7.5" y1="7" x2="8.5" y2="7" />
          </g>
        );
      case 3: // Scar
        return <line x1="4" y1="4" x2="6" y2="7" stroke="#dc2626" strokeWidth="0.5" />;
      default: return null;
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="bg-slate-800 border-2 border-slate-600 rounded">
      {head}
      {eyes}
      {getHair()}
      {getAccessory()}
    </svg>
  );
};