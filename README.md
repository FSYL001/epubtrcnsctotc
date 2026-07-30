# EPUBTR

> EPUB Simplified-Traditional Chinese Converter

A modern, client-side EPUB text conversion tool that converts Simplified Chinese to Traditional Chinese (and vice versa) directly in the browser. All conversion happens locally with no server uploads.

## Features

- Drag-and-drop or file picker for multiple EPUB files
- Convert Simplified Chinese to Traditional Chinese
- Convert Traditional Chinese to Simplified Chinese
- Preserves all EPUB structure: images, CSS, fonts, hyperlinks, table of contents, layout, metadata
- Batch conversion with Web Worker for non-blocking UI
- Individual file error handling (one failure doesn't affect others)
- Light/Dark/System theme

## Tech Stack

- **Runtime**: React 19 + TypeScript 6 (strict mode)
- **Build**: Vite 8
- **Styling**: Tailwind CSS 3 + custom shadcn/ui components
- **Chinese Conversion**: opencc-js (pure JS OpenCC implementation)
- **EPUB Parsing**: JSZip (ZIP handling) + DOMParser (XML/HTML parsing)
- **Concurrency**: Web Worker for non-blocking file conversion

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
src/
  components/
    ui/              shadcn/ui primitives (Button)
    Header.tsx       App header with logo and theme toggle
    UploadZone.tsx   Drag-and-drop upload area
    FileList.tsx     File list container
    FileRow.tsx      Individual file entry with status and actions
  hooks/
    useTheme.ts      Theme management (light/dark/system)
  lib/
    utils.ts         cn() utility for Tailwind class merging
    constants.ts     Types, interfaces, and helper functions
  workers/
    converter.worker.ts  Web Worker for EPUB conversion
  App.tsx            Main application component
  main.tsx           Entry point
  index.css          Tailwind directives and CSS variables
```

### Conversion Flow

1. **File Input**: User drops or selects EPUB files
2. **Worker Dispatch**: Each file is sent to a Web Worker
3. **EPUB Parsing**: Worker unzips the EPUB and parses `container.xml` → `OPF` → manifest
4. **Text Conversion**: Worker converts text in metadata, XHTML/HTML content, and NCX nav labels using OpenCC, while preserving all markup, attributes, and non-text resources
5. **Re-packing**: Worker re-zips the modified EPUB with DEFLATE compression
6. **Download**: Converted EPUB is served via Blob URL for download

## Conversion Rules

**Converted:**
- HTML/XHTML text content
- Table of contents (NCX nav labels)
- Metadata (title, creator, description, publisher, subjects)

**Preserved (not converted):**
- HTML tags and attributes
- CSS
- JavaScript
- URLs and file paths
- Images and binary resources
- Fonts

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — Attribution-NonCommercial 4.0 International

You are free to share and adapt the material for **non-commercial purposes**, as long as you provide **attribution** to the original author.
