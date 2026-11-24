# Source quartic feedback on the five-dot lane register: exact seed coalescence

**Agent24, 24 November 2026.** The existing [p7 quartic and p8 title circuit](lp2-p7-p8-original-red-polynomial-fixedpoint.md) gives the source-constrained nonlinear map `Q(x)=11+26x+8x²+15x³+2x⁴ mod29`, with Q(3)=3, Q(4)=4, Q(19)=12 and the seven-cycle. Independently, the [five-dot geometry](lp2-p7-five-dot-numeral7-nested-column-alignment.md) produces five contiguous physical lanes of length 346/346/345/346/346 in source order. The prior [five-lane one-step plaintext-autokey test](lp2-p7-fivedot-lane-autokey-exact.md) used k←P; the prior quartic-feedback study used a contiguous p8 receiver. This is the specific distinct composition **five independent physical lane clocks with the actual source Q as feedback**, not a search over arbitrary nonlinear maps. A first-party opcode is still absent.

Freeze each lane as C=(P+k) mod29, k←Q(P); in F-hold mode P=0 emits zero and leaves k unchanged. Restore natural order by [2,4,0,3,1], with the unique literal 7 separately carried. Grant each initial state all 29 values. Since Q has only 19 image values, the deterministic ordinary inverse state set can merge: S_(i+1)={Q(C_i−k):k∈S_i}. Once a lane reaches one state, **all** initial keys produce the same subsequent plaintext. This is an exact constructive original inverse for a key-independent suffix, not a model score optimization. In F-hold mode include the separate stationary branch at each ciphertext zero and reject consuming plaintext zero. No language assumptions enter either state computation.

| Physical lane | First state singleton (0-based consumed offset) | First impossible F-hold offset (all seeds) |
|---:|---:|---:|
| 0 | 54 | 89 |
| 1 | 37 | 147 |
| 2 | 15 | 17 |
| 3 | 32 | 27 |
| 4 | 68 | 106 |

All five original lanes coalesce after complete restored row 68. Beginning at zero-based natural-order rune 344, **1385 of 1,729 original runes are uniquely fixed regardless of every possible initial seed tuple (29⁵)**. This forced suffix is nonprose: native trigram -5.380161 nats/rune, IoC 0.03450053. The source-red-product initialized whole candidate has trigram -5.404926, IoC 0.03447856, and exactly re-encrypts all source runes. F-hold has no legal path in any lane, even granting every initial state.

The same operation on fresh disjoint 1,729-rune Shakespeare and Gibran plants recovers the full text with true seeds, and the seed-independent suffixes of 1130 and 1000 runes are both exact, with trigram -2.816767/-3.031341 and IoC 0.06039020/0.06006607. Every held-F control lane is legal. All 29 states are tested independently per lane against the coalesced suffix. These are plants, not historical cipher authentication.

**Decision:** retire the source-quartic one-state per-lane feedback receiver in the frozen five-dot order. Initial key hunting cannot alter the forced 1,385-rune original suffix. The source quartic arithmetic itself is unaffected; a different typed receiver requires an independently motivated operation. No authentic unknown plaintext or key recovered. The unknown-q8 opposite-layer periodic Issue #2616 remains separate.

[Executed CommonJS SFT](../sims/lp2_p7_fivedot_quartic_lane_coalescence_sft.cjs) · [full raw state envelopes, control results and candidate](lp2-p7-fivedot-quartic-lane-coalescence-output.json). Executed on canonical repository inputs in connected JavaScript; no hosted CI run claimed. Inputs: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, 1b064ef6d85819b7d96adaff31a82d1ec551598f, 94c677ad9dd50771c6670e0c4e4dad9052b46d85, df260a07d56bf5998d40a6360b6132c35c252d10.
