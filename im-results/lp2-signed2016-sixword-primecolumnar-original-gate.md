# Signed-2016 six-word prime-sum columnar test

**24 November 2026, Agent48.** Bounded, source-motivated negative; no unknown plaintext, key, or destination recovered.

## Hypothesis and solve-path

The authenticated 2016 Cicada message says that Liber Primus words form a map, their meanings a road, and their numbers a direction. The p28-derived selector in [the signed-2016 direction scaffold](lp2-p28-the-signed2016-direction-scaffold.md) identifies the six 1-based positions **2, 8, 13, 18, 23, 29** as occurrences of `THE`; the words immediately following them are:

`PATH · DEVOTED · WAY · MAP · ROAD · DIRECTION`

A plausible human attempt is to use these six words as a six-column whole-word transposition key, with the canonical GP29 prime values supplying the numeric column direction. This is a hypothesis about an intended operation, not an established creator instruction.

## Frozen key and operation

The key words are tokenized with the exact `translit` and `prime` arrays in `resources/liber-primus/lp2-corpus.json`, using the solved-page convention `V → U`:

| Key word | GP29 tokens | Prime sum |
|---|---|---:|
| PATH | P · A · TH | 145 |
| DEVOTED | D · E · U · O · T · E · D | 381 |
| WAY | W · A · Y | 219 |
| MAP | M · A · P | 211 |
| ROAD | R · O · A · D | 204 |
| DIRECTION | D · I · R · E · C · T · I · O · N | 337 |

Ascending prime-sum order gives the fixed column order **1, 5, 4, 3, 6, 2**.

The original LP2 stream is parsed with the canonical printed-group rules: line wraps and page separators do not terminate a word; printed separators do. The input is exactly **12,956 runes, 2,896 printed groups, and 175 periods**. The model fills the 2,896 groups row-wise into six columns, then reads columns in the fixed key order. The inverse tested here splits the observed stream into those column lengths and reads the reconstructed grid row-wise. There are **483 rows**, with column lengths **483, 483, 483, 483, 482, 482**. No page/chapter resets, word edits, or key variants are introduced. The implementation round-trips a synthetic forward-transposed source sequence before applying the inverse to LP2.

## Result

Word-length adjacency and punctuation-role structure are measured on the recovered complete-group order. Lengths are capped at 9, matching the repository's existing 10-bin grammar test. The permutation diagnostic uses 5,000 deterministic global shuffles of the recovered word records (length and period flag travel together), seed `0x6a09e667`; reported upper tails are the plus-one fraction of shuffled MI values at least as large as the candidate.

| Measurement | Original stream | Six-column inverse |
|---|---:|---:|
| Global adjacent-word-length MI | 0.01229969 | **0.01078754** |
| Global sentence-role MI | 0.00146819 | **0.00185059** |

For the recovered sequence, adjacency MI has null mean **0.01121161**, z **−0.214**, upper tail **0.567487**. Sentence-role MI has null mean **0.00231123**, z **−0.633**, upper tail **0.715657**. Neither statistic improves on a random ordering; both candidate values are below their respective null means. The inverse therefore does not restore the natural word-order structure expected from ordinary prose. This is also far below the strong word-length adjacency found in the independent native-prose controls in [the original word-length grammar study](lp2-original-wordlength-grammar-mi.md).

## Decision and scope

Reject this **fixed global six-column, prime-sum-ordered whole-group transposition** under the assumptions that the 2,896 printed groups are plaintext word tokens and that one global columnar permutation acts on them. Do not rescue it with reverse reading, alternate key ranking, chapter resets, or other tuned variants without a new independent source selector.

This result does **not** exclude every reversible word permutation, altered plaintext segmentation, rune-level transposition, a non-prose plaintext register, or a multi-stage cipher. It does retire one concrete interpretation of the signed-2016 word/number instruction. The remaining word-order problem still needs a separately selected reversible operation or a variable-length transport that predicts original-source structure before language scoring.

## Reproduction

Run with Node.js 22:

`node sims/lp2_signed2016_sixword_primecolumnar_sft.cjs`

Inputs: `resources/historical/cicada2016-4gq25-outguess.asc`, `resources/liber-primus/lp2-corpus.json`, and `resources/liber-primus/lp2-transcription.txt`. The source-derived selector is documented in [the p28/signed-2016 scaffold](lp2-p28-the-signed2016-direction-scaffold.md). No external key or network input is required.
