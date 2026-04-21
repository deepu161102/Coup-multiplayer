import React from 'react';
import { CHARACTER_INFO } from '../../game/constants';

const CARD_IMAGES = {
  Assassin:  '/cards/assassin.jpg',
  Ambassador: '/cards/ambassador.jpg',
  Captain:   '/cards/captain.jpg',
  Contessa:  '/cards/contessa.jpg',
  Duke:      '/cards/duke.jpg',
};

export default function CardFront({ character, width = 80, height = 120, style = {}, className = '' }) {
  const info = CHARACTER_INFO[character];
  if (!info) return null;

  const imgSrc = CARD_IMAGES[character];
  const borderRadius = Math.max(4, width * 0.06);

  return (
    <div
      className={`playing-card ${className}`}
      style={{
        width,
        height,
        borderRadius,
        border: `2px solid ${info.borderColor}`,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 0 12px ${info.glowColor}, 0 4px 16px rgba(0,0,0,0.7)`,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Full-card portrait image */}
      <img
        src={imgSrc}
        alt={character}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
        }}
        draggable={false}
      />

      {/* Subtle border glow overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius,
        boxShadow: `inset 0 0 ${width * 0.15}px ${info.color}44`,
        pointerEvents: 'none',
      }} />

      {/* Top-left corner symbol */}
      <div style={{
        position: 'absolute',
        top: Math.max(3, width * 0.05),
        left: Math.max(3, width * 0.05),
        fontFamily: 'Cinzel, serif',
        fontSize: Math.max(6, width * 0.12),
        color: info.borderColor,
        lineHeight: 1,
        textShadow: `0 0 6px ${info.glowColor}`,
        pointerEvents: 'none',
        filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.9))`,
      }}>
        {info.symbol}
      </div>

      {/* Bottom-right corner symbol */}
      <div style={{
        position: 'absolute',
        bottom: Math.max(3, width * 0.05),
        right: Math.max(3, width * 0.05),
        fontFamily: 'Cinzel, serif',
        fontSize: Math.max(6, width * 0.12),
        color: info.borderColor,
        lineHeight: 1,
        textShadow: `0 0 6px ${info.glowColor}`,
        pointerEvents: 'none',
        filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.9))`,
        transform: 'rotate(180deg)',
      }}>
        {info.symbol}
      </div>
    </div>
  );
}
