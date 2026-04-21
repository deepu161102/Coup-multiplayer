import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { ACTIONS, ACTION_INFO, CHARACTER_INFO } from '../../game/constants';

const ACTION_GROUPS = [
  {
    label: 'General Actions',
    actions: [ACTIONS.INCOME, ACTIONS.FOREIGN_AID, ACTIONS.COUP],
    color: 'rgba(212,175,55,0.15)',
  },
  {
    label: 'Character Actions',
    actions: [ACTIONS.TAXES, ACTIONS.ASSASSINATE, ACTIONS.STEAL, ACTIONS.EXCHANGE],
    color: 'rgba(123,47,190,0.1)',
  },
];

export default function ActionPanel() {
  const { state, actions } = useGame();
  const { game } = state;
  const [hoveredAction, setHoveredAction] = useState(null);

  if (!game) return null;
  const currentPlayer = game.players[game.currentPlayerIndex];
  const mustCoup = currentPlayer.coins >= 10;

  const canAfford = (action) => {
    const info = ACTION_INFO[action];
    return currentPlayer.coins >= info.cost;
  };

  const getCharacterColor = (action) => {
    const char = ACTION_INFO[action].requiredCharacter;
    return char ? CHARACTER_INFO[char].color : null;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      width: '100%',
      maxWidth: 340,
    }}>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 10,
        letterSpacing: '0.25em',
        color: 'rgba(212,175,55,0.45)',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 2,
      }}>
        ✦ &nbsp; Choose Your Action &nbsp; ✦
      </div>

      {ACTION_GROUPS.map((group, gi) => (
        <div key={gi}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'rgba(212,175,55,0.35)',
            textTransform: 'uppercase',
            marginBottom: 6,
            paddingLeft: 4,
          }}>
            {group.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {group.actions.map(actionType => {
              const info = ACTION_INFO[actionType];
              const affordable = canAfford(actionType);
              const disabled = !affordable || (mustCoup && actionType !== ACTIONS.COUP);
              const charColor = getCharacterColor(actionType);
              const isHovered = hoveredAction === actionType;

              return (
                <motion.button
                  key={actionType}
                  disabled={disabled}
                  onClick={() => !disabled && actions.selectAction(actionType)}
                  onHoverStart={() => setHoveredAction(actionType)}
                  onHoverEnd={() => setHoveredAction(null)}
                  whileHover={!disabled ? { x: 3, scale: 1.01 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 14px',
                    background: disabled
                      ? 'rgba(255,255,255,0.02)'
                      : isHovered
                        ? charColor
                          ? `linear-gradient(135deg, ${charColor}22, ${charColor}11)`
                          : 'rgba(212,175,55,0.08)'
                        : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${disabled
                      ? 'rgba(255,255,255,0.05)'
                      : isHovered
                        ? charColor || 'rgba(212,175,55,0.5)'
                        : charColor
                          ? `${charColor}44`
                          : 'rgba(212,175,55,0.2)'
                    }`,
                    borderRadius: 2,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    outline: 'none',
                    boxShadow: isHovered && !disabled
                      ? charColor
                        ? `0 0 12px ${charColor}33`
                        : '0 0 12px rgba(212,175,55,0.15)'
                      : 'none',
                  }}
                >
                  {/* Left accent */}
                  <div style={{
                    width: 3,
                    alignSelf: 'stretch',
                    background: charColor || '#D4AF37',
                    borderRadius: 2,
                    opacity: disabled ? 0.3 : 0.7,
                    flexShrink: 0,
                  }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}>
                      <div style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: 12,
                        letterSpacing: '0.06em',
                        color: disabled
                          ? 'rgba(245,237,216,0.3)'
                          : charColor || '#D4AF37',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {info.name}
                      </div>
                      {info.cost > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          flexShrink: 0,
                        }}>
                          <div className="coin-icon" style={{ width: 8, height: 8 }} />
                          <span style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: 10,
                            color: 'rgba(212,175,55,0.7)',
                            fontWeight: 700,
                          }}>
                            -{info.cost}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'EB Garamond, serif',
                      fontSize: 11,
                      color: 'rgba(245,237,216,0.4)',
                      fontStyle: 'italic',
                      marginTop: 1,
                      lineHeight: 1.3,
                    }}>
                      {info.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
