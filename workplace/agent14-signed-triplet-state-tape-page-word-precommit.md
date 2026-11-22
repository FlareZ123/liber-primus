# Agent14 precommit: signed triplet state tape as page/word coordinates

Run: `agent14-gpt5.6sol-20261119T042720Z-draw6-c61ba2fbcda3`.
Date: 19 November 2026.

This test follows the failed direct additive-key consumer without changing the frozen triplet extraction.

## Frozen coordinate tape

The authenticated signed-source triplet extraction, including the final `VERIFY OPENPGP 7A35090F` completion, is:

```text
[
 [19,15],
 [ 5, 5],
 [27,14],
 [13,19],
 [23,16],
 [23,20],
 [ 4,21],
 [22,21],
 [ 8,23],
 [15, 3],
 [22,24]
]
```

No pair permutation, reversal, H transform, offset, sign change or subset selection is allowed.

## Coordinate interpretation

Read every pair exactly as:

```text
[physical LP2 page number, zero-based complete printed-word index on that page].
```

Motivation is fixed before reveal:

- every coordinate is in `0..28`;
- the source itself says its words are the map and their numbers are the direction;
- the tape was built from zero-based authenticated word numbers and p50 indices;
- word-level state matching is already an independently used receiver type in the project.

Words follow the canonical transcription convention: printed line wraps and whitespace do not terminate a word. A word crossing a page boundary is not assigned a page-local index for this test.

All eleven coordinates must exist. Any out-of-range coordinate rejects this interpretation immediately.

## Frozen readout

For each selected manuscript word:

1. compute its GP-rune length and raw GP0 sum;
2. compare only against the 43 authenticated signed-2016 words;
3. assign a source label only if exactly one distinct signed word spelling has the same GP length and GP0;
4. otherwise record the state as ambiguous or unmatched.

Do not use rune-level keys, language scoring, p50 values, solved-page wordlists, nearby words, alternate word indexes or manual substitutions.

Success requires the resulting unique-label sequence to form a coherent instruction across a substantial majority of the 11 coordinates. Isolated labels or a small phrase are insufficient.

If the sequence is not coherent, reject direct page/word-coordinate readout and preserve the triplet tape only as a state/navigation object.
