# P32 HOME/BUDS +60 period-Vigenere gate

**Status (11 November 2026): bounded source-driven negative. No unknown LP2 plaintext or authentic key recovered.**

## Why this operation was worth testing

The signed 2016 tree image independently selects original physical p32: the page's 11×11 GP-prime square has first-row and first-column sums 563 and 569, exactly the image dimensions. The same p32 source contains a source-constrained pair of four-rune **edge fragments** at local offsets **33** and **93**: **HOME** is the prefix of the printed token `HOMEXWDSLFD`, and **BUDS** is the suffix of `OENGOMBUDS`. The p15 4×4 table suggests four-rune edges; the p32 11×11 map selects the 11th red-start spiral value 2838; and 3301−2838=463, the **90th prime** in one-based ranking, or **P89** in the p15 zero-based prime-order convention, directly points to p32 zero-based offset 89, the start of `OENGOMBUDS`. Thus BUDS is prime-rank-addressed, not an arbitrary substring search. The p15 Fibonacci-prime spiral itself is established prior work; the new hypothesis here is the cross-artifact use of its 11th entry's P89 address as a p32 rune offset. Their starts differ by **60**. The cross-round image dimensions also move by +60 from 2012 to 2016 after swapping axes, but reuse of that difference as a p32 selector remains an inference.

This motivates one concrete human-scale hypothesis: p32 uses a 60-period additive GP29/Vigenère clock, with HOME and BUDS literal plaintext landmarks. Because their four columns share the same period-60 phases, the edge-fragment landmark hypothesis fixes key phases **33–36 to zero**. No phase or key symbol is selected from output language.

## Key-independent whole-book gate

For an exact additive period-60 pad,

[
C_i=P_i+K_{imod60}pmod{29},
]

same-phase equality is invariant. Book-global LP2 has **470/12,896** lag-60 equalities. If the 60-state clock resets on each physical rune page, the source gives **365/9,656** eligible lag-60 equalities.

Using the repository's fixed GP transliteration and 2,000 deterministic original-length windows from each of Shakespeare, Gibran and Emerson, every one of **6,000** controls has more equalities under both clocks. Representative ranges:

- Shakespeare: global **711–836**, page-reset **514–656**;
- Gibran: global **772–838**, page-reset **544–651**;
- Emerson: global **741–883**, page-reset **530–687**.

Therefore the +60 clue does **not** support one exact native-GP additive pad repeated across the whole book or independently reset on every page.

## P32-only difference constraint survives

P32 itself is only 121 runes, so a 60-period key reuses each phase twice, with phase zero used three times. Its lag-60 equality count is **5/61**. The complete difference histogram over bins 0..28 is:

[
[5,0,3,4,2,3,1,0,0,3,1,1,1,1,3,4,3,3,3,3,4,2,2,3,2,2,1,1,0].
]

A native-GP difference-likelihood control trained on Shakespeare and evaluated on 5,000 windows from each of Shakespeare, Gibran and Emerson places the original p32 score near the middle of all three distributions. The source page therefore does **not** admit a key-independent rejection of a local 60-period additive clock.

## Exact period-60 inversion

The 60 unknown key phases form two coupled plaintext chains:

- positions 0..59;
- positions 60..119;
- position 120 reuses phase zero.

Under a fixed GP bigram model with original p32 word starts and ends preserved, the optimum can be solved **exactly** by cycle Viterbi rather than stochastic key search. Freeze the literal HOME/BUDS premise by setting phases 33..36 to zero.

The exact best source output is:

`TH HED PRELD ITWHEYOUSPE SERIS NDERS ONS HOMEREARCTYO METESE ASTREDEATHE DELLE ALLYOUND THEST SEREACOFUN YORE HANOBUDS WO NDE SE WHINGSELE HAREE WEND`

It is visibly more English-like than the raw ciphertext, but this appearance is not evidence because the model has 56 remaining free key phases.

## Conditioned source null

Hold all eight original HOME/BUDS glyphs fixed, preserve the exact p32 rune multiset, shuffle every other source rune, and rerun the **same exact optimizer** with the same word boundaries and zero-shift phases. Across 1,000 deterministic shuffles:

- original optimized score: **−306.2484532925**;
- **108/1,000** shuffles score at least as well;
- plus-one conditional upper tail: **109/1001 = 0.1088911**.

Thus the English-looking optimum is a routine consequence of optimizing a highly underdetermined 60-phase key against a short page. The original source arrangement is not distinguished.

## Decision

Retire these exact interpretations:

1. one period-60 additive GP29 pad repeated book-wide;
2. a period-60 additive pad reset on each physical page;
3. treating HOME/BUDS plus the +60 source relation as sufficient evidence for a p32-only Vigenère key and selecting the maximum-language output.

The p32 HOME/BUDS/+60 relationship remains exact source structure. A local p32 period-60 cipher is still mathematically possible, but another independent source clue must supply most of the missing 56 key phases or a stronger state transition before this branch becomes a decryption route.

**Reproduce:** `node sims/p32_home_buds_period60_vigenere_sft.cjs`.
