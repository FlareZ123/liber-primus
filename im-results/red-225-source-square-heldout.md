# Source-defined 225-red-rune square as a repeating key: original-language holdout negative

**Agent 1, 2026-11-10. Classification:** original-ciphertext finite key-source test with an independent source-language planted control. **No original LP2 plaintext, pad or cipher mechanism recovered.**

## Source-selected construction and question

The corrected original-image annotation `resources/liber-primus/lp2-ink-annotations.json` records **225 red runes across all 58 physical LP2 pages**, including solved pages 56–57. This equals **15²**, allowing a literal 15×15 square in original page/span/rune order, without changing the image-selected red glyphs. The same source annotates 36 large punctuation events, a second perfect square, but this experiment does not invent any punctuation-derived permutation. The dimensional observation was noticed during exploratory investigation; it is not an authenticated intentional cipher structure.

A narrow test: could these independently marked runes be a **repeating additive mod-29 key** applied to black-ink ciphertext? Interpret the red square in original row-major order or in column-major order. For each rune, use either its Gematria Primus index (0–28) or its assigned prime value modulo 29. For both signs, test page-reset and globally continuous key clocks, each counting either *all* physical ciphertext positions or *black-only* positions. These **32 complete deterministic configurations** are the entire bounded family; no red glyph, permutation, unknown plaintext or pad phase is fitted.

Remove the 213 red runes from the original unsolved physical pages 0–55, leaving **12,743 black ciphertext runes**. Use pages 0–27 (**6,637 runes**) to rank candidate inverse-decryptions by whole-register 29-rune index of coincidence (IoC). Freeze the winner and evaluate pages 28–55 (**6,106 runes**, with page 50 runeless) without refitting. The source includes its two solved-page red headings as potential key bytes, but those solved pages are **not** scored as ciphertext. This preserves a reproducible source distinction.

## Original and planted outcomes

| Condition | Fixed rule / outcome |
| --- | --- |
| Training winner | 15×15 column-major; GP-prime residues; page-reset; physical-rune clock; inverse sign +1 |
| Original training IoC | **0.03460698480752913** |
| Original held-out IoC, same frozen rule | **0.03451000653752046** |
| Maximum held-out IoC among all 32 original candidate rules (descriptive, postselection) | **0.03462761215791023** |
| Uniform mod29 reference | **0.034482758620689655** |

A positive control was separately generated using only English from the **final 60,000 characters** of the pinned Shakespeare corpus, GP-encoded using the repository's digraph mapping. It was padded under the *exact column/prime/page/physical-clock/sign+* candidate. Whenever an encrypted symbol equalled its immediately preceding published symbol within a black page segment, it was randomly changed to a different GP rune with 81% probability, deterministic seed `0x55a5c033`. There were **388 actual replacement events**.

The source GP-English plaintext's IoC was **0.058641826776955286**. The exact selected 32-model probe recovered the planted key setting in first place with **training IoC 0.05749236907130038**, and its unchanged rule retained **heldout IoC 0.05672282174083681**. Thus the simple pad architecture would have been detected despite more than 300 genuine local ciphertext repairs.

**Interpretation:** a direct, unchanged row/column reading of the corrected 225 red runes is not a recovered repeating additive key for ordinary GP-English under these 32 specified clock, residue and sign conventions. This finding does **not** refute the source ink as a key for an independently defined keyed permutation, stateful stream cipher, non-English intermediate language, image-based reading order, or a separate encryption layer. Pure reordering of the 225 red symbols leaves their own original IoC **0.03321428571428572**, so a mere column transposition of the red text alone also cannot yield an English-like rune monogram profile without further changes.

## Reproduction

Source-exact CommonJS implementation: [`sims/red_225_square_key_holdout.cjs`](../sims/red_225_square_key_holdout.cjs). It asserts the complete image-derived red and black rune contracts, contains the positive generator, displays all selected key parameters and SHA-256 identifiers, and fails if the positive control cannot recover the correct key or the original top original score becomes unexpectedly English-like.

The existing Agent 1 manual workflow [`word-lag5-affine-keyfree.yml`](../.github/workflows/word-lag5-affine-keyfree.yml) now accepts a `red-225` choice; no new per-commit CI workflow was added. The analysis was also independently executed against the current shared JSON and Shakespeare source **inside the connected V8 runtime** with matching numeric scores and planted key recovery. The complete committed CJS file has **not yet been executed in a GitHub Actions runner** because the available GitHub connector does not expose an action-dispatch operation. Until a successful full script execution is recorded, treat this as an independently calculated result with the end-to-end implementation not yet CI-verified.

The 15² dimension and physical red-pair numbering were selected because they are source-observable; their historical meaning remains conjectural. Further work should require a fixed *external* clue for a nontrivial reading/key schedule and an original ciphertext-to-plaintext holdout, rather than multiplying rotations of this unsuccessful direct pad.
