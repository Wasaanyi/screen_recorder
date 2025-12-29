# Screen Recorder

A professional Electron-based screen recording application for Windows with webcam overlay, annotation tools, and video editing capabilities.

## Features

- **Screen & Window Recording**: Capture your entire screen or individual windows
- **Webcam Overlay**: Add a webcam feed to your recordings with customizable shape (circle/square)
- **Annotation Tools**: Draw, highlight, and annotate while recording
- **Video Editor**: Trim and edit your recordings
- **Multiple Quality Presets**: Low, Medium, High, and Ultra quality settings
- **Audio Recording**: System audio and/or microphone
- **System Tray Integration**: Quick access to recording controls

## Tech Stack

- Electron 28+
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- FFmpeg for video processing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will launch with hot-reload enabled for development.

### Building for Production

To build the application:

```bash
npm run build:app
```

To create a Windows installer:

```bash
npm run package
```

The installer will be created in the `release` folder.

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
│   ├── renderer/          # Renderer processes (React apps)
│   │   ├── control/       # Main control panel
│   │   ├── overlay/       # Annotation overlay
│   │   ├── webcam/        # Webcam window
│   │   └── editor/        # Video editor
│   │
│   ├── preload/           # Preload scripts
│   │   └── index.ts       # Context bridge API
│   │
│   └── shared/            # Shared code
│       ├── types.ts       # TypeScript types
│       ├── constants.ts   # Constants
│       └── ipc-channels.ts # IPC channel definitions
│
├── assets/                # Static assets
│   └── icons/            # Application icons
│
└── resources/            # Build resources

```

## Usage

### Recording a Screen

1. Launch the application
2. Select a screen or window from the source picker
3. Configure settings (optional):
   - Video quality
   - Frame rate
   - Audio sources
4. Enable webcam or annotations (optional)
5. Click "Start Recording"
6. Click "Stop Recording" when done

### Using Annotations

1. Enable "Annotations" before or during recording
2. An overlay window will appear with drawing tools
3. Select tool, color, and thickness
4. Draw on the screen
5. Use "Clear" to remove all annotations
6. Click "Close" when done

### Using Webcam Overlay

1. Enable "Webcam" before or during recording
2. A webcam window will appear
3. Drag to reposition
4. Resize as needed
5. Toggle between circle and square shape

### Editing Videos

1. After stopping a recording, click "Open in Editor"
2. Use the timeline to set trim points
3. Click "Apply Trim" to trim the video
4. Click "Export Video" to save

## Configuration

### Output Settings

- **Output Folder**: Where recordings are saved
- **Video Quality**:
  - Low: 720p @ 15fps
  - Medium: 1080p @ 30fps
  - High: 1080p @ 60fps
  - Ultra: 1440p @ 60fps
- **Audio**: System audio and/or microphone

### Keyboard Shortcuts

(To be implemented - you can add custom shortcuts using Electron's globalShortcut API)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build:app` - Build the application
- `npm run package` - Create Windows installer
- `npm run typecheck` - Run TypeScript type checking

### Adding New Features

1. **Main Process**: Add logic to `src/main/`
2. **IPC Communication**: Define channels in `src/shared/ipc-channels.ts`
3. **Renderer**: Add UI components in `src/renderer/`
4. **Preload**: Expose APIs in `src/preload/index.ts`

## Known Issues

- Recording functionality uses simulated recording (implement actual MediaRecorder integration)
- FFmpeg processing is basic (can be enhanced with more options)
- Annotation overlay needs click-through implementation for better UX

## Future Enhancements

- [ ] Actual screen recording implementation with MediaRecorder API
- [ ] Real-time preview during recording
- [ ] Custom keyboard shortcuts
- [ ] Cloud upload integration
- [ ] Video compression options
- [ ] Watermark support
- [ ] GIF export
- [ ] License key system for one-time purchase model

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
