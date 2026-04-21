import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { TURN_PHASES, ACTION_INFO } from '../../game/constants';
import OpponentSeat from './OpponentSeat';
import PlayerHand from './PlayerHand';
import ActionPanel from './ActionPanel';
import ResponseModal from './ResponseModal';
import LoseInfluenceModal from './LoseInfluenceModal';
import ExchangeModal from './ExchangeModal';
import PassDeviceScreen from './PassDeviceScreen';
import TargetModal from './TargetModal';
import WinnerScreen from './WinnerScreen';
import GameLog from './GameLog';

function getOpponentPositions(opponentCount) {
  switch (opponentCount) {
    case 1: return [{ top: '10%', left: '50%', transform: 'translateX(-50%)' }];
    case 2: return [
      { top: '8%', left: '30%', transform: 'translateX(-50%)' },
      { top: '8%', left: '70%', transform: 'translateX(-50%)' },
    ];
    case 3: return [
      { top: '8%', left: '20%', transform: 'translateX(-50%)' },
      { top: '8%', left: '50%', transform: 'translateX(-50%)' },
      { top: '8%', left: '80%', transform: 'translateX(-50%)' },
    ];
    case 4: return [
      { top: '18%', left: '6%', transform: 'translateY(-50%)' },
      { top: '6%', left: '30%', transform: 'translateX(-50%)' },
      { top: '6%', left: '70%', transform: 'translateX(-50%)' },
      { top: '18%', left: '94%', transform: 'translate(-100%, -50%)' },
    ];
    case 5: return [
      { top: '20%', left: '4%', transform: 'translateY(-50%)' },
      { top: '6%', left: '25%', transform: 'translateX(-50%)' },
      { top: '4%', left: '50%', transform: 'translateX(-50%)' },
      { top: '6%', left: '75%', transform: 'translateX(-50%)' },
      { top: '20%', left: '96%', transform: 'translate(-100%, -50%)' },
    ];
    default: return [];
  }
}

function CenterTable({ game }) {
  const currentPlayer = game.players[game.currentPlayerIndex];
  const phase = game.turnPhase;

  let centerText = '';
  let centerSub = '';

  if (phase === TURN_PHASES.ACTION) {
    centerText = `${currentPlayer.name}'s Turn`;
    centerSub = currentPlayer.isComputer
      ? 'Thinking...'
      : currentPlayer.coins >= 10
        ? 'Must perform a Coup'
        : 'Choose an action';
  } else if (phase === TURN_PHASES.TARGETING) {
    const actionInfo = game.pendingAction ? ACTION_INFO[game.pendingAction.type] : null;
    centerText = actionInfo?.name || 'Targeting';
    centerSub = 'Select a target';
  } else if (phase === TURN_PHASES.RESPONSE) {
    centerText = 'Awaiting Response';
    centerSub = `${game.players[game.responderQueue[0]]?.name || ''} responds`;
  } else if (phase === TURN_PHASES.BLOCK_RESPONSE) {
    centerText = 'Action Blocked';
    centerSub = `${game.players[game.pendingAction?.actingPlayerId]?.name || ''} responds`;
  } else if (phase === TURN_PHASES.REVEAL_FOR_CHALLENGE) {
    centerText = 'Challenge!';
    centerSub = 'Reveal a card to defend';
  } else if (phase === TURN_PHASES.LOSE_INFLUENCE) {
    centerText = 'Lose Influence';
    centerSub = 'Select a card to reveal';
  } else if (phase === TURN_PHASES.EXCHANGE_SELECT) {
    centerText = 'Exchange';
    centerSub = 'Select cards to return';
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      {/* Felt texture center emblem */}
      <div style={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        border: '1px solid rgba(212,175,55,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
      }}>
        <motion.div
          key={centerText}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: 11,
            letterSpacing: '0.05em',
            color: 'rgba(212,175,55,0.6)',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 130,
          }}
        >
          {centerText}
        </motion.div>
        <div style={{
          width: 40,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
        }} />
        <motion.div
          key={centerSub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: 10,
            fontStyle: 'italic',
            color: 'rgba(212,175,55,0.35)',
            maxWidth: 110,
          }}
        >
          {centerSub}
        </motion.div>
      </div>
    </div>
  );
}

