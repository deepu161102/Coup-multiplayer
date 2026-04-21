import React from 'react';
import { motion } from 'framer-motion';
import Card from '../cards/Card';

function getCardTransform(index, total) {
  if (total === 1) return { rotate: 0, translateX: 0, translateY: 0 };
  if (total === 2) {
    const angles = [-10, 10];
    const xs = [-20, 20];
    return { rotate: angles[index], translateX: xs[index], translateY: Math.abs(angles[index]) * 0.5 };
  }
  const spread = 14;
  const offset = index - (total - 1) / 2;
  return {
    rotate: offset * spread,
    translateX: offset * 28,
    translateY: Math.abs(offset) * 6,
  };
}

export default function PlayerHand({
  player,
  selectableCards = false,
  selectedCardIndex = null,
  onCardSelect,
  showCardFaces = true,
  label = null,
}) {
  if (!player) return null;

  const cards = player.cards;
  const total = cards.length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}>
      {/* Player info bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: 2,
        padding: '8px 20px',
      }}>
        {/* Status dot */}
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 6px rgba(74,222,128,0.7)',
        }} />

        {/* Name */}
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 13,
          letterSpacing: '0.1em',
          color: '#D4AF37',
          textTransform: 'uppercase',
          textShadow: '0 0 8px rgba(212,175,55,0.4)',
        }}>
          {player.name}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(212,175,55,0.2)' }} />

        {/* Coins */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div className="coin-icon" />
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#D4AF37',
          }}>
            {player.coins}
          </span>
          <span style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: 12,
            color: 'rgba(212,175,55,0.5)',
            fontStyle: 'italic',
          }}>
            coins
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(212,175,55,0.2)' }} />

        {/* Influence */}
        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 12,
          color: 'rgba(245,237,216,0.4)',
          fontStyle: 'italic',
        }}>
          {cards.filter(c => !c.revealed).length} influence
        </div>

        {player.coins >= 10 && (
          <>
            <div style={{ width: 1, height: 16, background: 'rgba(212,175,55,0.2)' }} />
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 10,
                color: '#ef4444',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Must Coup!
            </motion.div>
          </>
        )}
      </div>

      {label && (
        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 13,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.45)',
          textAlign: 'center',
        }}>
          {label}
        </div>
      )}

      {/* Hand container — perspective view */}
      <div style={{
        position: 'relative',
        height: 160,
        width: 320,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        perspective: 800,
      }}>
        {/* Hand silhouette */}
        <div style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 180,
          height: 40,
          background: 'radial-gradient(ellipse, rgba(30,15,5,0.7) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Cards in a fan */}
        {cards.map((card, index) => {
          const t = getCardTransform(index, total);
          const isSelected = selectedCardIndex === index;
          const isSelectable = selectableCards && !card.revealed;

          return (
            <motion.div
              key={index}
              initial={{ y: 80, opacity: 0, rotate: 0 }}
              animate={{
                y: isSelected ? -20 : 0,
                opacity: 1,
                rotate: t.rotate,
                x: t.translateX,
              }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                type: 'spring',
                stiffness: 200,
                damping: 18,
              }}
              whileHover={isSelectable ? { y: -16, scale: 1.06 } : {}}
              style={{
                position: 'absolute',
                bottom: t.translateY,
                transformOrigin: 'bottom center',
                zIndex: isSelected ? 10 : index,
                cursor: isSelectable ? 'pointer' : 'default',
                filter: isSelected
                  ? 'drop-shadow(0 0 16px rgba(212,175,55,0.8))'
                  : 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
              }}
              onClick={isSelectable ? () => onCardSelect(index) : undefined}
            >
              <Card
                character={card.character}
                revealed={card.revealed}
                faceUp={showCardFaces && !card.revealed}
                width={100}
                height={150}
                selected={isSelected}
              />
            </motion.div>
          );
        })}
      </div>

      {selectableCards && (
        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 13,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.45)',
        }}>
          Select a card to reveal
        </div>
      )}
    </div>
  );
}
