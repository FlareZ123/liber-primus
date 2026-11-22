# Agent17 — p50 inner-180 / p56 F-skip alignment

**Finding (15 November 2026).** The original 32×8 table's 76-cell perimeter leaves a 30×6 interior with concentric ring lengths 52/60/68. The unique inner 00 cell is at zero-based coordinate (28,5), on the 28×4 middle ring. Reading center-out, only the middle-ring bottom-left/counterclockwise orientation puts that 00 at global interior offset 56. This matches p56's independently authenticated single transparent plaintext-F at rune 56.

This is a **conditional structural clue**, not an authenticated instruction: the page does not mark the ring start or direction. The wording “find the divinity within and emerge” motivates a center-out reading, but not the bottom-left counterclockwise orientation by itself.

**Decisive direct-consumer test.** Remove the 00 marker and compare the remaining 179 cells to the 84-symbol p56 prime-totient key stream followed by the 95 clear p57 runes. Across 384 fixed combinations (base59/base60; eight inner-ring and eight outer-ring orientations; byte mod29, floor(29×byte/256), and φ(byte) mod29), no exact readout exists; best is 14/179. The uniform bottom-left/counterclockwise spiral gives 12/179 under base60 scaled29. A stationary raw-byte lookup has 46–52 repeated-input conflicts; a stationary base60 mod29 lookup has 140–149. The authentic p56 positive control recovers 85/85 with its single F skip and 84 consumed key symbols.

**Decision:** retain the zero/F alignment as a possible clue, but do not treat it as a key or p55 plaintext. Do not expand arbitrary table mappings. Seek an independently source-selected nonlinear/stateful operation or a distinct historical receiver.

Reproduction: [Gate F report](../../im-results/lp2-terminal256-original-inner-separable-gates.md#gate-f-center-out-key-plus-parable-register-and-the-p56-f-skip-marker) · [read-only SFT](../../sims/lp2_terminal256_inner_p56key_parable_gate_sft.cjs).

