<!-- VoiceHints Component -->
<template>
  <Transition name="hints-fade">
    <div v-if="showHints" class="voice-hints" :class="{ expanded: isExpanded }">
      <!-- Glassmorphism overlay -->
      <div class="glass-overlay"></div>
      
      <!-- Decorative elements -->
      <div class="decorative-circle circle-1"></div>
      <div class="decorative-circle circle-2"></div>
      
      <header class="hints-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <Lightbulb class="icon" />
          </div>
          <div class="header-text">
            <h3 class="title">Voice Commands</h3>
            <p class="subtitle">Try saying these phrases to create cards</p>
          </div>
        </div>
        <button 
          @click="toggleExpanded" 
          class="expand-btn"
          :class="{ expanded: isExpanded }"
        >
          <ChevronDown class="chevron" />
        </button>
      </header>
      
      <Transition name="content-slide">
        <div v-if="isExpanded" class="hints-content">
          <div class="hints-grid">
            <div 
              v-for="hint in currentHints" 
              :key="hint.id"
              class="hint-card"
              :class="hint.category"
              @click="selectHint(hint)"
            >
              <div class="hint-icon">
                <component :is="hint.icon" class="icon" />
              </div>
              <div class="hint-text">
                <p class="hint-phrase">"{{ hint.phrase }}"</p>
                <span class="hint-description">{{ hint.description }}</span>
              </div>
            </div>
          </div>
          
          <div class="more-examples">
            <button @click="showMoreHints" class="more-btn">
              <Shuffle class="icon" />
              <span>Show More Examples</span>
            </button>
          </div>
        </div>
      </Transition>
      
      <button @click="dismiss" class="dismiss-btn">
        <X class="icon" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Lightbulb, ChevronDown, X, Shuffle,
  Calendar, CheckSquare, TrendingUp, Clock,
  MapPin, Camera, LinkIcon, Target,
  MessageSquare, Star, Bell, Package
} from 'lucide-vue-next';

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  },
  autoShow: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['hint-selected', 'dismissed']);

const showHints = ref(false);
const isExpanded = ref(false);
const currentHintSet = ref(0);

// All available hints organized by category
const allHints = [
  // Planning & Events
  {
    id: 1,
    category: 'planning',
    icon: Calendar,
    phrase: "Add a meeting with John tomorrow at 3 PM",
    description: "Creates a meeting card with date and time"
  },
  {
    id: 2,
    category: 'planning',
    icon: Clock,
    phrase: "Remind me to call mom in 2 hours",
    description: "Sets up a reminder with countdown"
  },
  {
    id: 3,
    category: 'planning',
    icon: MapPin,
    phrase: "Plan a trip to Paris next month",
    description: "Creates a travel planning card"
  },
  
  // Tasks & Progress
  {
    id: 4,
    category: 'tasks',
    icon: CheckSquare,
    phrase: "Create a shopping list",
    description: "Makes a checklist for items"
  },
  {
    id: 5,
    category: 'tasks',
    icon: Target,
    phrase: "Track my exercise progress",
    description: "Sets up a progress tracking card"
  },
  {
    id: 6,
    category: 'tasks',
    icon: TrendingUp,
    phrase: "Show my sales metrics",
    description: "Creates a metrics dashboard card"
  },
  
  // Media & Links
  {
    id: 7,
    category: 'media',
    icon: Camera,
    phrase: "Save this vacation photo",
    description: "Creates an image card with description"
  },
  {
    id: 8,
    category: 'media',
    icon: LinkIcon,
    phrase: "Bookmark this website",
    description: "Saves a link with preview"
  },
  {
    id: 9,
    category: 'media',
    icon: Star,
    phrase: "Rate this restaurant 5 stars",
    description: "Creates a rating or review card"
  },
  
  // Information & Notes
  {
    id: 10,
    category: 'info',
    icon: MessageSquare,
    phrase: "Take a note about the meeting",
    description: "Creates a basic information card"
  },
  {
    id: 11,
    category: 'info',
    icon: Bell,
    phrase: "Check the weather for tomorrow",
    description: "Gets weather information card"
  },
  {
    id: 12,
    category: 'info',
    icon: Package,
    phrase: "Track my Amazon package",
    description: "Creates a delivery tracking card"
  }
];

