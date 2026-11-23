# An authentic 2014 seven-column operation on LP2 word-boundary gaps

**22–23 November 2026, Agent33. Classification:** a complete, source-derived, reversible **segmentation-changing** LP2 candidate has been tested on original contiguous ciphertext and a disjoint untouched chapter. The eight historical-key inverses are uniformly nonlinguistic. The underlying seven-column operation was genuinely used in the solved 2014 Cicada Stage5 puzzle, but its **application to LP2 boundary gaps and word-reset GP29 keys is a separate unselected hypothesis**. No unknown LP2 plaintext, author-supplied LP2 key, or destination was recovered.

## Original human-route premise and independent rival

The authenticated 2014 Stage5 OutGuess plaintext presents 56 letters in eight seven-column rows; historically attested ordering `1736254`, represented as zero-based source indices **[0,6,2,5,1,4,3]**, recovers the exact **`TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133`** continuation. The source and precise extracted bytes are in [the four-JPEG/OutGuess reconstruction](2014-stage5-avowy-archive-audit.md). This is a demonstrated original puzzle instruction and a sensible human-scale operation to consider elsewhere. It does **not** tell players to apply that ordering to punctuation, to unknown LP2, or to restart a cipher at its word boundaries.

LP2's actual punctuation and word boundaries are unlike ordinary native prose, and the 29-rune ciphertext histogram is nearly uniform. A simple transposition of rune indices cannot change that histogram. The distinct experiment here moves only the *between-rune word-boundary marks*, then additionally transforms GP29 rune values under one of two authentic solved LP1 keywords. Its rival is an ordinary high-entropy external-key cipher whose printed space placement is not an encoded boundary channel. Earlier #2278 programs tested whole rune-and-punctuation token permutations, a p15 numeric Hill4, p50 byte-driven GP30 shifts and 2014 magic-square GF31 Hill; none is this no-empty-slot, gap-only Stage5 transformation.

## Exact fully reversible source tape and rule

The source is the canonical `resources/liber-primus/lp2-corpus.json` and matching literal `lp2-transcription.txt`, physical pp0–55. The 55 rune-bearing pages contain **12,956** original GP29 symbols; physical p50 is numerical and has zero runes. Between adjacent runes are **12,955** exact source punctuation slots, of which **2,895** are nonempty; the final printed punctuation `.&$` is retained as an independent terminal field. These fields give **2,896 complete printed words**, including **32 genuine cross-physical-page words**. Original line wraps and physical page separators do not break words.

The nine original red-heading chapter boundaries in global source-rune offsets are exactly

`[0,729,1874,3603,5506,6527,7960,9640,12648,12956]`.

At each chapter, apply the historical `[0,6,2,5,1,4,3]` permutation independently to every successive *complete* block of seven **between-rune punctuation slots**. Preserve trailing incomplete blocks, chapter-final gap and terminal `.&$` literally. The alternative read direction is the exact historical inverse `[0,4,2,6,5,3,1]`. Both transforms are genuine bijections of the source punctuation slots; every source rune and every actual punctuation identity survives. Reversing the same original-seven permutation exactly restores all source slots without assuming a plaintext dictionary, introducing or deleting spaces, or inferring secret keys.

As a separate cryptographic hypothesis, decode rune `C_i` within its *new* printed word by `P_i=(C_i±K_{j mod |K|}) mod 29`, `j=0` at every newly established word start. Only two genuinely proven Cicada LP1 keys are supplied: `FIRFUMFERENFE` (13 original GP29 symbols; exact source-corrected spelling) and `DIVINITY` rendered in historical GP spelling `DIUINITY` (eight GP29 symbols). Both signs are checked, and no shift offset, secret seed, page phase, language-selected exception, invented filler or ciphertext mutation is permitted. A *word-reset* key schedule is experimental rather than a historically demonstrated LP1 clock.

## Original text and holdout decisions

