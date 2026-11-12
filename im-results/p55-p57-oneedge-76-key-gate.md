# P57 word-circumference stripping as an exact 76-rune p55 key

**Classification:** original-input negative for 12 source-sized, reversible finite decoders, now complemented by an exact three-artifact p50-ring/p55-cipher/p57-shaved-text key exclusion. No recovered p55 plaintext. This is a direct word-boundary key construction distinct from the earlier stationary 19-block affine code exclusion.

## Fixed source-selected framing

Physical p57 (already solved in ordinary GP29) contains a **seven-rune PARABLE heading** followed by **19 separate body words totaling 88 runes**. Its 95 original runes are thus `7+88`. Physical p55 contains **76** original runes. A literal reading of the p57 phrase “shed our own circumferences” suggests removing *one outer rune per body word*:

`7 (unchanged heading) + (88 − 19) = 76.`

Exactly two directional choices are admitted: retain the PARABLE heading, and remove either the *first* or the *last* rune from each of the 19 body words, using the original printed word segmentation. Each resulting 76-rune GP29 stream becomes a candidate full-length key for the original 76-rune p55 ciphertext, in source order. The sentence and manuscript do not actually command this key transfer. The matching length makes it a bounded hypothesis worth testing once.

Earlier [19×4 / 19×5 affine-code work](terminal-p55-p57-19block-affine-obstruction.md) rejected fixed secret block matrices on unsegmented pages; it did **not** cover removing first/last glyphs from the *printed* body words. The broader [circumference report](instar-circumference-edge-strip.md) tested other ring and repeat-key interpretations, but did not test these specific 76-rune keys against p55 under the two established differential rank conventions.

## All-secret monoalphabetic exclusion independent of source position (Agent47, 12 November 2026)

The same two **source-specified 76-rune** stripped-p57 sequences can be tested as **literal plaintext candidates for p55** under *every possible* secret fixed bijective GP29 symbol substitution, independently of the numerical decoder/key candidates below. A bijection preserves the number of distinct rune labels even if an arbitrary, independently imposed reading order permutes their positions. In the original verified runes:

| Complete 76-rune sequence | Distinct GP29 symbols |
| --- | ---: |
| Original ciphertext p55 | **25** |
| Solved p57 heading + body words with each **first** rune shed | **22** |
| Solved p57 heading + body words with each **last** rune shed | **20** |

Because `25>22` and `25>20`, **no monoalphabetic bijection and no subsequent transposition** can map either literal source candidate onto the unmodified p55 ciphertext. This is key-independent; there is no need to try 29! alphabets. It does not reject an independent polyalphabetic/stateful cipher, homophones, insertion, or another intermediate register. [The existing SFT](../sims/p55_p57_oneedge_76_key_gate.cjs) now asserts these exact three distinct-symbol counts before its earlier candidate-decryption tests. Its 12 direct/rank-decoder results below remain unchanged.

## Twelve frozen complete-page decoders

Two source-derived keys are each evaluated under exactly six reversible operations:

- Original GP29 additive cipher, with `P_i = C_i ± K_i mod29`, two signs.
- Anti-doublet GP28 ciphertext-difference encoder, with `Δ_i = (C_i-C_(i−1)) mod29`, `C_(−1)=0`; nonzero differences are converted either by `Δ−1` or by the discrete logarithm base 15 in GF29; `Δ=0` emits the reserved EA symbol; the two key signs are tested for each rank convention.

All twelve models completely re-encrypt **76/76 original source runes** and recover **76/76 planted known GP29 plaintext runes**, with a forced EA sentinel testing the zero-difference channel. The differential model has a p55 ciphertext repeat at one noninitial position, handled without loss. No phase/offset/word reset, key permutation or unrestricted alphabet fit is introduced.

The strongest candidate is *remove-last, GP28 ordinal difference, positive key sign* with decoded IoC **0.04385964912**. The next relevant simple direct-GP29 candidate (remove-first, subtraction) reaches **0.04035087719**. All other source candidates lie from **0.03122807018** through **0.03894736842**. Every decoded transliteration is nonlinguistic.

As a matched-length native-language comparison, the repository's solved LP1 reference provides **3,504** greedily encoded GP29 runes, and **3,429** consecutive 76-rune windows. The **lowest** reference IoC is **0.04561403509**. All twelve original candidates remain below that floor, including the highest GP28 candidate. This benchmark describes the tested GP-native register; it does not forbid an unknown language, compressed intermediate or a separate source-provided transform.

