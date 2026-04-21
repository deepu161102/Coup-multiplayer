import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { TURN_PHASES, CHARACTER_INFO } from '../../game/constants';
import CardFront from '../cards/CardFront';

export default function LoseInfluenceModal() {
  const { state, actions } = useGame();
  const { game } = state;
  const [selected, setSelected] = useState(null);

  if (!game || game.turnPhase !== TURN_PHASES.LOSE_INFLUENCE) return null;

  const { loseInfluenceQueue, players } = game;
  if (loseInfluenceQueue.length === 0) return null;

  const playerId = loseInfluenceQueue[0];
  const player = players[playerId];

  // Computer's card loss is handled automatically by the AI
  if (player.isComputer) return null;
  const unrevealed = player.cards
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => !c.revealed);

  const handleConfirm = () => {
    if (selected === null) return;
    actions.loseInfluenceCard(playerId, selected);
    setSelected(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        style={{
          background: 'linear-gradient(160deg, #1a0008 0%, #0e0006 50%, #080004 100%)',
          border: '1px solid rgba(196,30,58,0.4)',
          borderRadius: 4,
          padding: '32px 36px',
          maxWidth: 460,
          width: '90%',
          boxShadow: '0 0 60px rgba(196,30,58,0.15), 0 32px 64px rgba(0,0,0,0.9)',
          textAlign: 'center',
        }}
      >
        {/* Pulsing danger glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 60,
            background: 'radial-gradient(ellipse, rgba(196,30,58,0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Pass device */}
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'rgba(196,30,58,0.5)',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          ✦ &nbsp; Pass to {player.name} &nbsp; ✦
        </div>

        {/* Title */}
        <motion.div
          animate={{ textShadow: ['0 0 8px rgba(196,30,58,0.4)', '0 0 20px rgba(196,30,58,0.8)', '0 0 8px rgba(196,30,58,0.4)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#ef4444',
            marginBottom: 8,
          }}
        >
          Lose Influence
        </motion.div>

        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 15,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.5)',
          marginBottom: 24,
        }}>
          {player.name}, choose a card to reveal and lose.
        </div>

        <div style={{
          width: 120,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(196,30,58,0.4), transparent)',
          margin: '0 auto 24px',
        }} />

        {/* Cards to choose from */}
        {unrevealed.length === 0 ? (
          <div style={{
            fontFamily: 'EB Garamond, serif',
            color: 'rgba(245,237,216,0.4)',
            fontStyle: 'italic',
          }}>
            No cards to reveal.
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              marginBottom: 24,
            }}>
              {unrevealed.map((card) => {
                const isSelected = selected === card.index;
                const ci = CHARACTER_INFO[card.character];
                return (
                  <motion.div
                    key={card.index}
                    whileHover={{ y: -10, scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isSelected
                      ? { y: -14, scale: 1.08, boxShadow: `0 0 24px ${ci.color}88` }
                      : { y: 0, scale: 1 }
                    }
                    onClick={() => setSelected(isSelected ? null : card.index)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      outline: isSelected ? `2px solid ${ci.borderColor}` : '2px solid transparent',
                      outlineOffset: 3,
                    }}
                  >
                    <CardFront
                      character={card.character}
                      width={100}
                      height={150}
                    />
                  </motion.div>
                );
              })}
            </div>

            {unrevealed.length > 1 && (
              <div style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: 13,
                fontStyle: 'italic',
                color: 'rgba(245,237,216,0.35)',
                marginBottom: 16,
              }}>
                Select the card you wish to sacrifice
              </div>
            )}

            <motion.button
              whileHover={selected !== null ? { scale: 1.02, boxShadow: '0 0 20px rgba(196,30,58,0.5)' } : {}}
              whileTap={selected !== null ? { scale: 0.98 } : {}}
              disabled={selected === null && unrevealed.length > 1}
              onClick={() => {
                if (unrevealed.length === 1) {
                  actions.loseInfluenceCard(playerId, unrevealed[0].index);
                  setSelected(null);
                } else {
                  handleConfirm();
                }
              }}
              style={{
                padding: '11px 32px',
                background: selected !== null || unrevealed.length === 1
                  ? 'linear-gradient(135deg, #4a0010 0%, #8B0000 50%, #C41E3A 100%)'
                  : 'rgba(196,30,58,0.1)',
                border: `1px solid rgba(196,30,58,${selected !== null || unrevealed.length === 1 ? '0.6' : '0.2'})`,
                borderRadius: 2,
                color: selected !== null || unrevealed.length === 1 ? '#fff' : 'rgba(239,68,68,0.4)',
                fontFamily: 'Cinzel, serif',
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: selected === null && unrevealed.length > 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {unrevealed.length === 1 ? 'Reveal & Lose' : selected !== null ? 'Confirm Sacrifice' : 'Select a Card'}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
