import { reactive, computed } from 'vue';

// ---------------------------------------------------------------------------
// Very small global store that keeps the client-side UI state emitted by the
// LLM (cards only for now).
// ---------------------------------------------------------------------------

const state = reactive({
  // Dictionary <cardId, cardData>
  cards: {},
});

/**
 * Apply a UI event to the local store.
 * @param {string} type - Event type (card.create | card.update).
 * @param {object} payload - Event payload (card fields).
 */
export function handleUiEvent(type, payload) {
  if (!payload || typeof payload !== 'object') return;

  if (type === 'card.create') {
    if (!payload.id) {
      // Fallback ID if the model forgot one
      payload.id = `card_${Date.now()}`;
    }
    state.cards[payload.id] = {
      id: payload.id,
      title: payload.title || '',
      description: payload.description || '',
      status: payload.status || '',
    };
  } else if (type === 'card.update') {
    const existing = state.cards[payload.id];
    if (!existing) return; // ignore unknown card
    Object.assign(existing, payload);
  }
}

export const cardList = computed(() => Object.values(state.cards));

export function useUiStore() {
  return { cardList, handleUiEvent };
}
