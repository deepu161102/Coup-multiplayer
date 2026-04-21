import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

const COMPUTER_NAMES = [
  'The Duke', 'The Assassin', 'The Captain', 'The Ambassador', 'The Contessa',
];

export default function GameSetup() {
  const { actions } = useGame();
  const [humanName, setHumanName] = useState('Player');
  const [opponentCount, setOpponentCount] = useState(2);

  const handleStart = () => {
    const name = humanName.trim() || 'Player';
    const playerConfigs = [
      { name, isComputer: false },
      ...Array.from({ length: opponentCount }, (_, i) => ({
        name: COMPUTER_NAMES[i],
        isComputer: true,
      })),
    ];
    actions.startGame(playerConfigs);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at 50% 20%, #1a0a2e 0%, #0c060f 40%, #060409 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto',
      }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(160deg, #120a1e 0%, #0d0718 60%, #080514 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 4,
          padding: '36px 40px',
          boxShadow: '0 0 80px rgba(212,175,55,0.08), 0 32px 64px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 11,
            letterSpacing: '0.3em',
            color: 'rgba(212,175,55,0.5)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            ✦ &nbsp; Court Assembly &nbsp; ✦
          </div>
          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: 26,
            color: '#D4AF37',
            letterSpacing: '0.08em',
            filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.3))',
          }}>
            New Game
          </h2>
          <div style={{
            width: 120,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            margin: '12px auto 0',
          }} />
        </div>

        {/* Human player name */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(212,175,55,0.6)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 10,
          }}>
            Your Name
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B7536, #D4AF37)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Cinzel, serif',
              fontSize: 11,
              color: '#1a1200',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              ♙
            </div>
            <input
              type="text"
              value={humanName}
              onChange={e => setHumanName(e.target.value)}
              maxLength={20}
              placeholder="Your name"
              style={{
                flex: 1,
                height: 40,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 2,
                padding: '0 12px',
                color: '#F5EDD8',
                fontFamily: 'EB Garamond, serif',
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.7)'}
              onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.3)'}
            />
          </div>
        </div>

        {/* Number of opponents */}
        <div style={{ marginBottom: 28 }}>
          <label style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(212,175,55,0.6)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 10,
          }}>
            Computer Opponents
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setOpponentCount(n)}
                style={{
                  flex: 1,
                  height: 40,
                  background: opponentCount === n
                    ? 'linear-gradient(135deg, #8B7536 0%, #D4AF37 50%, #F0D060 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: opponentCount === n
                    ? '1px solid #D4AF37'
                    : '1px solid rgba(212,175,55,0.15)',
                  borderRadius: 2,
                  color: opponentCount === n ? '#1a1200' : 'rgba(212,175,55,0.6)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: opponentCount === n ? '0 0 16px rgba(212,175,55,0.4)' : 'none',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'rgba(245,237,216,0.3)',
            marginTop: 8,
            textAlign: 'center',
          }}>
            {opponentCount + 1} players total · {opponentCount} vs you
          </div>
        </div>

        {/* Opponent preview */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(212,175,55,0.1)',
          borderRadius: 2,
          padding: '10px 14px',
          marginBottom: 28,
        }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'rgba(212,175,55,0.3)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Your Opponents
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Array.from({ length: opponentCount }, (_, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(123,47,190,0.08)',
                border: '1px solid rgba(123,47,190,0.2)',
                borderRadius: 2,
                padding: '3px 8px',
              }}>
                <span style={{ fontSize: 10 }}>⚙</span>
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 10,
                  color: 'rgba(212,175,55,0.7)',
                  letterSpacing: '0.04em',
                }}>
                  {COMPUTER_NAMES[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-ghost"
            onClick={actions.goToWelcome}
            style={{ flex: 0.4 }}
          >
            ← Back
          </button>
          <button
            className="btn btn-gold"
            onClick={handleStart}
            style={{ flex: 1 }}
          >
            Begin the Intrigue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
