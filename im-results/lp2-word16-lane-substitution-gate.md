# LP2 16-lane word substitution gate

**Classification: bounded negative; no unknown plaintext, key, or complete cipher recovered.**

## Question and source motivation

The original p15 4×4 Fibonacci-prime construction supplies 16 ordered cells. The authenticated 2016 signed message says that words are the map. The canonical LP2 unknown transcript contains exactly **2,896 words = 16 × 181**. These facts motivate one narrow, inexpensive hypothesis: arrange the 2,896 words into 16 lanes of 181 words and apply one fixed, unknown 29-symbol substitution to each lane.

This is **not** an established solve path. No original instruction says to form 16 lanes, and the earlier p15-to-16-p55-word alignment was retired in [Issue #179](https://github.com/FlareZ123/liber-primus/issues/179). The current test asks only whether either of the two ordinary 16×181 word layouts could support a fixed substitution architecture.

## Decisive invariant

For a fixed bijection of the 29 GP symbols, the index of coincidence (IoC) is exactly invariant. The same holds for any permutation of positions within a lane. Consequently, if each lane is an English plaintext stream encrypted by its own fixed substitution (and/or transposition), each lane should retain substantially more symbol collisions than a near-uniform 29-symbol stream.

No alphabet order, key, or language score is fitted. Permuting the 16 lane labels according to the p15 spiral does not change the test.

## Original-source inputs

- Canonical transcription: `resources/lp2-transcription.txt`, Git blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`.
- Canonical rune mapping: `resources/liber-primus/lp2-corpus.json`, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.
- Word segmentation uses the existing `sims/lp2_word_pages.cjs` parser, preserving the 32 words that cross physical page boundaries.
- Positive language control: `resources/liber-primus/lp1-plaintext-reference.txt`, encoded with the existing GP transliterator in `sims/word_partition_invariant.cjs`.

The unknown input is **2,896 words, 12,956 runes, and 32 cross-page words**.

## Frozen layouts and results

1. **Interleaved:** word ordinal modulo 16 selects a lane. Each lane contains 181 words.
2. **Contiguous:** each consecutive block of 181 words is one lane.

| Lane | Interleaved IoC | Contiguous IoC | LP1 control IoC |
|---:|---:|---:|---:|
| 0 | 0.034659508 | 0.034229626 | 0.059271942 |
| 1 | 0.033912009 | 0.034386617 | 0.061901479 |
| 2 | 0.034552303 | 0.034492978 | 0.062140054 |
| 3 | 0.034344442 | 0.034824074 | 0.057392253 |
| 4 | 0.034445425 | 0.034828340 | 0.060648875 |
| 5 | 0.034644151 | 0.034190383 | 0.060758082 |
| 6 | 0.034856202 | 0.034222203 | 0.064412599 |
| 7 | 0.034610001 | 0.034290901 | 0.061979500 |
| 8 | 0.034294367 | 0.034061849 | 0.064428150 |
| 9 | 0.034368447 | 0.034196449 | 0.063468863 |
| 10 | 0.034744486 | 0.034011264 | 0.059420549 |
| 11 | 0.034662331 | 0.034430725 | 0.059704137 |
| 12 | 0.034580955 | 0.034334888 | 0.057566583 |
| 13 | 0.034091541 | 0.034696406 | 0.059207686 |
| 14 | 0.034692330 | 0.034347446 | 0.062246964 |
| 15 | 0.034718424 | 0.034146470 | 0.059139785 |

| Partition | Words per lane | IoC range | Mean lane IoC |
|---|---:|---:|---:|
| Interleaved LP2 | 181 | 0.033912–0.034856 | 0.034511058 |
| Contiguous LP2 | 181 | 0.034011–0.034828 | 0.034355664 |
| Interleaved LP1 control | 53–54 | 0.057392–0.064428 | 0.060855469 |

The uniform-symbol baseline is (1/29 \approx 0.034482759). Every unknown lane remains close to that baseline. Even the highest unknown-lane IoC (0.034856202) is well below the lowest LP1 control lane (0.057392253).

The positive control applies 16 different fixed affine bijections (x \mapsto ax+b \pmod{29}) to the LP1 lanes and asserts exact IoC preservation. This confirms that arbitrary fixed lane alphabets cannot evade the invariant.

## Decision

**Reject both natural 16×181 word layouts as fixed, independent GP29 substitution lanes.** No arbitrary secret alphabet permutation or within-lane transposition can turn these observed lane distributions into native-English-like streams.

This does not reject:
- evolving or polyalphabetic lane state;
- nonlinear or non-GP intermediate registers;
- a different word partition or variable lane boundaries;
- per-word-changing substitutions;
- non-English plaintext.

The 16-cell p15 construction and the factorization 2,896 = 16 × 181 remain observations, not an authenticated instruction. Do not expand this branch into phase, orientation, alphabet, or key sweeps without a new source clue selecting a different stateful operation.

## Reproduction

Run:

```sh
node sims/lp2_word16_lane_substitution_gate.cjs
```

The script reads the canonical shared corpus and LP1 reference, asserts the input counts and page-crossing word contract, prints all lane IoCs, and verifies the lane-specific affine-bijection positive control.
