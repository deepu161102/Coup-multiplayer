import React from 'react';
import { motion } from 'framer-motion';
import CardBack from '../cards/CardBack';
import CardFront from '../cards/CardFront';

const SEAT_SIZES = {
  small: { card: { w: 42, h: 63 }, nameSize: 10, coinSize: 11 },
  medium: { card: { w: 56, h: 84 }, nameSize: 11, coinSize: 12 },
  large: { card: { w: 66, h: 99 }, nameSize: 12, coinSize: 13 },
};

export default function OpponentSeat({
  player,
  isCurrentTurn,
  position = 'top',
  size = 'medium',
}) {
  if (!player) return null;

  const sz = SEAT_SIZES[size];
  const activeCards = player.cards.filter(c => !c.revealed);
  const revealedCards = player.cards.filter(c => c.revealed);
  const cardSpacing = sz.card.w * 0.4;

  const getRotation = () => {
    switch (position) {
      case 'left': return -90;
      case 'right': return 90;
      default: return 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: player.isAlive ? 1 : 0.4,
        filter: player.isAlive ? 'none' : 'grayscale(0.8)',
        transition: 'opacity 0.5s, filter 0.5s',
        minWidth: sz.card.w * 2,
      }}
    >
      {/* Name plate */}
      <motion.div
        animate={isCurrentTurn ? { boxShadow: ['0 0 8px rgba(212,175,55,0.3)', '0 0 20px rgba(212,175,55,0.7)', '0 0 8px rgba(212,175,55,0.3)'] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          background: isCurrentTurn
            ? 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)'
            : 'rgba(0,0,0,0.4)',
          border: `1px solid ${isCurrentTurn ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.15)'}`,
          borderRadius: 2,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 80,
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: player.isAlive ? '#4ade80' : '#ef4444',
          boxShadow: player.isAlive ? '0 0 4px rgba(74,222,128,0.6)' : '0 0 4px rgba(239,68,68,0.6)',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: sz.nameSize,
          letterSpacing: '0.06em',
          color: isCurrentTurn ? '#D4AF37' : 'rgba(245,237,216,0.7)',
          whiteSpace: 'nowrap',
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textTransform: 'uppercase',
        }}>
          {player.name}
        </span>
      </motion.div>

      {/* Coin display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <div className="coin-icon" style={{ width: 10, height: 10 }} />
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: sz.coinSize,
          color: '#D4AF37',
          fontWeight: 700,
        }}>
          {player.coins}
        </span>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        position: 'relative',
        height: sz.card.h + 10,
        width: sz.card.w + (player.cards.length - 1) * cardSpacing,
        alignItems: 'flex-end',
      }}>
        {player.cards.map((card, i) => {
          const totalCards = player.cards.length;
          const offset = totalCards === 1 ? 0 : (i - (totalCards - 1) / 2);
          const rotation = offset * 8;
          const xPos = i * cardSpacing;
          const yOffset = Math.abs(offset) * 2;

          return (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: yOffset, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{
                position: 'absolute',
                left: xPos,
                bottom: 0,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'bottom center',
                zIndex: i,
              }}
            >
              {card.revealed ? (
                <CardFront character={card.character} width={sz.card.w} height={sz.card.h}
                  style={{ opacity: 0.6, filter: 'grayscale(0.3)' }} />
              ) : (
                <CardBack width={sz.card.w} height={sz.card.h} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Influence count */}
      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: 10,
        fontStyle: 'italic',
        color: 'rgba(245,237,216,0.3)',
      }}>
        {activeCards.length} influence{activeCards.length !== 1 ? 's' : ''}
        {!player.isAlive && ' · eliminated'}
      </div>
    </motion.div>
  );
}
