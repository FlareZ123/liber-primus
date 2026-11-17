# Original LP2 adjacent-repeat positions exclude a fixed GP29-escape English transducer

**Decision (Agent20, 17 November 2026):** The original 12,956-rune LP2 unknown book has just **86 adjacent equal ciphertext runes**. Of those 86 second-rune positions, **23 begin a printed word** and **19 end a printed word**; none is a single-rune word. A simple fully lossless stateful explanation for anti-repetition is to reserve one fixed plaintext rune \`E\` as an escape and make its ciphertext equal the previous ciphertext; all other 28 plaintext runes are mapped bijectively to the 28 different output runes. This implies a strong **key-independent prediction**: the original 86 repeat sites must be exactly the occurrences of the *same* unknown GP29 plaintext rune, so they should have its native-English within-word positional distribution.

Original-word-length-matched heldout English controls disfavor **all 29 fixed escape symbols** in this exact family. After searching all 29, the best candidate remains more than **8.57** empirical control standard deviations away on at least one source feature for independent Shakespeare and **7.76** for Gibran. This is a **bounded negative for ordinary GP-native English and this precise lossless architecture**, not a proof against all anti-repeat ciphers, changing escape symbols, missing registers, authored nonstandard grammar or key streams.

## Reversible channel, no lost bits

Work with the original fixed 29-symbol GP alphabet, indices \`0..28\`. Fix a single plaintext escape index \`E\`. For a plaintext rune \`P_i != E\`, its 28-rank \`rank_E(P_i)\` is the index of \`P_i\` after deleting \`E\` from the ordered alphabet. Fix any 28-valued per-rune secret key \`K_i\` and previous emitted glyph \`C_{i-1}\`.

- If \`P_i == E\`, emit \`C_i = C_{i-1}\`.
- Otherwise emit \`C_i = (C_{i-1} + 1 + ((rank_E(P_i) + K_i) mod 28)) mod 29\`.
- Decode \`P_i=E\` on equal adjacent ciphertext; otherwise invert the 28-rank and add \`E\` back in its original alphabet position.

This is exactly reversible for **every** value of \`E\`, prior glyph and key value. It can produce a near-uniform 29-way ciphertext distribution with arbitrarily few equal adjacent runes if \`E\` is a rare plaintext rune. Hence it avoids the noninjective "repeat-rejection retry" ambiguity reported separately in [#1296](https://github.com/FlareZ123/liber-primus/issues/1296). No authorship or original key is claimed for this hypothetical operation. The SFT plants genuine GP29 Gibran plaintext and proves 3000/3000 forward and inverse agreement under four different escape indices, using the provisional original p49–51 base60 grid bytes modulo28 as a reproducible *control* key.

## Source-native, independently heldout English test

Read original \`resources/liber-primus/lp2-transcription.txt\` by its source physical-page conventions and truncate before the solved p56. The 55 rune-bearing unsolved pages, excluding runeless p50, produce exactly **12,956** rune glyphs, **2,896 printed words**, **83 one-rune words**, and the **86/23/19** repeat-site triple above. Page breaks do not create artificial words. The original ciphertext is never edited or decrypted.

Convert two **independent** public-domain English texts in \`resources/control/\` to native GP29 using the existing project's \`ING\`, \`IO\`, \`QU→CW\`, \`V→U\`, \`K/Q→C\`, \`Z→S\` normalization, and tokenize each word separately. For each source printed word length, randomly select a same-rune-length word from the control corpus with replacement. Do this with a deterministic 32-bit LCG (seed \`0x9e3779b9\`) for **700 full original-shaped plants** per language. Each original-shaped plant supplies all 29 possible fixed-symbol occurrence triples (total count, word-start count, word-end count). Compare observed original \`[86,23,19]\` to each symbol's empirical control mean/standard deviation and give the **best of all 29** the benefit of selection. This is not a calibrated formal p-value; the standardized differences show the scale of the conditional mismatch with those two reference distributions.

| Native control | Best of 29 escape runes | Expected total | Expected word starts | Expected word ends | Largest absolute standardized deviation |
| --- | --- | ---: | ---: | ---: | ---: |
| Original unmodified LP2 | unknown | **86** | **23** | **19** | observed |
| Shakespeare, 700 plants | P | 211.1 | 95.8 | 16.7 | **8.57** |
| Gibran, 700 plants | G | 191.4 | 71.1 | 19.0 | **7.76** |

The superficially enticing rare last-rune \`EA\` is *not* an escape fit. Shakespeare's original-shaped word frequencies predict approximately **98.8 EA occurrences**, near 86, but only **6.2 at word starts** and **1.8 at word ends**, versus observed 23 and19. Gibran expects about119.6 total,10.7 starts and2.5 ends. \`NG\` similarly predicts a near-matching total (~97 in Shakespeare), but only ~1.3 word starts and ~48 word ends. A symbol's total rarity alone cannot explain the original repeat-site geometry.

The table is conditional on native GP English from these two independent sources. Shakespeare and Gibran are stylistically different from Cicada's unknown author, and the original plaintext may be non-English, differently tokenized, multiple-stage encrypted or otherwise intentionally patterned. Treat this as a decisive *model choice* against the simplest one-global-escape English model, never as a complete cryptanalytic impossibility theorem.

## Reproducibility and research consequence

[Executable Windows Node22/CommonJS SFT](../sims/lp2_fixed_escape_repeat_site_native_gate_sft.cjs) reads the original untouched committed transcription, 256 source-table bytes only for its synthetic positive, and both full independent English references. It asserts the original \`[86,23,19]\` triple and validates exact forward/inverse losslessness. The seeded simulations evaluate **all** 29 escape choices rather than only the preselected rare symbols. On 17 November 2026 the identical calculations were independently executed in the repository-connected JS runtime. A manual Windows CI run was dispatched as [run 44050649896](https://github.com/FlareZ123/liber-primus/actions/runs/44050649896), **queued at initial report time**; do not claim CI PASS without its confirmed terminal result.

**Decision for next research:** avoid a speculative fixed \`EA\`, \`NG\` or \`F\` plaintext escape selected because its *total* frequency resembles the original doublet rate. A subsequent lossless anti-repeat theory must explain the unchanged **original site shape** jointly with frequency, or source a different register, moving escape, nontrivial state/code or separate data. This study did **not** recover an unknown rune of plaintext or an authentic key.
