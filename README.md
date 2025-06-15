# VoicePlan – AI-Powered Travel Planning with Dynamic Mosaic UI

> _"Voice-driven travel planning with intelligent card layouts"_

VoicePlan is an innovative AI travel planning assistant that creates dynamic, 
interactive planning boards through natural voice conversations. The system 
combines OpenAI's Realtime API with a sophisticated mosaic grid layout that 
intelligently organizes travel information into beautiful, responsive card 
layouts.

## ✨ Key Features

### 🎙️ **Voice-Reactive Interface**
- **Real-time voice detection** using WebAudio API
- **Voice-reactive chat bubble** with WebGL iridescent effects
- **Live audio visualization** with dynamic color changes
- **5-state voice indicator**: idle, connecting, live, listening, speaking

### 🎨 **Dynamic Mosaic Grid System**
- **12-column precision grid** for flexible card layouts
- **8 intelligent card sizes**: tiny, small, medium, large, wide, tall, xl, square
- **Content-aware sizing**: Cards automatically size based on content density
- **Responsive design**: Adapts seamlessly across desktop, tablet, and mobile
- **Tight spacing**: 0.25rem gaps for true mosaic feel

### 🃏 **9 Dynamic Card Types**
1. **Basic** - Text notes and reminders
2. **Image** - Photos with thumbnails
3. **Checklist** - Interactive to-dos with progress tracking
4. **Date** - Deadlines with countdown timers
5. **Link** - External resources with favicons
6. **Metric** - Numbers, statistics, and costs with trend indicators
7. **Progress** - Multi-step processes with progress bars
8. **Weather** - Conditions with forecasts and details
9. **Map** - Locations, routes, and transportation info

### 🎯 **Smart Layout Intelligence**
- **Content-first sizing**: Cards size based on actual content amount
- **Left-to-right tiling**: Proper flow with `grid-auto-flow: row`
- **Visual hierarchy**: First cards get prominence for impact
- **Efficient packing**: Maximum screen utilization with minimal gaps

### 🌙 **Modern UI/UX**
- **Theme switching**: Light/dark mode with smooth transitions
- **Color customization**: 8 accent colors for personalization
- **Glassmorphism effects**: Modern backdrop blur and transparency
- **Staggered animations**: Cards enter with 50ms delays for smoothness
- **Micro-interactions**: Hover effects and active states

## 🏗️ Architecture

This repository contains a **Vue.js frontend** demonstrating the core building blocks:

• **Frontend (Vue 3)** → Captures microphone audio, establishes **WebRTC** 
  connection to OpenAI Realtime API, and renders dynamic mosaic layouts
• **Composables** → `useRealtime.js` handles WebRTC, `useVoiceDetection.js` 
  manages audio input, `useUiStore.js` maintains reactive card state
• **Components** → 9 specialized card components with responsive mosaic sizing
• **WebGL Effects** → Custom iridescent bubble with fragment shaders

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Modern browser** with WebRTC support
- **OpenAI API key** with Realtime API access

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd VoicePlan-UI
```

2. **Install dependencies:**
```bash
cd frontend
npm install
```

3. **Configure environment:**
Create a `.env` file in the frontend directory:
```env
VITE_OPENAI_API_KEY="sk-..."
```

4. **Start development server:**
```bash
npm run dev
```

5. **Open browser:**
Navigate to `http://localhost:5173`

## 🎮 Usage

### Voice Interaction
1. **Connect**: Click the voice button in the bottom navigation
2. **Speak**: Talk naturally about your travel plans
3. **Watch**: Cards automatically appear in the mosaic grid
4. **Interact**: Click cards to expand or modify them

### Example Voice Commands
- _"I'm planning a trip from New York to San Francisco"_
- _"Add a checklist for train snacks"_ 
- _"What's the weather like in San Francisco?"_
- _"Find hotels near the beach in San Sebastian"_
- _"Create a reminder for my hotel check-in"_

### Navigation Features
- **🌙 Theme Toggle**: Switch between light and dark modes
- **🎨 Color Picker**: Choose from 8 accent colors
- **🎙️ Voice Control**: Connect/disconnect with real-time status
- **⚙️ Settings**: Access configuration options

## 🎯 Mosaic Grid System

### Card Sizing Logic
```javascript
// Content-aware sizing examples:
checklist: ≤3 items = tiny, ≤6 items = small, ≤10 items = medium
weather: Horizontal space = wide or large
metrics: Always compact = tiny or small
images: Visual prominence = medium to large
dates: Brief content = tiny
```

### Responsive Breakpoints
```css
/* Desktop: 12 columns */
@media (min-width: 1200px) { /* Full mosaic flexibility */ }

/* Tablet: 8 columns */ 
@media (max-width: 1199px) and (min-width: 769px) { /* Optimized medium */ }

/* Mobile: 6 columns */
@media (max-width: 768px) { /* Simplified but balanced */ }

/* Phone: 4 columns */
@media (max-width: 480px) { /* Clean single layouts */ }
```

## 🔧 Development

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Card components & UI elements
│   │   ├── Card*.vue       # 9 specialized card types
│   │   ├── VoiceBubble.vue # Voice-reactive visualization
│   │   └── BottomPillNav.vue # Main navigation
│   ├── composables/         # Vue composables
│   │   ├── useRealtime.js  # WebRTC & OpenAI integration
│   │   ├── useVoiceDetection.js # Audio input handling
│   │   └── useUiStore.js   # Reactive state management
│   └── App.vue             # Main app with mosaic grid
```

### Key Technologies
- **Vue 3** with Composition API
- **WebRTC** for real-time communication
- **WebGL** for visual effects
- **CSS Grid** for mosaic layouts
- **WebAudio API** for voice detection

## 🎨 Customization

### Adding New Card Types
1. Create new card component in `src/components/`
2. Register in `componentMap` in `App.vue`
3. Add sizing logic to `getMosaicSize()` function
4. Update OpenAI function definitions

### Modifying Mosaic Behavior
- **Card sizes**: Edit CSS grid span values
- **Spacing**: Adjust gap values in `.mosaic-grid`
- **Sizing logic**: Modify `getMosaicSize()` algorithm
- **Responsive breakpoints**: Update media queries

## 📱 Browser Support

- **Chrome** 88+ (recommended)
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

**Note**: WebRTC and WebAudio APIs required for full functionality.

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_APP_TITLE=VoicePlan
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

---

**Built with ❤️ using Vue 3, OpenAI Realtime API, and intelligent design patterns.**

