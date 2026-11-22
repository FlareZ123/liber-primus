# p33 original 13-dot mark and one 13-column readout: negative

**Decision (11 November 2026, Agent45; Director Issue [#375](https://github.com/FlareZ123/liber-primus/issues/375)):** The first source-delimited physical p33 unit contains exactly 91 GP29 runes, including its 10 red heading runes. Reading those 91 positions as seven *row-major* rows of thirteen and then taking each column top-to-bottom, left-to-right yields a completely reversible 91-rune sequence, but **does not recover plaintext**. The symbol histogram, unchanged by this or any ordinary transposition, sharply disfavors unaltered native GP-English.

## Source premise and fixed operation

The original p33 source image `resources/liber-primus/50.jpg` has a 13-dot title marker; original p33 rune offsets `[0,91)` end at the next marked section. The 10-rune heading is `D EO X C F I A W H G`. The frozen operation is:

- For original array `C[0..90]`, candidate `P[7*c+r] = C[13*r+c]`, for `0 <= r < 7`, `0 <= c < 13`.
- Forward reconstruction: `C[13*r+c] = P[7*c+r]`.
- Every original rune position re-encrypts identically. A 91-rune Shakespeare GP29 control planted through the same forward map is exactly recovered by the inverse.

This one geometric readout is motivated by a source-visible count. No key, phase, padding, alternative direction, extra cipher, or model-selected permutation was introduced. Related but different seven-column transfer was already tested negatively on the same 91-rune input by [#339](https://github.com/FlareZ123/liber-primus/issues/339). Its exact historical 2014 transposition does not authenticate the present thirteen-column direction.

## Original candidate

Original first-section GP29 indices and the entire candidate are emitted by [the standalone reproducer](../sims/p33_91_source_13column_sft.cjs). The candidate transliteration (GP multigraph letters kept together) is:

```text
DTRJTWJEOEOHIJWXOEIAAEWAECEAMOETJUFAWIAOAEHIIAXNGUGWASMWNYNGWGYHWMIHYDSMWSGEABFLDAEEONTIASPGOETHRLTHIAJFAEUTHEAEL
```

There are no intelligible runic words or discernible instructions. Direct forward re-encryption is exact, as is the planted-English test. These are implementation checks, not evidence that this was Cicada's encryption.

## Pre-decryption symbol-preservation gate

Original GP29 frequencies over 91 runes (alphabet order from `lp2-corpus.json`):

`[3,3,3,2,2,1,4,9,4,2,3,5,2,1,2,4,4,1,3,4,3,2,3,3,3,4,3,5,3]`

The original/candidate index of coincidence is exactly `262/8190 = 0.031990231990232`. The five original solved p57 91-rune windows have IoC `0.0603175, 0.0634921, 0.0639805, 0.0625153, 0.0652015`.

Using the exact GP29 tokenization employed by `sims/p33_91_historical_7col_gate.cjs` (standard K/V/Z/QU normalization; greedy longest rune multigraphs), the three pinned control texts were split 80% training / 20% held out. **Every contiguous held-out window of 91 GP symbols** was tested without sampling for original-IoC and nearest symbol histogram:

| Held-out native control | All 91-rune windows | Minimum native IoC | Windows at/below original | Minimum changed symbols for exact histogram |
|---|---:|---:|---:|---:|
| Shakespeare | 43,670 | 0.0415140 | 0 | 30 |
| Gibran | 12,533 | 0.0456654 | 0 | 35 |
| Emerson | 64,836 | 0.0444444 | 0 | 32 |
| **Total** | **121,039** | | **0** | **at least 30** |

The edit lower bound is the exact half-L1 distance between two length-91 unigram histograms, minimized over all held-out windows of each source. Any permutation of original p33's 91 runes has precisely the same histogram. Thus the candidate cannot equal any of these native GP-English windows without 30 or more symbol substitutions (under the tested finite controls).

Training-only additive-0.1 GP29 trigram models with 1,000 held-out native windows and 1,000 matched random original-source permutations per author, all using deterministic seeds, also place the actual candidate well below native prose:

| Model | Original score | 13-column candidate | Native median | Shuffled-original median | Candidate percentile in shuffled-original null |
|---|---:|---:|---:|---:|---:|
| Shakespeare | -4.7583 | -4.8863 | -2.3686 | -4.6537 | 5.9% |
| Gibran | -4.2982 | -4.5726 | -2.3877 | -4.2904 | 1.0% |
| Emerson | -4.8944 | -4.9737 | -2.2644 | -4.7607 | 8.1% |

Scores are mean log conditional trigram probabilities, so *higher* is more English-like. The candidate is worse than the original under all three models, and near the weaker tail of random original-rune permutations. The complete fixed computation is in the SFT.

## Interpretation and scope

The 13-dot mark may be a section delimiter only; `91=7×13` is insufficient evidence of intended columnar encryption. **Retire only this exact 7×13 row-to-column transformation** as a direct English plaintext decoder for p33's first 91 runes. All-secret permutations retain the low source histogram, but unknown non-English plaintext, a second source-selected cipher layer, and changing-state cryptography are beyond this gate. Do not expand into unmotivated width, phase, and direction sweeps.

**Reproduction:** from repository root, run `node sims/p33_91_source_13column_sft.cjs`. The script reads only original checked-in ciphertext and control texts; emits the full indices, planted GP-English control, complete score tables, and asserts exact inverse, native-window totals, and finite histogram bounds.
