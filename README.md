# QUILT-CANVAS

The web/WASM line of the quilt-canvas family: a canvas where **every cell is an
addressable capability and every workflow is a fabric projection** — the same
genome, many renderings. Terminal-native sibling:
[quilt-canvas-tui](https://github.com/SuperInstance/quilt-canvas-tui)
(the reference implementation of the fabric law, three byte-compatible ports).

## Status — honest (2026-09-29)

**This repo is a scaffold in relaunch.** We undersell and overdeliver; the
README is fact, not aspiration.

**Real today:**
- Vite + TypeScript shell that builds clean (`tsc --noEmit` strict).
- Zero-dependency demo renderer (`src/main.ts` + `src/viridis.ts`): a fixed
  demo fabric rendered as an 8×6 grid, viridis tone ramp (dials→color, the
  chiaroscuro:glyph lineage), link overlay, live HUD with an FNV-1a-64 fabric
  digest. Drag to pan, wheel to zoom.
- Cloudflare Pages deployment (see **Deploy** below).

**Not yet (the point of this repo):**
- The WASM engine (`engine/` — the manifest is staged; the crate is not) —
  fabric opcodes compiled to the browser via `wasm-pack`.
- Real fabric state: BIND / LINK / EFFECT / VIEW / TICK over the shared kernel.
- Controller bridge (NDJSON → WebSocket) so the web canvas is a true peer of
  the terminal canvas — same protocol, different skin.
- Chiaroscuro modes (`g` glyph / `G` sculpt) ported from the tui line.

## Why

A fabric is cells (address, dials, neighbors, kind) plus receipts. The **genome
≠ evidence** law: a cell's digest (dials+links) is its genome; the journal of
receipts is the evidence. A projection renders the genome and cannot flatter
you. The terminal line proves the law in three byte-compatible ports; this
line takes it to the browser, where a projection can be experienced rather
than read.

## Quickstart

```bash
npm install        # dev deps only (vite + typescript)
npm run dev        # http://localhost:5173 — demo renderer
npm run build      # tsc --noEmit && vite build → dist/
```

Engine (future, once the crate lands):

```bash
npm run engine     # wasm-pack build engine --target web --release
```

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=quilt-canvas
```

Live: https://quilt-canvas.pages.dev

## Roadmap

- **M0 — scaffold + demo renderer** (this commit): shell builds, viridis
  projection, honest HUD. No engine claims.
- **M1 — engine port**: quilt-c kernel → WASM; digest parity pinned against
  the tui line's fixed six-op script (FAIL-first: the parity pin exists before
  the engine does).
- **M2 — peer protocol**: NDJSON over WebSocket; web canvas joins a controller
  as a peer (ready → update → opcode), same as the tui canvas.
- **M3 — chiaroscuro**: glyph + sculpt modes in the browser; the projection
  engine shared, the renderings native.

## Doctrine

- **FAIL-first pins**: every parity/behavior pin observed RED before the
  implementation that makes it pass. SKIP, never vacuous pass.
- **Genome ≠ evidence**: digests are genomes; journals are evidence; a
  projection renders the genome and cannot flatter you.
- **README = fact**: linked docs carry the trail; this page carries the truth.

— [SuperInstance](https://github.com/SuperInstance) · sibling:
[quilt-canvas-tui](https://github.com/SuperInstance/quilt-canvas-tui) ·
the kernel: [quilt-c](https://github.com/SuperInstance/quilt-c)