// Smart hints based on existing cards
const smartHints = computed(() => {
  const hints = [];
  
  // If no cards, show basic creation hints
  if (props.cards.length === 0) {
    hints.push({
      id: 'first',
      category: 'getting-started',
      icon: Lightbulb,
      phrase: "Create my first card",
      description: "Start with any idea or task"
    });
  }
  
  // If has tasks but no progress tracking
  const hasChecklists = props.cards.some(c => c.type === 'checklist');
  const hasProgress = props.cards.some(c => c.type === 'progress');
  if (hasChecklists && !hasProgress) {
    hints.push({
      id: 'progress-smart',
      category: 'smart',
      icon: TrendingUp,
      phrase: "Track my task completion rate",
      description: "Monitor your productivity"
    });
  }
  
  // If has meetings but no reminders
  const hasMeetings = props.cards.some(c => c.type === 'meeting');
  const hasReminders = props.cards.some(c => c.type === 'reminder');
  if (hasMeetings && !hasReminders) {
    hints.push({
      id: 'reminder-smart',
      category: 'smart',
      icon: Bell,
      phrase: "Remind me before my next meeting",
      description: "Never miss important events"
    });
  }
  
  return hints;
});

// Current hints to display (mix of smart + random)
const currentHints = computed(() => {
  const smart = smartHints.value;
  const regular = allHints.slice(currentHintSet.value * 6, (currentHintSet.value + 1) * 6);
  return [...smart, ...regular].slice(0, 6);
});

// Auto-show logic
onMounted(() => {
  if (props.autoShow) {
    const hasSeenHints = localStorage.getItem('voiceplan-hints-seen');
    if (!hasSeenHints) {
      setTimeout(() => {
        showHints.value = true;
        isExpanded.value = true;
      }, 2000);
    }
  }
});

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function selectHint(hint) {
  emit('hint-selected', hint);
  // Optional: close hints after selection
  // showHints.value = false;
}

function showMoreHints() {
  currentHintSet.value = (currentHintSet.value + 1) % Math.ceil(allHints.length / 6);
}

function dismiss() {
  showHints.value = false;
  localStorage.setItem('voiceplan-hints-seen', 'true');
  emit('dismissed');
}

// Expose method to show hints programmatically
function show() {
  showHints.value = true;
}

defineExpose({ show });
</script>

<style scoped>
.voice-hints {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.voice-hints.expanded {
  transform: scale(1.01);
  box-shadow: 
    0 8px 32px rgba(79, 70, 229, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(79, 70, 229, 0.3);
}

.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(79, 70, 229, 0.08) 0%, 
    rgba(139, 92, 246, 0.05) 100%
  );
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 1;
}

.voice-hints.expanded .glass-overlay {
  opacity: 1;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.circle-1 {
  width: 4rem;
  height: 4rem;
  top: -2rem;
  right: -2rem;
  background: rgba(79, 70, 229, 0.1);
}

.circle-2 {
  width: 6rem;
  height: 6rem;
  bottom: -3rem;
  left: -3rem;
  background: rgba(139, 92, 246, 0.1);
}

.hints-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-wrapper {
  padding: 0.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.icon-wrapper .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  stroke-width: 2;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--text-color);
  background: linear-gradient(135deg, 
    var(--text-color) 0%, 
    color-mix(in srgb, var(--text-color) 80%, #4f46e5 20%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
}

.expand-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.expand-btn .chevron {
  width: 1rem;
  height: 1rem;
  color: var(--text-color);
  transition: transform 0.3s ease;
}

.expand-btn.expanded .chevron {
  transform: rotate(180deg);
}

.hints-content {
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.hints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.hint-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.hint-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.hint-card.planning {
  border-color: rgba(59, 130, 246, 0.2);
}

.hint-card.tasks {
  border-color: rgba(16, 185, 129, 0.2);
}

.hint-card.media {
  border-color: rgba(236, 72, 153, 0.2);
}

.hint-card.info {
  border-color: rgba(245, 158, 11, 0.2);
}

.hint-card.smart {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.08);
}

.hint-icon {
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.hint-icon .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-color);
  opacity: 0.8;
}

.hint-text {
  flex: 1;
  min-width: 0;
}

.hint-phrase {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
  font-style: italic;
  opacity: 0.9;
}

.hint-description {
  font-size: 0.7rem;
  color: var(--text-color);
  opacity: 0.6;
  line-height: 1.3;
}

.more-examples {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 20px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-size: 0.8rem;
  font-weight: 600;
}

.more-btn:hover {
  background: rgba(79, 70, 229, 0.15);
  transform: translateY(-1px);
}

.more-btn .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.dismiss-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  z-index: 3;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.dismiss-btn .icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

/* Animations */
.hints-fade-enter-active,
.hints-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hints-fade-enter-from,
.hints-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.content-slide-enter-active,
.content-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-slide-enter-from,
.content-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

/* Dark mode enhancements */
.dark .voice-hints {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .voice-hints.expanded {
  border-color: rgba(79, 70, 229, 0.3);
  box-shadow: 
    0 8px 32px rgba(79, 70, 229, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .hints-grid {
    grid-template-columns: 1fr;
  }
  
  .hint-card {
    padding: 0.5rem;
  }
  
  .hints-header {
    padding: 0.75rem;
  }
  
  .hints-content {
    padding: 0.75rem;
  }
}
</style>
