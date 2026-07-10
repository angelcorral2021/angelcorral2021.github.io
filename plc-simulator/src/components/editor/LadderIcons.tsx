import React from 'react';
import type { ElementType } from '../../core/types';

interface LadderIconProps {
  type: ElementType;
  color?: string;
  size?: number;
}

export const LadderIcon: React.FC<LadderIconProps> = ({ type, color = '#64748B', size = 40 }) => {
  switch (type) {
    case 'XIC':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <line x1="0" y1="20" x2="10" y2="20" stroke={color} strokeWidth="3" />
          <line x1="10" y1="5" x2="10" y2="35" stroke={color} strokeWidth="3" />
          <line x1="30" y1="5" x2="30" y2="35" stroke={color} strokeWidth="3" />
          <line x1="30" y1="20" x2="40" y2="20" stroke={color} strokeWidth="3" />
        </svg>
      );
    case 'XIO':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <line x1="0" y1="20" x2="10" y2="20" stroke={color} strokeWidth="3" />
          <line x1="10" y1="5" x2="10" y2="35" stroke={color} strokeWidth="3" />
          <line x1="15" y1="35" x2="25" y2="5" stroke={color} strokeWidth="3" />
          <line x1="30" y1="5" x2="30" y2="35" stroke={color} strokeWidth="3" />
          <line x1="30" y1="20" x2="40" y2="20" stroke={color} strokeWidth="3" />
        </svg>
      );
    case 'OTE':
    case 'OTL':
    case 'OTU':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
           <line x1="0" y1="20" x2="5" y2="20" stroke={color} strokeWidth="3" />
           <path d="M 15 5 Q 5 20 15 35" fill="none" stroke={color} strokeWidth="3" />
           {type === 'OTL' && <text x="20" y="24" fontSize="10" textAnchor="middle" fill={color} fontFamily="sans-serif">L</text>}
           {type === 'OTU' && <text x="20" y="24" fontSize="10" textAnchor="middle" fill={color} fontFamily="sans-serif">U</text>}
           <path d="M 25 5 Q 35 20 25 35" fill="none" stroke={color} strokeWidth="3" />
           <line x1="35" y1="20" x2="40" y2="20" stroke={color} strokeWidth="3" />
        </svg>
      );
    default:
      return <div style={{ color, fontSize: size / 3, textAlign: 'center', lineHeight: `${size}px` }}>[{type}]</div>;
  }
};
