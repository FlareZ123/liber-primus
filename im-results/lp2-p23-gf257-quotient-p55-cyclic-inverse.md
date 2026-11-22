# P23→p50 root213→p55: frozen cyclic polynomial inverse

**Agent7, 22 November 2026. Classification:** one new source-shaped, non-additive original-cipher decryption test with exact native-GP positive controls; **negative on original p55**. The p50 root and original lengths remain valid algebraic observations. No unknown-page plaintext, genuine key or historical typed operation was recovered. This is an exploratory finite inverse, **not** an authenticated Cicada cipher.

## What the original artifact actually selects

- Original LP2 p23 has **213 GP29 ciphertext runes** and a sixteen-rune red heading with an original 8|8 word boundary, but no explicit finite-field instruction.
- Original numerical p50 is a 32×8 table. Reading its 256 original two-character tokens as high-first conventional base60 bytes produces the polynomial B(X) with exactly one GF257 zero, **B(213)=0**; under generator38 its DFT coefficient76 is zero. The p50 one-cell perimeter contains76 entries.
- Original p55 has **76 GP29 ciphertext runes**, with 17 physical printed fragments (including its incoming p54 word carry). The genuine original solved p57 provides a GP-native plaintext control. These inputs, source data and prior field/pad exclusions are documented in [the existing p50 GF257 synthesis](lp2-gf257-spectral-border76-p56-source-bridge.md) and [the p23 source bridge](lp2-p23-red-midpoint-p50-factor-bridge.md).

No inspected original clue says to evaluate a polynomial at the length of p23, to divide by the resulting linear factor, to truncate the quotient to 76, or to perform a cyclic GP29 convolution. Those actions define a **single exploratory transfer proposal**, frozen prior to original p55 scoring. They are not retrospectively elevated to creator instructions.

## Exact reversible receiver

Use the original row-major p50 bytes b0..b255, never alter them, and write B(X) in **descending** power order. Compute the exact GF257 quotient of B(X)/(X−213) using the standard high-first division recurrence:

- q0 = b0
- qi = (bi + 213 × q(i−1)) mod257, i=1..254
- final remainder = (b255 + 213 × q254) mod257 = **0**

The first eight quotient coefficients are **[203,37,81,220,183,152,120,43]**. Fix the **first76** as a source-order kernel, reducing them modulo29. The first eight GP29 kernel values are **[0,8,23,17,9,7,4,14]**. Fix the following cyclic ciphertext operator, with all arithmetic modulo29 and indices modulo76:

C(i) = sum over j=0..75 of K(j) × P((i−j) mod76).

Solve the resulting 76×76 circulant system by exact GF29 Gaussian elimination. It has full rank **76** on the original selected kernel, so all 76 original p55 ciphertext positions have a unique inverse under this **hypothetical** rule. No guessed secret, phase, F skip, page reset, variable length, alternate orientation, English-fitting selector, or omitted p55 glyph is used.

The [read-only original-input CommonJS SFT](../sims/lp2_p23_gf257_quotient_p55_cyclic_inverse_sft.cjs) loads the canonical p23/p55/p57 rune arrays, the original 256 p50 source bytes, and the authentic printed p55 divisions from the source transcription. It verifies the 213 root is unique in GF257, the quotient is exact, and the 17 printed fragment lengths sum to76, with a byte-for-byte independent rune-tape agreement. All 76 cipher symbols and fragment cuts remain intact.

## Exact tests

| Test | Result |
| --- | --- |
| Original p50 polynomial remainder at213 | 0 mod257 |
| Original p50 unique GF257 root | [213] |
| Original p55 convolution inverse rank | 76/76 |
| Native solved-p57 first76 GP runes: encrypt under selected K, then decrypt | 76/76 exact recovery |
| Original p55 76-rune inverse then forward convolution | 76/76 exact reproduction |
| Native solved-p57 76-rune plaintext index of coincidence | 0.059649123 |
| Original p55 encrypted-rune index of coincidence | 0.037894737 |
| Inferred original p55 plaintext index of coincidence | **0.032631579** |

The source-frozen original p55 output contains **no coherent adjacent native-GP complete words** at its actual printed boundaries. The SFT prints the complete segmented candidate to make this judgement inspectable. The low index of coincidence and lack of complete-word language jointly distinguish the failed receiver from its authentic planted positive. Full re-encryption confirms implementation invertibility only, as every wrong key in an invertible family can re-encrypt a gibberish candidate.

As an independent algebraic obstruction to a naive **common polynomial factor** interpretation, the original high-first GP-index polynomial of p23 has GF257 linear root **20**, while p50 has **213**; exact GF257 Euclidean GCD between the full original p23 and p50 polynomials is **1** (also degree0 for p23 with p55 and for p50 with p55). Thus the page-length-to-root relation does not extend to shared original-cipher factors in these direct representations. This does **not** rule out nonlinear or differently serialized relations.


**Independent Windows Node.js 22 execution:** [PASS 44978642173](https://github.com/FlareZ123/liber-primus/actions/runs/44978642173). The exact original segmented output is:

```
L ETMG BEA HEA XTOEOEIAF FPAYNGTH ANG XAENJSAAEDEABEUM TGGAIAAE TOEMU HEO WHIANGOTEO MEYNWUX EW EXWPYEA RHOE NGJOE
```

The 17 source word divisions and their carried first glyph are unchanged. This is an original-cipher **failure**, despite the valid 76/76 planted inverse and exact replay.

## Decision and next action

The 213/76 source alignment is mathematically real, and the present rule supplies a fully reversible, strictly finite **non-additive** receiver. That receiver fails on the entire untouched original p55. More important, no first-party clue selects its polynomial-division-to-convolution steps. The original source gives one GF257 field equation and an appealing count correspondence; it does not yield a typed 76-symbol plaintext operation, correct p55 output or authentic cipher key. Prior DFT additive masks, 180/76 systematic RS, and 255/3×85 quotient-share candidates are independently negative; do not relabel those as consequences of this test or rerun them.

**Issue #2149 fork:** retire this specific root-quotient/cyclic inverse and classify the hypothesized p23→p55 *designer-selected handoff* as currently unsupported. Any successor requires an independently dateable source instruction choosing a p50 field operation and a 76-glyph target, or a previously uninspected authentic original-text crib. Retain root213 and k76 in the provisional source-algebra frontier without claiming unknown plaintext.
