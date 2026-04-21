import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  initializeGame,
  canBlock,
  getOpponentIdsInOrder,
  resolveActionEffect,
  advanceToNextTurn,
  checkWinner,
} from '../game/gameEngine';
import { ACTION_INFO, TURN_PHASES, ACTIONS } from '../game/constants';
import { returnToDeck as deckReturnToDeck } from '../game/deck';
import {
  aiChooseAction,
  aiChooseTarget,
  aiDecideResponse,
  aiDecideBlockResponse,
  aiChooseCardToReveal,
  aiChooseCardToLose,
  aiChooseExchangeCards,
} from '../game/aiPlayer';

const GameContext = createContext(null);

const initialState = {
  screen: 'welcome',
  game: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'GO_TO_SETUP':
      return { ...state, screen: 'setup' };

    case 'GO_TO_WELCOME':
      return { ...state, screen: 'welcome', game: null };

    case 'START_GAME': {
      const game = initializeGame(action.playerConfigs);
      return { screen: 'game', game };
    }

    case 'DISMISS_PASS_DEVICE': {
      const g = state.game;
      const currentPlayer = g.players[g.currentPlayerIndex];
      const mustCoup = currentPlayer.coins >= 10;
      return {
        ...state,
        game: {
          ...g,
          turnPhase: mustCoup ? TURN_PHASES.TARGETING : TURN_PHASES.ACTION,
          pendingAction: mustCoup
            ? { type: ACTIONS.COUP, actingPlayerId: currentPlayer.id, targetPlayerId: null, coinsSpent: 0 }
            : null,
          log: mustCoup
            ? [...g.log, `${currentPlayer.name} has 10+ coins and MUST perform a Coup!`]
            : g.log,
        },
      };
    }

    case 'SELECT_ACTION': {
      const g = state.game;
      const { actionType } = action;
      const info = ACTION_INFO[actionType];
      const actingPlayer = g.players[g.currentPlayerIndex];
      const coinsSpent = info.cost;

      let newPlayers = g.players.map(p =>
        p.id === actingPlayer.id ? { ...p, coins: p.coins - coinsSpent } : p
      );

      const pendingAction = {
        type: actionType,
        actingPlayerId: actingPlayer.id,
        targetPlayerId: null,
        coinsSpent,
      };

      const newLog = [...g.log, `${actingPlayer.name} declares: "${info.name}".`];

      if (info.requiresTarget) {
        return {
          ...state,
          game: {
            ...g,
            players: newPlayers,
            pendingAction,
            turnPhase: TURN_PHASES.TARGETING,
            log: newLog,
          },
        };
      }

      if (!info.challengeable && !info.blockable) {
        return {
          ...state,
          game: resolveActionEffect(
            { ...g, players: newPlayers, pendingAction, log: newLog },
            actionType
          ),
        };
      }

      const responderQueue = getOpponentIdsInOrder(newPlayers, g.currentPlayerIndex);
      return {
        ...state,
        game: {
          ...g,
          players: newPlayers,
          pendingAction,
          responderQueue,
          turnPhase: TURN_PHASES.RESPONSE,
          log: newLog,
        },
      };
    }

    case 'SELECT_TARGET': {
      const g = state.game;
      const { targetId } = action;
      const info = ACTION_INFO[g.pendingAction.type];
      const actingPlayer = g.players[g.pendingAction.actingPlayerId];
      const targetPlayer = g.players[targetId];
      const updatedPending = { ...g.pendingAction, targetPlayerId: targetId };
      const newLog = [...g.log, `${actingPlayer.name} targets ${targetPlayer.name}.`];

      if (!info.challengeable && !info.blockable) {
        return {
          ...state,
          game: resolveActionEffect(
            { ...g, pendingAction: updatedPending, log: newLog },
            g.pendingAction.type
          ),
        };
      }

      const responderQueue = getOpponentIdsInOrder(g.players, g.currentPlayerIndex);
      return {
        ...state,
        game: {
          ...g,
          pendingAction: updatedPending,
          responderQueue,
          turnPhase: TURN_PHASES.RESPONSE,
          log: newLog,
        },
      };
    }

    case 'PASS_RESPONSE': {
      const g = state.game;
      const [, ...remainingQueue] = g.responderQueue;

      if (remainingQueue.length === 0) {
        return {
          ...state,
          game: resolveActionEffect(
            { ...g, responderQueue: [] },
            g.pendingAction.type
          ),
        };
      }

      return {
        ...state,
        game: { ...g, responderQueue: remainingQueue },
      };
    }

    case 'BLOCK_ACTION': {
      const g = state.game;
      const { blockingCharacter, blockingPlayerId } = action;
      const blocker = g.players[blockingPlayerId];
      const actingPlayer = g.players[g.pendingAction.actingPlayerId];
      const newLog = [
        ...g.log,
        `${blocker.name} claims to be the ${blockingCharacter} and blocks ${actingPlayer.name}'s action!`,
      ];
      return {
        ...state,
        game: {
          ...g,
          pendingBlock: { blockingPlayerId, blockingCharacter },
          turnPhase: TURN_PHASES.BLOCK_RESPONSE,
          responderQueue: [],
          log: newLog,
        },
      };
    }

    case 'CHALLENGE_ACTION': {
      const g = state.game;
      const { challengingPlayerId } = action;
      const challenger = g.players[challengingPlayerId];
      const actingPlayer = g.players[g.pendingAction.actingPlayerId];
      const newLog = [
        ...g.log,
        `${challenger.name} challenges ${actingPlayer.name}'s claim!`,
      ];
      return {
        ...state,
        game: {
          ...g,
          pendingChallenge: {
            challengingPlayerId,
            challengedPlayerId: g.pendingAction.actingPlayerId,
            challengedCharacter: g.pendingAction.type ? ACTION_INFO[g.pendingAction.type].requiredCharacter : null,
            challengeType: 'action',
          },
          turnPhase: TURN_PHASES.REVEAL_FOR_CHALLENGE,
          responderQueue: g.responderQueue.filter(id => id !== challengingPlayerId),
          log: newLog,
        },
      };
    }

    case 'ACCEPT_BLOCK': {
      const g = state.game;
      const blocker = g.players[g.pendingBlock.blockingPlayerId];
      const newLog = [...g.log, `${g.players[g.pendingAction.actingPlayerId].name} accepts the block. Action cancelled.`];

      if (g.pendingAction.coinsSpent > 0) {
        // Refund assassination coins since action was blocked
        // Per official rules, coins are NOT refunded. Keep spent.
      }

      return {
        ...state,
        game: advanceToNextTurn({ ...g, log: newLog }),
      };
    }

    case 'CHALLENGE_BLOCK': {
      const g = state.game;
      const actingPlayer = g.players[g.pendingAction.actingPlayerId];
      const blocker = g.players[g.pendingBlock.blockingPlayerId];
      const newLog = [
        ...g.log,
        `${actingPlayer.name} challenges ${blocker.name}'s block!`,
      ];
      return {
        ...state,
        game: {
          ...g,
          pendingChallenge: {
            challengingPlayerId: g.pendingAction.actingPlayerId,
            challengedPlayerId: g.pendingBlock.blockingPlayerId,
            challengedCharacter: g.pendingBlock.blockingCharacter,
            challengeType: 'block',
          },
          turnPhase: TURN_PHASES.REVEAL_FOR_CHALLENGE,
          log: newLog,
        },
      };
    }

    case 'REVEAL_CARD_FOR_CHALLENGE': {
      const g = state.game;
      const { cardIndex } = action;
      const { challengedPlayerId, challengingPlayerId, challengedCharacter, challengeType } = g.pendingChallenge;
      const challengedPlayer = g.players[challengedPlayerId];
      const challengingPlayer = g.players[challengingPlayerId];
      const revealedCard = challengedPlayer.cards[cardIndex];
      const hasIt = revealedCard.character === challengedCharacter && !revealedCard.revealed;

      let newPlayers = [...g.players];
      let newDeck = [...g.deck];
      let newLog = [...g.log];
      let newLoseInfluenceQueue = [];
      let afterLoseInfluence = 'end_turn';

      if (hasIt) {
        // Challenged player WINS: return card to deck, draw new one
        newDeck = deckReturnToDeck(newDeck, [revealedCard.character]);
        const { drawn, remaining } = { drawn: [newDeck[0]], remaining: newDeck.slice(1) };
        newDeck = remaining;

        newPlayers = newPlayers.map(p => {
          if (p.id !== challengedPlayerId) return p;
          const updatedCards = p.cards.map((c, i) =>
            i === cardIndex ? { character: drawn[0], revealed: false } : c
          );
          return { ...p, cards: updatedCards };
        });

        newLog.push(`${challengedPlayer.name} reveals the ${challengedCharacter} — the challenge fails! ${challengingPlayer.name} loses influence.`);
        newLoseInfluenceQueue = [challengingPlayerId];

        if (challengeType === 'block') {
          afterLoseInfluence = 'end_turn';
        } else {
          // Challenger loses influence, then action proceeds through remaining responders or resolves
          const remainingResponders = g.responderQueue.filter(id => id !== challengingPlayerId);
          if (remainingResponders.length > 0) {
            afterLoseInfluence = 'continue_response';
          } else {
            afterLoseInfluence = 'proceed_action';
          }
        }
      } else {
        // Challenged player LOSES
        newPlayers = newPlayers.map(p => {
          if (p.id !== challengedPlayerId) return p;
          const updatedCards = p.cards.map((c, i) =>
            i === cardIndex ? { ...c, revealed: true } : c
          );
          const isAlive = updatedCards.some(c => !c.revealed);
          return { ...p, cards: updatedCards, isAlive };
        });

        newLog.push(`${challengedPlayer.name} cannot reveal the ${challengedCharacter} — the challenge succeeds! ${challengedPlayer.name} loses influence.`);

        if (challengeType === 'action') {
          afterLoseInfluence = 'fail_action';
        } else {
          // Block challenge: block fails, action proceeds
          afterLoseInfluence = 'proceed_action_after_block_fail';
        }
        newLoseInfluenceQueue = [];
      }

      let newState = {
        ...g,
        players: newPlayers,
        deck: newDeck,
        log: newLog,
        loseInfluenceQueue: newLoseInfluenceQueue,
        afterLoseInfluence,
        pendingChallenge: null,
      };

      const winner = checkWinner(newPlayers);
      if (winner) {
        return {
          ...state,
          game: {
            ...newState,
            turnPhase: TURN_PHASES.GAME_OVER,
            winner,
            log: [...newLog, `🏆 ${winner.name} wins the game!`],
          },
        };
      }

      if (!hasIt) {
        // Challenged player already had their card revealed inline
        if (afterLoseInfluence === 'fail_action') {
          return { ...state, game: advanceToNextTurn({ ...newState, loseInfluenceQueue: [] }) };
        } else if (afterLoseInfluence === 'proceed_action_after_block_fail') {
          return {
            ...state,
            game: resolveActionEffect({ ...newState, loseInfluenceQueue: [] }, g.pendingAction.type),
          };
        }
      }

      if (newLoseInfluenceQueue.length > 0) {
        return {
          ...state,
          game: { ...newState, turnPhase: TURN_PHASES.LOSE_INFLUENCE },
        };
      }

      // After challenge won, proceed or continue
      if (afterLoseInfluence === 'proceed_action') {
        return {
          ...state,
          game: resolveActionEffect({ ...newState, loseInfluenceQueue: [] }, g.pendingAction.type),
        };
      }
      if (afterLoseInfluence === 'continue_response') {
        const remainingResponders = g.responderQueue.filter(id => id !== challengingPlayerId);
        return {
          ...state,
          game: {
            ...newState,
            responderQueue: remainingResponders,
            turnPhase: TURN_PHASES.RESPONSE,
            loseInfluenceQueue: [],
          },
        };
      }
      return { ...state, game: advanceToNextTurn({ ...newState, loseInfluenceQueue: [] }) };
    }

    case 'LOSE_INFLUENCE_CARD': {
      const g = state.game;
      const { playerId, cardIndex } = action;

      let newPlayers = g.players.map(p => {
        if (p.id !== playerId) return p;
        const updatedCards = p.cards.map((c, i) =>
          i === cardIndex ? { ...c, revealed: true } : c
        );
        const isAlive = updatedCards.some(c => !c.revealed);
        return { ...p, cards: updatedCards, isAlive };
      });

      const losingPlayer = newPlayers.find(p => p.id === playerId);
      const newLog = [
        ...g.log,
        `${losingPlayer.name} reveals the ${losingPlayer.cards[cardIndex].character} and loses influence${losingPlayer.isAlive ? '.' : ' — and is eliminated!'}`,
      ];

      const winner = checkWinner(newPlayers);
      if (winner) {
        return {
          ...state,
          game: {
            ...g,
            players: newPlayers,
            turnPhase: TURN_PHASES.GAME_OVER,
            winner,
            log: [...newLog, `🏆 ${winner.name} wins the game!`],
          },
        };
      }

      const remainingQueue = g.loseInfluenceQueue.slice(1);

      if (remainingQueue.length > 0) {
        return {
          ...state,
          game: {
            ...g,
            players: newPlayers,
            loseInfluenceQueue: remainingQueue,
            log: newLog,
          },
        };
      }

      const { afterLoseInfluence } = g;
      let baseState = { ...g, players: newPlayers, loseInfluenceQueue: [], afterLoseInfluence: null, log: newLog };

      if (afterLoseInfluence === 'proceed_action') {
        return { ...state, game: resolveActionEffect(baseState, g.pendingAction.type) };
      }
      if (afterLoseInfluence === 'continue_response') {
        return {
          ...state,
          game: { ...baseState, turnPhase: TURN_PHASES.RESPONSE },
        };
      }
      return { ...state, game: advanceToNextTurn(baseState) };
    }

    case 'COMPLETE_EXCHANGE': {
      const g = state.game;
      const { cardsToReturn } = action;
      const actingPlayer = g.players[g.pendingAction.actingPlayerId];
      const allCards = [
        ...actingPlayer.cards.filter(c => !c.revealed).map(c => c.character),
        ...g.exchangeCards,
      ];
      const cardsToKeep = [...allCards];
      cardsToReturn.forEach(char => {
        const idx = cardsToKeep.indexOf(char);
        if (idx !== -1) cardsToKeep.splice(idx, 1);
      });

      const newDeck = deckReturnToDeck(g.deck, cardsToReturn);
      const newPlayers = g.players.map(p => {
        if (p.id !== actingPlayer.id) return p;
        const revealedCards = p.cards.filter(c => c.revealed);
        const newCards = [
          ...cardsToKeep.map(char => ({ character: char, revealed: false })),
          ...revealedCards,
        ];
        return { ...p, cards: newCards };
      });

      const newLog = [...g.log, `${actingPlayer.name} completes the Exchange.`];
      return {
        ...state,
        game: advanceToNextTurn({ ...g, players: newPlayers, deck: newDeck, log: newLog, exchangeCards: [] }),
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // AI automation: fire whenever the turn phase or acting player changes
  useEffect(() => {
    const g = state.game;
    if (!g || g.winner || g.turnPhase === TURN_PHASES.GAME_OVER) return;

    const currentPlayer = g.players[g.currentPlayerIndex];
    let aiAction = null;
    let delay = 900;

    switch (g.turnPhase) {
      case TURN_PHASES.PASS_DEVICE:
        if (currentPlayer.isComputer) {
          delay = 500;
          aiAction = () => dispatch({ type: 'DISMISS_PASS_DEVICE' });
        }
        break;

      case TURN_PHASES.ACTION:
        if (currentPlayer.isComputer) {
          delay = 1000;
          aiAction = () => {
            const alivePlayers = g.players.filter(p => p.isAlive);
            const actionType = aiChooseAction(currentPlayer, alivePlayers);
            dispatch({ type: 'SELECT_ACTION', actionType });
          };
        }
        break;

      case TURN_PHASES.TARGETING:
        if (currentPlayer.isComputer) {
          delay = 700;
          aiAction = () => {
            const alivePlayers = g.players.filter(p => p.isAlive);
            const targetId = aiChooseTarget(currentPlayer, alivePlayers);
            if (targetId !== null) dispatch({ type: 'SELECT_TARGET', targetId });
          };
        }
        break;

      case TURN_PHASES.RESPONSE:
        if (g.responderQueue.length > 0) {
          const responder = g.players[g.responderQueue[0]];
          if (responder.isComputer) {
            delay = 1100;
            aiAction = () => {
              const actionInfo = ACTION_INFO[g.pendingAction.type];
              const result = aiDecideResponse(responder, g.pendingAction, actionInfo, g.players);
              if (result.decision === 'block') {
                dispatch({ type: 'BLOCK_ACTION', blockingPlayerId: responder.id, blockingCharacter: result.blockChar });
              } else if (result.decision === 'challenge') {
                dispatch({ type: 'CHALLENGE_ACTION', challengingPlayerId: responder.id });
              } else {
                dispatch({ type: 'PASS_RESPONSE' });
              }
            };
          }
        }
        break;

      case TURN_PHASES.BLOCK_RESPONSE: {
        const actingPlayer = g.players[g.pendingAction.actingPlayerId];
        if (actingPlayer.isComputer) {
          delay = 1000;
          aiAction = () => {
            const result = aiDecideBlockResponse();
            dispatch({ type: result.decision === 'challenge' ? 'CHALLENGE_BLOCK' : 'ACCEPT_BLOCK' });
          };
        }
        break;
      }

      case TURN_PHASES.REVEAL_FOR_CHALLENGE:
        if (g.pendingChallenge) {
          const challenged = g.players[g.pendingChallenge.challengedPlayerId];
          if (challenged.isComputer) {
            delay = 900;
            aiAction = () => {
              const cardIndex = aiChooseCardToReveal(challenged, g.pendingChallenge.challengedCharacter);
              dispatch({ type: 'REVEAL_CARD_FOR_CHALLENGE', cardIndex });
            };
          }
        }
        break;

      case TURN_PHASES.LOSE_INFLUENCE:
        if (g.loseInfluenceQueue.length > 0) {
          const losingPlayer = g.players[g.loseInfluenceQueue[0]];
          if (losingPlayer.isComputer) {
            delay = 800;
            aiAction = () => {
              const cardIndex = aiChooseCardToLose(losingPlayer);
              dispatch({ type: 'LOSE_INFLUENCE_CARD', playerId: losingPlayer.id, cardIndex });
            };
          }
        }
        break;

      case TURN_PHASES.EXCHANGE_SELECT:
        if (currentPlayer.isComputer) {
          delay = 900;
          aiAction = () => {
            const cardsToReturn = aiChooseExchangeCards(currentPlayer, g.exchangeCards);
            dispatch({ type: 'COMPLETE_EXCHANGE', cardsToReturn });
          };
        }
        break;

      default:
        break;
    }

    if (aiAction) {
      const timer = setTimeout(aiAction, delay);
      return () => clearTimeout(timer);
    }
  }, [
    state.game?.turnPhase,
    state.game?.currentPlayerIndex,
    state.game?.responderQueue?.[0],
    state.game?.loseInfluenceQueue?.[0],
    state.game?.pendingChallenge?.challengedPlayerId,
  ]);

  const actions = {
    goToSetup: () => dispatch({ type: 'GO_TO_SETUP' }),
    goToWelcome: () => dispatch({ type: 'GO_TO_WELCOME' }),
    startGame: (playerConfigs) => dispatch({ type: 'START_GAME', playerConfigs }),
    dismissPassDevice: () => dispatch({ type: 'DISMISS_PASS_DEVICE' }),
    selectAction: (actionType) => dispatch({ type: 'SELECT_ACTION', actionType }),
    selectTarget: (targetId) => dispatch({ type: 'SELECT_TARGET', targetId }),
    passResponse: () => dispatch({ type: 'PASS_RESPONSE' }),
    blockAction: (blockingPlayerId, blockingCharacter) =>
      dispatch({ type: 'BLOCK_ACTION', blockingPlayerId, blockingCharacter }),
    challengeAction: (challengingPlayerId) =>
      dispatch({ type: 'CHALLENGE_ACTION', challengingPlayerId }),
    acceptBlock: () => dispatch({ type: 'ACCEPT_BLOCK' }),
    challengeBlock: () => dispatch({ type: 'CHALLENGE_BLOCK' }),
    revealCardForChallenge: (cardIndex) =>
      dispatch({ type: 'REVEAL_CARD_FOR_CHALLENGE', cardIndex }),
    loseInfluenceCard: (playerId, cardIndex) =>
      dispatch({ type: 'LOSE_INFLUENCE_CARD', playerId, cardIndex }),
    completeExchange: (cardsToReturn) =>
      dispatch({ type: 'COMPLETE_EXCHANGE', cardsToReturn }),
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
