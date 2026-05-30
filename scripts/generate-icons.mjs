// ----------------------------------------------------------------------------
// Generates the PNG PWA icons from scratch (no image libraries required).
//
// Draws a navy rounded square, a gold ring, and a gold five-point star into an
// RGBA pixel buffer, then encodes a valid PNG using Node's built-in zlib.
//
// Run with:  npm run generate-icons
// Outputs:   public/icons/icon-192.png
//            public/icons/icon-512.png
//            public/icons/icon-maskable-512.png
//            public/icons/apple-touch-icon.png  (180x180)
// ----------------------------------------------------------------------------

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/icons");
mkdirSync(OUT_DIR, { recursive: true });

const NAVY = [10, 22, 40, 255];
const GOLD = [255, 215, 0, 255];
const RED = [178, 34, 52, 255];

// --- tiny PNG encoder -------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Add a filter byte (0) at the start of each row.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- drawing helpers --------------------------------------------------------
function makeCanvas(size) {
  return { size, data: Buffer.alloc(size * size * 4) };
}

function setPx(c, x, y, [r, g, b, a]) {
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  c.data[i] = r;
  c.data[i + 1] = g;
  c.data[i + 2] = b;
  c.data[i + 3] = a;
}

function fillRoundedRect(c, color, radiusFrac) {
  const s = c.size;
  const r = s * radiusFrac;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      // rounded-corner test
      let inside = true;
      const corners = [
        [r, r],
        [s - r, r],
        [r, s - r],
        [s - r, s - r],
      ];
      for (let k = 0; k < 4; k++) {
        const cx = corners[k][0];
        const cy = corners[k][1];
        const nearX = (k % 2 === 0 && x < r) || (k % 2 === 1 && x > s - r);
        const nearY = (k < 2 && y < r) || (k >= 2 && y > s - r);
        if (nearX && nearY) {
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy > r * r) inside = false;
        }
      }
      if (inside) setPx(c, x, y, color);
    }
  }
}

function drawRing(c, color, cx, cy, outer, inner) {
  for (let y = 0; y < c.size; y++) {
    for (let x = 0; x < c.size; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= outer && d >= inner) setPx(c, x, y, color);
    }
  }
}

// Fill a polygon via even-odd ray casting.
function fillPolygon(c, color, pts) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, py] of pts) {
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if (y1 === y2) continue;
      if (y >= Math.min(y1, y2) && y < Math.max(y1, y2)) {
        const t = (y - y1) / (y2 - y1);
        xs.push(x1 + t * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.floor(xs[k]); x <= Math.ceil(xs[k + 1]); x++) {
        setPx(c, x, y, color);
      }
    }
  }
}

function starPoints(cx, cy, outer, inner, rotation = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (i * Math.PI) / 5;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function buildIcon(size, { maskable = false } = {}) {
  const c = makeCanvas(size);
  // Maskable icons need their content inside a safe zone (~80%), so we just
  // draw the same art a touch smaller and on a full-bleed navy background.
  fillRoundedRect(c, NAVY, maskable ? 0 : 0.1875);

  const cx = size / 2;
  const cy = size / 2;
  const scale = maskable ? 0.8 : 1;

  drawRing(c, GOLD, cx, cy, size * 0.39 * scale, size * 0.355 * scale);
  fillPolygon(
    c,
    GOLD,
    starPoints(cx, cy * 0.92, size * 0.26 * scale, size * 0.11 * scale)
  );
  // small red bar accent under the star
  const barW = size * 0.34 * scale;
  const barH = size * 0.05 * scale;
  fillPolygon(c, RED, [
    [cx - barW / 2, cy + size * 0.27 * scale],
    [cx + barW / 2, cy + size * 0.27 * scale],
    [cx + barW / 2, cy + size * 0.27 * scale + barH],
    [cx - barW / 2, cy + size * 0.27 * scale + barH],
  ]);

  return encodePNG(size, size, c.data);
}

const targets = [
  ["icon-192.png", buildIcon(192)],
  ["icon-512.png", buildIcon(512)],
  ["icon-maskable-512.png", buildIcon(512, { maskable: true })],
  ["apple-touch-icon.png", buildIcon(180)],
];

for (const [name, buf] of targets) {
  writeFileSync(resolve(OUT_DIR, name), buf);
  console.log(`wrote public/icons/${name} (${buf.length} bytes)`);
}
