import { CHARACTERS } from './constants';

export function createDeck() {
  const deck = [];
  Object.values(CHARACTERS).forEach(character => {
    for (let i = 0; i < 3; i++) {
      deck.push(character);
    }
  });
  return shuffle(deck);
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawFromDeck(deck, count = 1) {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export function returnToDeck(deck, cards) {
  return shuffle([...deck, ...cards]);
}
