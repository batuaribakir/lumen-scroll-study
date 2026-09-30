#!/usr/bin/env python3
"""Generate the lumen study page's background track: an ORIGINAL ambient loop.

Everything is synthesised here from scratch — no samples, no existing recording or
melody. The piece is a slow cycle of eight chords in D (Dorian colour), each held for
18 s and cross-faded into the next, voiced as detuned soft pads over a sub drone, with
sparse seeded plucks from the D pentatonic set through a ping-pong delay, a little
filtered noise for air, and a synthetic hall reverb. Rendering is circular (every tail
wraps to the start), so the 144 s file loops without a seam; the loop point also sits in
a gentle dip because <audio loop> leaves a few milliseconds of gap there.

Output: site/revert/assets/audio/lumen-ambient.mp3 (112 kbps stereo) + lumen-ambient.json
Requires numpy and lameenc (pip install numpy lameenc).
Usage:  python3 tools/lumen/make-track.py [--seed 2026] [--out site/revert/assets/audio]
"""
import argparse
import json
import math
import pathlib

import lameenc
import numpy as np

SR = 44100
CHORD_SECONDS = 18.0
# MIDI voicings, low to high. Common chord shapes; the sequence and voicing are ours.
CHORDS = [
    ('Dm9', [50, 57, 60, 64, 65]),
    ('Bbmaj7', [46, 53, 57, 60, 62]),
    ('Gm9', [43, 50, 53, 57, 58]),
    ('Asus4', [45, 52, 57, 62, 64]),
    ('Fmaj7', [41, 48, 52, 57, 60]),
    ('Cadd9', [48, 55, 62, 64, 67]),
    ('Bbmaj9', [46, 53, 57, 60, 62]),
    ('Asus2', [45, 52, 59, 64, 69]),
]
PLUCK_NOTES = [62, 64, 67, 69, 72, 74, 76, 79, 81]  # D pentatonic (D E G A C), octaves 4-5
DRONE = 38  # D2


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def raised_cosine(n_in, n_hold, n_out):
    up = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n_in, endpoint=False))
    down = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n_out, endpoint=False))
    return np.concatenate([up, np.ones(n_hold), down])


def add_circular(buf, start, sig):
    """Add sig into buf starting at sample `start`, wrapping around the end."""
    n = buf.shape[-1]
    idx = (start + np.arange(sig.shape[-1])) % n
    np.add.at(buf, (slice(None), idx) if buf.ndim == 2 else idx, sig)


def pad_note(freq, length, rng, t0):
    """Soft pad voice: three detuned oscillators, gentle harmonics that breathe slowly."""
    t = np.arange(length) / SR
    left = np.zeros(length)
    right = np.zeros(length)
    for k, cents in enumerate((-7.0, 0.0, 6.0)):
        f = freq * 2 ** (cents / 1200)
        ph = rng.uniform(0, 2 * np.pi)
        breath = 0.5 + 0.5 * np.sin(2 * np.pi * (0.045 + 0.01 * k) * (t + t0) + ph)
        wave = (np.sin(2 * np.pi * f * t + ph)
                + (0.22 + 0.12 * breath) * np.sin(4 * np.pi * f * t + 1.3 * ph)
                + (0.06 + 0.06 * breath) * np.sin(6 * np.pi * f * t + 0.7 * ph))
        pan = (-0.6, 0.0, 0.6)[k]
        left += wave * math.cos((pan + 1) * math.pi / 4)
        right += wave * math.sin((pan + 1) * math.pi / 4)
    return np.stack([left, right]) / 3.0


def pluck(freq, rng):
    n = int(SR * 4.0)
    t = np.arange(n) / SR
    env = np.minimum(1.0, t / 0.006) * np.exp(-t / 1.1)
    wave = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(4 * np.pi * freq * t) * np.exp(-t / 0.35)
    pan = rng.uniform(-0.7, 0.7)
    sig = wave * env
    return np.stack([sig * math.cos((pan + 1) * math.pi / 4), sig * math.sin((pan + 1) * math.pi / 4)])


def smooth_noise(n, rng, width):
    """White noise smoothed by a moving average of `width` samples (a soft low-pass)."""
    x = rng.standard_normal(n + width)
    c = np.cumsum(x)
    return (c[width:] - c[:-width]) / width


def circular_convolve(x, ir):
    n = x.shape[-1]
    size = 1 << (n + ir.shape[-1]).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: n + ir.shape[-1]]
    out = y[:n].copy()
    tail = y[n:]
    for s in range(0, tail.shape[-1], n):
        seg = tail[s:s + n]
        out[: seg.shape[-1]] += seg
    return out


def hall_ir(rng, seconds=4.2):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        low = smooth_noise(n, rng, 24) * np.exp(-t / 1.25)
        high = (rng.standard_normal(n) - smooth_noise(n, rng, 24)) * np.exp(-t / 0.45)
        ir = low * 1.0 + high * 0.25
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))  # pre-delay-ish onset
        irs.append(ir / np.sqrt(np.sum(ir ** 2)))
    return np.stack(irs)


