# Agent14 precommit: signed triplet state tape -> p28 22-rune line

**Frozen before opening the complete p28 22-rune line under this construction.**
Run: `agent14-gpt5.6sol-20261119T042720Z-draw6-c61ba2fbcda3`.
Date: 19 November 2026.

## Source-only tape construction

Use the authenticated signed-2016 words with their zero-based word numbers and the original p50 table.

Decode p50 token `i` to byte `B_i`, then uniquely write:

```text
B_i = 29*h_i + l_i
0 <= l_i < 29.
```

The instructional sentence from signed word11 through word40 is exactly 30 words and naturally groups into ten consecutive three-word clauses:

```text
11 IS THE WAY
14 ITS WORDS ARE
17 THE MAP THEIR
20 MEANING IS THE
23 ROAD AND THEIR
26 NUMBERS ARE THE
29 DIRECTION SEEK AND
32 YOU WILL BE
35 FOUND GOOD LUCK
38 BEWARE FALSE PATHS
```

For each triple beginning at `i`, emit:

```text
[l_i - h_(i+2), l_(i+1) - h_(i+2)] mod29.
```

This gives, without using any LP2 ciphertext:

```text
11 -> [19,15] = [B,b]
14 -> [ 5, 5] = [g,g]
17 -> [27,14] = [-K,-b]
20 -> [13,19] = [b-K,B]
23 -> [23,16] = [p,K-b]
26 -> [23,20] = [p,DH[p]]
29 -> [ 4,21] = [q,p-K]
32 -> [22,21] = [p-1,p-K]
35 -> [ 8,23] = [A,p]
38 -> [15, 3] = [b,e].
```

The authenticated message then ends:

```text
41 VERIFY
42 OPENPGP
7A35090F
```

Treat the first fingerprint byte `0x7A=122=29*4+6=[q,a]` as the missing third numeric item and use its high coordinate `q=4` in the same subtraction:

```text
[l_41-q, l_42-q]
= [26-4,28-4]
= [22,24]
= [p-1,-g].
```

The frozen 22-value tape is therefore:

```text
[19,15,5,5,27,14,13,19,23,16,23,20,4,21,22,21,8,23,15,3,22,24]
```

No tape rotation, reversal, H transform, repetition, reindexing or sign change is admitted after reveal.

## Receiver selection

Use the already selected physical p28 literal-DH object.

- physical line6 is the manuscript-unique line beginning literal `DH` and has `p=23` runes;
- the immediately following rune line, line7, has exactly `p-1=22` runes;
- the source-derived tape above has exactly22 GP29 values.

The receiver is therefore **all 22 runes of physical p28 line7 in printed order**, with no trimming or fragment selection.

## Frozen operation and acceptance gate

Operation:

```text
plaintext_j = ciphertext_j - tape_j mod29
```

for all 22 positions.

Only subtraction is admitted because the p33 WILL, p38 BEWARE and p40 PATHS source-derived local keys all use ciphertext-minus-key.

Success requires a coherent GP-native plaintext or unambiguous instruction over a substantial fraction of the entire 22-rune line. A few English-looking runes, a short substring, or a state echo is failure.

If the output is not coherent, reject this direct tape-as-additive-key consumer. Preserve the triplet state tape separately as a navigation/state object; do not rescue it with rotations, alternate signs, H transforms, Caesar offsets, language-score searches or changed receivers.
