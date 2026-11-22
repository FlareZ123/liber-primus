# Original 242 black scroll words ↔ 242 page-contained p8 black runes

**Original-source result, Agent 2, 22 November 2026.** This tightens the adjacent 255↔255 observation and specifies an operationally meaningful stream split. It does **not** recover unknown-page plaintext, a creator-selected key, a reversible original cipher, or the final destination. The independent original-image ink annotations, complete-word transcription and complete numerical GP29 ciphertext supply all inputs.

## What a 2014 reader could actually see

Physical p3–p7 are one five-page scroll (1,145 original GP29 runes) and contain precisely **255 complete printed words**, joining line and page carries. Classifying whole words against the original colored-rune segments yields **13 entirely-red words, 242 entirely-black words and zero mixed-ink words**. Red word positions in the 255-word scroll register are zero-based:

`[0,1,2,22,176,177,178,179,250,251,252,253,254]`.

Physical p8 immediately follows. Its **255 original runes** consist of a twelve-rune red heading and **243 black runes**. The final black rune `ᛇ` belongs to a **single six-rune printed word crossing from p8 into p9**: that page carries one GP rune, followed by five GP runes from p9. Consequently exactly **242 black p8 runes form the entire page-contained black receiver**, with a natural unchanged 242-word source tape on p3–p7. Both source and receiver can be read without removing or inventing original cipher symbols. This strengthens the prior plain 255↔255 cardinality by recognizing original ink and a complete-word seam.

Independently the *literal five final p7 red-word GP29-index products modulo three* define a primitive order-five GF(3) recurrence with 242 nonzero states; see the repository's existing p7 GF3 report. The new **242 black source words** supply one possible original word for each such state, and **242 page-contained black p8 runes** supply one possible receiver per state. A single carried p8 rune could serve a zero-state or seam marker, but that interpretation is conjectural. The red13 source words and red12 p8 heading runes do **not** explain their own mismatch. Neither the original text nor earlier authenticated Cicada instructions presently tell a reader how to transform a source word into a corresponding receiver symbol, what the state ordering is, or how to decode p9. This is a well-typed missing **word→rune opcode**, not an unlocked cipher.

## One direct, source-respecting inverse decisively fails

Before fitting any keys, align the 242 black scroll words with the 242 black p8 runes by original printed order. The previously appealing 20/255 zero-phase equality between complete-scroll word GP29-index sums and all 255 p8 runes does **not** transfer to this ink-consistent pairing:

- **6/242** GP29-index word sums equal aligned source p8 black runes. Among all 242 cyclic shifts, the maximum is 18 and **198** shifts tie or exceed the exact source phase-zero score. The difference tape IoC is **0.0328863894**.
- Only **36/242** target p8 symbols occur anywhere within their corresponding source black word. This directly excludes a simple selection of one original rune from each word as an explanation of the whole receiver.
- More strongly, even giving a free source-rune selector **per word** and any completely secret fixed GP29 29→29 substitution, every one of the **29/29 p8 output classes** has an empty intersection of candidate input glyphs across all its matching words. Therefore the direct one-rune extraction is impossible under **every** global secret mapping, including all arbitrary nonbijective maps. Allowing a separate completely unknown secret mapping on **each of the five scroll pages** still leaves **52 of 121 occupied page×output classes impossible**. Synthetic source-selected glyphs under a fixed secret affine GP29 substitution correctly produce zero contradictions.
- Whole-word **BASE29** values reduced modulo243 have only **150 distinct labels** across the 242 black source words (149 when rune digits are reversed). Thus no one-to-one *direct* fixed-base29-mod243 address code for the 242 nonzero states is present without another selected transform.

Two further exact necessary conditions strengthen the same no-go. **Three pairs of identical original black whole words** appear at source black-word indices `(43,232)`, `(44,223)`, and `(227,228)`. Every pair is aligned to **different** p8 black output runes, so a stationary deterministic hash or codebook mapping a complete source word to one target rune cannot work, regardless of secret key or unbounded nonlinear word hash. The third pair is especially decisive: it is the **two consecutive identical black GP29 words on physical p7**, excluding even a page-local fixed whole-word codebook. All three pairs require changing state if this source register is the intended input. The minimal alternating word-position parity removes just these three whole-word contradictions, but no original page chooses that mode as the cipher.

The original p7 fivefold red rubric also motivates a much more permissive **five-state fixed secret alphabet** applied to *any freely selected source rune in every word*. Source-position phase modulo5 leaves **49 impossible classes among122 occupied phase×target groups**. Even granting **five separate completely secret tables for each original physical scroll page**, the page×phase×target test still finds **18 impossible classes among205**. Thus a fixed five-phase single-glyph extraction, with or without a page reset, cannot transmit this exact original p8 black receiver. A genuine source mechanism would have to aggregate more source information or evolve state beyond the tested stationary maps.

These are exact original-source obstructions, with no possible key fitting to rescue the stated deterministic one-glyph transport.

## A source-shaped shared-state pad was inverted on actual unknown ciphertext

There is an unusual route in which the apparently random original 242-rune difference tape is itself a **secret state pad**, rather than expected plaintext. Let a whole source scroll word's GP29-index sum, or alternatively its explicitly printed GP-prime **Gematria sum**, be `S[j]`. If `C8[j] = S[j] + K[j] (mod29)` and the same 242-state pad encrypts p9's original prose, then the pad is exactly recoverable: `K[j] = C8[j] − S[j] (mod29)`. No guessed key survives. Starting p9 after the authentic five-rune continuation of the p8 crossing word, decrypt the original first 300 later GP runes and predict a disjoint original p13 first 200 with the unchanged repeated 242-state key. Exactly reencrypt every original rune. True solved-p57 GP29 plants encrypt/decrypt 300/300 for each key.

| Fixed source checksum | Original p9 first300 IoC | Untouched p13 first200 IoC |
| --- | ---: | ---: |
| GP29-index word sum | 0.0340245262 | 0.0345226131 |
| GP-prime Gematria word sum | 0.0342251951 | 0.0349246231 |

All four original outputs are ciphertext-like, around the GP29 uniform baseline 1/29, and contain no coherent sustained GP29 prose. This rejects only the **explicit repeated 242-state additive pad with either source-word checksum**, not an evolving cipher or the larger original 242-state clue. Merely reencrypting random-looking plaintext under the recovered candidate pad proves nothing about author intent.

## Practical research decision

Keep the original **red13/black242 scroll words → red12/black242+carried1 p8 runes** as a physically independent, source-typed possible state-transmission interface. The next productive step would be a **first-party instruction or visibly determinative original illustration** fixing (1) how 242 complete source words encode 242 distinct states or values, (2) the 13→12 red register treatment and final carried GP rune, and (3) a *nonstationary and reversible downstream recipient*. Do not resurrect the old 20/255 sum spike as evidence of a plaintext checksum; source-color separation makes that match less compelling. Avoid inventing a secret 242-entry dictionary, cycling arbitrary permutations, or refitting a pad to p9 language.

**Reproducer:** [original-source Windows/Node22 CJS SFT](../sims/lp2_p3_p8_242_blackword_blackrune_transfer_sft.cjs). Sources: [exact previous whole-scroll 255↔255 experiments](lp2-five-scroll-255words-p8-255runes-p50-grid256-original-gate.md), [original ink register](../resources/liber-primus/lp2-ink-annotations.json), [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [source transcription](../resources/liber-primus/lp2-transcription.txt). Source registers remain fixed and all ciphertext counts are original.
