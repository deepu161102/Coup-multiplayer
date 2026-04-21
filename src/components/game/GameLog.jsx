import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

export default function GameLog() {
  const { state } = useGame();
  const { game } = state;
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game?.log]);

  if (!game) return null;

  const log = game.log;
  const recent = log.slice(-8);

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 9,
        letterSpacing: '0.2em',
        color: 'rgba(212,175,55,0.35)',
        textTransform: 'uppercase',
        paddingBottom: 6,
        borderBottom: '1px solid rgba(212,175,55,0.08)',
      }}>
        Court Record
      </div>

      <div
        ref={logRef}
        style={{
          maxHeight: 120,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {recent.map((entry, i) => {
          const isLatest = i === recent.length - 1;
          return (
            <motion.div
              key={`${i}-${entry}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: 11,
                fontStyle: 'italic',
                color: isLatest
                  ? 'rgba(245,237,216,0.75)'
                  : 'rgba(245,237,216,0.3)',
                lineHeight: 1.4,
                paddingLeft: 8,
                borderLeft: isLatest
                  ? '1px solid rgba(212,175,55,0.4)'
                  : '1px solid rgba(212,175,55,0.08)',
                transition: 'all 0.3s',
              }}
            >
              {entry}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
