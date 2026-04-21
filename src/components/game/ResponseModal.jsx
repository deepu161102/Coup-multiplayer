import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { ACTION_INFO, CHARACTER_INFO, TURN_PHASES } from '../../game/constants';
import { canBlock } from '../../game/gameEngine';
import CardFront from '../cards/CardFront';

export default function ResponseModal() {
  const { state, actions } = useGame();
  const { game } = state;
  const [selectedBlockChar, setSelectedBlockChar] = useState(null);

  if (!game) return null;

  const { turnPhase, pendingAction, responderQueue, pendingBlock, pendingChallenge, players } = game;

  const isResponse = turnPhase === TURN_PHASES.RESPONSE;
  const isBlockResponse = turnPhase === TURN_PHASES.BLOCK_RESPONSE;
  const isReveal = turnPhase === TURN_PHASES.REVEAL_FOR_CHALLENGE;

  if (!isResponse && !isBlockResponse && !isReveal) return null;

  const actionInfo = pendingAction ? ACTION_INFO[pendingAction.type] : null;
  const actingPlayer = pendingAction ? players[pendingAction.actingPlayerId] : null;
  const targetPlayer = pendingAction?.targetPlayerId != null ? players[pendingAction.targetPlayerId] : null;

  // Determine current responder
  let currentResponder = null;
  if (isResponse && responderQueue.length > 0) {
    currentResponder = players[responderQueue[0]];
  } else if (isBlockResponse) {
    currentResponder = actingPlayer;
  } else if (isReveal && pendingChallenge) {
    currentResponder = players[pendingChallenge.challengedPlayerId];
  }

  if (!currentResponder) return null;
  // Computer responders are handled automatically by the AI
  if (currentResponder.isComputer) return null;

  const canChallenge = isResponse && actionInfo?.challengeable;
  const canBlockAction = isResponse && actionInfo && canBlock(
    actionInfo,
    currentResponder.id,
    pendingAction?.actingPlayerId,
    pendingAction?.targetPlayerId
  );

  const handleBlock = () => {
    if (!selectedBlockChar && actionInfo?.blockedBy?.length > 1) return;
    const charToUse = selectedBlockChar || actionInfo?.blockedBy?.[0];
    actions.blockAction(currentResponder.id, charToUse);
    setSelectedBlockChar(null);
  };

  const handleChallenge = () => {
    if (isResponse) actions.challengeAction(currentResponder.id);
    if (isBlockResponse) actions.challengeBlock();
  };

  const handlePass = () => {
    setSelectedBlockChar(null);
    if (isResponse) actions.passResponse();
    if (isBlockResponse) actions.acceptBlock();
  };

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
        initial={{ y: 40, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        style={{
          background: 'linear-gradient(160deg, #12091f 0%, #0e0618 50%, #09050f 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 4,
          padding: '28px 32px',
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 0 80px rgba(212,175,55,0.08), 0 32px 64px rgba(0,0,0,0.9)',
        }}
      >
        {/* ── RESPONSE PHASE ── */}
        {isResponse && (
          <>
            {/* Pass device label */}
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 10,
              letterSpacing: '0.3em',
              color: 'rgba(212,175,55,0.4)',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              ✦ &nbsp; Pass to {currentResponder.name} &nbsp; ✦
            </div>

            {/* Action declaration */}
            <div style={{
              background: 'rgba(212,175,55,0.05)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 2,
              padding: '12px 16px',
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: 14,
                color: 'rgba(245,237,216,0.7)',
                marginBottom: 6,
                fontStyle: 'italic',
              }}>
                {actingPlayer?.name} declares:
              </div>
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 16,
                color: actionInfo ? (CHARACTER_INFO[actionInfo.requiredCharacter]?.color || '#D4AF37') : '#D4AF37',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}>
                {actionInfo?.name}
              </div>
              <div style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: 12,
                color: 'rgba(245,237,216,0.45)',
                marginTop: 4,
                fontStyle: 'italic',
              }}>
                {actionInfo?.description}
                {targetPlayer && ` → Targeting ${targetPlayer.name}`}
              </div>
            </div>

            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 12,
              letterSpacing: '0.08em',
              color: '#D4AF37',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {currentResponder.name}, what is your response?
            </div>

            {/* Block character selection */}
            {canBlockAction && actionInfo.blockedBy.length > 1 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  color: 'rgba(212,175,55,0.4)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  Block with which character?
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {actionInfo.blockedBy.map(char => {
                    const ci = CHARACTER_INFO[char];
                    return (
                      <button
                        key={char}
                        onClick={() => setSelectedBlockChar(char === selectedBlockChar ? null : char)}
                        style={{
                          padding: '6px 14px',
                          background: selectedBlockChar === char
                            ? `linear-gradient(135deg, ${ci.color}33, ${ci.color}22)`
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${selectedBlockChar === char ? ci.color : `${ci.color}44`}`,
                          borderRadius: 2,
                          color: ci.color,
                          fontFamily: 'Cinzel, serif',
                          fontSize: 11,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: selectedBlockChar === char ? `0 0 10px ${ci.color}33` : 'none',
                        }}
                      >
                        {ci.symbol} {char}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {canChallenge && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleChallenge}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #2a0008 0%, #6b0018 50%, #8B0000 100%)',
                    border: '1px solid rgba(196,30,58,0.5)',
                    borderRadius: 2,
                    color: '#FF6B8A',
                    fontFamily: 'Cinzel, serif',
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    boxShadow: '0 0 12px rgba(196,30,58,0.2)',
                    minWidth: 100,
                  }}
                >
                  ⚔ Challenge
                </motion.button>
              )}
              {canBlockAction && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBlock}
                  disabled={actionInfo.blockedBy.length > 1 && !selectedBlockChar}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #000e2a 0%, #1040a0 100%)',
                    border: '1px solid rgba(33,150,243,0.4)',
                    borderRadius: 2,
                    color: '#64B5F6',
                    fontFamily: 'Cinzel, serif',
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    cursor: actionInfo.blockedBy.length > 1 && !selectedBlockChar ? 'not-allowed' : 'pointer',
                    opacity: actionInfo.blockedBy.length > 1 && !selectedBlockChar ? 0.5 : 1,
                    textTransform: 'uppercase',
                    boxShadow: '0 0 12px rgba(33,150,243,0.15)',
                    minWidth: 100,
                  }}
                >
                  🛡 Block
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePass}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  color: 'rgba(245,237,216,0.5)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  minWidth: 80,
                }}
              >
                Pass
              </motion.button>
            </div>
          </>
        )}

        {/* ── BLOCK RESPONSE PHASE ── */}
        {isBlockResponse && pendingBlock && (
          <>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 10,
              letterSpacing: '0.3em',
              color: 'rgba(212,175,55,0.4)',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              ✦ &nbsp; Pass to {actingPlayer?.name} &nbsp; ✦
            </div>

            <motion.div
              animate={{ boxShadow: ['0 0 8px rgba(33,150,243,0.2)', '0 0 20px rgba(33,150,243,0.5)', '0 0 8px rgba(33,150,243,0.2)'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                background: 'rgba(33,150,243,0.05)',
                border: '1px solid rgba(33,150,243,0.25)',
                borderRadius: 2,
                padding: '12px 16px',
                marginBottom: 20,
              }}
            >
              <div style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: 14,
                color: 'rgba(245,237,216,0.7)',
                fontStyle: 'italic',
                marginBottom: 4,
              }}>
                {players[pendingBlock.blockingPlayerId]?.name} claims to be the{' '}
                <span style={{ color: CHARACTER_INFO[pendingBlock.blockingCharacter]?.color, fontStyle: 'normal' }}>
                  {pendingBlock.blockingCharacter}
                </span>{' '}
                and blocks your {actionInfo?.name}!
              </div>
            </motion.div>

            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 12,
              color: '#D4AF37',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {actingPlayer?.name}, how do you respond?
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleChallenge}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #2a0008 0%, #8B0000 100%)',
                  border: '1px solid rgba(196,30,58,0.5)',
                  borderRadius: 2,
                  color: '#FF6B8A',
                  fontFamily: 'Cinzel, serif',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                ⚔ Challenge Block
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePass}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  color: 'rgba(245,237,216,0.5)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: 12,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Accept Block
              </motion.button>
            </div>
          </>
        )}

        {/* ── REVEAL FOR CHALLENGE ── */}
        {isReveal && pendingChallenge && (
          <RevealForChallenge
            game={game}
            pendingChallenge={pendingChallenge}
            respondingPlayer={currentResponder}
            actions={actions}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function RevealForChallenge({ game, pendingChallenge, respondingPlayer, actions }) {
  const { players } = game;
  const challenger = players[pendingChallenge.challengingPlayerId];
  const { challengedCharacter } = pendingChallenge;
  const charInfo = CHARACTER_INFO[challengedCharacter];

  const unrevealed = respondingPlayer.cards
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => !c.revealed);

  return (
    <>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 10,
        letterSpacing: '0.3em',
        color: 'rgba(212,175,55,0.4)',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 16,
      }}>
        ✦ &nbsp; Pass to {respondingPlayer.name} &nbsp; ✦
      </div>

      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          background: `${charInfo?.color}11`,
          border: `1px solid ${charInfo?.color}33`,
          borderRadius: 2,
          padding: '12px 16px',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: 14,
          color: 'rgba(245,237,216,0.7)',
          fontStyle: 'italic',
        }}>
          {challenger.name} challenges your claim to be the{' '}
          <span style={{ color: charInfo?.color, fontStyle: 'normal', fontWeight: 600 }}>
            {challengedCharacter}
          </span>
          !
        </div>
      </motion.div>

      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 12,
        color: '#D4AF37',
        textAlign: 'center',
        marginBottom: 16,
      }}>
        Reveal a card to defend yourself
      </div>

      <div style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        {unrevealed.map((card) => (
          <motion.div
            key={card.index}
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => actions.revealCardForChallenge(card.index)}
            style={{ cursor: 'pointer' }}
          >
            <CardFront
              character={card.character}
              width={90}
              height={135}
              style={{
                boxShadow: `0 0 16px ${CHARACTER_INFO[card.character]?.color}44`,
                border: `2px solid ${CHARACTER_INFO[card.character]?.borderColor}`,
              }}
            />
          </motion.div>
        ))}
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: 12,
        color: 'rgba(245,237,216,0.3)',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        Tap a card to reveal it
      </div>
    </>
  );
}