def render(seed):
    rng = np.random.default_rng(seed)
    n_chord = int(SR * CHORD_SECONDS)
    total = n_chord * len(CHORDS)
    dry = np.zeros((2, total))

    # pads: each chord fades in over 7 s, holds, and fades out over 8 s into the next
    fade_in, fade_out = int(SR * 7), int(SR * 8)
    for i, (_, notes) in enumerate(CHORDS):
        start = i * n_chord - fade_in // 2
        env = raised_cosine(fade_in, n_chord - fade_in // 2, fade_out)
        for j, m in enumerate(notes):
            level = 0.16 if j == 0 else 0.11
            v = pad_note(hz(m), env.shape[0], rng, i * CHORD_SECONDS) * env * level
            add_circular(dry, start % total, v)

    # sub drone on D2 with a slow swell, a quiet fifth above
    t = np.arange(total) / SR
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * t / (total / SR) * 3)
    drone = (0.10 * np.sin(2 * np.pi * hz(DRONE) * t) + 0.035 * np.sin(2 * np.pi * hz(DRONE + 7) * t)) * swell
    dry += np.stack([drone, drone])

    # plucks: sparse, seeded; denser in the middle chords, none in the first/last 6 s
    plucks = np.zeros((2, total))
    tcur = 6.0
    while tcur < total / SR - 6.0:
        chord_i = int(tcur // CHORD_SECONDS)
        density = 0.6 + 0.4 * math.sin(math.pi * chord_i / len(CHORDS))
        note = PLUCK_NOTES[rng.integers(len(PLUCK_NOTES))]
        add_circular(plucks, int(tcur * SR), pluck(hz(note), rng) * (0.05 + 0.03 * rng.random()))
        tcur += rng.uniform(1.6, 4.2) / density
    # ping-pong delay (dotted quarter at ~60 bpm), circular
    d = int(0.75 * SR)
    echo = np.zeros_like(plucks)
    src = plucks.copy()
    for k in range(1, 6):
        src = np.roll(src, d, axis=1)[::-1] * 0.42  # swap channels each repeat
        echo += src
    dry += plucks + echo

    # air: soft noise with slow swells
    air = smooth_noise(total, rng, 40)
    air = air / np.max(np.abs(air)) * 0.012 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 24.0))
    dry += np.stack([air, np.roll(air, 331)])

    # hall reverb, circular so the tail wraps into the loop start
    ir = hall_ir(rng)
    wet = np.stack([circular_convolve(dry[0], ir[0]), circular_convolve(dry[1], ir[1])])
    mix = 0.72 * dry + 0.55 * wet

    # a soft breath at the loop point (the <audio loop> gap falls in it)
    dip = int(SR * 3)
    w = np.ones(total)
    w[:dip] = 0.35 + 0.65 * (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, dip)))
    w[-dip:] = 0.35 + 0.65 * (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, dip)))
    mix *= w

    # level: RMS about -18 dBFS, peaks under -1 dBFS through a gentle soft clip
    rms = np.sqrt(np.mean(mix ** 2))
    mix *= 10 ** (-18 / 20) / rms
    mix = np.tanh(mix * 1.2) / 1.2
    peak = np.max(np.abs(mix))
    if peak > 10 ** (-1 / 20):
        mix *= 10 ** (-1 / 20) / peak
    return mix


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seed', type=int, default=2026)
    ap.add_argument('--out', default='site/revert/assets/audio')
    ap.add_argument('--kbps', type=int, default=112)
    a = ap.parse_args()
    mix = render(a.seed)
    pcm = np.clip(np.round(mix.T * 32767), -32768, 32767).astype('<i2')
    enc = lameenc.Encoder()
    enc.set_bit_rate(a.kbps)
    enc.set_in_sample_rate(SR)
    enc.set_channels(2)
    enc.set_quality(2)
    mp3 = enc.encode(pcm.tobytes()) + enc.flush()
    out = pathlib.Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / 'lumen-ambient.mp3').write_bytes(mp3)
    meta = {
        'title': 'lumen ambient (study loop)',
        'generator': 'tools/lumen/make-track.py',
        'seed': a.seed,
        'durationS': round(mix.shape[1] / SR, 3),
        'sampleRate': SR,
        'channels': 2,
        'bitrateKbps': a.kbps,
        'bytes': len(mp3),
        'rmsDbfs': round(20 * math.log10(float(np.sqrt(np.mean(mix ** 2)))), 2),
        'peakDbfs': round(20 * math.log10(float(np.max(np.abs(mix)))), 2),
        'chords': [c for c, _ in CHORDS],
        'provenance': 'Original work synthesised by this script (no samples, recordings or existing melodies). Licence: to be chosen by the repository owner.',
    }
    (out / 'lumen-ambient.json').write_text(json.dumps(meta, indent=2) + '\n')
    print(json.dumps(meta, indent=2))


if __name__ == '__main__':
    main()