export default function GameBoard() {
  const { state, actions } = useGame();
  const { game } = state;

  if (!game) return null;

  const currentPlayer = game.players[game.currentPlayerIndex];
  // Human player always stays at the bottom; computers are always opponents
  const humanPlayer = game.players.find(p => !p.isComputer) ?? game.players[0];
  const opponents = game.players.filter(p => p.id !== humanPlayer.id);
  const positions = getOpponentPositions(opponents.length);
  const isActionPhase = game.turnPhase === TURN_PHASES.ACTION;
  const isTargeting = game.turnPhase === TURN_PHASES.TARGETING;
  const isHumanTurn = !currentPlayer.isComputer;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, #1c1005 0%, #0f0a04 40%, #070502 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── ROOM AMBIENT LIGHT ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '40%',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── CASINO TABLE ── */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(85%, 900px)',
        height: '72%',
        borderRadius: '50%',
        background: [
          'radial-gradient(ellipse at 50% 40%, #1a6b40 0%, #0d4a25 40%, #083518 70%, #052412 100%)',
        ].join(','),
        border: '12px solid #2a1a08',
        boxShadow: [
          '0 0 0 3px #5a3a10',
          '0 0 0 6px #3a2008',
          '0 4px 60px rgba(0,0,0,0.8)',
          'inset 0 0 80px rgba(0,0,0,0.4)',
          'inset 0 0 20px rgba(212,175,55,0.03)',
        ].join(', '),
        zIndex: 1,
      }}>
        {/* Felt texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: [
            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)',
            'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)',
          ].join(', '),
          pointerEvents: 'none',
        }} />

        {/* Inner gold border ring */}
        <div style={{
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.12)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          inset: 12,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.06)',
          pointerEvents: 'none',
        }} />

        {/* Center emblem */}
        <CenterTable game={game} />
      </div>

      {/* ── TABLE EDGE GOLD TRIM ── */}
      <div style={{
        position: 'absolute',
        top: 'calc(8% - 2px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(87%, 920px)',
        height: 'calc(72% + 4px)',
        borderRadius: '50%',
        border: '2px solid rgba(212,175,55,0.2)',
        zIndex: 0,
        pointerEvents: 'none',
        boxShadow: '0 0 30px rgba(212,175,55,0.05)',
      }} />

      {/* ── OPPONENTS ── */}
      {opponents.map((opp, i) => {
        const pos = positions[i] || {};
        const size = opponents.length <= 2 ? 'large' : opponents.length <= 4 ? 'medium' : 'small';
        return (
          <div
            key={opp.id}
            style={{
              position: 'absolute',
              zIndex: 5,
              ...pos,
            }}
          >
            <OpponentSeat
              player={opp}
              isCurrentTurn={opp.id === currentPlayer.id}
              size={size}
            />
          </div>
        );
      })}

      {/* ── BOTTOM: CURRENT PLAYER AREA ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 20px 12px',
        gap: 16,
      }}>
        {/* Left: Game Log */}
        <div style={{
          width: 200,
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(212,175,55,0.1)',
          borderRadius: 2,
          padding: '10px 12px',
          backdropFilter: 'blur(8px)',
          flexShrink: 0,
          alignSelf: 'flex-start',
          maxHeight: 200,
          marginBottom: 8,
        }}>
          <GameLog />
        </div>

        {/* Center: Player hand */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          maxWidth: 480,
        }}>
          <PlayerHand
            player={humanPlayer}
            showCardFaces={true}
          />
        </div>

        {/* Right: Action panel — only shown on the human's turn */}
        {isActionPhase && isHumanTurn && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              width: 280,
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(212,175,55,0.12)',
              borderRadius: 2,
              padding: '12px 14px',
              backdropFilter: 'blur(12px)',
              flexShrink: 0,
              alignSelf: 'flex-end',
              marginBottom: 8,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <ActionPanel />
          </motion.div>
        )}

        {/* Right placeholder when no action panel */}
        {(!isActionPhase || !isHumanTurn) && <div style={{ width: 280, flexShrink: 0 }} />}
      </div>

      {/* ── DECK INDICATOR ── */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          right: '6%',
          transform: 'translateY(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div style={{ position: 'relative', width: 52, height: 78 }}>
          {[2, 1, 0].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * 2,
                top: i * 2,
                width: 44,
                height: 66,
                background: 'linear-gradient(160deg, #0a0618 0%, #0d0a20 100%)',
                border: '1px solid #3a2a6a',
                borderRadius: 5,
                boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
              }}
            />
          ))}
        </div>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'rgba(212,175,55,0.3)',
          textTransform: 'uppercase',
        }}>
          {game.deck.length} left
        </div>
      </motion.div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {game.turnPhase === TURN_PHASES.PASS_DEVICE && (
          <PassDeviceScreen key="pass" />
        )}
        {game.turnPhase === TURN_PHASES.TARGETING && isHumanTurn && (
          <TargetModal key="target" />
        )}
      </AnimatePresence>

      <ResponseModal />
      <LoseInfluenceModal />
      <ExchangeModal />
      <WinnerScreen />
    </motion.div>
  );
}
