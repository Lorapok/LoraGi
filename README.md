# LoraGi ⚡

> **Bio-Digital Precision Video Slicer & Multi-Segment Segmenter**  
> *Engineered by Lorapok Labs (`lorapok.tech`)*

LoraGi is a client-side video cutting, slicing, and segmenting web application designed following the **Bio-Digital Synthesis & Biological UI** philosophy. It allows creators, researchers, and developers to trim, cut, and extract multiple portions of any video with frame-accurate millisecond precision directly in the browser—with zero server uploads and 100% local privacy.

---

## 🧬 Biological UI & Features

- **Multi-Portion Precision Cutting**:
  - Define multiple independent portions (cuts) on a single video.
  - Interactive biological filmstrip timeline with colored segment overlays.
  - Drag handles for frame-level start and end adjustments.
  - Interactive playhead scrubbing with real-time hover timestamp previews.
  - Zoomable timeline (1x to 6x zoom) for ultra-accurate sub-second micro-cuts.

- **Dual Cut Modes**:
  - **Keep Portions (Extract Mode)**: Retain only the marked sections and export.
  - **Remove Portions (Ripple Cut Mode)**: Cut out marked scenes and preserve the rest of the video seamlessly.

- **Fast Client-Side Export Engine**:
  - **Single Merged Video**: Stitches all selected portions together seamlessly into one continuous video file.
  - **Separate Video Clips**: Downloads each cut portion as an individually labeled file.
  - **ZIP Bundle**: Packages all exported portions into a single `.zip` archive via JSZip.
  - **Frame Capture**: Instant high-resolution PNG snapshot capture at current playhead.
  - Format options: WebM (VP9/VP8) and MP4 container support.
  - Quality presets: High Quality (8 Mbps) and Max Bitrate (12 Mbps).

- **Sensory Audio & Visuals**:
  - 32-band real-time FFT bio-luminescent audio visualizer.
  - Vaultie mascot cybernetic status indicator and tactile interactive hints.
  - Dynamic aspect ratio and stream metadata inspector (resolution, fps, bitrate, trim reduction savings).

- **100% Private & Local**:
  - Built on HTML5 Canvas, Web Audio API, and MediaStream / MediaRecorder.
  - Zero bytes are sent over the network. Your video remains strictly on your local machine.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play / Pause video |
| `[` | Set Mark In point for current portion |
| `]` | Set Mark Out point for current portion |
| `S` | Split portion at current playhead |
| `←` / `→` | Step 1 frame backward / forward (0.05s) |
| `Shift` + `←` / `→` | Jump 1 second backward / forward |
| `J` / `L` | Shuttle rewind 5s / forward 5s |
| `K` | Pause playback |
| `?` | Open keyboard shortcuts modal |
| `Esc` | Close active dialog / modal |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or pnpm

### Installation

```bash
git clone https://github.com/Lorapok/LoraGi.git
cd LoraGi
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

```
LoraGi/
├── src/
│   ├── components/
│   │   ├── AudioVisualizer.tsx   # 32-band FFT live audio visualizer
│   │   ├── Dropzone.tsx          # Biological drop area & sample generator
│   │   ├── ExportModal.tsx       # Export configuration & progress tracker
│   │   ├── Header.tsx            # Lorapok Labs brand header
│   │   ├── MetadataDrawer.tsx    # Technical stream & resolution inspector
│   │   ├── SegmentsList.tsx      # Portions manager & cut mode controller
│   │   ├── ShortcutsModal.tsx    # Keyboard shortcut cheat sheet
│   │   ├── Timeline.tsx          # Filmstrip scrubber & segment handles
│   │   ├── VaultieMascot.tsx     # Cybernetic larva assistant
│   │   └── VideoPlayer.tsx       # Custom video player & frame controller
│   ├── utils/
│   │   ├── sampleGenerator.ts    # In-browser test stream generator
│   │   ├── timeFormat.ts         # SMPTE timecode & millisecond utilities
│   │   └── videoProcessor.ts     # Client-side slice, merge, and zip engine
│   ├── types.ts                  # TypeScript types & segment definitions
│   ├── App.tsx                   # Central biological orchestrator
│   └── main.tsx                  # Application entry point
├── public/
│   └── favicon.svg               # Biological cutter insignia
└── package.json
```

---

## 🌐 Lorapok Labs Ecosystem

LoraGi is an official project of **Lorapok Labs**:
- **Hub**: [lorapok.tech](https://lorapok.tech)
- **GitHub**: [github.com/Lorapok](https://github.com/Lorapok)
- **Mascot**: Vaultie (Bio-Digital Larva)
- **Philosophy**: *Open-Source Products That Feel Alive*

---

## 📄 License

MIT License © Lorapok Labs
