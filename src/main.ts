// main.ts — scaffold demo renderer.
// HONEST SCOPE (2026-09-29): no WASM engine yet, no fabric opcodes, no socket.
// What this does: renders a FIXED demo fabric (deterministic dials via FNV-1a)
// as an 8x6 grid with a viridis tone ramp + link overlay, HUD with the fabric
// digest. When engine/ lands (wasm-pack), this renderer becomes the VIEW layer
// and the demo fabric becomes the real one. Drag to pan, wheel to zoom.
/// <reference types="vite/client" />
import { viridisCss } from "./viridis";

// ---- FNV-1a 64 (BigInt), ported from quilt-canvas-tui bridge/fabric.mjs ----
const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const U64 = 0xffffffffffffffffn;

function fnv1a64(str: string): string {
  let h = FNV_OFFSET;
  for (let i = 0; i < str.length; i++) {
    h ^= BigInt(str.charCodeAt(i));
    h = (h * FNV_PRIME) & U64;
  }
  return h.toString(16).padStart(16, "0");
}

// ---- fixed demo fabric (deterministic; no engine claims) ----
interface Cell { addr: string; dials: number[]; neighbors: string[]; }

const COLS = 8, ROWS = 6;
const DEMO_LINKS: ReadonlyArray<readonly [string, string]> = [
  ["A1", "B1"], ["B1", "C1"], ["C1", "H1"], ["A2", "B1"], ["E1", "H1"],
];

function demoFabric(): Map<string, Cell> {
  const cells = new Map<string, Cell>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const addr = String.fromCharCode(65 + c) + (r + 1);
      const h = fnv1a64(addr);
      // three deterministic dials from one hash (slice the hex)
      const dials = [0, 4, 8].map((off) => parseInt(h.slice(off, off + 4), 16) % 10000);
      cells.set(addr, { addr, dials, neighbors: [] });
    }
  }
  for (const [a, b] of DEMO_LINKS) {
    cells.get(a)?.neighbors.push(b);
    cells.get(b)?.neighbors.push(a);
  }
  return cells;
}

// ---- render loop ----
const canvas = document.getElementById("c") as HTMLCanvasElement;
const hud = document.getElementById("hud") as HTMLDivElement;
const ctx = canvas.getContext("2d")!;
const cells = demoFabric();

let panX = 0, panY = 0, zoom = 1;
let dragging = false, lastX = 0, lastY = 0;

canvas.addEventListener("mousedown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.classList.add("dragging"); });
window.addEventListener("mouseup", () => { dragging = false; canvas.classList.remove("dragging"); });
window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  panX += e.clientX - lastX; panY += e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
});
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoom = Math.min(4, Math.max(0.4, zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
}, { passive: false });

function digest(): string {
  const parts = [...cells.values()].sort((x, y) => x.addr.localeCompare(y.addr))
    .map((c) => `${c.addr}:${c.dials.join(",")}:${c.neighbors.join("+")}`);
  return fnv1a64(parts.join("|"));
}

let t0 = performance.now();
function frame(now: number): void {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#0e0f12";
  ctx.fillRect(0, 0, w, h);

  const phase = (now - t0) / 1000; // slow breathing so the page is alive
  const cell = Math.min(140, Math.max(60, Math.min(w, h) / 10)) * zoom;
  const gw = COLS * cell, gh = ROWS * cell;
  const ox = (w - gw) / 2 + panX, oy = (h - gh) / 2 + panY;

  // links first (under cells)
  ctx.strokeStyle = "rgba(180,190,200,0.35)";
  ctx.lineWidth = Math.max(1, 2 * zoom);
  const center = (addr: string): [number, number] | null => {
    const c = cells.get(addr);
    if (!c) return null;
    const col = addr.charCodeAt(0) - 65, row = parseInt(addr.slice(1), 10) - 1;
    return [ox + col * cell + cell / 2, oy + row * cell + cell / 2];
  };
  for (const [a, b] of DEMO_LINKS) {
    const pa = center(a), pb = center(b);
    if (!pa || !pb) continue;
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
  }

  // cells
  ctx.font = `${Math.max(9, 11 * zoom)}px ui-monospace, Menlo, monospace`;
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  let hot = 0;
  for (const c of cells.values()) {
    const col = c.addr.charCodeAt(0) - 65, row = parseInt(c.addr.slice(1), 10) - 1;
    const x = ox + col * cell, y = oy + row * cell;
    const tone = ((c.dials[0] / 10000) * 0.85 + 0.075 + 0.05 * Math.sin(phase + col + row)) % 1;
    if (c.neighbors.length > 0) hot++;
    ctx.fillStyle = viridisCss(Math.min(1, Math.max(0, tone)));
    ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
    ctx.fillStyle = "rgba(14,15,18,0.85)";
    ctx.fillText(c.addr, x + 8, y + 7);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(String(c.dials[0]), x + 8, y + 7 + 13 * Math.max(1, zoom));
  }

  hud.innerHTML =
    `<b>quilt-canvas</b> — scaffold build · demo renderer\n` +
    `<span class="dim">fabric</span> ${cells.size} cells · ${DEMO_LINKS.length} links (${hot} bound) · tick ${Math.floor(phase)}\n` +
    `<span class="dim">digest</span> ${digest()}\n` +
    `<span class="dim">wasm engine</span> not yet wired · <span class="dim">drag pan · wheel zoom</span>`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
