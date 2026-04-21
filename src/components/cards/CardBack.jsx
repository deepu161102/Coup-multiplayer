import React from 'react';

export default function CardBack({ width = 80, height = 120, style = {}, className = '' }) {
  return (
    <div
      className={`playing-card ${className}`}
      style={{
        width,
        height,
        background: 'linear-gradient(160deg, #0a0618 0%, #120a24 50%, #0a0618 100%)',
        border: '2px solid #3a2a6a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Outer ornate border */}
      <div style={{
        position: 'absolute',
        inset: 4,
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: 4,
        pointerEvents: 'none',
      }} />

      {/* Diamond grid pattern */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}
        viewBox="0 0 80 120"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="diamonds" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="80" height="120" fill="url(#diamonds)" />
      </svg>

      {/* Center emblem */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        zIndex: 1,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(212,175,55,0.7)' }}>✦</span>
        </div>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: Math.max(6, width * 0.08),
          letterSpacing: '0.15em',
          color: 'rgba(212,175,55,0.5)',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          COUP
        </div>
      </div>

      {/* Corner decorations */}
      {[
        { top: 3, left: 3 },
        { top: 3, right: 3 },
        { bottom: 3, left: 3 },
        { bottom: 3, right: 3 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 6,
          height: 6,
          border: '1px solid rgba(212,175,55,0.3)',
          transform: 'rotate(45deg)',
          ...pos,
        }} />
      ))}

      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