## A three-way inverse: p57-shaved candidate plaintext, p55 ciphertext, p50-ring key

Read the real 32×8 table's perimeter from top-left, across the top, down the right side, along the bottom from right to left, then up the left side, without repeating corners: **76 source token values**. Reverse that complete ring as the sole direction alternative. The conventional published base60 interpretation gives original bytes 0…255, reduced modulo29 for a direct GP rune pad.

Under the exact candidate `C55 = shed(P57) + perimeterPad mod29` or `C55 = shed(P57) − perimeterPad mod29`, the **required** pad is `(C55 − shed(P57)) mod29`. Because both p55 and the shaved p57 are fixed original strings, **no guessed plaintext or cryptographic key is used**.

| p57 shaving | Ring direction | Matches if ring added to known p57 | Matches if ring subtracted |
| --- | --- | ---: | ---: |
| First | Clockwise | 1/76 | 4/76 |
| First | Reversed | 4/76 | 3/76 |
| Last | Clockwise | 5/76 | 6/76 |
| Last | Reversed | **6/76** | 4/76 |

Every direct ring interpretation has at least **70** contradicted positions. There is no resulting source-key encryption of the observed p55 ciphertext under these stationary source-order rules.

More permissively, allow the **entire 76-byte table perimeter** to act through an **arbitrary completely unknown but fixed function** `F(byte) → GP29 pad`, with a different free F for each of the four source readings. This contains *every possible stationary substitution codebook*, including the ordinary byte residue rule. The original perimeter has **68 distinct byte values** in 76 positions, hence eight repeated-token occurrences. A single stationary function must give identical pad for each repeated token. The exact maximum-match calculation sums the modal required-pad frequency for each source-token class:

| Shaving / perimeter orientation | Absolute maximum exact positions under every secret lookup | Forced errors |
| --- | ---: | ---: |
| First / clockwise | **68/76** | 8 |
| First / reversed | **68/76** | 8 |
| Last / clockwise | **70/76** | 6 |
| Last / reversed | **69/76** | 7 |

Thus no *fixed token-to-key lookup*, regardless of its unknown 256-entry content, can make the two original terminal strings form a clean additive relation using this literal 76-cell ring order. This conclusion is conditional on the p57 shaving actually being the proposed p55 plaintext, which is **unproven**. A stateful or position-dependent key and another geometric traversal remain logically possible, but no original source selects them.

## P57 19-word numerical key: independent direct GP29 test

A second literal interpretation of the signed 2016 hint “Its words are the map … their numbers are the direction” lets each of p57's **19 body words** supply one additive GP29 key value, repeated across a consecutive group of four p55 runes. The two obvious source-authentic word values are sum of GP rune indices and sum of GP prime weights, each modulo29. These yield precisely **19×4 = 76** p55 decoded runes with no chosen phase. All four plus/minus streams have IoC in **0.032632–0.041404** and no native-GP prose. This excludes those four direct scalar-key reads alone. The 19×4 block assumption is not an independently printed p55 layout.

**Executed source test:** [Node 22 workflow run 43168398561](https://github.com/FlareZ123/liber-primus/actions/runs/43168398561) completed this new SFT step successfully. The combined legacy workflow failed at an **unrelated pre-existing** p55 SHA1 score assertion in another SFT; see run log. The new SFT reads the exact original p55/p57 corpus and 32×8 grid and includes native-GP and secret-map positive plants.

## Decision

**Retire these specific p57 one-edge-stripped keys as stand-alone GP29 additive or protected-zero GP28 differential decryptors of p55.** Also retire the exact direct p50 perimeter pad and every stationary unknown byte-to-GP-pad lookup in printed/reversed circumference order when the shaved p57 text is used as the proposed known plaintext. The 95−19=76 source-length equality and the explicit printed 19-word segmentation survive as observations, but do not license further fitted trims, key schedules or cipher menus without an independent instruction.

[Single-file, dependency-free CommonJS reproducer](../sims/p55_p57_oneedge_76_key_gate.cjs) uses the pinned original runic transcription, GP alphabet, solved p57 and p55 physical page indices, and solved LP1 reference. It asserts the exact source counts and all original/plant round-trips.
