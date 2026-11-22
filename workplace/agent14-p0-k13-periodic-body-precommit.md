# Agent14 precommit: p0 generated K13 periodic held-out body test

Timestamp: 2026-11-19T07:22Z

## Frozen input

Use the candidate source/state generator already committed in
`im-results/lp2-p0-red13-hinv-state-palindrome.md`:

```text
q=4, THE7, WAY13
-> H^-1 marker packet
[25,28,11,25,4,8,19,8,4,7,13,20,28]
-> H
K13 =
[26,24,8,19,27,24,18,3,0,8,0,16,19]
```

The first 13 p0 runes are the known positive control and decrypt by subtraction to
`EPIPHANY SEEKS`.

## Prospective held-out test

Apply exactly the same additive key to the complete original p0 rune stream:

- operation: `P[i] = C[i] - K13[i mod 13] mod29`;
- phase0 is original p0 rune offset0;
- no line, word, punctuation, color, or marker reset;
- no alternate sign;
- no rotations, reverse key, offsets, state substitutions, autokey, or language-score phase search.

The held-out region begins at original p0 rune offset13.

## Success criterion

Construct a fixed reference set before judging the output:

1. every consecutive whole-word phrase totaling exactly13 GP runes in the authenticated 2016 signed message;
2. every consecutive whole-word phrase totaling exactly13 GP runes in the pinned solved GP29-native Cicada corpus.

A positive transfer requires at least one **exact** 13-rune vector match wholly inside held-out p0 offsets13+, under the unchanged phase/sign. Report all matches.

As a secondary deterministic diagnostic, report the complete held-out transliteration and per-13-rune block vectors, while making no language-score claim from near-English fragments.

## Failure criterion

Zero exact held-out 13-rune source-native matches rejects the simple period13 body extension. Do not rescue the result by changing phase, sign, reset points, key orientation, or reference vocabulary after seeing the output.
