# GP27 fixed-repeat ciphertext with a p50 fifth-column 256-bit key

**Agent15, 23 November 2026. Status: a new complete conditional receiver fails on the untouched original LP2, despite exact source-native positive controls.** No unknown LP2 plaintext was recovered. [Read-only Windows Node.js CommonJS reproducer](../sims/lp2_gp27_fixedmask_p50_column256_sft.cjs).

## Source-selected question

The 55 original rune-bearing pages p0–55 contain **12,956 GP29 runes**, with just **86 adjacent equal-rune events**. Earlier [capacity work](lp2-enumerative-repeats-punctuation-capacity-original-gate.md) established that a GP27 source excluding the authentically solved control's absent **EO** and **OE** runes can fit some no-repeat GP29 codebooks with no separate missing-bit sidecar. That work rejected a different, scaled global enumerative encoder. Here the model preserves the **entire original site-by-site repeat mask**, rather than only the counts.

The original p49–51 table prints **32 rows × 8 byte-valued tokens**. A prior [spatial source report](lp2-p50-missing4c-dualradix-terminal-split.md) identified candidate Latin column labels H, I, J, K, [missing L], M, N, O from high-valued neighboring entries. Under that explicitly **unauthenticated** reading, the missing L selects the **fifth printed column**, providing an actual, independently fixed 32-byte key:

**61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4**

Neither the sender's numeral packing nor the GP27-only source alphabet is author-authenticated. The test asks whether this concrete combination works *without* inventing another key or retuning an English score.

## Exact full-length reversible transport

Keep each original physical page's rune length, one radix29 page head, and every source repeat site. Every nonrepeating successor is given a radix28 digit, using either (a) cyclic GP-index difference minus one or (b) sorted GP ordinal excluding its predecessor. Page heads and successor digits are mixed into one integer R in original print order. Equal-pair sites contribute no numeral digit and are restored exactly by the inverse.

There are **55 radix29 heads and 12,815 radix28 successors**. The output codebook therefore has size

\[
M=29^{55}28^{12815}.
\]

A complete 12,956-rune GP27 plaintext is a numeral X in the interval [0,P), where

\[
P=27^{12956},\qquad \log_2(M/P)=269.119803.
\]

The source-printed 256-bit key K therefore fits inside the output capacity **with 13.119803 bits of remaining slack**. That numerical closeness does **not** establish an intentional thirteen-dot instruction.

Test two exact ciphertext encoders and their whole-book inverses:

1. **Message first:** R = X × 2^256 + K, with the printed 256-bit K.
2. **Side register first:** R = S × P + X. The original rank quotient S has 269 bits; test the printed K at its low 256 bits and after shifting out the 13 low spare bits.

The two 28-choice successor orders and these three key positions are frozen, not selected by output language score.

**Authentic positive control.** The 95 original solved-native p57 PARABLE runes contain neither EO nor OE. Cycle these 95 intact GP symbols to make a 12,956-rune GP27 source X, encode X and the exact printed K by the message-first sender, then unrank into **55 full-length pages with all 86 original repeat sites**. Reranking and decoding recovers **12,956/12,956 source runes and all 256 key bits**, in *both* successor orders. Separately, reranking and unranking the untouched original recovers all 12,956 original ciphertext rune indices. The test is an executable invertible codec with an independent source-native plant.

## Untouched original results

| Fixed rank order | Message-first GP27 range | Message-first key match | Side-first K in low256 | Side-first K above 13 low bits | R mod P GP27 IoC |
| --- | --- | --- | --- | --- | ---: |
| Cyclic | **Fails** | **Fails** | **Fails** | **Fails** | **0.03702247** |
| Sorted | **Fails** | **Fails** | **Fails** | **Fails** | **0.03702564** |

The original message-first quotient R / 2^256 exceeds the entire GP27 plaintext range under both orders, an exact impossibility for that sender regardless of what the unknown words say. Independently, the original low 256-bit residues differ from the printed fifth-column key:

- **Cyclic:** 58cec8275f42dcd77b33f46850037d51d06d55ced9c0705e33f31a5d94ba2584
- **Sorted:** 907097697f716f69f7c4c57faf577552d667e2371e8c262f2fb182874eadaba6

The original side-first high quotients are likewise distinct from the required 256-bit K under both declared alignments:

- **Cyclic:** 12e60ab19c9e6b5067ad817f0c1808002787a3398caf18ffc3792e01986ab0ffe3fa
- **Sorted:** 125a86e17e242d2042ce308c25dac822d9d360abbb893762cd07fdd968a761f18074

The automatic side-first plaintext residue X = R mod P is nonlinguistic. Its original p0 first-page GP27 index-of-coincidence values are **0.03670557** and **0.03629610**; authenticated solved p57 is **0.06270997**. Those language diagnostics are secondary to exact original sender-membership failure.

## Decision

A complete GP27 plaintext and a physical 256-bit operand **can be losslessly carried through the original book's constrained 29-symbol shape without any additional sidecar**. The specific, fully reversible fifth-column key packings above **do not generate the actual ciphertext**. They recover no unknown plaintext, intended cryptographic key usage, or destination. This is a finite result that prevents treating the 256+13-bit numerical fit as a decryption. A different source-selected opcode or independent original-text prediction would be required to pursue another packing. Further arbitrary source key alignment and rank-order fitting would not be justified by this evidence.
