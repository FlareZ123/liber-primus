# Original LP2 terminal DJU-BEI: unique repeated two-word ciphertext phrase

**Evidence class: source-exact structural observation with two source-shaped null gates. No recovered unknown plaintext, key, cipher operation or destination.** This observation depends only on original GP29 word/rune order and chapter boundaries. Reproducer: [Node 22 single-file source test](../sims/lp2_terminal_dju_bei_phrase_sft.cjs); [manual native Windows test](../.github/workflows/agent29-terminal-dju-bei-original-manual.yml).

## Why this matters to a solver

The final six ciphertext runes of the entire undeciphered LP2 book, at the foot of the image with the 76-rune terminal p55 and immediately before the large terminal punctuation, are:

```text
ᛞᛄᚢ-ᛒᛖᛁ.
DJU-BEI.
```

**Precisely the same pair of complete three-rune words** occurs earlier, at the beginning of physical p27. This is the *only repeated adjacent two-word sequence* in all 2,896 original printed unknown words, even though 120 individual word types repeat. It is also the sole repeated contiguous six-rune run in all 12,956 ciphertext runes, when runes alone are concatenated. The two occurrences are separated by 6,395 ciphertext runes. This source-level repetition offers an independent potential cross-chapter crib or clock/state boundary check, provided some first-party clue specifies what two identical ciphertext words are intended to mean.

The earlier occurrence is near the beginning of p27 under a red chapter heading and a drawn cicada wing; the final occurrence is the two concluding printed words of p55, below the final large-text lines and before the thirteen-dot mark, above a pale tree/moth image. **No visible shared decoding opcode** is currently established by these illustrations, and the numerical distance must not be promoted to a key period merely because it has small factors.

## Source record and exact boundary accounting

Use `resources/lp2-transcription.txt`, with `resources/liber-primus/lp2-corpus.json` as an independent parser cross-check of physical rune positions. The former supplies original printed words; a visible `-`, `.`, or `&` ends a word, while line `/` and physical-page `%` do not. Omit the solved physical pp56–57; include the rune-free p50. The authentic unknown chapter rune counts are `[729,1145,1729,1903,1021,1433,1680,3008,308]`, and the corresponding word counts are `[158,255,383,437,224,326,378,669,66]`. Thirty-two words cross page boundaries; neither of these matching two-word phrases does.

| Property | First copy | Terminal copy |
|---|---|---|
| Original JPEG | `44.jpg` (physical p27) | `72.jpg` (physical p55) |
| Zero-based complete-word indices | 1462–1463 | 2894–2895 |
| Zero-based full-corpus rune offset | 6555–6560 | 12950–12955 |
| Physical-page local rune start | 28 | 70 |
| Native GP29 transliteration | `DJU-BEI` | `DJU-BEI` |
| Chapter (zero-based) | 5 (p27–31) | 8 (p54–55) |
| Boundary after pair | ordinary continuation | end of all unsolved ciphertext |

Across all 2,896 words there are 2,731 distinct whole-word values. There are 120 word types occurring two or more times, totaling 285 instances of these repeated types. The word `DJU` appears **only** at indices 1462 and 2894; `BEI` appears **only** at indices 1463 and 2895. A full adjacent two-word scan finds exactly one duplicated pair, with first and second occurrence indices `[1462,2894]`. A continuous rune n-gram scan finds **one** repeated distinct six-rune sequence, at offsets `[6555,12950]`; no seven-rune sequence repeats.

## Frozen null preserving exact printed word-length positions

To avoid calling an expected short-repeat event an instruction, randomly reorder complete **word identities only within their own chapter and their exact word-length class**, holding fixed every chapter boundary and every individual printed-word-length position. The original word inventory, all rune values within each word, and all word lengths remain unchanged. The nine chapter cuts and full word-carry grammar remain fixed. This is a stricter source-conditioned null than uniform placement of 2,896 independent words; the shuffled positions cannot fabricate or destroy the observed chapter-specific word-length sequence.

A 20,000-trial deterministic Xorshift32/Fisher–Yates experiment, seed `0x33011717`, gives:

| Original-source event | Observed | Shuffled count of 20,000 |
|---|---:|---:|
| Any repeated adjacent two-word phrase, searched across all nine chapters | one unique duplicated pair | **254** trials with at least one pair |
| At least two duplicate-pair occurrences | zero | **3** trials |
| Any two-word phrase duplicated specifically **at the final two printed words** | yes | **0** trials |

The familywise, scan-aware **any-duplicate** frequency is **254/20,000 = 1.27%** (plus-one corrected **255/20,001 ≈ 0.0127494**). This is evidence of unusual adjacent word-token dependence relative to the stated shuffle null, **not** proof of deliberate phrase placement. The final-position event was noticed after inspecting the corpus, so its more extreme conditional value cannot be read as a pre-registered discovery probability.

### Exact conditional terminal probability under this same word-shuffle null

The final p54–55 chapter contains fourteen words of length exactly three and **only one** adjacent 3+3 word-length position, which is at the end. Two of those fourteen are the globally repeated `DJU` and `BEI`; all the other twelve 3-rune tokens in the final chapter appear nowhere else in the book. In chapter index5, which holds the two previous copies, there are eighty-three words of length three and exactly twenty-five adjacent 3+3 positions. Each constituent token occurs once in each of these two chapters.

Conditioned on all these observed inventories and length positions, the exact probability of a matching **ordered** terminal pair somewhere in the earlier chapter is:

```text
P = [2 / (14 × 13)] × [25 / (83 × 82)]
  = 25 / 619346
  ≈ 0.00004036515938  (1 in 24,773.84)
```

The factor 2 permits either orientation of the two distinguishable repeated tokens. The 25 positions count valid possible earlier 3+3 adjacencies; the (83×82) denominator enforces distinct word positions. This exact value concerns the one **observed book-terminal event** under the frozen null only. It is not adjusted for all the other types of linguistic, arithmetic, visual, or endpoint coincidences the research population could have noticed. The Monte Carlo zero-of-20k terminal result is compatible with that exact conditional probability.

## Causal implications and next discriminating decision

A cipher that resets deterministically at each **whole word**, and which enciphers equal plaintext words identically, could preserve a repeated word pair under identical hidden states. A stateful cipher with an author-supplied reset or a repeated input phrase also remains possible. Conversely, any source-stationary random-looking output produces some repeated short runs at sufficient length, and a word-value coincidence does not establish common plaintext at the two sites. The copy beginning at p27 and the terminal copy on p55 have different preceding original context, so a claim of identical plaintext would require a motivated key/clock/state explanation.

A human-solvable next step would need **one independent source-selected cross-chapter word-reuse or key-reset rule**. Freeze it against p27 and p55 before inspecting further unknown pages. A candidate must predict at least one *new* untouched original-output constraint, recover an extended readable section, and re-encrypt it exactly; the phrase itself supplies only six repeated cipher symbols and cannot distinguish the many bijective models that map them to arbitrary words. The historical 14-column, generic period-five and direct p56 transfer sweeps are already negative; do not treat this coincidence as justification to reopen those searches.

**Status:** one source-specific, statistically conditioned original-cipher structural lead; no unknown plaintext, creator key, exact decoder, or final destination.
