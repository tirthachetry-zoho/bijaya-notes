# Bijaya Notes

A modern, tablet-first, installable note-taking application built with Next.js and Progressive Web App (PWA) standards.

## Features

- 📝 **Create, edit, and delete notes** with rich text content
- 🔍 **Search functionality** across note titles and content
- 📊 **Sort notes** by title, creation date, or last modified date
- 💾 **Auto-save** while typing with 1-second debounce
- 📱 **Tablet-first responsive design** with split-view layout
- 🌙 **Dark/Light theme support** with system preference detection
- 📲 **Installable PWA** - works offline and can be installed on tablets
- ☁️ **Google Drive sync** - sync your notes across devices with conflict resolution
- 🎯 **Touch-friendly interface** with 44px minimum tap targets
- 🔄 **Offline-first** - no internet connection required

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand with persistence
- **Storage**: LocalStorage for offline-first behavior
- **PWA**: next-pwa with service worker
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project (for sync functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tirthachetry-zoho/bijaya-notes.git
   cd bijaya-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Drive sync (optional):
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google Client ID:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
5. Copy the **Client ID** to your `.env.local` file
6. No API key required - uses OAuth authentication only

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## PWA Installation

### Android Tablets
1. Open the app in Chrome browser
2. Tap the "Install" button when prompted
3. Or tap the menu (⋮) → "Add to Home screen"

### iPad/iPhone
1. Open the app in Safari browser
2. Tap the Share button (📤)
3. Scroll down and tap "Add to Home Screen"

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Or use the browser menu to install

## Responsive Design

- **Mobile (320px+)**: Single-column layout with slide-out navigation
- **Tablet (768px+)**: Dual-pane split-view with notes list and editor
- **Desktop (1024px+)**: Centered layout with maximum width

## Offline Functionality

The app works completely offline:
- All notes are stored in localStorage
- Service worker caches the application shell
- No internet connection required for core functionality

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles and CSS variables
│   ├── layout.tsx      # Root layout with PWA metadata
│   └── page.tsx        # Main application page
├── components/         # React components
│   ├── Layout.tsx      # Responsive layout components
│   ├── NoteList.tsx    # Notes list with search and sort
│   ├── NoteEditor.tsx  # Note editor with auto-save
│   ├── ThemeToggle.tsx # Dark/light theme switcher
│   └── PWAInstallPrompt.tsx # Install prompt component
├── hooks/              # Custom React hooks
│   ├── useMediaQuery.ts # Media query hook
│   ├── useTheme.ts     # Theme management hook
│   └── usePWAInstall.ts # PWA installation hook
├── lib/                # Utility functions
│   ├── storage.ts      # Local storage utilities
│   └── utils.ts        # General utilities
├── store/              # Zustand store
│   └── noteStore.ts    # Notes state management
└── types/              # TypeScript definitions
    └── note.ts         # Note-related types
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

## License

MIT License
