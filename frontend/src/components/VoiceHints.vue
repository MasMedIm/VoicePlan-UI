<!-- VoiceHints Component -->
<template>
  <div class="voice-hints" :class="{ visible: showHints, compact: isCompact }">
    <!-- Hints Header -->
    <div class="hints-header" @click="toggleHints">
      <div class="hints-title">
        <MessageCircle class="hints-icon" />
        <span>Voice Commands</span>
      </div>
      <button class="toggle-btn" :class="{ expanded: showHints }">
        <ChevronDown class="toggle-icon" />
      </button>
    </div>

    <!-- Hints Content -->
    <Transition name="hints-content">
      <div v-if="showHints" class="hints-content">
        <!-- Quick Commands -->
        <div class="hints-section">
          <h4 class="section-title">Quick Commands</h4>
          <div class="hints-grid">
            <div 
              v-for="hint in quickCommands" 
              :key="hint.id"
              class="hint-bubble"
              :class="hint.category"
              @click="speakHint(hint)"
            >
              <component :is="hint.icon" class="hint-icon" />
              <span class="hint-text">{{ hint.text }}</span>
              <div class="hint-example">{{ hint.example }}</div>
            </div>
          </div>
        </div>

        <!-- Card Commands -->
        <div class="hints-section">
          <h4 class="section-title">Create Cards</h4>
          <div class="hints-grid card-commands">
            <div 
              v-for="cardHint in cardCommands" 
              :key="cardHint.id"
              class="hint-bubble card-hint"
              @click="speakHint(cardHint)"
            >
              <component :is="cardHint.icon" class="hint-icon" />
              <span class="hint-text">{{ cardHint.text }}</span>
              <div class="hint-example">{{ cardHint.example }}</div>
            </div>
          </div>
        </div>

        <!-- Contextual Suggestions -->
        <div v-if="contextualHints.length" class="hints-section">
          <h4 class="section-title">Suggested for You</h4>
          <div class="contextual-hints">
            <div 
              v-for="suggestion in contextualHints" 
              :key="suggestion.id"
              class="hint-bubble contextual"
              @click="speakHint(suggestion)"
            >
              <Sparkles class="hint-icon" />
              <span class="hint-text">{{ suggestion.text }}</span>
              <div class="hint-reason">{{ suggestion.reason }}</div>
            </div>
          </div>
        </div>

        <!-- Tips Section -->
        <div class="hints-section tips-section">
          <h4 class="section-title">Pro Tips</h4>
          <div class="tips-list">
            <div v-for="tip in tips" :key="tip.id" class="tip-item">
              <Lightbulb class="tip-icon" />
              <span class="tip-text">{{ tip.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  MessageCircle, ChevronDown, Mic, Calendar, MapPin, 
  Target, Clock, CreditCard, CheckSquare, Image,
  Sparkles, Lightbulb, Plane, Hotel, Camera
} from 'lucide-vue-next';

const props = defineProps({
  voiceState: {
    type: String,
    default: 'idle'
  },
  existingCards: {
    type: Array,
    default: () => []
  },
  isCompact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['speak-hint']);

const showHints = ref(false);

// Quick action commands
const quickCommands = ref([
  {
    id: 'listen',
    text: 'Start Listening',
    example: 'Say "Start listening" or just click the mic',
    icon: Mic,
    category: 'control'
  },
  {
    id: 'clear',
    text: 'Clear Board',
    example: 'Say "Clear all cards" or "Start fresh"',
    icon: CheckSquare,
    category: 'control'
  }
]);

// Card creation commands
const cardCommands = ref([
  {
    id: 'basic',
    text: 'Basic Note',
    example: 'Create a note about my Paris trip',
    icon: MessageCircle,
    category: 'card'
  },
  {
    id: 'checklist',
    text: 'Packing List',
    example: 'Create a packing checklist for my vacation',
    icon: CheckSquare,
    category: 'card'
  },
  {
    id: 'countdown',
    text: 'Event Countdown',
    example: 'Create a countdown to my flight on December 25th',
    icon: Calendar,
    category: 'card'
  },
  {
    id: 'goal',
    text: 'Travel Goal',
    example: 'Track my goal to visit 10 countries this year',
    icon: Target,
    category: 'card'
  },
  {
    id: 'weather',
    text: 'Weather Info',
    example: 'Show me the weather for Tokyo next week',
    icon: Clock,
    category: 'card'
  },
  {
    id: 'budget',
    text: 'Budget Tracker',
    example: 'Track expenses for my Europe trip',
    icon: CreditCard,
    category: 'card'
  },
  {
    id: 'map',
    text: 'Location',
    example: 'Show me a map of Barcelona attractions',
    icon: MapPin,
    category: 'card'
  },
  {
    id: 'photo',
    text: 'Photo Memory',
    example: 'Add photos from my last trip to Italy',
    icon: Image,
    category: 'card'
  }
]);

// Contextual suggestions based on existing cards
const contextualHints = computed(() => {
  const suggestions = [];
  const cardTypes = props.existingCards.map(card => card.kind);

  // Smart suggestions based on what's already on the board
  if (cardTypes.includes('card.countdown')) {
    suggestions.push({
      id: 'packing',
      text: 'Create packing list',
      reason: 'Based on your upcoming event',
      category: 'contextual'
    });
  }

  if (cardTypes.includes('card.map')) {
    suggestions.push({
      id: 'weather-local',
      text: 'Check weather for this location',
      reason: 'Based on your destination',
      category: 'contextual'
    });
  }

  if (cardTypes.includes('card.checklist')) {
    suggestions.push({
      id: 'budget-tracking',
      text: 'Track your travel budget',
      reason: 'Complete your trip planning',
      category: 'contextual'
    });
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
});

// Helpful tips
const tips = ref([
  {
    id: 'natural',
    text: 'Speak naturally - no need for specific commands'
  },
  {
    id: 'specific',
    text: 'Be specific about dates, locations, and details'
  },
  {
    id: 'follow-up',
    text: 'Ask follow-up questions to refine your cards'
  },
  {
    id: 'organize',
    text: 'Cards automatically organize based on content'
  }
]);

function toggleHints() {
  showHints.value = !showHints.value;
}

function speakHint(hint) {
  emit('speak-hint', hint);
  // Optionally close hints after selection
  if (props.isCompact) {
    showHints.value = false;
  }
}

// Auto-show hints on first visit
onMounted(() => {
  const hasSeenHints = localStorage.getItem('hasSeenVoiceHints');
  if (!hasSeenHints) {
    setTimeout(() => {
      showHints.value = true;
      localStorage.setItem('hasSeenVoiceHints', 'true');
    }, 2000);
  }
});
</script>

<style scoped>
.voice-hints {
  position: fixed;
  top: 6rem;
  right: 1rem;
  width: 350px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1100;
  box-shadow: 
    0 20px 48px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.voice-hints.compact {
  width: 280px;
}

.hints-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hints-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.hints-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
  color: white;
}

.hints-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.toggle-btn.expanded {
  transform: rotate(180deg);
}

.toggle-icon {
  width: 1rem;
  height: 1rem;
  color: white;
}

.hints-content {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.hints-section {
  margin-bottom: 2rem;
}

.hints-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.hints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.card-commands {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.hint-bubble {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.hint-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hint-bubble:hover {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.hint-bubble:hover::before {
  opacity: 1;
}

.hint-bubble.control {
  border-color: rgba(59, 130, 246, 0.3);
}

.hint-bubble.card {
  border-color: rgba(16, 185, 129, 0.3);
}

.hint-bubble.contextual {
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.05);
}

.hint-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.hint-text {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
  margin-bottom: 0.375rem;
  position: relative;
  z-index: 1;
}

.hint-example {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
  position: relative;
  z-index: 1;
}

.hint-reason {
  font-size: 0.7rem;
  color: rgba(251, 191, 36, 0.8);
  font-style: italic;
  position: relative;
  z-index: 1;
}

.contextual-hints {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tips-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.tip-icon {
  width: 1rem;
  height: 1rem;
  color: #f59e0b;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.tip-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* Transitions */
.hints-content-enter-active,
.hints-content-leave-active {
  transition: all 0.4s ease;
}

.hints-content-enter-from,
.hints-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .voice-hints {
    position: fixed;
    top: auto;
    bottom: 6rem;
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: none;
  }
  
  .hints-content {
    max-height: 50vh;
    padding: 1rem;
  }
  
  .hints-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .hint-bubble {
    padding: 0.75rem;
  }
}

/* Dark mode adjustments */
.dark .voice-hints {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .hints-header:hover {
  background: rgba(255, 255, 255, 0.02);
}

.dark .tips-section {
  background: rgba(0, 0, 0, 0.3);
}

/* Scrollbar styling */
.hints-content::-webkit-scrollbar {
  width: 4px;
}

.hints-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.hints-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.hints-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>
