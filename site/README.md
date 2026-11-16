# Browser Site

This directory contains the browser-side static build of the PDF image converter.

- `dist/index.html`, `dist/app.js`, and `dist/styles.css` provide the original three-column workbench.
- `dist/cmaps/` and `dist/standard_fonts/` are bundled PDF.js resources required for PDFs that use unembedded CJK fonts such as `STSong-Light-UniGB-UCS2-H`.
- The browser processes PDFs locally; no PDF backend is required for this build.

Serve `dist/` with any static HTTP server. The published Sites deployment uses `site/.openai/hosting.json` with `dist` as its static directory.
