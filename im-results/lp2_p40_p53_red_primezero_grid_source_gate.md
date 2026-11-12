# Original red boundary sums and a literal p40-to-grid consumer

**Agent37, 12 November 2026. Status: provisional original-source clue, no decryption or authentic key.**

## Frozen original source observations

Original visual chapter pp40–53 begins with **p40 local0, eight red GP29 runes** and ends with **p53 local128–178, 51 red runes**, followed by red 13-dot punctuation. Original ink source: `resources/liber-primus/lp2-ink-annotations.json`; glyph indices and prime values: `resources/liber-primus/lp2-corpus.json`.

| Original red span | Length | GP index sum | GP prime sum |
| --- | ---: | ---: | ---: |
| p15 local0, isolated numerical heading | 9 | 164 (mod29=19) | **638=29×22** |
| p40 local0, chapter opening | 8 | **116=29×4** | **435=29×15** |
| p53 local128, chapter closing | 51 | 634 (mod29=25) | **2262=29×78** |

Those are the **only three of 16 unknown-page red spans (213 red rune positions)** with prime-weight sum divisible by29. The p40 heading is the only unknown red span with both ordinal and prime sums divisible by29. Its indices are `[0,9,19,26,6,23,25,8]`.

Across all **12,949** sliding original unknown-ciphertext eight-rune windows, exactly **eight** have *both* sums divisible by29, at global offsets `[1103,4725,5692,5712,8621,9640,10930,12882]`; offset **9640** is the original beginning of chapter p40. The p53 red passage ends with GP-N, whose prime weight is 29, so its last rune contributes zero: the *first 50* already had total prime residue zero. This weakens any proposed deliberate terminal check-digit mechanism.

## Conditional exploratory null

Draw each red rune independently *with replacement* from its original visual chapter's empirical 29-rune distribution. Keep the observed 16 red-span locations and lengths. Exact modular convolutions and a 16-term Poisson-binomial calculation yield:

- Expected prime-zero red spans **0.5528885054**; probability at least three **0.01648620738**.
- Probability of both p40 eight-rune residues being zero **0.00092920038**.
- Probability p53 51-rune prime residue zero **1/29=0.03448275862**.
- Joint probability for those two explicitly chosen events **0.00003204139**.

These conditional frequencies are *exploratory and postselected* after observing the original, not author-intent or discovery-wide probabilities. This model ignores true word/rune dependence, so it is a diagnostic baseline only.

## One frozen eight-column table-reading test

The **same p40–53 visual chapter** includes original pp49–51 **32×8** numerical table (conditionally interpreted as conventional base60 bytes). Reading one cell in each of its eight columns, selecting the row from the corresponding p40 red heading rune with no offsets or permutations, yields:

| Source-based row address | Eight bytes, hex |
| --- | --- |
| GP index, zero-based | `CB4F0E3D56C07F6C` |
| GP index +1 | `5C3AC03B6A73FB52` |
| GP prime value modulo32 | `79EA9245F54CC721` |

An independently source-visible eight-rune red heading at p33 local91 gives `F0CA48C1616BA7CE` by the first rule. None of these literal, unmodified short outputs is a recognizable ordinary file header or intelligible instruction. That is a narrow negative for this one eight-column lookup, and no substitute index mapping is justified by the source.

## Exact 32×94 chapter/grid additive inverse

The nine originally visible chapters include p40–53 of length **3,008 = 32×94** GP29 runes, and *within that same chapter* the printed numeric table has exactly **32 rows of eight cells**. This is a source-visible dimensional compatibility, but does not specify an encryption method. A finite additional human-motivated interpretation is to divide the complete chapter, including its red opening and closing, into 32 consecutive rows of 94 runes, assign each the corresponding source-order grid row, and repeatedly apply its eight conventional radix60 byte values reduced modulo29 as an additive key.

To distinguish source-order reading from its transposed read, the one independently fixed companion convention interprets rune i's row as i mod32 and key-column as floor(i/32) mod8. No row permutations, phases, resets, fitted byte maps or secret keys are admitted. The complete original 3008-rune GP29 IoCs are:

| Frozen mapping | C−K IoC | C+K IoC |
| --- | ---: | ---: |
| Printed-order 32 consecutive ×94 rune rows | **0.034416370667** | 0.034543954178 |
| Source-order 32-column interleave | **0.034536657374** | 0.034434944350 |
| Original, unchanged | **0.034542627486** | same |

The 29-way uniform benchmark is 1/29≈0.03448276; full candidate prefixes remain nonlinguistic. This explicitly excludes a *direct ordinary-English GP29* reading under these four finite grid-byte pad clocks. The 3,008=32×94 divisibility by itself gives no reason to explore other table functions or row maps. The attached SFT includes exact full re-encryption, source-documented alignment, complete-output IoC, and positive native-GP plants.

## Research decision

The paired red prime-zero boundaries are a new original-source structural observation with a plausible human route to modulo29 arithmetic. **No actual source inscription prescribes the checksum or table addressing**, so refrain from promoting it to verified authorial intent, a key, or plaintext. Any follow-up should independently select a reversible consumer and predict untouched original ciphertext before fitting phases or permutations.

A single-file CommonJS source assertion/conditional null is at [the reproducer](../sims/lp2_p40_p53_red_primezero_grid_source_sft.cjs).