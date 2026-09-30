// Adaptive quality ladder. It watches the last 16 frame times; when their median is above
// 32 ms (and at least 500 ms after the previous step) it lowers three knobs in one step:
//   kCeil  ceiling of the resolution factor E (quarter steps, floor 0.4)
//   detail terrain grid density (floor 0.4)
//   dotK   share of particles drawn (floor 0.8)
// There is no way back up: a slow patch costs quality for the rest of the visit.

const WINDOW = 16, LIMIT_MS = 32, COOLDOWN_MS = 500;

export function createLadder() {
  const ring = new Float64Array(WINDOW);
  let filled = 0, head = 0, lastStep = -Infinity;
  const q = { kCeil: 1, detail: 1, dotK: 1, steps: 0 };

  /** Feed one frame delta (ms) at time `now`; returns true when the ladder stepped down. */
  q.sample = (deltaMs, now) => {
    ring[head] = deltaMs; head = (head + 1) % WINDOW;
    if (filled < WINDOW) filled++;
    if (filled < WINDOW || now - lastStep < COOLDOWN_MS) return false;
    const sorted = Array.from(ring).sort((a, b) => a - b);
    const median = sorted[WINDOW / 2];   // upper median: 8 slow frames out of 16 are enough
    if (!(median > LIMIT_MS)) return false;
    const m = LIMIT_MS / median;
    q.kCeil = Math.max(0.4, Math.min(q.kCeil - 0.25, Math.floor(q.kCeil * m * 4) / 4));
    q.detail = Math.max(0.4, Math.min(q.detail - 0.2, q.detail * m));
    q.dotK = Math.max(0.8, Math.min(q.dotK - 0.25, q.dotK * m));
    q.steps++;
    lastStep = now; filled = 0; head = 0;
    return true;
  };
  return q;
}
