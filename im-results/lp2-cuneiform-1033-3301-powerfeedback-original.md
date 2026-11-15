# Cuneiform 1033/3301 as a GP29 nonlinear power-feedback cipher: original-input rejection

**Agent10, 15 November 2026, Director #1157. Outcome:** This exact, low-complexity, fully reversible nonlinear decoder fails on authentic p33–39 ciphertext. It recovers **no unknown LP2 plaintext or key**. This is a bounded negative for one frozen candidate, not evidence that the cuneiform numerals are a cipher instruction.

## One source-fixed nonlinear operation and its weakest link

Original LP2 p33–39 display the two established Babylonian numbers **1033** and **3301**. Historical Cicada used modular arithmetic and Diffie–Hellman, while Gematria Primus supplies a field of 29 rune indices. A source-era player could therefore try modular exponentiation. However, the artwork directly conveys **numbers**, with **no authenticated command to exponentiate runes, combine a previous ciphertext rune, or begin a clock**. The rival explanation is a repeated historical Cicada numerical emblem.

The exact arithmetic observation is

\[
1033 \equiv 3301 \equiv 25 \pmod{28},\qquad
25\cdot9\equiv1\pmod{28}.
\]

Since the multiplicative group of the prime field \(\mathbb F_{29}\) has order 28, the distinct printed integers **induce exactly the same invertible power map** on every GP rune: \(x^{1033}=x^{3301}=x^{25}\pmod{29}\), including zero; its inverse is \(x^9\). Thus the pair cannot supply two distinct 29-field power substitution states. The original four base-60 digits [17,13;55,1] were already documented and used in an independent linear Hill2 exclusion. This study fixes *one nonlinear predecessor-ciphertext feedback operation*:

\[
C_i = (P_i+C_{i-1})^{25}\pmod{29},
\qquad
P_i=C_i^9-C_{i-1}\pmod{29}.
\]

An added prior-ciphertext state is a historically plausible way to break stationary monoalphabetic equality and address the manuscript's near-total shortage of repeated adjacent runes. It is still **our conjecture**, not a creator-authenticated procedure. No secret alphabet, fitted IV, trial exponent, per-word rule, or adjustable score threshold enters this test. The hypothetical initial predecessor is GP **F=0**; changing it affects only the first decoded rune of each independently reset page and cannot change any tested singleton below.

## Exact original span and evidence

Use the canonical JSON corpus at resources/liber-primus/lp2-corpus.json with the unchanged rune text at resources/liber-primus/lp2-transcription.txt, preserving printed word endings through page wraps. On p33, the cuneiform emblem follows the separately marked **91-rune preface**. The source-faithful candidate interval therefore begins at **p33 offset 91** and continues across all of pp34–39. Its page-part lengths are **[123,261,271,238,228,228,240]**, exactly **1,589 GP29 ciphertext runes** and **355 printed word slots**. The SFT checks every source rune against both repository encodings.

The fully specified inverse preserves the exact original ciphertext on forward re-encryption, including all 1,589 glyphs. This round trip is an implementation check only: any bijective wrong key/operation has the same property. Native-GP language supplies a more discriminating original prediction, since ordinary one-rune English words in the authentic LP convention can only be GP A, I or occasional O.

| Original source test | Observed under frozen inverse | Native-GP expectation |
| --- | --- | --- |
| Complete 1,589-rune output IoC | **0.03515510444** | Authentically clear GP prose is substantially more concentrated (p57 IoC ~0.06271) |
| Nine original complete one-rune printed words | **D EO TH W X D G EO S** | Each should be **A, I, O** |
| Original native-English-compatible singleton words | **0 / 9** | **9 / 9** required if original spaces preserve words |
| Held-out pp37–39 one-rune words | **D G EO S = 0 / 4** | **4 / 4** expected |
| Original-cipher exact full reencryption | **1,589 / 1,589** | Necessary implementation invariant |
| Planted clear p57 GP29 positive | **95 / 95** recovered | Complete expected recovery |

The nine original singleton rune positions within this source interval are **[47,227,276,508,627,1021,1195,1351,1504]**. None is at a page start of the original interval (**[0,123,384,655,893,1121,1349]**). Consequently, **any per-page IV choice** leaves every one of those nine decoded symbols unchanged under the declared one-back ciphertext feedback. The four untouched pp37–39 singleton positions are **[1021,1195,1351,1504]**. Their outputs were not used to select the rule.

Source GP29 ciphertext IoC is **0.03434982**; the output barely changes it. The first 30 decoded GP rune tokens are: X IA I G M R R M A D L P I R W N I J D OE EA TH A M T AE O IA AE Y. There is no recoverable contiguous English instruction; the singleton contradiction rejects this original input as ordinary preserved-word GP English under the model.

## Interpretation and next decision

**Retire this particular cuneiform-powered GP29 predecessor feedback grammar** on p33[91..] through p39. It is mathematically invertible and uses the two printed numbers, yet its original output fails nine independently printed word constraints, four on withheld pages. A new initial IV, exponent choice between 1033 and 3301, or uninterrupted versus physical-page-reset state cannot rescue those positions. A separately authenticated word-boundary operator, changed plaintext alphabet, or explicit alternate nonlinear opcode would constitute a **different hypothesis** needing source evidence before another search.

The repeated p34–39 upper header ink and quantized DCT blocks are already proved exact copies in [historical header report](issue344-cuneiform-historical-template-gate.md), so their repetition alone cannot provide per-page hidden IV differences. Historical 2014 Stage05 seven-wide p33 prologue, 2×2 digit Hill, base60 60-phase secret substitution and 2013 DH-numbered passages have their own published exact negative tests. None should be rerun to rescue this power model.

**Reproducer:** [Node 22 CommonJS read-only original-corpus test](../sims/lp2_cuneiform1033_powerfeedback_original_sft.cjs), asserting original printed boundaries, all singleton outputs and the 95-rune clear-p57 plant. On Windows 11, run it with Node.js from the repository root.
