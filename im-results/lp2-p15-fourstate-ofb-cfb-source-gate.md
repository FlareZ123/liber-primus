# P15 printed 4×4 matrix as an original four-state stream cipher

**Original-input gate, Agent 37, 13 November 2026. Classification: bounded negative, no plaintext or authentic key.**

## Human-observable clue and distinct cipher route

Physical LP2 p15 (original JPEG `32.jpg`) prints a **4×4** square of sixteen Fibonacci-indexed primes. The next original chapter, physical pp16–22, has exactly **1,744 = 436×4** runes. The published square is invertible modulo the 29 GP runes. Earlier direct Hill, four-page Hill and two CBC variants on this chapter failed. Those tests do not cover the distinct **stateful stream generation** architectures tested here.

A reader could naturally attempt two standard linear stream-cipher modes using the printed matrix over GF(29):

- **Output feedback (OFB):** update four-rune state by `S_i=M S_(i−1)` and decrypt `P_i=C_i±S_i`. It emits a four-symbol pad for each block, independent of ciphertext.
- **Ciphertext feedback (CFB):** decrypt `P_i=C_i±M C_(i−1)`, with a four-rune initial state. This makes the pad depend on preceding *actual* ciphertext and differs algebraically from the previously tested `M*C_i−C_(i−1)` and `M*(C_i−C_(i−1))` CBC models.

Neither an OFB/CFB command nor an initial state is explicitly given by the artist. To avoid fitting a secret state, the only inspected four-symbol IVs are the **first four and last four GP values of each of p15's two original red spans**, plus zero as the standard reference. The source red spans have lengths 9 and 11. For each of these five frozen IVs, use the printed `M`, its inverse, transpose or inverse transpose, with both GP29 additive signs. For the four nonzero ink-derived IVs, additionally test the **direct signed-prime-complement reading**: the original table prints the positive magnitudes `4516` and `1206`, whereas the same p15 Fibonacci-prime construction `3301−p` gives `−4516` and `−1206`. Only those two entries are sign-restored. This is a motivated alternate arithmetic interpretation, and the source does not explicitly print minus signs. Evaluate that signed matrix and its transpose with both signs. This is ****56** fully specified candidates per mode**, no phase optimization, alternative page clocks, lexical fitting or key search. The entire following 1,744-rune chapter is a single continuous stream.

## Original-cipher result

The original pp16–22 ciphertext IoC is **0.034509598025**. The exhaustive fixed-source test obtains:

| Reversible candidate | Declared models | Maximum original decoded IoC |
| --- | ---: | ---: |
| Four-state matrix OFB | 56 | **0.034767510409** |
| Four-state matrix CFB | 56 | **0.034922784190** |

These near-uniform outputs are nonlinguistic; neither has the concentrated GP symbol spectrum of the independent genuine cleartext control. The first **92 original clear runes** of LP2 p57 have IoC **0.062111801242**. Under each candidate, this authentic source-native GP control is encrypted and recovered exactly (**112/112** plants, 92/92 symbols each). Every original candidate likewise re-encrypts precisely to the full **1,744/1,744** unchanged ciphertext, which checks the inverse implementation but does not validate the candidate as an historical cipher.

The strict zero-state OFB candidate is especially uninformative: a linear state machine started at zero remains at zero. No nonzero source IV was selected from a solved instruction. The four printed red IVs and one source-derived signed-table interpretation therefore represent narrow, motivated tests rather than a claim to have exhausted unknown IVs.

## Decision

**The visible p15 matrix, used directly as either of these source-adjacent four-state GF29 stream ciphers, does not recover native-GP English plaintext.** Both have a concrete reversible forward model and solved-page positive control, and their frozen original outputs are uniformly distributed. This adds two specific stateful consumers missing from the stationary Hill and CBC source gates. It does **not** exclude a different matrix state update, an independently derived IV, an external binary plaintext register or a hidden key. No further IV/phase variation is warranted without a new original instruction. This bounded negative belongs in intermediate research only; the overall authoritative synthesis is unchanged.

[Source-original CommonJS reproducer](../sims/lp2_p15_fourstate_ofb_cfb_source_sft.cjs) · [Prior distinct CBC gate](lp2-p15-fourblock-cbc-original-gate.md).
