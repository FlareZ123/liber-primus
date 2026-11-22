# Additional exact length-stratified null for the previously established p27/p55 ciphertext bookend

**Agent45, 13 November 2026.** This is an additional conditional combinatorial analysis of the previously established six-rune bookend and its previously established unique seven-rune continuation into the first ciphertext rune of solved p56; see [the existing original-pair and known-boundary analysis](lp2-bookend7-p56-known-boundary.md) and its already-completed chapter/page-conditioned 30,000-shuffle experiments. The original 12,956 unsolved LP2 runes, segmented at their printed punctuation, contain exactly **one** repeated contiguous two-word ciphertext phrase: the six-GP-rune pair `ᛞᛄᚢ ᛒᛖᛁ` (transliteration `DJU BEI`). It occurs at physical **p27** and as the **final two whole words on p55**. The literal duplication is already noted in [the tree/cicada illustration study](tree-outline-blur-crosspage.md#specific-bookend-phrase-outguess-test), whose six phrase-derived OutGuess passwords failed on all 58 JPEGs. This study adds a complete original-word-pair census, a fixed-word-length conditional null, and an exact analytic rarity bound. **The duplicated ciphertext does not establish identical underlying plaintext, a cipher key, or a destination.**

## Source-exact census

Use the canonical [unmodified LP2 runic transcription](../resources/lp2-transcription.txt), and the existing page-continuous word parser [lp2_word_pages.cjs](../sims/lp2_word_pages.cjs) to join 32 words spanning a physical page boundary while retaining the original punctuation as boundaries. These 2,896 printed words have 2,895 adjacent ordered word pairs. Exactly **one pair** appears twice, at zero-based global word indexes **1462** and **2894**:

| Occurrence | Source location | Source-local position | Exact ciphertext |
| --- | --- | --- | --- |
| First | physical p27, within the first page of the p27–32 chapter | complete-word indexes **5–6** (zero-based on that page) | `ᛞᛄᚢ ᛒᛖᛁ` |
| Second | physical p55, final page of the final p54–55 visual chapter | complete-word indexes **14–15** of 16; **last two words** of all 56 unsolved pages | `ᛞᛄᚢ ᛒᛖᛁ` |

Each individual component rune word appears **exactly twice**, only in this paired order. There is no other duplicate adjacent whole-word pair at any word length, and no duplicate three-word phrase. These are deterministic properties of the provided transcription; direct original JPEGs remain the reference for any future disputed glyph boundary.

## An exact conditional chance bound

The repeated phrase is a **3+3** rune-length pair. There are **720** three-rune word slots and **184** adjacent places whose two original word lengths both equal three. Their original symbol inventory contains **704 unique 3-rune word spellings**, including 14 types of multiplicity two and one type of multiplicity three.

Freeze the **entire original 2,896-word length sequence**, and freeze the **exact multiset of all 720 original three-rune ciphertext words**. Under a uniformly random reassignment of these words only to the 720 permitted length-three positions, let `D` count repeated adjacent ordered 3+3 phrases. Of the `C(184,2)=16,836` ordered site-pair comparisons, **16,800** are disjoint and **36** share a word slot. Using falling factorials `(n)_k=n(n−1)...(n−k+1)` and each word type's original multiplicity `f_a`, their exact pair-equality numerators are:

```text
S4 = sum_{a != b} (f_a)_2 (f_b)_2 + sum_a (f_a)_4 = 1064
S3 = sum_a (f_a)_3 = 6

E[D] = 16800 × 1064 / (720)_4 + 36 × 6 / (720)_3
     = 0.0000676538434737498
```

The actually observed `D=1` implies, by Markov's inequality, an **exact upper bound** `P(D≥1) ≤ 0.0000676538434737498` for **this conditioned and selected 3+3 stratum**. The calculation counts all 3+3 word pairs, not just the retrospectively noticed literal phrase; it gives no trial-correction for searching other word-length combinations, chapter pairs or other manuscript structures.

A separate, broader matched-null simulation corrects the selection of the **whole two-word length class**, rather than only 3+3. Run 15,000 deterministic Fisher–Yates shuffles of original word identities **only within exactly equal-length original word slots**, maintaining all original length positions and all word-type multiplicities. On each shuffle search all 2,895 adjacent word-pair types for repeats, without selecting length3 or the observed bookend pair. There are **193/15,000** randomized manuscripts with at least one duplicated pair at any lengths, giving add-one empirical **family-matched p = 194/15001 ≈ 0.01293247**. Only **1/15,000** shuffled books repeats any 3+3 pair (empirical postselected p = 2/15001 ≈ 0.00013332), compatible with the small exact expectation. This length-conditioned shuffle is still a **model**, not a probability of authorial intention: the manuscript's spellings and repetitions may be correlated through linguistics, a stateful cipher, deliberate copy editing or other editorial structure.

## Relation to already established chapter/page-conditioned controls

The existing [seven-rune bookend report](lp2-bookend7-p56-known-boundary.md) already proved that the phrase extends to `DJU BEI AE` across p55/p56, the **only** full seven-rune repeat in all 13,136 original LP2 runes. It also held both the word-length tape and each **visual chapter's** inventory fixed (only **4/30,000** simulations have an adjacent repeated pair of at least six runes), or held each **physical page's** word inventory fixed (**754/30,000** simulations). In that second, stronger conditioned null, p55's only two three-rune words are *already the observed pair*, and their correct ordering is almost inevitable. This new whole-book length-only test leaves the allocation of words between chapters/pages free, giving **193/15,000** all-length repeat events under its separate null. Such choices of what to hold fixed substantially determine the observed p-values. The exact 3+3 expectation above is new, but **the original phrase discovery, the bookend clue, and the more detailed known-boundary constraints predate this experiment**. Never present this supplementary count as an independent decryption or a novel source-discovery.

## Human solve path and competing explanations

The first occurrence lies on **p27**, associated with the tree/floral transition, while the second closes **p55**, the last unresolved runic page with the pale tree and the recurrent Cicada emblem. The shared two-word phrase is a natural **bookend anchor** for trying to link p27 to p55, and the 2016 signed instruction treats manuscript words as a map. A player could notice the repeated six-rune motif without seeing a statistical analysis. However, repeating ciphertext can result from verbatim copying, a repeated formula, a fixed cipher phrase, or post-encryption textual decoration. Its exact meaning remains completely unknown.

If the repeated words represent identical underlying plaintext, a candidate decoder must independently account for the **same six input runes** at two different original locations, while preserving every original punctuation and producing readable **unseen nearby runes**, particularly the adjacent original p55 terminal passage. A test restricted to this already-identical six-rune window is vacuous; **at least 20 additional previously unrecovered adjacent runes** and a separately selected key or operator should be the minimal prospective gate. The prior six password-derived OutGuess tests [failed](tree-outline-blur-crosspage.md#specific-bookend-phrase-outguess-test), so do not repeat them.

**Decision:** preserve this alternate exact length-only null beside the earlier, more informative chapter- and page-conditioned tests. The whole-book figure lies between those prior controls and does not change the established research decision. The bookend remains an original-source plaintext-anchoring clue, while the finite rarity is conditional support rather than a decipherment. Do not search arbitrary substitutions of `DJU BEI` or claim that the known ciphertext literally says an English phrase. Future work should seek an independent authorial selector for a reversible mechanism; the pair is useful for falsifying that mechanism on two original positions and their untouched context.

## Reproduction

[Single-file CommonJS Node22 original-input SFT](../sims/lp2_bookend_wordpair_lengthconditional_sft.cjs) asserts all corpus totals, both zero-based phrase positions and their physical pages, whole-book unique-pair census, complete 3+3 multiplicity inventory, `S3`/`S4` exact combinatorics, expected duplicate count, and fixed-seed 15,000 full-inventory-matched randomizations (xorshift32 seed `0x3301d355`). No text or manuscript glyph is edited in the original. The simulation reports both all-length and 3+3 family outcomes and can be independently rerun on Windows Node22 with no dependencies beyond the repository's canonical parser.
