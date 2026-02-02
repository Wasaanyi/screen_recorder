# Screen Recorder

[![Latest Release](https://img.shields.io/github/v/release/Wasaanyi/screen_recorder?style=flat-square)](https://github.com/Wasaanyi/screen_recorder/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](https://github.com/Wasaanyi/screen_recorder/releases)

A professional Electron-based screen recording application with webcam overlay, real-time annotations, and video editing capabilities. Available for Windows, macOS, and Linux.

## Download

**[Download Latest Release](https://github.com/Wasaanyi/screen_recorder/releases/latest)**

### Windows

1. Download `Screen.Recorder.Setup.x.x.x.exe` from the latest release
2. Run the installer
3. If Windows SmartScreen appears, click "More info" → "Run anyway"
4. Follow the installation wizard

### macOS

1. Download the `.dmg` file (Intel or Apple Silicon)
2. Open the `.dmg` and drag Screen Recorder to Applications
3. On first launch, right-click the app and select "Open"
4. Grant Screen Recording and Camera permissions when prompted (System Settings > Privacy & Security)

### Linux

**AppImage:**
1. Download the `.AppImage` file
2. Make it executable: `chmod +x Screen-Recorder-*.AppImage`
3. Run it: `./Screen-Recorder-*.AppImage`

**Debian/Ubuntu (.deb):**
1. Download the `.deb` file
2. Install: `sudo dpkg -i screen-recorder_*.deb`

## Features

### Core Recording
- **Screen & Window Capture** - Record entire screen or individual application windows
- **Source Selection** - Visual picker with thumbnails for screens and windows
- **Pause/Resume** - Pause recording without stopping, continue when ready
- **Real-time Preview** - Live preview of selected source before and during recording

### Video Quality
| Preset | Resolution | Frame Rate | Bitrate |
|--------|------------|------------|---------|
| Low | 720p | 15 fps | 1000 kbps |
| Medium | 1080p | 30 fps | 2500 kbps |
| High | 1080p | 60 fps | 5000 kbps |
| Ultra | 1440p | 60 fps | 8000 kbps |

### Audio
- **System Audio** - Capture desktop/application sounds
- **Microphone** - Record voice with device selection
- **Audio Mixing** - Combine system audio and microphone in real-time

### Webcam Overlay
- **Live Webcam Feed** - Overlay your webcam during recording
- **Shape Options** - Circle or square webcam frame
- **Position Control** - Place in any corner (top-left, top-right, bottom-left, bottom-right)
- **Size Adjustment** - Configurable overlay size
- **Multiple Cameras** - Select from available webcam devices

### Annotation Tools
Draw and annotate on screen while recording:
- **Pen** - Freehand drawing
- **Highlighter** - Semi-transparent highlighting
- **Arrow** - Direction indicators
- **Rectangle** - Box annotations
- **Circle** - Circular shapes
- **Text** - Add text labels
- **9 Colors** - Red, orange, yellow, green, blue, purple, pink, black, white
- **5 Thickness Levels** - 2px to 12px stroke width

### Video Editor
- **Timeline Scrubber** - Navigate through your recording
- **Trim Tool** - Cut start and end points
- **Export** - Save edited videos to custom location

### Additional Features
- **System Tray** - Quick access menu for recording controls
- **Settings Persistence** - Remember your preferences
- **MP4 Output** - Universal format via FFmpeg conversion
- **Dark Theme UI** - Modern, eye-friendly interface
- **Cross-Platform** - Windows, macOS (Intel + Apple Silicon), and Linux

## Tech Stack

- **Framework**: Electron 28
- **UI**: React 18 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS
- **Video Processing**: FFmpeg (bundled)
- **Packaging**: electron-builder (NSIS, DMG, AppImage, deb)

## Getting Started (Development)

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Wasaanyi/screen_recorder.git
cd screen_recorder

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build Commands

```bash
npm run dev            # Start development with hot-reload
npm run build:app      # Build without packaging
npm run build          # Full build + Windows installer
npm run package        # Package for Windows (after build:app)
npm run package:mac    # Package for macOS (Intel + Apple Silicon)
npm run package:linux  # Package for Linux (AppImage + deb)
npm run typecheck      # TypeScript type checking
npm run generate-icons # Regenerate app icons from SVG
```

## Project Structure

```
screen-recorder/
├── src/
│   ├── main/              # Main process (Electron)
│   │   ├── index.ts       # Entry point
│   │   ├── windows.ts     # Window management
│   │   ├── recorder.ts    # Recording logic
│   │   ├── ffmpeg.ts      # FFmpeg integration
│   │   ├── tray.ts        # System tray
│   │   └── ipc-handlers.ts # IPC communication
│   │
│   ├── renderer/          # Renderer processes (React)
│   │   ├── control/       # Main control panel
│   │   ├── overlay/       # Annotation overlay
│   │   ├── webcam/        # Webcam window
│   │   └── editor/        # Video editor
│   │
│   ├── preload/           # Preload scripts
│   └── shared/            # Shared types & constants
│
├── build/                 # Build resources (entitlements)
├── scripts/               # Build & icon generation scripts
├── release/               # Build output
└── assets/                # Static assets & icons
```

## Usage

### Recording a Screen

1. Launch the application
2. Select a screen or window from the source picker
3. Configure settings (quality, audio, webcam)
4. Click **Start Recording** (or press the record button)
5. Click **Stop Recording** when finished
6. Recording is automatically saved to your output folder

### Using Annotations

1. Click the **Pen icon** to enable annotations
2. Select your tool, color, and thickness
3. Draw directly on screen while recording
4. Click **Clear** to remove all annotations
5. Close the overlay when done

### Using Webcam Overlay

1. Click the **Camera icon** to enable webcam
2. Select your camera device if multiple are available
3. Choose shape (circle/square) and position
4. Webcam appears as overlay in your recording

### Editing Videos

1. After recording, click **Open in Editor**
2. Use the timeline to set trim points
3. Click **Apply Trim** to cut the video
4. Click **Export** to save

## Platform Notes

### macOS
- Requires granting Screen Recording permission (System Settings > Privacy & Security > Screen Recording)
- Camera and Microphone permissions are requested on first use
- Supports both Intel (x64) and Apple Silicon (arm64) Macs

### Linux
- AppImage requires FUSE (installed by default on most distributions)
- Screen capture uses PipeWire/XDG portal on Wayland, X11 capture on X.org
- Some window managers may require a compositor for transparent overlay windows

### Windows
- System audio capture requires Windows 10+
- App is unsigned (SmartScreen warning on install)

## Roadmap

Future enhancements planned:

- [ ] Custom keyboard shortcuts
- [ ] Cloud upload integration (Google Drive, Dropbox)
- [ ] GIF export option
- [ ] Watermark support
- [ ] Additional video compression options
- [ ] Auto-update mechanism
- [x] macOS and Linux support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
