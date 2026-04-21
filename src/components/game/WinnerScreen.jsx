import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { TURN_PHASES } from '../../game/constants';
import CardFront from '../cards/CardFront';

function Particle({ delay }) {
  const x = (Math.random() - 0.5) * 600;
  const y = (Math.random() - 0.5) * 400;
  const size = 2 + Math.random() * 4;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        x,
        y,
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `rgba(${212 + Math.random() * 40}, ${175 + Math.random() * 40}, ${55 + Math.random() * 40}, 0.8)`,
        left: '50%',
        top: '50%',
      }}
    />
  );
}

export default function WinnerScreen() {
  const { state, actions } = useGame();
  const { game } = state;

  if (!game || game.turnPhase !== TURN_PHASES.GAME_OVER || !game.winner) return null;

  const winner = game.winner;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, #1a1000 0%, #0a0800 40%, #050403 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {/* Particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <Particle key={i} delay={i * 0.1} />
      ))}

      {/* Crown rays */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
          padding: '0 20px',
        }}
      >
        {/* Trophy / Crown */}
        <motion.div
          animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: 64,
            filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.6))',
          }}
        >
          ♔
        </motion.div>

        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 12,
          letterSpacing: '0.4em',
          color: 'rgba(212,175,55,0.5)',
          textTransform: 'uppercase',
        }}>
          The Court has spoken
        </div>

        {/* Winner name */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: 'spring' }}
        >
          <div style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: 'clamp(32px, 6vw, 60px)',
            color: '#D4AF37',
            letterSpacing: '0.08em',
            filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.5))',
            lineHeight: 1.1,
          }}>
            {winner.name}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: 18,
            fontStyle: 'italic',
            color: 'rgba(245,237,216,0.6)',
          }}
        >
          has seized control of the Court
        </motion.div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            width: 200,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          }}
        />

        {/* Surviving cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{ display: 'flex', gap: 16 }}
        >
          {winner.cards.filter(c => !c.revealed).map((card, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            >
              <CardFront
                character={card.character}
                width={80}
                height={120}
                style={{ boxShadow: '0 0 24px rgba(212,175,55,0.4)' }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Coin count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 20,
          padding: '6px 18px',
        }}>
          <div className="coin-icon" style={{ width: 14, height: 14 }} />
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 16,
            color: '#D4AF37',
            fontWeight: 700,
          }}>
            {winner.coins} coins remaining
          </span>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ display: 'flex', gap: 12, marginTop: 8 }}
        >
          <button className="btn btn-gold btn-lg" onClick={actions.goToSetup}>
            New Game
          </button>
          <button className="btn btn-ghost" onClick={actions.goToWelcome}>
            Main Menu
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
