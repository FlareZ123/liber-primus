# LP2 opening 27×27 square: all-secret independent group alphabets cannot explain native GP prose

**Original-input cryptanalytic constraint, 11 November 2026 (Agent 6).** The source-motivated opening 27×27 arrangement cannot contain ordinary GP-encoded Shakespeare, Gibran or Emerson-like continuous prose under **independent arbitrary monoalphabetic substitutions and arbitrary within-group position rearrangements**, with the group chosen as every row or every column. This is an invariant over unrestricted secret group alphabets, with strong native-source positive controls. **No previously unknown LP2 rune, genuine key, cipher mechanism or destination was recovered.**

## Why this is a bounded, source-relevant new family

The original LP2 physical p0–p2 runes total **262 + 266 + 201 = 729 = 27²**, with the exact source stream in [the fixed physical-page corpus](../resources/liber-primus/lp2-corpus.json). The repeated figure-eight ornaments on these pages suggested a square to earlier researchers, but the artwork does **not** specify a cipher or a row/column direction. The original no-repeat/equality fingerprints make a secret substitution or hidden positional rearrangement plausible enough to test as an economical model.

Prior source work separately tested additive **row-plus-column** masks using Fourier singular values ([existing study](lp2-rowcol-fourier-original-invariant.md)), and uniform whole-block substitution collisions. The present family is different: every **row** may have an *entirely unrelated secret bijection of all 29 GP symbols*, plus any 27-position permutation **within that row**. Separately test the same allowance independently for every **column**. No key values, candidate alphabet strings or transposition permutations are fitted to the unknown ciphertext. This encompasses every per-row (or per-column) Caesar, affine, arbitrary monoalphabetic substitution and within-group transposition; it does **not** encompass a simultaneous varying row-plus-column mask or any cipher mixing symbols across different groups.

## Exact all-key invariant and replacement bound

For each 27-rune group, let \(n_a\) be the number of appearances of GP symbol \(a\). Its unordered equal-symbol pair count is

\[Q=\sum_{a=0}^{28}\binom{n_a}{2}.\]

Any bijection of all 29 symbol labels simply permutes the histogram, while a positional permutation within the group leaves the histogram unchanged. Thus \(Q\) is exactly invariant for **every unknown group key** and **every within-group readout order**. Sum over the 27 rows or columns. This tests an otherwise enormous secret-key family without guessing a single key. The stronger **sorted 29-bin count vector** is also invariant. Given a particular candidate natural-language GP window, the exact minimum number of further *rune substitutions* needed after granting both secret maps in each group is one half the \(L^1\) distance between their sorted vectors, summed over 27 groups. This is an exact minimum because alphabet relabelings may pair histogram bins in ascending order and a within-group permutation may align the overlapping occurrences arbitrarily.

The source table uses the ordinary GP29 alphabet and the repository's control transliteration: greedy TH, ING/NG, EO, OE, AE, IA and EA, with QU→CW, V→U, K→C and Z→S. Remove natural punctuation/spacing in all prose samples. Window length is 729 runes; take nonoverlapping consecutive windows and retain only complete windows. This is a finite real-prose comparator, **not** a mathematical claim about all possible English passages.

## Original ciphertext, independent source prose and 27-phase sensitivity

| Source stream | 729-rune windows | Lowest 27-row pair count | Lowest 27-column pair count | Lowest among either axis and all 27 cyclic column phases | Minimum further replacements, row / column |
|---|---:|---:|---:|---:|---:|
| **Original p0–2 ciphertext** | 1 | **337** | **326** | **326** | Not applicable |
| Shakespeare, pinned first 300k characters | **298** | **457** | **477** | **445** | **83 / 91** |
| Gibran, *The Prophet* | **86** | **477** | **517** | **464** | **86 / 95** |
| Emerson, pinned essays | **443** | **483** | **518** | **462** | **87 / 98** |

Across all **827 source windows**, **none** has as few grouped same-symbol pairs as the actual original. The original's **maximum** over 27 cyclic starts is **337** for row grouping and **326** for column grouping; the latter is phase invariant because a cyclic shift merely permutes column members. Even the **minimum** among source controls after giving each text its own most favorable 27 starts and both axes is **445**, comfortably above the most favorable original result of 337. The original's 337 and 326 pair counts were computed on all 729 original runes, without dropping the unusual short runs or adjusting physical page boundaries.

For each of the 827 source passages, also minimize the exact number of extra rune replacements needed to reconcile the entire vector of 27 sorted group-frequency spectra. The **most favorable** pair needs **at least 83 replacements of 729 positions** (Shakespeare, row orientation), even after independently choosing every group alphabet and its 27-way internal permutation. This is a source-relative lower bound, not proof of 83 deliberate ciphertext edits. At ordinary prose level the group collision deficit is too large to repair by selecting more clever secret substitutions or unknown within-group reading orders.

## Positive controls and independent execution

The standalone Node22 [SFT](../sims/lp2_p0_allsecret_27group_invariant_sft.cjs) loads the original source corpus and all three pinned reference texts, reconstructs the 729-rune opening, reruns all 827 windows and 27 phase allowances, asserts the table's exact integer results, and then **actually encrypts a genuine Shakespeare-GP 729-rune passage** with a separate seeded, uniformly shuffled 29-rune alphabet and independent 27-way position permutation for each row or each column. Each planted ciphertext has exactly the same group pair count as its input; the exact minimal replacement distance to its actual held-out source passage is **zero**. Both positive cases therefore pass the all-key tests regardless of their secret permutations. The test neither trains an English scoring model on the original nor optimizes keys against it.

Verified successfully on Node22 in [manual GitHub Actions run 43082180010](https://github.com/FlareZ123/liber-primus/actions/runs/43082180010). The reproducible invocation is `node sims/lp2_p0_allsecret_27group_invariant_sft.cjs`. Inputs are the repository's original `lp2-corpus.json` and three `resources/control/*.txt` texts, with no external fetch or training step.

## Decision

A **single opening-square layer** composed solely of arbitrary independent row- or column-specific alphabet permutations, optionally followed by wholly arbitrary permutations **inside the same groups**, is strongly incompatible with the tested GP-natural-language passages. Subsequent ciphertext mixing across groups, page-dependent clocks, homophonic encoding, wordwise segmentation, pre-whitening, or a plaintext register outside the sampled prose would evade this invariant. The 27×27 geometry itself remains a hypothesis, and the source does not select the first alphabet or an inverse operation. Do not try to rescue this family by searching all 29! label maps, which provably cannot change the measured group collisions. Seek an independent source hint fixing a genuinely cross-group operation or source-selected key if the opening 729-rune square is to be cryptanalytically useful.
