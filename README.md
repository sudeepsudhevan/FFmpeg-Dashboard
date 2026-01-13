# FFmpeg Dashboard "Antigravity"

A high-performance, aesthetically pleasing FFmpeg web dashboard built with React, Vite, and `ffmpeg.wasm`. This tool allows users to perform common video operations directly in the browser.

## Features

- **Project Hub**: Drag & Drop interface for managing active video files.
- **Client-Side Processing**: Uses `ffmpeg.wasm` (Multi-threaded or Single-threaded via CDN) to process videos locally. No server uploads required.
- **Visual Operations**:
  - **Crop**: Interactive canvas to define crop regions.
  - **Trim/Split**: Precise start/end time cutting.
  - **Compress**: Visual quality/CRF adjustment.
  - **Mix**: Concatenate multiple clips.
- **Manual Command Mode**: Experienced users can type custom FFmpeg commands in the footer terminal.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Open**: `http://localhost:5173`

## Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + Framer Motion
- **Core**: @ffmpeg/ffmpeg + @ffmpeg/util

## License
MIT
