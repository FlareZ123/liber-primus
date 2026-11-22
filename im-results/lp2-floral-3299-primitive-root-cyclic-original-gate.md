# Floral chapter pair: 3299-rune multiplicative orbit and full original inverse

**Status: exact source-derived numerical alignment, complete reversible original-input test, no recovered unknown plaintext or key. Agent27, 22 November 2026.** The original 3,299-position count could be deliberate, but it was noticed retrospectively. Only the single frozen inverse below was tested; it fails to decode native GP29 text.

## New cross-object clue and exact input

The p15 original numeric figure (physical `32.jpg`) highlights **3299** in red. The independent 3301 identifier supplies difference **3301−3299=2**. These integers admit an unusually clean multiplicative schedule: 3299 is prime, `3298=2×17×97`, and `2^3298 ≡1 mod3299`, while the powers `2^(3298/2), 2^(3298/17), 2^(3298/97)` are respectively **3298,1355,83**, all distinct from1. Thus **2 is a primitive root mod3299**, visiting every nonzero index exactly once.

The original manuscript's two *floral-opening* red headings give a separate exact **content length**:

| Source unit | Original whole-runic input | Introductory red title excluded | Content retained |
| --- | ---: | ---: | ---: |
| p40–p53, physical 57.jpg–70.jpg | 3008 | p40 first8 | **3000** |
| p54–p55, physical 71.jpg–72.jpg | 308 | p54 first9 | **299** |
| Total | 3316 | 17 | **3299** |

The p53 **red51 is retained** inside the first content segment: it occurs inside that chapter and is not one of the two introductory red headings. Physical p50's **256 printed table tokens are not runes**, and no token is added to this 3,299-rune register. All original word carries and the 3000-to299 concatenation remain in source order.

Both initial red heading polynomials have the already-documented *simple* root24 (i.e. 3301 modulo29), but no independent source selects a specific cipher consumer from that property. The highlighted 3299 and these headings are genuine original visual facts; **selecting this 3299-rune register and a doubling mixer is a cryptanalytic hypothesis**, not an authenticated historical instruction.

## One predeclared, genuinely value-changing full inverse

The [predeclared receiver and no-fitting rule](../workplace/agent27-floral-3299-primitive-root-cyclic-inverse-precommit.md) was committed **before the original decoded output was inspected**, at commit `2a91a39`.

Use the whole untouched 3299-rune input `C[0..3298]` and **one fixed GP29 linear mixer**, indexed modulo the original highlighted 3299:

```text
C[i] = (P[i] + 2*P[(2*i)%3299]) % 29
```

No source glyph, rune, original word boundary or original page position is reordered or refit; the second term is a deterministic distant-index plaintext feedback. The integer coefficient and index multiplier both equal 3301−3299, and the original GP field is GF29.

The index `0` is fixed by the multiplier; `P[0] = C[0] / 3 mod29 = 10*C[0] mod29`. The other3298 indices form one complete orbit under doubling. On this cycle the inverse exists and is unique because `(-2)^3298=5 mod29`, hence the closing factor `1−5=25` is invertible (inverse7). The [Windows-compatible read-only CommonJS SFT](../sims/lp2_flora_3299_primitive_root_cycle_sft.cjs) implements that complete inverse; original runes are checked by exact forward re-encryption. This is a concrete original-cipher attack, rather than a key search over an unspecified parameter family.

## Original-language outcome and independent solved-GP control

| Complete 3299-rune register | IoC |
| --- | ---: |
| Unchanged authentic floral ciphertext `C` | **0.034464934244** |
| Frozen full original inverse `P` | **0.034429088992** |
| Independently solved, genuinely clear p57 GP text, repeated to3299 | **0.072215683272** |

The exact full original inverse begins `H.P.F.G.W.A.I.S.S.U.D.I.N.U.D.S.T.B.OE.S.EA.G.N...` as unambiguously segmented GP rune names. The independent original p54–p55 body segment, beginning at source register offset3000, decodes `A.C.I.W.W.EO.Y.W.I.AE.E.H.AE.M.IA.I.F.P.S.E.O...`. Neither complete interval yields coherent plaintext. The source-register IoC remains essentially 1/29 before and after, substantially below ordinary native GP text.

The independent, algorithm-positive plant encrypts **3,299 authentic solved p57 rune values** (95 genuine GP symbols repeated without editing), then executes the exact inverse and recovers all **3,299/3,299 original planted values**. The planted target is merely a positive execution control: its artificial repetition raises IoC above a typical source-native text. This separately verifies the inverse on a genuine solved register rather than treating the original round-trip as decryption proof.

## Research decision

The source arithmetic really supplies **one complete full-cycle schedule**, and the two natural floral bodies exactly fit its modulus. However, the original text and visual clues provide no direction to interpret the count as a cyclic plaintext mixer or pick this specific linear rule. Under the single fully specified source-fixed inverse, all 3,299 actual ciphertext runes remain nonlinguistic; source-native positive controls pass. Consequently this exact full-cycle value-changing cipher is **rejected as a direct GP29 decryptor**. A simple bare doubling transposition likewise cannot repair near-uniform native-rune frequencies because it preserves the exact ciphertext histogram.

Do **not** extrapolate this test to all possible 3299-state ciphers, arbitrary hidden keys, alternative boundary semantics, or a non-GP intermediate. The number alignment is a useful constrained follow-up clue **only if** a genuinely independently authenticated operation selects this receiver and alters rune values. No generalized multiplication/swap/phase sweep is justified by the current art.

Source files: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-ink-annotations.json`, and the unchanged original LP2 JPEGs `32.jpg`, `57.jpg`, `70.jpg`, `71.jpg`, `72.jpg`.
