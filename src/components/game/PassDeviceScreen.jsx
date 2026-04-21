import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import CardBack from '../cards/CardBack';

export default function PassDeviceScreen() {
  const { state, actions } = useGame();
  const { game } = state;
  if (!game) return null;

  const currentPlayer = game.players[game.currentPlayerIndex];

  // Computer turns are handled automatically — no pass-device screen needed
  if (currentPlayer.isComputer) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, #1a0a2e 0%, #080410 40%, #030208 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 400,
        height: 200,
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating cards decoration */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'flex',
          gap: -20,
          marginBottom: 40,
          filter: 'drop-shadow(0 8px 24px rgba(212,175,55,0.15))',
        }}
      >
        <CardBack width={70} height={105} style={{ transform: 'rotate(-12deg) translateY(8px)' }} />
        <CardBack width={70} height={105} style={{ transform: 'rotate(12deg) translateY(8px)', marginLeft: -20 }} />
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 36 }}
      >
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 11,
          letterSpacing: '0.3em',
          color: 'rgba(212,175,55,0.4)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          ✦ &nbsp; Pass the Device &nbsp; ✦
        </div>

        <div style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(28px, 5vw, 44px)',
          color: '#D4AF37',
          letterSpacing: '0.06em',
          filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))',
          marginBottom: 12,
        }}>
          {currentPlayer.name}
        </div>

        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 18,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.5)',
          marginBottom: 8,
        }}>
          it is your turn to reign
        </div>

        {/* Coin display */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 20,
          padding: '4px 14px',
          marginTop: 8,
        }}>
          <div className="coin-icon" />
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 14,
            color: '#D4AF37',
            fontWeight: 700,
          }}>
            {currentPlayer.coins} coins
          </span>
        </div>
      </motion.div>

      {/* Cards held count */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 40,
          alignItems: 'center',
        }}
      >
        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 14,
          color: 'rgba(245,237,216,0.4)',
          fontStyle: 'italic',
        }}>
          {currentPlayer.cards.filter(c => !c.revealed).length} Influence card{currentPlayer.cards.filter(c => !c.revealed).length !== 1 ? 's' : ''} remaining
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <button
          className="btn btn-gold btn-lg"
          onClick={actions.dismissPassDevice}
          style={{ minWidth: 220 }}
        >
          Reveal My Cards
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          position: 'absolute',
          bottom: 24,
          fontFamily: 'EB Garamond, serif',
          fontSize: 12,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.2)',
          textAlign: 'center',
        }}
      >
        Keep your cards secret from other players
      </motion.div>
    </motion.div>
  );
}
