import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { TURN_PHASES, ACTION_INFO } from '../../game/constants';
import CardBack from '../cards/CardBack';

export default function TargetModal() {
  const { state, actions } = useGame();
  const { game } = state;

  if (!game || game.turnPhase !== TURN_PHASES.TARGETING) return null;

  const { pendingAction, players } = game;
  const actionInfo = pendingAction ? ACTION_INFO[pendingAction.type] : null;
  const actingPlayer = players[pendingAction.actingPlayerId];

  const validTargets = players.filter(
    p => p.isAlive && p.id !== actingPlayer.id
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ y: 30, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        style={{
          background: 'linear-gradient(160deg, #120a1e 0%, #0e0618 50%, #09050f 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 4,
          padding: '28px 32px',
          maxWidth: 480,
          width: '90%',
          boxShadow: '0 0 80px rgba(212,175,55,0.08), 0 32px 64px rgba(0,0,0,0.9)',
          textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'rgba(212,175,55,0.4)',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          ✦ &nbsp; Choose Your Target &nbsp; ✦
        </div>

        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 18,
          color: '#D4AF37',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}>
          {actionInfo?.name}
        </div>

        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 14,
          fontStyle: 'italic',
          color: 'rgba(245,237,216,0.5)',
          marginBottom: 24,
        }}>
          {actionInfo?.description}
        </div>

        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          {validTargets.map(target => (
            <motion.button
              key={target.id}
              whileHover={{ y: -8, scale: 1.05, boxShadow: '0 0 20px rgba(196,30,58,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => actions.selectTarget(target.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '16px',
                background: 'rgba(196,30,58,0.05)',
                border: '1px solid rgba(196,30,58,0.2)',
                borderRadius: 4,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease',
                minWidth: 90,
              }}
            >
              <CardBack width={60} height={90} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 12,
                  color: '#F5EDD8',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {target.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <div className="coin-icon" style={{ width: 10, height: 10 }} />
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 11,
                    color: '#D4AF37',
                    fontWeight: 700,
                  }}>
                    {target.coins}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'EB Garamond, serif',
                  fontSize: 10,
                  fontStyle: 'italic',
                  color: 'rgba(245,237,216,0.3)',
                }}>
                  {target.cards.filter(c => !c.revealed).length} influence
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            // Can't easily cancel since coins were already spent for assassinate
            // For now, just go back won't work cleanly - we just keep the modal
          }}
          style={{ opacity: 0.5 }}
        >
          Select a target above
        </button>
      </motion.div>
    </motion.div>
  );
}
