import { ACTIONS } from './constants';

function hasCharacter(player, character) {
  return player.cards.some(c => c.character === character && !c.revealed);
}

// Lower value = sacrifice/return first during decisions
const CHAR_VALUE = { Contessa: 1, Ambassador: 2, Captain: 3, Duke: 4, Assassin: 5 };

export function aiChooseAction(player, alivePlayers) {
  const { coins } = player;
  if (coins >= 10) return ACTIONS.COUP;
  if (coins >= 7) return ACTIONS.COUP;

  const targets = alivePlayers.filter(p => p.id !== player.id);
  const hasRichTarget = targets.some(p => p.coins > 0);

  if (coins >= 3 && hasCharacter(player, 'Assassin') && targets.length > 0) {
    return ACTIONS.ASSASSINATE;
  }
  if (hasCharacter(player, 'Duke')) return ACTIONS.TAXES;
  if (hasCharacter(player, 'Captain') && hasRichTarget && targets.length > 0) {
    return ACTIONS.STEAL;
  }

  // Bluff with some probability
  const r = Math.random();
  if (r < 0.35) return ACTIONS.TAXES;
  if (hasRichTarget && r < 0.55) return ACTIONS.STEAL;
  return ACTIONS.INCOME;
}

export function aiChooseTarget(player, alivePlayers) {
  const targets = alivePlayers.filter(p => p.id !== player.id && p.isAlive);
  if (targets.length === 0) return null;
  // Slightly prefer the human player as a target
  const humanTarget = targets.find(p => !p.isComputer);
  if (humanTarget && Math.random() < 0.55) return humanTarget.id;
  return [...targets].sort((a, b) => b.coins - a.coins)[0].id;
}

export function aiDecideResponse(responder, pendingAction, actionInfo, players) {
  const isTarget = responder.id === pendingAction.targetPlayerId;

  if (pendingAction.type === ACTIONS.FOREIGN_AID && actionInfo.blockableByAnyone) {
    if (hasCharacter(responder, 'Duke') || Math.random() < 0.45) {
      return { decision: 'block', blockChar: 'Duke' };
    }
  }

  if (pendingAction.type === ACTIONS.STEAL && isTarget && actionInfo.blockableByTarget) {
    if (hasCharacter(responder, 'Captain') || hasCharacter(responder, 'Ambassador') || Math.random() < 0.4) {
      const blockChar = hasCharacter(responder, 'Captain') ? 'Captain' : 'Ambassador';
      return { decision: 'block', blockChar };
    }
  }

  if (pendingAction.type === ACTIONS.ASSASSINATE && isTarget && actionInfo.blockableByTarget) {
    if (hasCharacter(responder, 'Contessa') || Math.random() < 0.45) {
      return { decision: 'block', blockChar: 'Contessa' };
    }
  }

  if (actionInfo.challengeable && Math.random() < 0.15) {
    return { decision: 'challenge' };
  }

  return { decision: 'pass' };
}

export function aiDecideBlockResponse() {
  return Math.random() < 0.28 ? { decision: 'challenge' } : { decision: 'accept' };
}

export function aiChooseCardToReveal(player, challengedCharacter) {
  const unrevealed = player.cards
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => !c.revealed);
  const match = unrevealed.find(c => c.character === challengedCharacter);
  if (match) return match.index;
  unrevealed.sort((a, b) => CHAR_VALUE[a.character] - CHAR_VALUE[b.character]);
  return unrevealed[0].index;
}

export function aiChooseCardToLose(player) {
  const unrevealed = player.cards
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => !c.revealed);
  unrevealed.sort((a, b) => CHAR_VALUE[a.character] - CHAR_VALUE[b.character]);
  return unrevealed[0].index;
}

export function aiChooseExchangeCards(actingPlayer, exchangeCards) {
  const unrevealed = actingPlayer.cards.filter(c => !c.revealed).map(c => c.character);
  const all = [...unrevealed, ...exchangeCards];
  return all
    .map((char, i) => ({ char, i, value: CHAR_VALUE[char] }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(r => r.char);
}
