import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { TURN_PHASES, CHARACTER_INFO } from '../../game/constants';
import CardFront from '../cards/CardFront';

export default function ExchangeModal() {
  const { state, actions } = useGame();
  const { game } = state;
  const [selected, setSelected] = useState([]);

  if (!game || game.turnPhase !== TURN_PHASES.EXCHANGE_SELECT) return null;

  const actingPlayer = game.players[game.pendingAction.actingPlayerId];

  // Computer's exchange is handled automatically by the AI
  if (actingPlayer.isComputer) return null;
  const exchangeCards = game.exchangeCards;

  const myUnrevealed = actingPlayer.cards
    .filter(c => !c.revealed)
    .map(c => c.character);

  const allCards = [...myUnrevealed, ...exchangeCards];
  const mustKeep = myUnrevealed.length;
  const mustReturn = 2;

  const toggleSelect = (index) => {
    setSelected(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= mustReturn) return prev;
      return [...prev, index];
    });
  };

  const selectedCards = selected.map(i => allCards[i]);
  const canConfirm = selected.length === mustReturn;

  const handleConfirm = () => {
    actions.completeExchange(selectedCards);
    setSelected([]);
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        style={{
          background: 'linear-gradient(160deg, #001a16 0%, #000e0c 50%, #000806 100%)',
          border: '1px solid rgba(0,105,92,0.4)',
          borderRadius: 4,
          padding: '32px 36px',
          maxWidth: 560,
          width: '92%',
          boxShadow: '0 0 60px rgba(0,105,92,0.15), 0 32px 64px rgba(0,0,0,0.9)',
          textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'rgba(0,175,155,0.5)',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          ✦ &nbsp; Ambassador's Exchange &nbsp; ✦
        </div>

        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 20,
          color: CHARACTER_INFO.Ambassador.borderColor,
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}>
          {actingPlayer.name}
        </div>

        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 14,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.5)',
          marginBottom: 24,
        }}>
          Select <strong style={{ color: CHARACTER_INFO.Ambassador.borderColor }}>
            {mustReturn} card{mustReturn !== 1 ? 's' : ''}
          </strong> to return to the Court deck.
          You will keep {mustKeep}.
        </div>

        <div style={{
          width: 120,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,175,155,0.4), transparent)',
          margin: '0 auto 20px',
        }} />

        {/* Labels */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          marginBottom: 10,
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Your Cards', count: myUnrevealed.length, color: 'rgba(212,175,55,0.5)' },
            { label: 'Drawn from Court', count: exchangeCards.length, color: 'rgba(0,175,155,0.5)' },
          ].map(g => (
            <div key={g.label} style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 10,
              letterSpacing: '0.15em',
              color: g.color,
              textTransform: 'uppercase',
            }}>
              {g.label} ({g.count})
            </div>
          ))}
        </div>

        {/* All cards */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 24,
        }}>
          {allCards.map((char, i) => {
            const isOwn = i < myUnrevealed.length;
            const isSelected = selected.includes(i);
            const ci = CHARACTER_INFO[char];

            return (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                animate={isSelected ? { y: -12, scale: 1.07 } : { y: 0, scale: 1 }}
                onClick={() => toggleSelect(i)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <CardFront
                  character={char}
                  width={88}
                  height={132}
                  style={{
                    outline: isSelected ? `2px solid #ef4444` : isOwn ? `2px solid ${ci.borderColor}44` : '2px solid rgba(0,175,155,0.3)',
                    outlineOffset: 3,
                    opacity: isSelected ? 0.7 : 1,
                    filter: isSelected ? 'brightness(0.8)' : 'none',
                    transition: 'all 0.2s',
                  }}
                />

                {/* Badge */}
                <div style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  padding: '2px 6px',
                  borderRadius: 2,
                  background: isOwn ? 'rgba(212,175,55,0.8)' : 'rgba(0,175,155,0.8)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: 8,
                  color: '#000',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  {isOwn ? 'Yours' : 'Court'}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239,68,68,0.15)',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: 11,
                      color: '#ef4444',
                      fontWeight: 700,
                      textShadow: '0 0 6px rgba(239,68,68,0.8)',
                      transform: 'rotate(-10deg)',
                      border: '1px solid rgba(239,68,68,0.5)',
                      padding: '2px 8px',
                      background: 'rgba(0,0,0,0.6)',
                    }}>
                      RETURN
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 13,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.35)',
          marginBottom: 20,
        }}>
          {selected.length === 0
            ? `Select ${mustReturn} card${mustReturn > 1 ? 's' : ''} to return`
            : selected.length < mustReturn
            ? `Select ${mustReturn - selected.length} more`
            : `${mustReturn} card${mustReturn > 1 ? 's' : ''} selected to return`}
        </div>

        <motion.button
          whileHover={canConfirm ? { scale: 1.02, boxShadow: '0 0 20px rgba(0,105,92,0.5)' } : {}}
          whileTap={canConfirm ? { scale: 0.98 } : {}}
          disabled={!canConfirm}
          onClick={handleConfirm}
          style={{
            padding: '11px 32px',
            background: canConfirm
              ? 'linear-gradient(135deg, #003326 0%, #00695C 50%, #26A69A 100%)'
              : 'rgba(0,105,92,0.1)',
            border: `1px solid rgba(0,105,92,${canConfirm ? '0.6' : '0.2'})`,
            borderRadius: 2,
            color: canConfirm ? '#fff' : 'rgba(38,166,154,0.4)',
            fontFamily: 'Cinzel, serif',
            fontSize: 13,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: canConfirm ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          Complete Exchange
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
