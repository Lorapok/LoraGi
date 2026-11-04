# LoraGi ⚡

> **Bio-Digital Precision Video Slicer & Multi-Segment Segmenter**  
> *Engineered by Lorapok Labs (`lorapok.tech`)*  
> **Live Web App:** [https://loragi.lorapok.tech](https://loragi.lorapok.tech)

LoraGi is a high-performance client-side video cutting, slicing, and segmenting web application designed following the **Bio-Digital Synthesis & Biological UI** philosophy. It allows creators, editors, researchers, and developers to trim, cut, and extract multiple portions of any video with frame-accurate millisecond precision directly in the browser—with zero server uploads and 100% local privacy.

---

## 📖 Complete Step-by-Step Instructions

### 1. How to Import Videos

LoraGi supports three flexible methods for loading media:

#### A. YouTube Videos & Shorts
1. Copy any YouTube video link (`https://www.youtube.com/watch?v=...`), short link (`https://youtu.be/...`), or Shorts link (`https://www.youtube.com/shorts/...`).
2. In LoraGi, click **Import YouTube / Flow Music** in the header or on the landing dropzone.
3. Paste your link and click **Fetch**.
4. LoraGi parses the video ID, retrieves the official high-resolution title, author/channel, and thumbnail preview.
5. If direct streaming is permitted, LoraGi buffers the stream immediately. If YouTube signature cipher encryption is active:
   - Click **Open Cobalt Web Tool** for an instant clean 1080p MP4 download (zero ads, zero quality loss), or
   - Click **Copy yt-dlp 1-Liner** to download via terminal (`yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" <URL> -o video.mp4`).
6. Drop the downloaded MP4 directly into LoraGi (either inside the modal's drop area or onto the main dropzone). Your video loads instantly into the interactive timeline!

#### B. Google Flow Music Sessions
1. Copy the generation session URL from Flow Music (e.g., `https://www.flowmusic.app/session/806433e8-679a-4ed3-b224-2920ad7ff8a3?t=true`).
2. Paste into LoraGi's URL Importer and click **Fetch**.
3. LoraGi's Cloudflare edge resolver queries the session, extracts all underlying Google Cloud Storage MP4 streams, and lets you pick any take directly into your browser timeline.

#### C. Local Video Files
- Drag and drop any video file (`.mp4`, `.webm`, `.mov`, `.mkv`, `.avi`, `.m4v`) directly onto the dropzone or click **Choose File**.

---

### 2. How to Cut & Slices Different Portions

LoraGi is built for non-destructive multi-segment editing:

1. **Mark In (`[`) & Mark Out (`]`)**:
   - Scrub the timeline to where you want a portion to begin and press `[` (or click **Mark In**).
   - Move to where you want the portion to conclude and press `]` (or click **Mark Out**).
2. **Split at Playhead (`S`)**:
   - While playing or scrubbing, press `S` (or click **Split Portion**) to instantly divide the active portion into two separate clips at the current playhead.
3. **Sub-Second Frame Stepping (`←` / `→`)**:
   - Tap the left/right arrow keys to nudge the playhead frame-by-frame (0.05-second increments) for laser-accurate cuts.
   - Hold `Shift` + `←` / `→` to jump 1 second.
4. **Timeline Zoom (1x to 6x)**:
   - Use the timeline zoom slider to stretch the filmstrip for inspecting sound transients and precise transitions.
5. **Portion Color Coding & Renaming**:
   - In the right-hand **Portions & Cuts** sidebar, rename your cuts (e.g., "Intro Highlight", "Drop", "Chorus", "Key Takeaway") and toggle individual portions on/off.

---

### 3. Understanding Cut Modes

Switch between two powerful operational modes depending on your workflow:

| Cut Mode | How It Works | Ideal For |
|---|---|---|
| **Keep Portions (Extract Mode)** | Only the highlighted portions are kept in the final video; all unselected intervals are trimmed away. | Highlight reels, compilation videos, music video teasers, YouTube Shorts cuts. |
| **Remove Portions (Ripple Cut Mode)** | The highlighted portions are excised and removed; the remaining sections are seamlessly stitched together. | Commercial / ad removal, removing awkward silences, outtakes, and speech pauses. |

---

### 4. How to Add Your Own Ending Scene (Outro Studio)

Add a branded ending or credit scene to the final few seconds of your video:

1. Click **Outro Scene** in the top navigation bar.
2. Toggle **Enable Ending Scene / Outro** to ON.
3. Choose your outro style:
   - **Bio-Digital Cyber Card**: Procedurally rendered high-tech animated outro featuring glowing biological pulses, custom title (e.g. *Created with LoraGi*), creator credits, and customizable theme colors.
   - **Custom Video Clip**: Upload your own video file (such as a YouTube end-screen video, subscribe animation, or branded motion logo).
4. Set duration (e.g. 3s or 5s).
5. Click **Save & Enable Outro**. When exporting a **Merged Video**, LoraGi automatically renders and appends the outro scene to the final seconds!

---

### 5. Exporting Your Edited Video

Click the neon **Export Video** button:

- **Single Merged Video**: Stitches all selected portions together seamlessly with your custom outro scene into one continuous video file.
- **Separate Video Clips**: Downloads each cut portion as an individually labeled video file.
- **ZIP Bundle**: Packages all exported portions into a single `.zip` archive via JSZip.
- **Frame Snapshot**: Captures a full-resolution PNG image at the current playhead frame.
- **Quality Presets**: Choose between High Quality (8 Mbps) and Max Bitrate (12 Mbps) in MP4 or WebM format.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play / Pause video |
| `[` | Mark In point for current portion |
| `]` | Mark Out point for current portion |
| `S` | Split portion at current playhead |
| `←` / `→` | Step 1 frame backward / forward (0.05s) |
| `Shift` + `←` / `→` | Jump 1 second backward / forward |
| `J` / `L` | Shuttle rewind 5s / forward 5s |
| `K` | Pause playback |
| `?` | Open keyboard shortcuts guide |
| `Esc` | Close active dialog / modal |

---

## 🧬 Bio-Digital Architecture & Features

- **Sensory Audio & Visuals**:
  - 32-band real-time FFT bio-luminescent audio visualizer.
  - Vaultie mascot cybernetic status indicator and tactile interactive hints.
  - Stream metadata inspector (resolution, fps, bitrate, trim reduction savings).
- **100% Client-Side Privacy**:
  - Built with HTML5 Canvas, Web Audio API, and MediaStream / MediaRecorder.
  - Zero video data is ever uploaded to external servers. Your media remains strictly on your local machine.

---

## 🚀 Development & Deployment

### Installation
```bash
git clone https://github.com/Lorapok/LoraGi.git
cd LoraGi
npm install
```

### Local Dev Server
```bash
npm run dev
```

### Production Build & Deploy
```bash
npm run build
npm run deploy
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
