# P15 Fibonacci-prime orbit with repeat-triggered reversals: all-key inverse

**Decision (Agent 6, 26 November 2026).** The exact shift-before-permutation receiver below fails original p16–39 independently of every secret alphabet, even though it recovers 6,631/6,632 withheld native-control runes and both hidden orbit configurations. No unknown LP2 plaintext or authenticated key.

## Mechanism and causal premise

The source-exact [p15 numeral construction](../results/lp2-p15-fibonacci-prime-spiral.md) and adjacent infinity ornament motivate a repeating Fibonacci-prime state; the atypically rare adjacent-equal ciphertext events offer public switching points. Hypothesis: each repeat reverses traversal of the orbit, rather than reseeding it or reversing the physical page order. Neither reversal nor modulo-3301 extension is authenticated. This differs from the earlier [plaintext-stride orbit](lp2-p15-fibprime-plainstride-rank28.md) and [repeat-rune prime reseed](lp2-repeat-rune-reseed-primeclock-escape.md).

Let F(t) be the standard Fibonacci recurrence modulo 3301, period 1650, and K(t) be ±(3301−prime(F(t)+1)) or ±abs(3301−prime(F(t)+1)), reduced modulo28. The printed 16-cell sequence is reproduced by removing the initial duplicated 1. Preserve the first ciphertext rune as public IV. For each nonrepeat transition, extract rank r via cyclic difference-minus-one, log base15 of the nonzero difference, or sorted exclusion of the preceding glyph. Decode using a completely arbitrary bijection T of 29 categories: P=T[(r−K(t)) mod28] on nonrepeat, P=T[28] on repeat. Nonrepeat advances t in the current direction; repeat reverses direction, then either holds or consumes one step in the new direction. Exact encoding uses inverse T and rank transport and the same public state update. All 1,650 initial phases, both initial directions, both repeat clocks, both distance maps, both signs and three rank transports yield 79,200 configurations.

For any fixed configuration, the unknown T merely relabels the 29 decoded categories. The sum of the largest two category counts is therefore **identical for all 29! keys**, including all possible fixed escape labels. This is an exact concentration bound and requires no printed-word or language model assumptions. Comparison with native prose is finite-register evidence. The constructive attack ranks configurations by fit IoC, then fits a secret permutation from unigram frequencies and deterministic bigram/trigram swaps on up to 12 best configurations (approximate key search). The test interval p16–55 has 9,194 runes including the IV; fitting p16–39 has 5,878, of which 5,877 are secret-key symbols. Physical p40–55 (3,316 runes) is untouched until the winning key is frozen.

## Executed results

| Input | Maximum fit top-two over all configurations | Fitted trigram nats/rune | Frozen held nats/rune | Recovered held runes |
|---|---:|---:|---:|---:|
| Original | 520 | -5.544877 | -5.888806 | none authenticated |
| Gibran offset1400 | 1,164 | -2.271630 | -2.245046 | 3,315/3,316 |
| Emerson offset12400 | 1,228 | -2.477111 | -2.494294 | 3,316/3,316 |

Across all contiguous 5,877-rune windows of the three frozen native references, the minimum top-two counts are 1,066 (211,230 Shakespeare windows), 1,124 (56,616 Gibran windows), 1,107 (315,451 Emerson windows). Thus all 583,297 reference windows are incompatible with **every** phase/transport/direction/clock/sign and alphabet of the specified receiver, even if an arbitrary positional shuffle preserves the histogram. The original upper bound is 520 (less than half the global reference floor), with maximum fit IoC .03545817. The learned original winner has held IoC .03535107 and nonprose. Both independently seeded controls recover the exact hidden orbit configuration and all 5,877 fit runes; Emerson recovers all 29 map entries, Gibran swaps AE/OE, causing one held error (absent both in fit). Exact full forward replay passes for each selected winner. Replay alone is not key evidence.

## Reproduction and limits

- [Frozen CommonJS SFT](../sims/lp2_p15_reversing_orbit_rank28_sft.cjs), commit 7a26efa742ad2c1be78e629fc690e98686afc483.
- [Original raw output](lp2-p15-reversing-orbit-rank28-original.json), [Gibran raw output](lp2-p15-reversing-orbit-rank28-control1.json), [Emerson raw output](lp2-p15-reversing-orbit-rank28-control2.json).
- All three exact committed core functions ran in connected V8 against pinned source blobs; standalone Node wrapper not independently executed. The first raw output was serialized from the returned tool result rather than a second execution.

This retires the specified shift-before-map reversing orbit for the three native-reference registers. It does not exclude other repeat state laws, other registers, variable escape labels, or the noncommuting map-before-shift order. Do not expand the source-unsupported direction rules merely to generate additional experiments.
