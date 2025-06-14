import { reactive, computed } from 'vue';

// Generic UI store – can hold multiple component kinds.

const state = reactive({
  // flat array keeps ordering
  items: [], // { id, kind, props }
});

function upsert(kind, payload) {
  if (!payload.id) payload.id = `${kind}_${Date.now()}`;
  const idx = state.items.findIndex((i) => i.id === payload.id && i.kind === kind);
  if (idx === -1) {
    state.items.push({ id: payload.id, kind, props: { ...payload } });
  } else {
    state.items[idx].props = { ...state.items[idx].props, ...payload };
  }
}

export function handleUiEvent(type, payload) {
  if (!type) return;
  const parts = type.split('.'); // e.g. card, basic, create
  let baseKind;
  let action;

  if (parts.length === 2) {
    // Legacy format: "card.create" → treat as basic card
    baseKind = 'card.basic';
    action = parts[1];
  } else {
    baseKind = parts.slice(0, 2).join('.'); // card.basic
    action = parts[2];
  }

  if (action === 'create' || action === 'update') {
    upsert(baseKind, payload || {});
  }
}

export const items = computed(() => state.items);

export function useUiStore() {
  return { items, handleUiEvent };
}
