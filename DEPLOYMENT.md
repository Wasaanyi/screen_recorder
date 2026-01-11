# Deployment Guide

This guide explains how to build, package, and distribute the Screen Recorder application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building the Application](#building-the-application)
- [Creating a Release](#creating-a-release)
- [Publishing to GitHub Releases](#publishing-to-github-releases)
- [User Installation Guide](#user-installation-guide)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Development Environment

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js) or **yarn**
3. **Git** - [Download](https://git-scm.com/)

### Windows Build Tools

The build process requires Windows build tools for native module compilation:

```bash
# Install Windows Build Tools (run as Administrator)
npm install -g windows-build-tools

# Or install Visual Studio Build Tools manually
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Verify Installation

```bash
node --version    # Should be 18.x or higher
npm --version     # Should be 8.x or higher
git --version     # Any recent version
```

---

## Building the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Build

For testing during development:

```bash
npm run dev
```

This starts the Vite dev server with hot-reload enabled.

### 3. Production Build

Build the application without creating an installer:

```bash
npm run build:app
```

**Output:**
- `dist/` - Compiled renderer (React) files
- `dist-electron/` - Compiled main process and preload scripts

### 4. Create Windows Installer

Build and package into a Windows installer:

```bash
npm run build
```

Or if you've already run `build:app`:

```bash
npm run package
```

**Output Location:** `release/{version}/`

**Generated Files:**
| File | Description |
|------|-------------|
| `Screen Recorder Setup {version}.exe` | NSIS installer (~170 MB) |
| `win-unpacked/` | Unpacked application files |
| `builder-effective-config.yaml` | Build configuration used |

---

## Creating a Release

### Step 1: Update Version Number

Edit `package.json` and update the version:

```json
{
  "name": "screen-recorder",
  "version": "1.1.0",  // <-- Update this
  ...
}
```

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Step 2: Build the Application

```bash
# Clean previous builds (optional)
rm -rf dist dist-electron release

# Full build
npm run build
```

### Step 3: Verify the Build

Before releasing, verify the installer works:

1. Navigate to `release/{version}/`
2. Run `Screen Recorder Setup {version}.exe`
3. Complete installation
4. Test core features:
   - [ ] App launches correctly
   - [ ] Screen/window selection works
   - [ ] Recording starts and stops
   - [ ] Audio capture works
   - [ ] Webcam overlay displays
   - [ ] Annotations draw correctly
   - [ ] Video saves to output folder
   - [ ] Editor opens and trims videos

### Step 4: Commit and Tag

```bash
# Commit version change
git add package.json
git commit -m "chore: bump version to 1.1.0"

# Create version tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Push changes and tag
git push origin main
git push origin v1.1.0
```

---

## Publishing to GitHub Releases

### Manual Release (Recommended for now)

1. **Go to GitHub Repository**
   - Navigate to your repository on GitHub
   - Click on **"Releases"** in the right sidebar

2. **Create New Release**
   - Click **"Draft a new release"**
   - Choose the tag you created (e.g., `v1.1.0`)
   - Set release title: `v1.1.0` or `Screen Recorder v1.1.0`

3. **Write Release Notes**

   Use this template:

   ```markdown
   ## What's New in v1.1.0

   ### New Features
   - Feature 1 description
   - Feature 2 description

   ### Improvements
   - Improvement 1
   - Improvement 2

   ### Bug Fixes
   - Fixed issue with...

   ## Download

   **Windows (64-bit):** Download `Screen.Recorder.Setup.1.1.0.exe` below

   ### Installation
   1. Download the installer
   2. Run the .exe file
   3. If Windows SmartScreen appears, click "More info" → "Run anyway"
   4. Follow the installation wizard

   ### System Requirements
   - Windows 10 or later (64-bit)
   - 4 GB RAM minimum
   - 500 MB disk space
   ```

4. **Upload Installer**
   - Drag and drop the installer file from `release/{version}/`
   - Upload: `Screen Recorder Setup {version}.exe`

5. **Publish**
   - Check **"Set as the latest release"**
   - Click **"Publish release"**

### Automated Releases (Optional)

See the GitHub Actions workflow in `.github/workflows/release.yml` for automated builds on version tags.

---

## User Installation Guide

Share these instructions with users:

### Downloading

1. Go to the [Releases page](https://github.com/Wasaanyi/screen_recorder/releases)
2. Download `Screen.Recorder.Setup.x.x.x.exe` from the latest release

### Installing

1. **Run the installer**
   - Double-click the downloaded `.exe` file

2. **Windows SmartScreen Warning**

   Since the app is not code-signed, Windows may show a warning:

   > "Windows protected your PC"

   This is normal for unsigned software. To proceed:
   - Click **"More info"**
   - Click **"Run anyway"**

3. **Installation Wizard**
   - Choose installation directory (default: `C:\Program Files\Screen Recorder`)
   - Create desktop shortcut (optional)
   - Click **Install**

4. **Launch the App**
   - Find "Screen Recorder" in Start Menu
   - Or use the desktop shortcut

### Uninstalling

1. Open **Settings** → **Apps** → **Installed apps**
2. Find "Screen Recorder"
3. Click **Uninstall**

Or use the uninstaller in the installation directory.

---

## Troubleshooting

### Build Errors

**Error: `node-gyp` rebuild failed**

Install Windows Build Tools:
```bash
npm install -g windows-build-tools
```

**Error: FFmpeg binary not found**

Ensure `ffmpeg-static` and `ffprobe-static` are installed:
```bash
npm install ffmpeg-static ffprobe-static
```

**Error: NSIS not found**

electron-builder should install NSIS automatically. If not:
```bash
npm install -g electron-builder
```

### Runtime Errors

**App won't start after installation**

1. Check Windows Event Viewer for errors
2. Try running from command line to see error output:
   ```bash
   "C:\Program Files\Screen Recorder\Screen Recorder.exe"
   ```

**No audio in recordings**

- Ensure "System Audio" is enabled in settings
- Check Windows audio permissions
- Try selecting a different audio device

**Webcam not detected**

- Check webcam permissions in Windows Settings
- Ensure no other app is using the webcam
- Try unplugging and reconnecting the webcam

**Recording saves as 0 bytes**

- Check write permissions for output folder
- Ensure enough disk space
- Try a different output folder

### SmartScreen Issues

If users can't bypass SmartScreen:

1. **Organization policies** may block unsigned apps
2. **Alternative**: Share the `win-unpacked/` folder directly
   - Users can run `Screen Recorder.exe` from the folder
   - No installation required

---

## Build Artifacts Reference

After running `npm run build`, you'll find:

```
release/
└── 1.0.0/
    ├── Screen Recorder Setup 1.0.0.exe    # Upload this to GitHub
    ├── win-unpacked/                       # Portable version
    │   ├── Screen Recorder.exe
    │   ├── resources/
    │   │   └── app.asar
    │   └── [electron files]
    ├── builder-debug.yml
    └── builder-effective-config.yaml
```

**File Sizes (approximate):**
- Installer: ~170 MB
- Unpacked folder: ~450 MB

---

## Future Considerations

### Code Signing

To remove SmartScreen warnings, you'll need a code signing certificate:

1. **Purchase a certificate** from providers like:
   - DigiCert (~$400/year)
   - Sectigo (~$200/year)
   - SignPath (free for open source)

2. **Configure in package.json**:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "YOUR_PASSWORD"
   }
   ```

### Auto-Updates

To enable automatic updates:

1. Install electron-updater:
   ```bash
   npm install electron-updater
   ```

2. Configure update server (GitHub Releases works)

3. Add update check code to main process

### Multi-Platform Builds

To build for macOS and Linux, update `package.json`:

```json
"mac": {
  "target": "dmg",
  "category": "public.app-category.video"
},
"linux": {
  "target": ["AppImage", "deb"],
  "category": "Video"
}
```

Note: macOS builds require Apple Developer account for notarization.
