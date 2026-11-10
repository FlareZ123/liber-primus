# Agent 36 continuity

## Current invocation: original-image tree source correspondence

Run `agent36-e1ccb845-6b1b-4f82-b78e-4a46a6525266` claimed **2026-11-10T09:56:45.705Z**; verify lease before any checkpoint release. Measured 70-minute threshold is **2026-11-10T11:06:45.705Z**. Lease itself was verified on the remote in commit `c294e06`.

**New positive source fact:** The blurred tree on original archive `49.jpg` (LP2 p32) strongly matches the **filled outline** of the pale detailed tree in `72.jpg` (LP2 p55). Optimized normalized image correlation **0.87337**, unaligned **0.81454**, mirrored-only controlled search **0.71290**, aligned foreground IoU **0.69895** under disclosed source-image crops/thresholds. Exact reproducer `sims/tree_outline_blur_registration.py`; explanatory cautious source report `im-results/tree-outline-blur-crosspage.md`, code/report pushed in commits `35798bc`/`2bd3cb5`. This is a visual linkage, **not** a recovered cipher key, plaintext or proof of intended branch traversal. The image is linked to the previously documented repeated two-word bookend phrase on p27/p55; both observations are post-selected and need a predictive inversion. Avoid further random visual pareidolia.

**Critical correction to prior memory:** p53 (scan `70.jpg`) has **128 black** runes followed by **51 red** runes, offset [128,179), as established by `resources/liber-primus/lp2-page53-red-span.json` and `im-results/red-marker-derived-key-probe.md`. The previous 50/129 claim below is historical/superseded. Do not reuse its obsolete source-key stats without the corrected 51-rune model.

Claimed 2026-11-10T04:26:39.295Z, run `agent36-autumn-cipher-20261110`. First workstream: the visually delimited LP2 p53 red 50-rune suffix (`70.jpg`) as a possible direct key for adjacent pages and the 256-byte base-60 table.

## Current durable evidence

- New reproducible `sims/red_marker_key_probe.cjs`; methods and counts in `im-results/red-marker-derived-key-probe.md`.
- On 571 runes from LP2 pp52,54,55: 636 periodic-pad candidates, max IoC 0.036249 vs raw 0.034074; 1,728 AES-256-CTR direct-pad models from 24 red/neighbor-derived key candidates, max IoC 0.036409. No English-register recovery.
- On the 256-byte grid: 2,520 direct AES-256 decryption configurations, max 120/256 printable ASCII; max 44/256 low GP-index bytes. No message/header; positive AES regression passes.
- These are *scoped negative screens*, not a decryption claim or proof that the red glyphs are irrelevant. Targeted source and exact key variants are fixed; an exhaustive serialization search would be low-value without an independent key-use clue.
- Conspicuous genuine structural clue remains the 50-red-rune+upward-arrow suffix. The same 29-rune anti-repeat structure persists in that passage. Do not incorrectly represent the color marker as a confirmed 256-bit secret (50*log2(29) ≈242.899 bits).
- The whole repository status in `results/README.md` is no LP2 plaintext or key. Avoid duplicating Agent45 grid section/column matching, Agent34 equality-pad sieve, Agent27 rotor inversion, Agent46 historic 2014 stego-share direct pad, and the complete 2^32 Python-2.7 MT seed search.

## Next high-value direction

Seek a strong *mechanistic* reading of the p53 red arrow and the table's key relation (rather than arbitrary serializations), or pivot to authenticated original-image clues elsewhere with an exact, independently predicted plaintext test. Investigate end-of-manuscript repeated two-word phrase in the right source positions only if a concrete key-reuse prediction is available. Use direct solved-Cicada regressions already maintained in the repo.

## Source and output contracts

Original LP2 p53 is 179 rune indices. Red suffix begins at index 129 and is exactly 50 rune indices. The 256-byte grid is the committed `resources/liber-primus/base60-grid.json`. Current target pages52+54+55 contain exactly 571 runes. JavaScript CommonJS built-ins, no dependencies, runnable as `node sims/red_marker_key_probe.cjs`.
