import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardFront from './CardFront';
import CardBack from './CardBack';

export default function Card({
  character,
  revealed = false,
  faceUp = false,
  width = 80,
  height = 120,
  selectable = false,
  selected = false,
  onClick,
  style = {},
  className = '',
  animate = true,
}) {
  const showFront = faceUp || revealed;

  return (
    <motion.div
      style={{
        width,
        height,
        perspective: 800,
        cursor: selectable ? 'pointer' : 'default',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
      whileHover={selectable ? { y: -8, scale: 1.04 } : undefined}
      whileTap={selectable ? { scale: 0.97 } : undefined}
      animate={selected ? { y: -14, scale: 1.06 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={selectable ? onClick : undefined}
      className={className}
    >
      {/* Selected ring */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: 10,
            border: '2px solid #D4AF37',
            boxShadow: '0 0 16px rgba(212,175,55,0.7)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {showFront ? (
        <CardFront
          character={character}
          width={width}
          height={height}
          style={revealed ? { filter: 'grayscale(0.2) brightness(0.8)', opacity: 0.75 } : {}}
        />
      ) : (
        <CardBack width={width} height={height} />
      )}

      {revealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 8,
          }}
        >
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 9,
            color: '#ef4444',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            textShadow: '0 0 6px rgba(239,68,68,0.8)',
            transform: 'rotate(-15deg)',
            border: '1px solid rgba(239,68,68,0.5)',
            padding: '2px 6px',
          }}>
            LOST
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
