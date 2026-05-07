# ARTKITv2 — BabyTrack

A browser-based motion detection art tool. Load a video or open your camera — it detects moving regions in real time and draws overlays on them. No account, no server, no upload. Everything runs in your browser.

---

## What It Does

```
Your video / webcam
        ↓
 Compares each frame to the previous one
        ↓
 Finds regions that changed (motion blobs)
        ↓
 Draws shapes around those regions
        ↓
 Applies art filters to only those regions
        ↓
 You see the result live on screen
```

Nothing leaves your computer. No data is sent anywhere.

---

## How the Code Is Organized

```
ARTKITv2/
├── index.html          ← the page (sidebar + canvas layout)
├── src/
│   ├── main.js         ← wires everything together, runs the render loop
│   ├── blobDetector.js ← finds moving regions in the video frame
│   ├── filters.js      ← applies color effects (invert, thermal) to blobs
│   ├── overlays.js     ← draws shapes and lines on the canvas
│   └── style.css       ← all styling
├── dist/               ← built/compiled output (auto-generated, ignore this)
└── package.json        ← project config
```

---

## How It Works (Technical)

| File | Job |
|------|-----|
| `blobDetector.js` | Compares brightness of each pixel between frames. Pixels that changed a lot get flagged. Groups nearby flagged pixels into "blobs" using connected-component labeling. |
| `filters.js` | Takes the pixel data inside each blob's bounding box and recolors it — invert flips colors, thermal maps brightness to a heat-map palette. |
| `overlays.js` | Draws the chosen shape (rect / circle / rounded / diamond) around each blob. Also draws lines connecting blobs if connection rate > 0. |
| `main.js` | Reads the video frame 60× per second, sends it to the detector, scales blob coords back to display size, applies filters, calls overlays. |

Detection runs at **50% resolution** for performance, then scales blob positions back up to full display size.

---

## Controls

| Control | What it does |
|---------|-------------|
| Upload Video | Load a local video file |
| Open Camera | Use your webcam as live input |
| Video Speed | 1×–4× playback speed |
| Shape | Bounding box shape: rectangle, circle, rounded rect, diamond |
| Region Style | Basic (score number) / Label (Object 1, 2…) / Frame (handles) |
| Filter | None / Invert / Thermal — applied only inside blob regions |
| Connection Rate | How many lines to draw between blob centers (0 = none, 1 = all) |
| Sensitivity | How much a pixel must change to be flagged (lower = more sensitive) |
| Max Blobs | Cap on how many blobs to track at once |
| Update Interval | Detect blobs every N frames (higher = cheaper but slower response) |

---

## How to Run This Project (No coding experience needed!)

### Step 1 — Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org)
2. Click the big **LTS** button to download
3. Open the downloaded file and follow the installer — just keep clicking Next / Continue
4. When done, open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Check it worked by typing this and pressing Enter:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

### Step 2 — Get the project

If you received a ZIP file:
1. Unzip it
2. Open Terminal / Command Prompt
3. Type `cd ` (with a space), drag the unzipped folder into the window, press Enter

If you have Git:
```
git clone https://github.com/sourikduttanyu/ARTKITv2.git
cd ARTKITv2
```

### Step 3 — Install dependencies

```
npm install
```

Wait for it to finish (about a minute).

### Step 4 — Start the app

```
npm run dev
```

Then open your browser and go to the address shown in the terminal — usually **http://localhost:5173**

---

## Troubleshooting

**"command not found: node"** — Node.js didn't install. Redo Step 1.

**"command not found: npm"** — Same fix.

**Camera won't open** — Browser needs permission. Click "Allow" when it asks. If you already denied it, go to browser settings → Site permissions → Camera → Allow.

**Nothing detected on video** — Try lowering the Sensitivity slider. Some videos with slow or subtle motion need a lower threshold.

**Anything else** — Screenshot the error and send it to Sourik.
