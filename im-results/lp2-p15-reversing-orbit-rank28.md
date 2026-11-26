# P15 Fibonacci-prime orbit with repeat-triggered reversals: all-key inverse

**Decision (Agent 6, 26 November 2026).** Both shift-before-permutation and map-before-shift receivers fail original p16–39 independently of every secret alphabet, even though the first recovers 6,631/6,632 withheld native-control runes and both hidden orbit configurations. No unknown LP2 plaintext or authenticated key.

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


## Noncommuting map-before-shift extension

The alternative decoder is P=unrank_e((S[r]−K(t)) mod28) on nonrepeat, P=e on repeat, with arbitrary bijection S of the 28 ranks and arbitrary fixed escape rune e. This is not equivalent to the earlier shift-before-map decoder. Retain exactly the same public clock and source construction.

For a fixed clock define H[r,k] as the number of fitting nonrepeat transitions of raw rank r and shift k. For any nonescape output rank y, its count is the sum over r of H[r,(S[r]−y) mod28]. Since S−y is a permutation, the minimum assignment cost in the 28×28 matrix H lower-bounds **every** nonescape output count. Therefore it also lower-bounds the second-smallest of all 29 rune counts, independently of e and even of arbitrary output relabeling. A cheaper bound is the sum of the 14 smallest row minima restricted to even shifts, since exactly 14 rows must be assigned even columns. Both bounds hold with no word geometry assumption.

Cyclic difference and log15 transports differ by a fixed row permutation. Negating all shifts permutes the assignment columns and preserves the even-column cheap bound. Thus 26,400 reduced configurations represent all 79,200 original configurations. Evaluate the cheap bound for all; invoke exact minimum assignment (Hungarian algorithm) only where that bound does not exclude the reference windows.

| Reference | Maximum second-smallest count | Windows |
|---|---:|---:|
| Shakespeare | 4 | 211,230 |
| Gibran | 3 | 56,616 |
| Emerson | 5 | 315,451 |

On p16–39, 13,137 reduced configurations have cheap bound >5. The remaining 13,263 have exact assignment minimum at least 91. Thus **all 26,400 reduced configurations fail**, for all 28! permutations and all 29 fixed escape labels. The exact minimum 91 is specifically for the subset needing assignment; it is not a global minimum over the cheap-excluded subset. Two independently constructed known-key controls reproduce all 9,194 runes each and pass both inequalities; their assignment minima are zero and observed second-smallest counts 0 and 2. These controls validate the exclusion test, not blind key recovery. Original p40–55 is not needed or scored by this extension.

- [Map-before-shift SFT](../sims/lp2_p15_reversing_orbit_mapfirst_sft.cjs), frozen commit b313a7a2d2dbed47a0b44dacfabec6c22fd9cf91.
- [Raw output and pinned blobs](lp2-p15-reversing-orbit-mapfirst.json), commit ff66d26d9fcd81da0d506110e9fec4325e6887e.
- Exact committed core executed in connected V8 (28.768 seconds); standalone wrapper not independently run.


## Variable-escape relaxation: no selector search necessary

Allow the escape glyph e_i to change arbitrarily at every transition, without even requiring an invertible public selector. This is a superset of all deterministic public escape laws with the same clock and rank ordering. For a nonrepeat decoded rank y, the ordinary GP29 unrank operation can emit only y or y+1, regardless of e_i. A repeat can emit any glyph. The bounds below do not depend on recovering an escape law, matching word divisions, or preserving word order.

**Shift-before-map:** any two chosen output glyphs collectively receive at most four distinct rank categories, plus all repeats. A common arbitrary rank permutation cannot exceed the sum of the four largest pre-permutation category counts plus repeats. Exhaustively evaluate all 79,200 configurations. Original maximum = **1,038** (read cyclic, hold, dir -1, signed distance, sign -1, phase283), below the minimum top-two native count **1,066**. This even allows an arbitrary fixed outer glyph relabeling.

**Map-before-shift:** the exact assignment minimum L of H lower-bounds each nonrepeat rank count. Every occurrence of rank y must emit one of adjacent canonical glyphs y,y+1. Consequently every adjacent glyph pair has summed count at least L, regardless of the variable escape law. The maximum, over all native windows, of their smallest adjacent-pair count is 24 (Shakespeare), 46 (Gibran), 47 (Emerson). Evaluate exact assignments for all 26,400 symmetry-reduced configurations. The global minimum is **89** (read cyclic, hold, dir -1, absolute distance, phase862). All configurations fail the native adjacent-pair bound. This uses the canonical GP29 unrank order and does not permit a further arbitrary outer relabeling for the map-first case.

The fixed-escape controls from the preceding section both retain exact 9,194-rune replay and satisfy the relaxed bound (assignment minimum zero; actual minimum adjacent-pair sum five). These controls are special cases of variable escape; they are not evidence of blind recovery for a dynamic selector. The original bounds are deterministic counting/assignment statements, with finite-reference interpretation rather than a language-universal theorem.

- [Variable-escape SFT](../sims/lp2_p15_reversing_orbit_variable_escape_sft.cjs), frozen commit 56a98acf050772429f1d0a1d0fb74134779c75ed.
- [Raw output](lp2-p15-reversing-orbit-variable-escape.json), commit 756159f522df205b3e51d6e1a056298cf1c2395f.
- Exact frozen core executed in connected V8, 81.321 seconds; standalone Node wrapper not independently run.

## Reproduction and limits

- [Frozen CommonJS SFT](../sims/lp2_p15_reversing_orbit_rank28_sft.cjs), commit 7a26efa742ad2c1be78e629fc690e98686afc483.
- [Original raw output](lp2-p15-reversing-orbit-rank28-original.json), [Gibran raw output](lp2-p15-reversing-orbit-rank28-control1.json), [Emerson raw output](lp2-p15-reversing-orbit-rank28-control2.json).
- All three exact committed core functions ran in connected V8 against pinned source blobs; standalone Node wrapper not independently executed. The first raw output was serialized from the returned tool result rather than a second execution.

This retires both specified operation orders of the reversing orbit for the three native-reference registers. The variable-escape relaxation also fails both operation orders, with canonical GP29 unrank order required for the map-first result. It does not exclude other repeat state laws, other registers, or an additional map-first outer relabeling. Do not expand the source-unsupported direction rules merely to generate additional experiments.
