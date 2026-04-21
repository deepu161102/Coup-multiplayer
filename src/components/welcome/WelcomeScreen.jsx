import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { CHARACTER_INFO } from '../../game/constants';

const CHARACTERS = [
  {
    name: 'Assassin',
    image: '/cards/assassin.jpg',
    color: CHARACTER_INFO.Assassin.color,
    borderColor: CHARACTER_INFO.Assassin.borderColor,
    glowColor: CHARACTER_INFO.Assassin.glowColor,
    symbol: CHARACTER_INFO.Assassin.symbol,
    desc: 'Pay 3 coins to eliminate a rival.',
  },
  {
    name: 'Ambassador',
    image: '/cards/ambassador.jpg',
    color: CHARACTER_INFO.Ambassador.color,
    borderColor: CHARACTER_INFO.Ambassador.borderColor,
    glowColor: CHARACTER_INFO.Ambassador.glowColor,
    symbol: CHARACTER_INFO.Ambassador.symbol,
    desc: 'Exchange cards with the Court deck.',
  },
  {
    name: 'Captain',
    image: '/cards/captain.jpg',
    color: CHARACTER_INFO.Captain.color,
    borderColor: CHARACTER_INFO.Captain.borderColor,
    glowColor: CHARACTER_INFO.Captain.glowColor,
    symbol: CHARACTER_INFO.Captain.symbol,
    desc: 'Steal 2 coins from any player.',
  },
  {
    name: 'Contessa',
    image: '/cards/contessa.jpg',
    color: CHARACTER_INFO.Contessa.color,
    borderColor: CHARACTER_INFO.Contessa.borderColor,
    glowColor: CHARACTER_INFO.Contessa.glowColor,
    symbol: CHARACTER_INFO.Contessa.symbol,
    desc: 'Block assassination attempts.',
  },
  {
    name: 'Duke',
    image: '/cards/duke.jpg',
    color: CHARACTER_INFO.Duke.color,
    borderColor: CHARACTER_INFO.Duke.borderColor,
    glowColor: CHARACTER_INFO.Duke.glowColor,
    symbol: CHARACTER_INFO.Duke.symbol,
    desc: 'Take 3 coins. Block Foreign Aid.',
  },
];

function CharacterPortrait({ char, index, hoveredIndex, onHover, onLeave }) {
  const isHovered = hoveredIndex === index;
  const isAny = hoveredIndex !== null;
  const isDimmed = isAny && !isHovered;

  return (
    <motion.div
      onHoverStart={() => onHover(index)}
      onHoverEnd={onLeave}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.7, ease: 'easeOut' }}
      style={{
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {/* Card container */}
      <motion.div
        animate={{
          scale: isHovered ? 1.18 : isDimmed ? 0.9 : 1,
          y: isHovered ? -24 : 0,
          opacity: isDimmed ? 0.45 : 1,
          zIndex: isHovered ? 10 : 1,
          rotateY: isHovered ? 0 : 0,
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{
          position: 'relative',
          width: 130,
          height: 195,
          borderRadius: 10,
          overflow: 'hidden',
          border: `2px solid ${isHovered ? char.borderColor : char.borderColor + '55'}`,
          boxShadow: isHovered
            ? `0 0 40px ${char.glowColor}, 0 0 80px ${char.color}55, 0 20px 40px rgba(0,0,0,0.8)`
            : `0 4px 20px rgba(0,0,0,0.6)`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Portrait image — show face/upper portion */}
        <img
          src={char.image}
          alt={char.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 10%',
            display: 'block',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          }}
          draggable={false}
        />

        {/* Gradient overlay — darker at bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isHovered
            ? `linear-gradient(to bottom, transparent 40%, ${char.color}99 100%)`
            : `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.75) 100%)`,
          transition: 'background 0.35s ease',
          pointerEvents: 'none',
        }} />

        {/* Glow border inner */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: `inset 0 0 30px ${char.color}66`,
            borderRadius: 8,
            pointerEvents: 'none',
          }}
        />

        {/* Character name at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 10px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: isHovered ? char.borderColor : 'rgba(245,237,216,0.85)',
            textTransform: 'uppercase',
            textShadow: `0 1px 4px rgba(0,0,0,0.9)`,
            transition: 'color 0.3s',
          }}>
            {char.name}
          </div>
        </div>

        {/* Symbol top-left */}
        <div style={{
          position: 'absolute',
          top: 7,
          left: 8,
          fontSize: 14,
          color: char.borderColor,
          textShadow: `0 0 8px ${char.glowColor}`,
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.3s',
        }}>
          {char.symbol}
        </div>
      </motion.div>

      {/* Hover tooltip — ability description */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: -52,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: `linear-gradient(135deg, ${char.color}22, rgba(0,0,0,0.9))`,
              border: `1px solid ${char.borderColor}66`,
              borderRadius: 4,
              padding: '6px 14px',
              textAlign: 'center',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: 12,
              fontStyle: 'italic',
              color: char.borderColor,
              letterSpacing: '0.04em',
            }}>
              {char.desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ground glow when hovered */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              bottom: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 16,
              background: `radial-gradient(ellipse, ${char.color}88 0%, transparent 70%)`,
              filter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WelcomeScreen() {
  const { actions } = useGame();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at 50% 20%, #1a0a2e 0%, #0c060f 40%, #060409 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 700,
        height: 350,
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hovered character ambient background */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            key={hoveredIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 60%, ${CHARACTERS[hoveredIndex].color}18 0%, transparent 60%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top ornament */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 12,
          letterSpacing: '0.4em',
          color: 'rgba(212,175,55,0.45)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        ✦ &nbsp; A Game of Intrigue & Deception &nbsp; ✦
      </motion.div>

      {/* Main title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.7 }}
        style={{ textAlign: 'center', marginBottom: 6 }}
      >
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(52px, 8vw, 100px)',
          fontWeight: 900,
          letterSpacing: '0.12em',
          background: 'linear-gradient(180deg, #F0D060 0%, #D4AF37 40%, #8B7536 80%, #D4AF37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
          lineHeight: 1,
          margin: 0,
        }}>
          COUP
        </h1>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(10px, 1.4vw, 14px)',
          letterSpacing: '0.35em',
          color: 'rgba(212,175,55,0.6)',
          marginTop: 6,
          textTransform: 'uppercase',
        }}>
          The Court of Influence
        </div>
      </motion.div>

      {/* Gold divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          width: 200,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          margin: '16px auto 20px',
        }}
      />

      {/* ── CHARACTER PORTRAITS ROW ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginBottom: 52,
          padding: '0 20px',
          position: 'relative',
        }}
      >
        {CHARACTERS.map((char, i) => (
          <CharacterPortrait
            key={char.name}
            char={char}
            index={i}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
            onLeave={() => setHoveredIndex(null)}
          />
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
      >
        <button className="btn btn-gold btn-lg" onClick={actions.goToSetup}>
          Begin the Game
        </button>
        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 13,
          fontStyle: 'italic',
          color: 'rgba(212,175,55,0.4)',
          letterSpacing: '0.06em',
        }}>
          Bluff, betray, and outmaneuver. Only one may rule.
        </div>
      </motion.div>

      {/* Bottom ornament */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        style={{
          position: 'absolute',
          bottom: 20,
          fontFamily: 'Cinzel, serif',
          fontSize: 10,
          letterSpacing: '0.2em',
          color: 'rgba(212,175,55,0.2)',
          textTransform: 'uppercase',
        }}
      >
        ✦ &nbsp; Influence is Everything &nbsp; ✦
      </motion.div>
    </motion.div>
  );
}
