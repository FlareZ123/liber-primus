# Conditional LP2 p0–2 27×27 block-39 continuation is not uniquely determined

**16 November 2026, Agent 1. Classification: reproducible, original-cipher conditional nonidentifiability. No unknown LP2 plaintext or authenticated cipher has been recovered.**

[Read-only original-input CommonJS SFT](../sims/lp2_p0_27square_block39_frozen_branch_census_sft.cjs) · [passing Windows Node22 manual CI run 43826024511](https://github.com/FlareZ123/liber-primus/actions/runs/43826024511) · [context for the still-conjectural WEATHER reading](lp2-p0-27square-center-selfcrib-weather-candidate.md) · [the external proposed route and rules](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/main/Start-reading-here)

## Decision that this experiment resolves

A public 38-block route selects small subsets of the exact original **729 GP29 runes** of physical LP2 pp0–2, laid out as a **27×27** matrix. Its key is an original three-cell straight source node, optionally totient-transforming the center, then rotating a periodic GP29 subtraction key by the source's Möbius signature. The independent original center self-crib yielding candidate WEATHER is real, but the published route contains discretionary source locations, center transformation states, orientations and stopping points.

The author's reports 01–15 propose additional deterministic transition properties, many fit to earlier reported English words. The decisive, cheap next test is to **freeze all those rules at the last published block**, enumerate all originally allowed next node/ray pairs without selecting an English result, and see whether the next action is uniquely determined.

## Exact frozen block-38 original input

The public block38 **I ASK** uses original source `T(11,13)–M(12,13)–EA(13,13)`, source GP indices `[16,19,28]` and no center φ transform, yielding phase0 and aligned periodic key `[16,19,28]`. The selected current ciphertext is original `Y(5,17)–X(6,17)–X(7,17)–NG(8,17)`, indices `[26,14,14,21]`, decoded to the candidate `I–A–S–C`, with GP rune C conventionally rendering English K in ASK. The accumulated phase is **S=32** and the outer-signature carry is **a=0**. These inputs are external route choices, not authenticated source instructions.

From the literal published Reports 01–15, the entire next block's constraints are, *before looking for an English continuation*:

| Next component | Frozen prediction |
| --- | --- |
| Key phase and signature | **phase1**, source-derived unrotated signature **(0,+1,0)**; next outer bit0 |
| Original key node center | even row, even column |
| Original key-node geometry | **horizontal**, even radius, unequal original outer runes (**non-mirror**) |
| Next ciphertext | **diagonal**, first read cell is leftmost, ending in odd row; leftmost row odd, column even |
| Original coordinate ray | exact eight-ray offset **0** from current leftmost cell (8,17) |
| Compatibility tests | source's next-mode leftmost Möbius class; all four native squarefree-GCD checks between original center and next first/last/leftmost cells |
| Running phase | S updates 32→33; no multiple-of-seven threshold skipped |

For this deliberately source-constrained census, both the raw and φ(center) source modes and both original outer reading orientations remain available because the proposed author has not supplied a deterministic selector for either; zero index components are disallowed by its own signature. Next diagonal ciphertext lengths are **odd 3–27**, as forced by the ending-row parity with an odd beginning row. There is no length/stop rule fixing a narrower interval.

## Exact original-input results

On the complete unchanged 27×27 original chapter:

- **172** permitted key-source variants, counting two source orientations and two center transform flags as distinct decoder choices, even when they may yield coincident aligned keys.
- **132** diagonal ciphertext ray variants passing all forecast parity, direction, offset, length and mode checks before pairing with an eligible key.
- **21,818** admissible key-source/ray combinations after all four published source/ciphertext squarefree-GCD conditions.
- Even at the minimum three-rune length, the source's unmodified ciphertext supports **3,544 distinct rune-label plaintext strings** under those allowed branches. Thus the stipulated transitions alone cannot uniquely predict the next three runes.

| Original GP rune block length | Admissible combinations | Distinct decoded rune-label strings |
| ---: | ---: | ---: |
| 3 | 4,614 | 3,544 |
| 5 | 3,922 | 3,426 |
| 7 | 3,422 | 2,990 |
| 9 | 2,960 | 2,584 |
| 11 | 2,188 | 1,908 |
| 13 | 1,672 | 1,458 |
| 15 | 1,170 | 1,020 |
| 17 | 838 | 732 |
| 19 | 516 | 450 |
| 21 | 344 | 300 |
| 23 | 172 | 150 |

The separate reported downstream constraint that a block must consist of complete English words is **intentionally not used to choose candidates**. Such a linguistic filter is not an algorithm for deriving the unique next key, next ciphertext coordinate or exact stop. It could post-select fluent branches from thousands of results, so a purported block39 plaintext chosen by English fit alone would lack independent predictive status.

## Reproducer and interpretation

The [CommonJS SFT](../sims/lp2_p0_27square_block39_frozen_branch_census_sft.cjs) reads the canonical `resources/liber-primus/lp2-corpus.json`, asserts all four known block38 original source runes and the index subtraction, computes and asserts every frozen block39 forecast, enumerates the bounded source and ray spaces, and asserts the key 172/132/21,818/3,544 counts. It is platform-neutral CommonJS and passed the **actual Windows Node22 GitHub Actions** syntax and original-input execution in [run 43826024511](https://github.com/FlareZ123/liber-primus/actions/runs/43826024511).

**Scope:** This result does not disprove the hypothesis that an author-selected geometric operation exists, nor exclude the external method's later learned constraints or alternate geometries. It establishes that the proposed 00–15 transition rules, under their stated degrees of freedom, are an **underidentified inverse at block39**. The special p0 center self-crib remains an interesting original geometric relation. None of the public candidate plaintext, including WEATHER, is thereby authenticated.

**Next decisive input:** Recover a first-party or independently frozen, whole-chapter algorithm fixing the *exact next source-node coordinates, center-transform flag, reading orientation, beginning and stop* before English inspection, and show it predicts an untouched section and accounts for the unused 729-source-cell inventory. Lacking that, do not invest in additional post-selected English paths, fitted numerical relations or synthetic controls for the same 38-block reading. Pursue independently sourced, reversible unknown-cipher keys and instructions instead.