The first original receiver is **all pp16–21**, global source-rune offsets `[3762,5375)` (**1,613** runes). The independent holdout is **all original pp40–53**, `[9640,12648)` (**3,008** runes), including the real number-table-only p50. Neither target was used to choose source keys or seven-gap ordering. Authentic clear solved p57 has GP29 IoC **0.062710**, and the raw original receiver intervals have IoC **0.034549 / 0.034543**.

| Gap operation and fixed key inverse | pp16–21 IoC | pp40–53 holdout IoC |
| --- | ---: | ---: |
| Stage5 forward; Circumference, minus | 0.034305 | 0.034475 |
| Stage5 forward; Circumference, plus | 0.034397 | 0.034367 |
| Stage5 forward; Divinity, minus | 0.034389 | 0.034372 |
| Stage5 forward; Divinity, plus | 0.034563 | 0.034544 |
| Stage5 inverse; Circumference, minus | 0.034566 | 0.034572 |
| Stage5 inverse; Circumference, plus | 0.034510 | 0.034498 |
| Stage5 inverse; Divinity, minus | 0.034751 | 0.034563 |
| Stage5 inverse; Divinity, plus | 0.034443 | 0.034532 |

All eight original outputs are within **0.034305–0.034751** on the opening and **0.034367–0.034572** on the independent holdout; their GP29 frequency profiles are random-like, and none reveals a continuous English-GP passage. Word length carries a superficially more concentrated adjacent-length mutual information (**0.045910** forward, **0.040925** inverse, compared with the original **0.012300**), but that isolated numerical increase does not validate segmentation. The complete unchanged input has only **83** one-rune printed words; the forward transform creates **587** and the inverse **457**, occupying **all 29 distinct rune identities** in either case. Native ordinary English requires frequent A/I and sometimes O singletons, far fewer than 29 different singleton characters. On pp16–21 the respective 17 original one-rune words become **79/62**; on the untouched pp40–53 the respective 13 original one-rune words become **140/96**. These are strong structural objections to interpreting the changed punctuation as natural word boundaries under the declared one-rune-per-letter output.

This is a **bounded original-cipher negative**, without a universal significance claim. A novel many-to-one rune map, different punctuation semantics, genuine book-sourced external pad or source-selected nonlocal cipher would be different architectures. The changed word-length dependence was not independently calibrated for postselected alternative punctuation models and should not become a plaintext claim.

## Positive controls and decisive next input

The reproducer first decodes the actual **56-character original 2014 Stage5 ciphertext** with its documented seven-order permutation and asserts the entire authentic known phrase plus onion continuation exactly. It then validates literal original runes, punctuation and 32 cross-page carries; all eight original-model inverse/forward checks recover the exact **12,956/12,956** ciphertext runes with all separator fields retained. For each of the eight hypotheses, encode the actual **95 source-native clear p57 GP29 runes and their authentic printed gaps** under the declared word-local keyword and inverse seven-gap operation, then recover **95/95** native GP runes and every genuine gap identity. All eight wrong-**keyword** controls fail to recover the real 95-rune message. A positive plant tests the decoder's mathematical ability to recover language; it does not authenticate LP2 transfer.

**Decision:** retire a direct Stage5 seven-gap boundary permutation coupled to unchanged historical Circumference/Divinity GP29 word-reset shifts. The tempting increase in word-length mutual information is contradicted by **hundreds of new singleton words** and two large, independent random-register outputs. An independently first-party **LP2-specific instruction that selects a punctuation clock, cipher consumer and relevant key source** is required before resurrecting this branch. Exhaustively varying more seven-gap offsets or keys would be unfounded.

[Exact original-source Windows Node22 CommonJS SFT](../sims/lp2_2014_stage5_sevengap_wordreset_original_sft.cjs) · [successful Windows manual CI run 45086324477](https://github.com/FlareZ123/liber-primus/actions/runs/45086324477) · [manual-only workflow](../.github/workflows/lp2-2014-stage5-seven-gap-original-manual.yml) · [Director issue #2278](https://github.com/FlareZ123/liber-primus/issues/2278).
