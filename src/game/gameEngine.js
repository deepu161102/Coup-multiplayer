import { createDeck, drawFromDeck, returnToDeck } from './deck';
import { ACTION_INFO, TURN_PHASES, ACTIONS } from './constants';

export function initializeGame(playerConfigs) {
  let deck = createDeck();
  const players = playerConfigs.map(({ name, isComputer = false }, id) => {
    const { drawn, remaining } = drawFromDeck(deck, 2);
    deck = remaining;
    return {
      id,
      name,
      isComputer,
      coins: 2,
      cards: drawn.map(character => ({ character, revealed: false })),
      isAlive: true,
    };
  });

  return {
    players,
    deck,
    currentPlayerIndex: 0,
    turnPhase: TURN_PHASES.PASS_DEVICE,
    pendingAction: null,
    pendingBlock: null,
    pendingChallenge: null,
    responderQueue: [],
    loseInfluenceQueue: [],
    afterLoseInfluence: null,
    exchangeCards: [],
    log: [`The game has begun. ${players[0].name} goes first.`],
    winner: null,
    animatingAction: null,
  };
}

export function getAlivePlayers(players) {
  return players.filter(p => p.isAlive);
}

export function getNextAlivePlayerIndex(players, currentIndex) {
  const total = players.length;
  let next = (currentIndex + 1) % total;
  let attempts = 0;
  while (!players[next].isAlive && attempts < total) {
    next = (next + 1) % total;
    attempts++;
  }
  return next;
}

export function getOpponentIdsInOrder(players, currentPlayerIndex) {
  const ids = [];
  const total = players.length;
  let idx = (currentPlayerIndex + 1) % total;
  let attempts = 0;
  while (idx !== currentPlayerIndex && attempts < total) {
    if (players[idx].isAlive) ids.push(players[idx].id);
    idx = (idx + 1) % total;
    attempts++;
  }
  return ids;
}

export function hasCharacter(player, character) {
  return player.cards.some(c => c.character === character && !c.revealed);
}

export function checkWinner(players) {
  const alive = players.filter(p => p.isAlive);
  return alive.length === 1 ? alive[0] : null;
}

export function canBlock(actionInfo, responderId, actingPlayerId, targetPlayerId) {
  if (!actionInfo.blockable) return false;
  if (actionInfo.blockableByAnyone) return true;
  if (actionInfo.blockableByTarget && responderId === targetPlayerId) return true;
  return false;
}

export function getAvailableBlockCharacters(actionInfo) {
  return actionInfo.blockedBy;
}

export function resolveActionEffect(state, actionType) {
  const { players, pendingAction, deck } = state;
  const actingPlayer = players[pendingAction.actingPlayerId];
  const info = ACTION_INFO[actionType];
  let newPlayers = [...players];
  let newDeck = [...deck];
  let newLog = [...state.log];
  let newLoseInfluenceQueue = [];
  let newExchangeCards = [];
  let afterLoseInfluence = 'end_turn';

  switch (actionType) {
    case ACTIONS.INCOME:
      newPlayers = newPlayers.map(p =>
        p.id === actingPlayer.id ? { ...p, coins: p.coins + 1 } : p
      );
      newLog.push(`${actingPlayer.name} takes 1 coin (Income).`);
      break;

    case ACTIONS.FOREIGN_AID:
      newPlayers = newPlayers.map(p =>
        p.id === actingPlayer.id ? { ...p, coins: p.coins + 2 } : p
      );
      newLog.push(`${actingPlayer.name} takes 2 coins (Foreign Aid).`);
      break;

    case ACTIONS.COUP: {
      const target = players[pendingAction.targetPlayerId];
      newLog.push(`${actingPlayer.name} launches a Coup against ${target.name}!`);
      newLoseInfluenceQueue = [pendingAction.targetPlayerId];
      afterLoseInfluence = 'end_turn';
      break;
    }

    case ACTIONS.TAXES:
      newPlayers = newPlayers.map(p =>
        p.id === actingPlayer.id ? { ...p, coins: p.coins + 3 } : p
      );
      newLog.push(`${actingPlayer.name} collects 3 coins as Taxes (Duke).`);
      break;

    case ACTIONS.ASSASSINATE: {
      const target = players[pendingAction.targetPlayerId];
      newLog.push(`${actingPlayer.name}'s assassination of ${target.name} succeeds!`);
      newLoseInfluenceQueue = [pendingAction.targetPlayerId];
      afterLoseInfluence = 'end_turn';
      break;
    }

    case ACTIONS.STEAL: {
      const target = players[pendingAction.targetPlayerId];
      const stolen = Math.min(2, target.coins);
      newPlayers = newPlayers.map(p => {
        if (p.id === actingPlayer.id) return { ...p, coins: p.coins + stolen };
        if (p.id === target.id) return { ...p, coins: p.coins - stolen };
        return p;
      });
      newLog.push(`${actingPlayer.name} steals ${stolen} coin(s) from ${target.name}!`);
      break;
    }

    case ACTIONS.EXCHANGE: {
      const { drawn, remaining } = drawFromDeck(newDeck, 2);
      newDeck = remaining;
      newExchangeCards = drawn;
      newLog.push(`${actingPlayer.name} draws cards from the Court deck to exchange.`);
      return {
        ...state,
        players: newPlayers,
        deck: newDeck,
        log: newLog,
        exchangeCards: newExchangeCards,
        turnPhase: TURN_PHASES.EXCHANGE_SELECT,
        loseInfluenceQueue: [],
        afterLoseInfluence: null,
      };
    }

    default:
      break;
  }

  if (newLoseInfluenceQueue.length > 0) {
    return {
      ...state,
      players: newPlayers,
      deck: newDeck,
      log: newLog,
      loseInfluenceQueue: newLoseInfluenceQueue,
      afterLoseInfluence,
      turnPhase: TURN_PHASES.LOSE_INFLUENCE,
    };
  }

  return advanceToNextTurn({
    ...state,
    players: newPlayers,
    deck: newDeck,
    log: newLog,
  });
}

export function advanceToNextTurn(state) {
  const winner = checkWinner(state.players);
  if (winner) {
    return {
      ...state,
      turnPhase: TURN_PHASES.GAME_OVER,
      winner,
      log: [...state.log, `🏆 ${winner.name} wins the game!`],
    };
  }

  const nextIndex = getNextAlivePlayerIndex(state.players, state.currentPlayerIndex);
  const nextPlayer = state.players[nextIndex];
  const mustCoup = nextPlayer.coins >= 10;

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnPhase: mustCoup ? TURN_PHASES.TARGETING : TURN_PHASES.ACTION,
    pendingAction: mustCoup
      ? { type: ACTIONS.COUP, actingPlayerId: nextPlayer.id, targetPlayerId: null, coinsSpent: 0 }
      : null,
    pendingBlock: null,
    pendingChallenge: null,
    responderQueue: [],
    loseInfluenceQueue: [],
    afterLoseInfluence: null,
    exchangeCards: [],
    animatingAction: null,
    log: [
      ...state.log,
      mustCoup
        ? `It is now ${nextPlayer.name}'s turn. They have 10+ coins and MUST perform a Coup!`
        : `It is now ${nextPlayer.name}'s turn.`,
    ],
  };
}
